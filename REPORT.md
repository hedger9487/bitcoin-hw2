# DAT.co Indicator Report

## Project Title

**Bitcoin Treasury Ledger: A DAT.co Indicator Dashboard for Strategy (MSTR)**

## 1. Selected Indicator

The selected indicator for this assignment is **Premium to NAV** for Strategy (`MSTR`).

I chose Premium to NAV because it directly measures whether the market is valuing the company above or below the spot value of the Bitcoin it actually holds. This is a core DAT.co question. A raw stock price cannot answer it, because stock price alone mixes treasury value, equity-wrapper sentiment, dilution expectations, and capital-markets optionality into a single number.

By using Premium to NAV as the formal indicator, the project stays tightly aligned with the assignment while still allowing the website to add richer DAT.co context through supplementary indicators.

At the latest generated reading in this project on **April 8, 2026**, Strategy traded at **-21.5% Premium to NAV**, equivalent to **0.78x mNAV**.

## 2. Why This Indicator Matters

Premium to NAV is a useful DAT.co signal because it captures:

- valuation expansion or compression around the treasury wrapper
- investor confidence in treasury execution and capital-markets strategy
- how much optionality the market assigns beyond direct BTC exposure

When Premium to NAV is high, investors are paying extra for the company wrapper. When it compresses or turns negative, the market is valuing the wrapper much more cautiously than the underlying Bitcoin treasury.

## 3. Relationship with Bitcoin (BTC)

The indicator is tightly linked to BTC because the denominator is the marked-to-market value of Strategy's Bitcoin treasury.

- If BTC rises and `MSTR` rises by roughly the same amount, the premium remains fairly stable.
- If BTC rises faster than `MSTR`, the premium compresses.
- If `MSTR` rises faster than BTC, the premium expands.

This makes Premium to NAV a strong bridge between BTC behavior and equity-wrapper behavior. It shows whether the stock is acting mainly as a treasury proxy or as a separate higher-beta vehicle layered on top of Bitcoin.

In the latest 30-trading-day window covered by this project:

- `BTC` returned approximately `+4.7%`
- `MSTR` returned approximately `-5.4%`

That divergence helps explain why the premium remained compressed.

## 4. Data Collection

This project aggregates multiple public data sources:

- **Daily market prices**: Yahoo Finance chart API for `MSTR` and `BTC-USD`
- **BTC holdings history**: official Strategy `8-K` bitcoin update tables filed with the SEC
- **Common shares outstanding**: official Strategy `10-Q` and `10-K` cover-page common-share facts filed with the SEC

### Data pipeline

1. Pull recent Strategy filings from the SEC submissions endpoint.
2. Extract BTC holdings from official `8-K` update tables.
3. Extract common shares outstanding from official `10-Q` and `10-K` disclosures.
4. Forward-fill both disclosure series across trading days.
5. Join the filing-derived data with daily `MSTR` and `BTC-USD` closes.
6. Compute `Premium to NAV = ((share price × common shares outstanding) / (bitcoin held × BTC price)) - 1`.

This approach ensures that the selected indicator is derived from real daily market data plus official corporate disclosures, which directly supports the “Correct Data Collection” grading component.

## 5. Website Visualization

The website satisfies the main visualization requirement by providing a **daily time-series chart** for the selected indicator, `Premium to NAV`.

The final product also goes beyond the minimum requirement with several DAT.co-oriented upgrades:

- bilingual interface: English and Traditional Chinese
- additional DAT.co indicators: `mNAV`, `NAV per share`, `Sats per share`, and `BTC treasury value`
- chart crosshair lines for precise cursor inspection
- range filters: `1M`, `3M`, `6M`, `YTD`, `1Y`, `All`
- rebased `MSTR vs BTC` comparison chart
- recent treasury-update cards linked directly to SEC sources
- rule-based interpretation panel plus optional AI-generated summary

These additions make the product more useful for treasury-company analysis, especially by emphasizing **per-share BTC ownership** and **dilution-aware interpretation**, which are central to DAT.co philosophy.

## 6. AI-Generated Summary

An optional bonus feature is included through [api/summary.js](/home/imlab306/smile/CCnoCC/bitcoin/api/summary.js).

- If `OPENAI_API_KEY` is configured, the user can generate a short AI summary for the current dashboard view.
- The summary respects both the currently selected language and the currently selected indicator.
- If no API key is configured, the built-in signal brief still provides usable interpretation.

This means the core product remains fully functional without AI, while the AI feature can still be presented as an optional bonus.

## 7. Deployment

The project is structured for straightforward deployment on **Vercel**.

- [vercel.json](/home/imlab306/smile/CCnoCC/bitcoin/vercel.json) defines the core deployment build command.
- `npm run build` regenerates the dataset automatically during deployment.
- An optional serverless endpoint, [api/redeploy.js](/home/imlab306/smile/CCnoCC/bitcoin/api/redeploy.js), plus the example schedule in [vercel.cron.example.json](/home/imlab306/smile/CCnoCC/bitcoin/vercel.cron.example.json), can trigger a daily redeploy through a Vercel Deploy Hook so the deployed static dataset stays fresh without manual redeployment.

This architecture keeps the main site simple and mostly static, while still allowing automatic updates in production.

### Deployed Website URL

Add the live URL here after deployment:

`[your deployed website URL]`

## 8. Local Run

The project now uses an npm-first workflow:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

The development command now **tries to refresh the dataset automatically** before starting the local server. If Python dependencies are not available, it falls back to the bundled dataset so the dashboard still opens.

If a manual refresh is needed:

```bash
pip3 install -r requirements.txt
npm run refresh:data
```

## 9. Conclusion

This project fulfills the assignment by selecting a valid DAT.co-related indicator, collecting real data from public sources, and visualizing the indicator through a web-based interface.

It also extends the minimum assignment scope into a more complete DAT.co product by adding multilingual support, richer indicator choices, precise chart interaction, and optional AI-assisted interpretation. As a result, the final site is both submission-ready for the assignment and strong enough to demonstrate thoughtful product design beyond the baseline requirements.
