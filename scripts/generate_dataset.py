#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import time
from collections import OrderedDict
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Iterable

import requests
from lxml import etree, html


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "assets" / "data" / "strategy-premium-nav.json"

SEC_CIK = "0001050446"
SEC_BASE = "https://www.sec.gov/Archives/edgar/data/1050446"
SUBMISSIONS_URL = f"https://data.sec.gov/submissions/CIK{SEC_CIK}.json"
YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"

USER_AGENT = "datco-premium-nav-dashboard/1.0 (educational-use; contact: classroom@example.com)"

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": USER_AGENT,
        "Accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
)

XBRL_NAMESPACES = {
    "ix": "http://www.xbrl.org/2013/inlineXBRL",
    "xbrli": "http://www.xbrl.org/2003/instance",
}


@dataclass(frozen=True)
class Filing:
    form: str
    filing_date: str
    accession: str
    primary_document: str

    @property
    def url(self) -> str:
        accession_clean = self.accession.replace("-", "")
        return f"{SEC_BASE}/{accession_clean}/{self.primary_document}"


def fetch_json(url: str, params: dict | None = None) -> dict:
    response = SESSION.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def fetch_text(url: str) -> str:
    response = SESSION.get(url, timeout=30)
    response.raise_for_status()
    return response.text


def parse_iso_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def parse_human_date(value: str) -> date:
    return datetime.strptime(value, "%B %d, %Y").date()


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()


def parse_number(value: str) -> float | None:
    cleaned = value.replace(",", "").replace("$", "").strip()
    if not cleaned or cleaned == "-":
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", cleaned)
    if not match:
        return None
    return float(match.group(0))


def to_unix_timestamp(day: date) -> int:
    return int(datetime(day.year, day.month, day.day, tzinfo=UTC).timestamp())


def get_recent_filings() -> list[Filing]:
    payload = fetch_json(SUBMISSIONS_URL)
    recent = payload["filings"]["recent"]
    filings: list[Filing] = []

    for idx, form in enumerate(recent["form"]):
        filings.append(
            Filing(
                form=form,
                filing_date=recent["filingDate"][idx],
                accession=recent["accessionNumber"][idx],
                primary_document=recent["primaryDocument"][idx],
            )
        )

    return filings


def fetch_symbol_history(symbol: str, start_day: date, end_day: date) -> OrderedDict[str, float]:
    params = {
        "period1": to_unix_timestamp(start_day),
        "period2": to_unix_timestamp(end_day),
        "interval": "1d",
        "includePrePost": "false",
        "events": "div,splits",
    }
    payload = fetch_json(YAHOO_CHART_URL.format(symbol=symbol), params=params)
    result = payload["chart"]["result"][0]
    timestamps = result["timestamp"]
    quote = result["indicators"]["quote"][0]
    closes = quote["close"]
    adjusted = result.get("indicators", {}).get("adjclose", [])
    adjusted_closes = adjusted[0]["adjclose"] if adjusted else closes

    series: OrderedDict[str, float] = OrderedDict()
    for ts, adjusted_close, raw_close in zip(timestamps, adjusted_closes, closes):
        close_value = adjusted_close if adjusted_close is not None else raw_close
        if close_value is None:
            continue
        day = datetime.fromtimestamp(ts, tz=UTC).date().isoformat()
        series[day] = round(float(close_value), 6)

    return series


def extract_share_events(filings: Iterable[Filing]) -> list[dict]:
    events: list[dict] = []

    for filing in filings:
        if filing.form not in {"10-Q", "10-K"}:
            continue

        document = fetch_text(filing.url)
        tree = etree.fromstring(document.encode("utf-8"), parser=etree.XMLParser(recover=True, huge_tree=True))

        context_dates: dict[str, str] = {}
        for context in tree.xpath("//xbrli:context", namespaces=XBRL_NAMESPACES):
            context_id = context.get("id")
            instant = context.findtext(".//xbrli:instant", namespaces=XBRL_NAMESPACES)
            if context_id and instant:
                context_dates[context_id] = instant

        totals_by_date: dict[str, float] = {}
        facts = tree.xpath(
            '//ix:nonFraction[@name="dei:EntityCommonStockSharesOutstanding"]',
            namespaces=XBRL_NAMESPACES,
        )

        for fact in facts:
            context_ref = fact.get("contextRef")
            if not context_ref:
                continue
            instant = context_dates.get(context_ref)
            if not instant:
                continue
            value = parse_number("".join(fact.itertext()))
            if value is None:
                continue
            totals_by_date.setdefault(instant, 0.0)
            totals_by_date[instant] += value

        if not totals_by_date:
            continue

        as_of_date = max(totals_by_date)
        total_shares = totals_by_date[as_of_date]

        events.append(
            {
                "form": filing.form,
                "filingDate": filing.filing_date,
                "asOfDate": as_of_date,
                "totalShares": int(round(total_shares)),
                "sourceUrl": filing.url,
            }
        )
        time.sleep(0.15)

    deduped: OrderedDict[str, dict] = OrderedDict()
    for event in sorted(events, key=lambda item: (item["asOfDate"], item["filingDate"])):
        deduped[event["asOfDate"]] = event

    return list(deduped.values())


def parse_btc_table(table: html.HtmlElement) -> dict | None:
    table_text = normalize_text(" ".join(table.xpath(".//text()")))
    if "Aggregate BTC Holdings" not in table_text:
        return None

    as_of_match = re.search(r"As of ([A-Z][a-z]+ \d{1,2}, \d{4})", table_text)
    period_match = re.search(
        r"During Period ([A-Z][a-z]+ \d{1,2}, \d{4}) to ([A-Z][a-z]+ \d{1,2}, \d{4})",
        table_text,
    )
    if not as_of_match:
        return None

    row_values: list[str] = []
    for row in table.xpath(".//tr"):
        cells = [normalize_text(" ".join(cell.xpath(".//text()"))) for cell in row.xpath("./th|./td")]
        cells = [cell for cell in cells if cell]
        if len(cells) >= 8 and "BTC Acquired" not in " ".join(cells):
            row_values = cells

    if len(row_values) < 10:
        return None

    return {
        "periodStart": parse_human_date(period_match.group(1)).isoformat() if period_match else None,
        "periodEnd": parse_human_date(period_match.group(2)).isoformat() if period_match else None,
        "asOfDate": parse_human_date(as_of_match.group(1)).isoformat(),
        "btcAcquired": int(round(parse_number(row_values[0]) or 0)),
        "aggregatePurchasePriceMillions": parse_number(row_values[2]),
        "periodAveragePurchasePrice": parse_number(row_values[4]),
        "btcHeld": int(round(parse_number(row_values[5]) or 0)),
        "aggregatePurchasePriceBillions": parse_number(row_values[7]),
        "aggregateAveragePurchasePrice": parse_number(row_values[9]),
    }


def extract_holdings_events(filings: Iterable[Filing], start_day: date) -> list[dict]:
    events: list[dict] = []

    for filing in filings:
        if filing.form != "8-K" or parse_iso_date(filing.filing_date) < start_day:
            continue

        document = fetch_text(filing.url)
        tree = html.fromstring(document.encode("utf-8"))

        found = False
        for table in tree.xpath("//table"):
            parsed = parse_btc_table(table)
            if not parsed:
                continue
            found = True
            parsed.update(
                {
                    "filingDate": filing.filing_date,
                    "sourceUrl": filing.url,
                }
            )
            events.append(parsed)

        if found:
            time.sleep(0.15)

    deduped: OrderedDict[str, dict] = OrderedDict()
    for event in sorted(events, key=lambda item: (item["asOfDate"], item["filingDate"])):
        deduped[event["asOfDate"]] = event

    return list(deduped.values())


def step_value(events: list[dict], current_day: str, key: str) -> int | None:
    value = None
    for event in events:
        if event["asOfDate"] <= current_day:
            value = event[key]
        else:
            break
    return value


def build_series(
    mstr_prices: OrderedDict[str, float],
    btc_prices: OrderedDict[str, float],
    holdings_events: list[dict],
    share_events: list[dict],
) -> list[dict]:
    if not holdings_events or not share_events:
        raise RuntimeError("Missing holdings or share events; cannot build indicator series.")

    first_holdings_date = holdings_events[0]["asOfDate"]
    first_share_date = share_events[0]["asOfDate"]
    start_date = max(first_holdings_date, first_share_date)

    series: list[dict] = []
    for trade_day, mstr_close in mstr_prices.items():
        if trade_day < start_date:
            continue

        btc_close = btc_prices.get(trade_day)
        if btc_close is None:
            continue

        btc_held = step_value(holdings_events, trade_day, "btcHeld")
        total_shares = step_value(share_events, trade_day, "totalShares")
        if not btc_held or not total_shares:
            continue

        bitcoin_nav = btc_held * btc_close
        market_cap = total_shares * mstr_close
        nav_per_share = bitcoin_nav / total_shares
        mnav = market_cap / bitcoin_nav if bitcoin_nav else math.nan
        premium = mnav - 1

        series.append(
            {
                "date": trade_day,
                "mstrClose": round(mstr_close, 4),
                "btcClose": round(btc_close, 4),
                "btcHeld": int(btc_held),
                "totalShares": int(total_shares),
                "bitcoinNav": round(bitcoin_nav, 2),
                "marketCap": round(market_cap, 2),
                "navPerShare": round(nav_per_share, 4),
                "mnav": round(mnav, 6),
                "premiumToNav": round(premium, 6),
                "premiumToNavPct": round(premium * 100, 4),
            }
        )

    return series


def compute_stats(series: list[dict]) -> dict:
    latest = series[-1]
    premiums = [point["premiumToNav"] for point in series]

    def window(size: int) -> list[dict]:
        return series[-size:] if len(series) >= size else series[:]

    recent_30 = window(30)
    recent_90 = window(90)
    recent_252 = window(252)

    def percentage_change(points: list[dict], key: str) -> float:
        if len(points) < 2 or points[0][key] == 0:
            return 0.0
        return (points[-1][key] / points[0][key]) - 1

    sorted_premiums = sorted(premiums)
    latest_rank = sum(1 for value in premiums if value <= latest["premiumToNav"])
    percentile = latest_rank / len(premiums)

    return {
        "latest": latest,
        "premiumSummary": {
            "mean30d": round(sum(point["premiumToNav"] for point in recent_30) / len(recent_30), 6),
            "mean90d": round(sum(point["premiumToNav"] for point in recent_90) / len(recent_90), 6),
            "low52w": round(min(point["premiumToNav"] for point in recent_252), 6),
            "high52w": round(max(point["premiumToNav"] for point in recent_252), 6),
            "percentile": round(percentile, 4),
        },
        "relativeMoves": {
            "premium30dChange": round(percentage_change(recent_30, "mnav"), 6),
            "mstr30dReturn": round(percentage_change(recent_30, "mstrClose"), 6),
            "btc30dReturn": round(percentage_change(recent_30, "btcClose"), 6),
        },
        "coverage": {
            "startDate": series[0]["date"],
            "endDate": series[-1]["date"],
            "tradingDays": len(series),
            "distinctPremiumValues": len(sorted_premiums),
        },
    }


def build_payload() -> dict:
    filings = get_recent_filings()

    share_filings = [
        filing
        for filing in filings
        if filing.form in {"10-Q", "10-K"} and parse_iso_date(filing.filing_date) >= date(2025, 1, 1)
    ]
    holdings_filings = [
        filing
        for filing in filings
        if filing.form == "8-K" and parse_iso_date(filing.filing_date) >= date(2025, 3, 1)
    ]

    share_events = extract_share_events(sorted(share_filings, key=lambda item: item.filing_date))
    holdings_events = extract_holdings_events(sorted(holdings_filings, key=lambda item: item.filing_date), date(2025, 3, 1))

    if not share_events:
        raise RuntimeError("No share events found in SEC filings.")
    if not holdings_events:
        raise RuntimeError("No BTC holdings events found in SEC filings.")

    start_day = parse_iso_date(min(share_events[0]["asOfDate"], holdings_events[0]["asOfDate"]))
    end_day = date.today()

    mstr_prices = fetch_symbol_history("MSTR", start_day, end_day)
    btc_prices = fetch_symbol_history("BTC-USD", start_day, end_day)
    series = build_series(mstr_prices, btc_prices, holdings_events, share_events)
    stats = compute_stats(series)

    source_links = sorted(
        {event["sourceUrl"] for event in holdings_events}.union({event["sourceUrl"] for event in share_events})
    )

    return {
        "generatedAt": datetime.now(tz=UTC).isoformat(),
        "company": {
            "name": "Strategy Inc.",
            "ticker": "MSTR",
            "exchange": "Nasdaq",
        },
        "indicator": {
            "id": "premium_to_nav",
            "name": "Premium to NAV",
            "shortName": "Premium / NAV",
            "description": "How far Strategy's equity market value trades above or below the spot value of the bitcoin on its balance sheet.",
            "formula": "((share price * common shares outstanding) / (bitcoin held * BTC price)) - 1",
            "interpretation": {
                "high": "Investors are paying a large premium above the underlying bitcoin treasury value.",
                "low": "The stock is trading closer to spot treasury value, implying less valuation premium.",
            },
        },
        "methodology": {
            "priceSource": "Yahoo Finance chart API for MSTR and BTC-USD daily closes.",
            "holdingsSource": "Official Strategy 8-K bitcoin update tables filed with the SEC.",
            "sharesSource": "Official Strategy 10-Q and 10-K cover-page common shares outstanding facts filed with the SEC.",
            "notes": [
                "BTC holdings are forward-filled from each official as-of date to the next disclosure.",
                "Common shares outstanding are forward-filled from each 10-Q / 10-K cover-page as-of date.",
                "Premium to NAV is computed on trading days using Strategy stock closes and same-day BTC closes.",
            ],
        },
        "stats": stats,
        "shareEvents": share_events,
        "holdingsEvents": holdings_events,
        "series": series,
        "sources": source_links,
    }


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)} with {len(payload['series'])} daily rows.")


if __name__ == "__main__":
    main()
