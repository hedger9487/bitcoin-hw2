import {
  clamp,
  findPointOnOrAfter,
  formatBillionsUsd,
  formatCompactNumber,
  formatDate,
  formatInteger,
  formatPercent,
  formatPercentFromPct,
  formatRatio,
  formatSignedNumber,
  formatUsd,
  percentageChange,
} from "./utils.js";

function isZh(locale) {
  return locale === "zh-TW";
}

export function getIndicatorDefinitions(locale) {
  const zh = isZh(locale);

  return [
    {
      id: "premiumToNav",
      key: "premiumToNavPct",
      label: "Premium to NAV",
      shortLabel: "Premium/NAV",
      description: zh
        ? "股價相對 BTC 財庫現貨淨值的溢折價。"
        : "Equity premium or discount versus BTC treasury NAV.",
      axisLabel: zh ? "溢折價 (%)" : "Premium (%)",
      lineLabel: "Premium to NAV",
      averageLabel: zh ? "20日均線" : "20D average",
      unit: "percent-points",
      color: "#c96442",
      fill: "rgba(201,100,66,0.14)",
      showAverage: true,
      stepped: false,
      laneLabels: zh ? ["折價", "一年分位", "溢價"] : ["Discount", "1Y percentile", "Premium"],
    },
    {
      id: "mnav",
      key: "mnav",
      label: "mNAV",
      shortLabel: "mNAV",
      description: zh
        ? "股權市值除以比特幣財庫淨值。"
        : "Equity value divided by BTC treasury NAV.",
      axisLabel: zh ? "倍數 (x)" : "Multiple (x)",
      lineLabel: "mNAV",
      averageLabel: zh ? "20日均線" : "20D average",
      unit: "ratio",
      color: "#66745b",
      fill: "rgba(102,116,91,0.14)",
      showAverage: true,
      stepped: false,
      laneLabels: zh ? ["低於 1x", "一年分位", "高於 1x"] : ["Below 1x", "1Y percentile", "Above 1x"],
    },
    {
      id: "navPerShare",
      key: "navPerShare",
      label: zh ? "每股 NAV" : "NAV per share",
      shortLabel: zh ? "每股 NAV" : "NAV/share",
      description: zh
        ? "每一股對應到的 BTC 現貨淨值。"
        : "Marked BTC treasury value attributable to each common share.",
      axisLabel: zh ? "美元 / 股" : "USD per share",
      lineLabel: zh ? "每股 NAV" : "NAV per share",
      averageLabel: zh ? "20日均線" : "20D average",
      unit: "usd",
      color: "#141413",
      fill: "rgba(20,20,19,0.08)",
      showAverage: true,
      stepped: false,
      laneLabels: zh ? ["較低", "一年分位", "較高"] : ["Lower", "1Y percentile", "Higher"],
    },
    {
      id: "satsPerShare",
      key: "satsPerShare",
      label: zh ? "每股 sats" : "Sats per share",
      shortLabel: zh ? "每股 sats" : "Sats/share",
      description: zh
        ? "稀釋後，每股實際代表多少 sats。"
        : "How many sats each share represents after dilution.",
      axisLabel: "sats/share",
      lineLabel: zh ? "每股 sats" : "Sats per share",
      averageLabel: zh ? "趨勢" : "Trend",
      unit: "sats",
      color: "#d2ad61",
      fill: "rgba(210,173,97,0.18)",
      showAverage: false,
      stepped: true,
      laneLabels: zh ? ["較低", "一年分位", "較高"] : ["Lower", "1Y percentile", "Higher"],
    },
    {
      id: "treasuryValue",
      key: "bitcoinNavBillions",
      label: zh ? "BTC 財庫價值" : "BTC treasury value",
      shortLabel: zh ? "財庫價值" : "Treasury value",
      description: zh
        ? "依最新 BTC 現貨價格計算的財庫規模。"
        : "Marked value of the Bitcoin treasury stack.",
      axisLabel: zh ? "十億美元" : "USD billions",
      lineLabel: zh ? "BTC 財庫價值" : "BTC treasury value",
      averageLabel: zh ? "20日均線" : "20D average",
      unit: "billions-usd",
      color: "#8a5d41",
      fill: "rgba(138,93,65,0.16)",
      showAverage: true,
      stepped: false,
      laneLabels: zh ? ["較小", "一年分位", "較大"] : ["Smaller", "1Y percentile", "Larger"],
    },
  ];
}

export function getIndicatorById(locale, indicatorId) {
  return (
    getIndicatorDefinitions(locale).find((indicator) => indicator.id === indicatorId) ||
    getIndicatorDefinitions(locale)[0]
  );
}

export function formatIndicatorValue(indicator, value, locale) {
  switch (indicator.unit) {
    case "percent-points":
      return formatPercentFromPct(value, 1, locale);
    case "ratio":
      return formatRatio(value, 2, locale);
    case "usd":
      return formatUsd(value, 2, locale);
    case "sats":
      return `${formatInteger(value, locale)} sats/share`;
    case "billions-usd":
      return formatBillionsUsd(value, 1, locale);
    default:
      return formatInteger(value, locale);
  }
}

export function buildHeroMeta(dataset, locale) {
  const zh = isZh(locale);

  return [
    {
      label: zh ? "資料區間" : "Coverage",
      value: `${formatDate(dataset.stats.coverage.startDate, locale)} - ${formatDate(
        dataset.stats.coverage.endDate,
        locale,
      )}`,
    },
    {
      label: zh ? "交易日" : "Trading days",
      value: formatInteger(dataset.stats.coverage.tradingDays, locale),
    },
    {
      label: zh ? "揭露事件" : "Disclosures",
      value: zh
        ? `${formatInteger(dataset.holdingsEvents.length, locale)} 次 BTC 更新 / ${formatInteger(
            dataset.shareEvents.length,
            locale,
          )} 次股本更新`
        : `${formatInteger(dataset.holdingsEvents.length, locale)} BTC updates / ${formatInteger(
            dataset.shareEvents.length,
            locale,
          )} share updates`,
    },
  ];
}

export function buildHeroFacts(latest, locale) {
  const zh = isZh(locale);

  return [
    [zh ? "mNAV" : "mNAV", formatRatio(latest.mnav, 2, locale)],
    [zh ? "每股 NAV" : "NAV per share", formatUsd(latest.navPerShare, 2, locale)],
    [zh ? "每股 sats" : "Sats per share", `${formatInteger(latest.satsPerShare, locale)} sats/share`],
    [zh ? "BTC 持有量" : "BTC held", formatInteger(latest.btcHeld, locale)],
  ];
}

export function buildKpis(dataset, locale) {
  const zh = isZh(locale);
  const latest = dataset.stats.latest;

  return [
    {
      label: zh ? "最新溢折價" : "Latest premium",
      value: formatPercent(latest.premiumToNav, 1, locale),
      note: `${formatDate(latest.date, locale)} ${zh ? "收盤" : "close"}`,
      state: latest.premiumToNav >= 0 ? "is-positive" : "is-negative",
    },
    {
      label: zh ? "最新 mNAV" : "Latest mNAV",
      value: formatRatio(latest.mnav, 2, locale),
      note: zh ? "股權市值 / BTC 財庫淨值" : "Equity value / BTC treasury NAV",
      state: latest.mnav >= 1 ? "is-positive" : "is-negative",
    },
    {
      label: zh ? "每股 NAV" : "NAV per share",
      value: formatUsd(latest.navPerShare, 2, locale),
      note: zh ? "依最新 BTC 收盤估值" : "Marked at the latest BTC close",
      state: "",
    },
    {
      label: zh ? "每股 sats" : "Sats per share",
      value: `${formatInteger(latest.satsPerShare, locale)} sats/share`,
      note: zh ? "稀釋後每股對應的 BTC 權益" : "BTC ownership per share after dilution",
      state: dataset.derived.threeMonthSatsChange >= 0 ? "is-positive" : "is-negative",
    },
    {
      label: zh ? "BTC 財庫價值" : "BTC treasury value",
      value: formatBillionsUsd(latest.bitcoinNavBillions, 1, locale),
      note: zh ? "以現貨價格計算的財庫規模" : "Marked value of the treasury stack",
      state: "",
    },
    {
      label: zh ? "3M 股本變化" : "3M share drift",
      value: formatPercent(dataset.derived.threeMonthShareDrift, 1, locale),
      note: zh ? "相較 3 個月前的普通股變動" : "Common-share change versus 3 months ago",
      state: dataset.derived.threeMonthShareDrift > 0 ? "is-negative" : "is-positive",
    },
  ];
}

export function buildPhilosophyCards(dataset, locale) {
  const zh = isZh(locale);
  const latest = dataset.stats.latest;
  const percentile = Math.round(dataset.stats.premiumSummary.percentile * 100);

  return [
    {
      eyebrow: zh ? "每股比特幣權益" : "Per-share bitcoin",
      value: `${formatInteger(latest.satsPerShare, locale)} sats/share`,
      title: zh ? "每股指標比總持幣量更貼近 DAT.co 核心。" : "Per-share metrics matter more than raw stack size.",
      copy: zh
        ? `過去 3 個月每股 sats 變動 ${formatPercent(
            dataset.derived.threeMonthSatsChange,
            1,
            locale,
          )}，能直接看出增持是否真的跑贏稀釋。`
        : `Over the last 3 months, sats per share changed ${formatPercent(
            dataset.derived.threeMonthSatsChange,
            1,
            locale,
          )}, which shows whether BTC accumulation outran dilution.`,
      meta: [
        [zh ? "BTC 持有量" : "BTC held", formatInteger(latest.btcHeld, locale)],
        [zh ? "普通股" : "Common shares", formatCompactNumber(latest.totalShares, 2, locale)],
      ],
    },
    {
      eyebrow: zh ? "稀釋路徑" : "Dilution path",
      value: formatPercent(dataset.derived.threeMonthShareDrift, 1, locale),
      title: zh ? "股本增加會決定每股財庫成長是否被稀釋。" : "Share issuance determines whether treasury growth survives.",
      copy: zh
        ? "DAT.co 投資人不能只看買了多少 BTC，還要看每股代表的 BTC 是增加還是被攤薄。"
        : "DAT.co investors cannot stop at how much BTC was bought. They also need to know whether each share ended up owning more or less of that treasury.",
      meta: [
        [zh ? "最新每股 NAV" : "Latest NAV/share", formatUsd(latest.navPerShare, 2, locale)],
        [zh ? "最新每股 sats" : "Latest sats/share", `${formatInteger(latest.satsPerShare, locale)} sats/share`],
      ],
    },
    {
      eyebrow: zh ? "公司包裝溫度" : "Wrapper temperature",
      value: `${formatInteger(percentile, locale)}%`,
      title: zh ? "Premium to NAV 仍是估值情緒最直接的溫度計。" : "Premium to NAV remains the cleanest wrapper-valuation thermometer.",
      copy: zh
        ? `目前讀值位於近一年約第 ${formatInteger(
            percentile,
            locale,
          )} 百分位，代表市場對公司包裝的定價仍偏保守。`
        : `The current reading sits near the ${formatInteger(
            percentile,
            locale,
          )}th percentile of the past year's premium range, which points to a much cooler wrapper valuation than peak periods.`,
      meta: [
        [zh ? "最新溢折價" : "Latest premium", formatPercent(latest.premiumToNav, 1, locale)],
        [zh ? "最新 mNAV" : "Latest mNAV", formatRatio(latest.mnav, 2, locale)],
      ],
    },
    {
      eyebrow: zh ? "財庫規模" : "Treasury scale",
      value: formatBillionsUsd(latest.bitcoinNavBillions, 1, locale),
      title: zh ? "財庫是所有 NAV 與包裝估值的基底。" : "Treasury value is the base layer beneath every NAV discussion.",
      copy: zh
        ? `最新 BTC 收盤價下，財庫約值 ${formatBillionsUsd(
            latest.bitcoinNavBillions,
            1,
            locale,
          )}；股權市值約 ${formatBillionsUsd(latest.marketCapBillions, 1, locale)}。`
        : `At the latest BTC close, the treasury was worth about ${formatBillionsUsd(
            latest.bitcoinNavBillions,
            1,
            locale,
          )} while equity market cap sat near ${formatBillionsUsd(latest.marketCapBillions, 1, locale)}.`,
      meta: [
        [zh ? "市值" : "Market cap", formatBillionsUsd(latest.marketCapBillions, 1, locale)],
        [zh ? "NAV 落差" : "Wrapper gap", formatBillionsUsd(latest.navGapBillions, 1, locale)],
      ],
    },
  ];
}

export function buildNarrative(dataset, activeSeries, indicator, locale) {
  const zh = isZh(locale);
  const latest = activeSeries[activeSeries.length - 1];
  const start = activeSeries[0];
  const percentile = Math.round(dataset.derived.activePercentile * 100);
  const premiumChangePoints = latest.premiumToNavPct - start.premiumToNavPct;
  const relationship = dataset.stats.relativeMoves;

  switch (indicator.id) {
    case "premiumToNav":
      return [
        zh
          ? `截至 ${formatDate(latest.date, locale)}，Strategy 的 Premium to NAV 為 ${formatPercent(
              latest.premiumToNav,
              1,
              locale,
            )}，等同 mNAV ${formatRatio(latest.mnav, 2, locale)}。以近一年資料看，這大約位在第 ${formatInteger(
              percentile,
              locale,
            )} 百分位。`
          : `As of ${formatDate(latest.date, locale)}, Strategy traded at ${formatPercent(
              latest.premiumToNav,
              1,
              locale,
            )} versus the spot value of its treasury, equivalent to an mNAV of ${formatRatio(
              latest.mnav,
              2,
              locale,
            )}. Within the past year of observations, that sits near the ${formatInteger(
              percentile,
              locale,
            )}th percentile.`,
        zh
          ? `在目前視窗內，BTC 近 30 個交易日報酬為 ${formatPercent(
              relationship.btc30dReturn,
              1,
              locale,
            )}，MSTR 為 ${formatPercent(
              relationship.mstr30dReturn,
              1,
              locale,
            )}。股票落後資產，讓溢折價約變動 ${formatSignedNumber(
              premiumChangePoints,
              1,
              locale,
              " 個百分點",
            )}。`
          : `Over the recent 30-trading-day window, BTC returned ${formatPercent(
              relationship.btc30dReturn,
              1,
              locale,
            )} while MSTR returned ${formatPercent(
              relationship.mstr30dReturn,
              1,
              locale,
            )}. Because the stock lagged the asset, the premium moved by about ${formatSignedNumber(
              premiumChangePoints,
              1,
              locale,
              " pts",
            )}.`,
        latest.premiumToNav < 0
          ? zh
            ? "目前股價低於財庫現貨淨值，市場對公司包裝、融資風險或稀釋路徑的定價明顯比高溢價時期保守。"
            : "The stock is currently below treasury spot value, which suggests the market is assigning less value to the corporate wrapper than it did during expansionary premium regimes."
          : zh
            ? "目前股價仍高於財庫現貨淨值，代表市場仍願意為資本市場操作、執行力與槓桿選擇權支付額外價格。"
            : "The stock still trades above treasury spot value, which implies investors continue to pay for capital-markets execution and optionality beyond raw BTC exposure.",
      ];
    case "mnav":
      return [
        zh
          ? `截至 ${formatDate(latest.date, locale)}，mNAV 為 ${formatRatio(
              latest.mnav,
              2,
              locale,
            )}，代表股權市值約為 BTC 財庫淨值的這個倍數。`
          : `As of ${formatDate(latest.date, locale)}, mNAV stood at ${formatRatio(
              latest.mnav,
              2,
              locale,
            )}, meaning equity value traded at that multiple of treasury NAV.`,
        zh
          ? `相較區間起點，mNAV 變動 ${formatSignedNumber(
              latest.mnav - start.mnav,
              2,
              locale,
              "x",
            )}；同時 Premium to NAV 為 ${formatPercent(
              latest.premiumToNav,
              1,
              locale,
            )}。這能更直觀看出公司包裝到底貴不貴。`
          : `Versus the start of the selected range, mNAV changed by ${formatSignedNumber(
              latest.mnav - start.mnav,
              2,
              locale,
              "x",
            )}, while Premium to NAV now sits at ${formatPercent(
              latest.premiumToNav,
              1,
              locale,
            )}. This makes the wrapper valuation easier to read at a glance.`,
        latest.mnav < 1
          ? zh
            ? "mNAV 低於 1x，代表股權市場給的總估值低於 BTC 財庫現貨淨值。"
            : "An mNAV below 1x means equity market value is sitting below the marked value of the Bitcoin treasury."
          : zh
            ? "mNAV 高於 1x，代表投資人仍願意為公司外殼支付高於財庫本身的價格。"
            : "An mNAV above 1x means investors are still paying more for the company than for the treasury alone.",
      ];
    case "navPerShare":
      return [
        zh
          ? `截至 ${formatDate(latest.date, locale)}，每一股對應約 ${formatUsd(
              latest.navPerShare,
              2,
              locale,
            )} 的 BTC 現貨淨值。這是把財庫規模翻譯成每股語言的核心橋樑。`
          : `As of ${formatDate(latest.date, locale)}, each common share mapped to about ${formatUsd(
              latest.navPerShare,
              2,
              locale,
            )} of marked BTC treasury value. This is the cleanest bridge between treasury scale and per-share economics.`,
        zh
          ? `相較區間起點，每股 NAV 變動 ${formatPercent(
              percentageChange(latest.navPerShare, start.navPerShare),
              1,
              locale,
            )}。但若股本擴張過快，每股 NAV 成長也可能被稀釋。`
          : `Versus the start of the selected range, NAV per share changed ${formatPercent(
              percentageChange(latest.navPerShare, start.navPerShare),
              1,
              locale,
            )}. Rapid share issuance can still dilute that progress on a per-share basis.`,
        zh
          ? `近 3 個月普通股變動 ${formatPercent(
              dataset.derived.threeMonthShareDrift,
              1,
              locale,
            )}，因此每股 NAV 要搭配股本路徑一起看，才是真正的 DAT.co 視角。`
          : `Common shares moved ${formatPercent(
              dataset.derived.threeMonthShareDrift,
              1,
              locale,
            )} over the last 3 months, so NAV per share only becomes a real DAT.co signal when read alongside dilution.`,
      ];
    case "satsPerShare":
      return [
        zh
          ? `截至 ${formatDate(latest.date, locale)}，每股約代表 ${formatInteger(
              latest.satsPerShare,
              locale,
            )} sats。這個指標只會在 BTC 累積速度超過股本擴張時改善。`
          : `As of ${formatDate(latest.date, locale)}, each share represented about ${formatInteger(
              latest.satsPerShare,
              locale,
            )} sats. This metric improves only when BTC accumulation outruns share growth.`,
        zh
          ? `近 3 個月每股 sats 變動 ${formatPercent(
              dataset.derived.threeMonthSatsChange,
              1,
              locale,
            )}，而普通股變動 ${formatPercent(dataset.derived.threeMonthShareDrift, 1, locale)}。`
          : `Over the last 3 months, sats per share changed ${formatPercent(
              dataset.derived.threeMonthSatsChange,
              1,
              locale,
            )} while common shares changed ${formatPercent(dataset.derived.threeMonthShareDrift, 1, locale)}.`,
        dataset.derived.threeMonthSatsChange >= 0
          ? zh
            ? "這代表最近的財庫運作仍有把每股 BTC 權益往上推，不只是單純變大而已。"
            : "That means recent treasury operations are still compounding BTC ownership on a per-share basis rather than merely growing the headline stack."
          : zh
            ? "這代表最近的增持速度沒有完全抵銷股本擴張，每股 BTC 權益反而被攤薄。"
            : "That means recent BTC accumulation was not enough to offset share growth, so per-share BTC ownership was diluted.",
      ];
    case "treasuryValue":
      return [
        zh
          ? `截至 ${formatDate(latest.date, locale)}，依最新 BTC 收盤價估算，Strategy 的 BTC 財庫約值 ${formatBillionsUsd(
              latest.bitcoinNavBillions,
              1,
              locale,
            )}。`
          : `As of ${formatDate(latest.date, locale)}, Strategy's Bitcoin treasury was worth about ${formatBillionsUsd(
              latest.bitcoinNavBillions,
              1,
              locale,
            )} at the latest BTC close.`,
        zh
          ? `相較區間起點，財庫價值變動 ${formatPercent(
              percentageChange(latest.bitcoinNavBillions, start.bitcoinNavBillions),
              1,
              locale,
            )}，主要由 BTC 價格與持幣規模共同驅動。`
          : `Versus the start of the selected range, treasury value changed ${formatPercent(
              percentageChange(latest.bitcoinNavBillions, start.bitcoinNavBillions),
              1,
              locale,
            )}, driven by both BTC price and treasury size.`,
        zh
          ? `目前股權市值約 ${formatBillionsUsd(
              latest.marketCapBillions,
              1,
              locale,
            )}，與財庫之間的落差正是 DAT.co 估值包裝的核心。`
          : `Equity market cap now sits near ${formatBillionsUsd(
              latest.marketCapBillions,
              1,
              locale,
            )}, and the gap between those two values is the heart of the DAT.co wrapper question.`,
      ];
    default:
      return [];
  }
}

export function buildMethodologyList(dataset, locale) {
  const zh = isZh(locale);

  return [
    zh
      ? `日資料價格：${dataset.methodology.priceSource}`
      : `Daily prices: ${dataset.methodology.priceSource}`,
    zh
      ? `BTC 財庫資料：${dataset.methodology.holdingsSource}`
      : `Treasury updates: ${dataset.methodology.holdingsSource}`,
    zh
      ? `股本資料：${dataset.methodology.sharesSource}`
      : `Share count updates: ${dataset.methodology.sharesSource}`,
    zh
      ? "BTC 持有量會從每次官方 as-of 日期一路前填到下一次揭露。"
      : "BTC holdings are forward-filled from each official as-of date to the next disclosure.",
    zh
      ? "普通股股數會從每次 10-Q / 10-K 的封面揭露日期前填到下一次更新。"
      : "Common shares outstanding are forward-filled from each 10-Q / 10-K cover-page as-of date.",
    zh
      ? "Premium to NAV 以交易日的 Strategy 收盤價與同日 BTC 收盤價計算。"
      : "Premium to NAV is computed on trading days using Strategy stock closes and same-day BTC closes.",
  ];
}

export function buildBtcRelationship(dataset, locale) {
  const zh = isZh(locale);
  const latest = dataset.stats.latest;
  const percentile = Math.round(dataset.stats.premiumSummary.percentile * 100);

  return [
    zh
      ? "Premium to NAV 不只是股票指標，它本質上是 BTC 包裝層的估值指標。當 BTC 漲得比 MSTR 快，溢價就會收斂；反過來則代表股票包裝在擴張。"
      : "Premium to NAV is not just a stock metric. It is a BTC wrapper metric. When BTC rises faster than MSTR, the premium compresses; when MSTR outruns its treasury, the premium expands.",
    zh
      ? `以最新讀值來看，Strategy 財庫約值 ${formatBillionsUsd(
          latest.bitcoinNavBillions,
          1,
          locale,
        )}，而股權市值約為 ${formatBillionsUsd(latest.marketCapBillions, 1, locale)}。這兩者之間的落差，就是指標真正捕捉的內容。`
      : `At the latest reading, Strategy's treasury was worth about ${formatBillionsUsd(
          latest.bitcoinNavBillions,
          1,
          locale,
        )} while equity market cap sat near ${formatBillionsUsd(
          latest.marketCapBillions,
          1,
          locale,
        )}. That gap is exactly what the indicator is measuring.`,
    zh
      ? `目前讀值約在近一年第 ${formatInteger(
          percentile,
          locale,
        )} 百分位，顯示市場對公司包裝的定價，比高溢價時期明顯冷靜。`
      : `Because the current reading is near the ${formatInteger(
          percentile,
          locale,
        )}th percentile of the last year's premium range, the market is treating the corporate wrapper much more cautiously than it did during peak premium periods.`,
  ];
}

export function buildReportIndicator(dataset, locale) {
  const zh = isZh(locale);
  const latest = dataset.stats.latest;

  return [
    zh
      ? "本專案正式選擇的指標是 Strategy（MSTR）的 Premium to NAV。我選它是因為它能直接回答 DAT.co 最核心的問題：市場對這家公司的定價，究竟高於還是低於它資產負債表上的比特幣現貨價值。"
      : "The selected indicator is Premium to NAV for Strategy (MSTR). I chose it because it directly answers the DAT.co question of whether the market is valuing the company above or below the spot value of the Bitcoin on its balance sheet.",
    zh
      ? `這比單看股價更有資訊量，因為它把財庫價值與公司外殼的可選性分開。以 ${formatDate(
          latest.date,
          locale,
        )} 的最新讀值來看，溢折價為 ${formatPercent(
          latest.premiumToNav,
          1,
          locale,
        )}，對應 mNAV ${formatRatio(latest.mnav, 2, locale)}。網站另外再延伸提供 mNAV、每股 NAV、每股 sats 與財庫價值，讓整體 DAT.co 視角更完整。`
      : `This is more informative than stock price alone because it separates treasury value from corporate optionality. On ${formatDate(
          latest.date,
          locale,
        )}, the monitor placed the premium at ${formatPercent(
          latest.premiumToNav,
          1,
          locale,
        )}, which means the stock traded at ${formatRatio(
          latest.mnav,
          2,
          locale,
        )} relative to treasury NAV. The website then extends the product with mNAV, NAV per share, sats per share, and treasury value as additional DAT.co lenses.`,
  ];
}

export function buildReportBtc(dataset, locale) {
  const zh = isZh(locale);
  const relation = dataset.stats.relativeMoves;

  return [
    zh
      ? "這個指標和 BTC 高度連動，因為分母就是以市價計算的比特幣財庫價值。若 BTC 上漲而溢價維持不變，代表 MSTR 大致只是財庫代理；若 BTC 上漲但溢價收斂，代表股票包裝正在失寵。"
      : "The indicator is tightly linked to BTC because the denominator is the marked-to-market value of Strategy's Bitcoin treasury. If BTC rises and the premium remains stable, MSTR is mostly moving as a treasury proxy. If BTC rises but the premium compresses, the equity wrapper is losing favor.",
    zh
      ? `在最近 30 個交易日，BTC 報酬為 ${formatPercent(
          relation.btc30dReturn,
          1,
          locale,
        )}，而 MSTR 報酬為 ${formatPercent(
          relation.mstr30dReturn,
          1,
          locale,
        )}。這個差距也正是 Premium to NAV 變化的背景。`
      : `In the latest 30-trading-day window, BTC moved ${formatPercent(
          relation.btc30dReturn,
          1,
          locale,
        )} while MSTR moved ${formatPercent(
          relation.mstr30dReturn,
          1,
          locale,
        )}. That divergence explains why the premium changed at the same time.`,
  ];
}

export function buildTimelineCards(dataset, locale) {
  const zh = isZh(locale);

  return dataset.holdingsEvents.slice(-6).reverse().map((event) => ({
    date: formatDate(event.asOfDate, locale),
    label: zh ? "BTC 總持有量" : "Aggregate BTC holdings",
    value: `${formatInteger(event.btcHeld, locale)} BTC`,
    copy:
      event.btcAcquired > 0
        ? zh
          ? `本次揭露期間新增 ${formatInteger(event.btcAcquired, locale)} BTC。`
          : `Strategy added ${formatInteger(event.btcAcquired, locale)} BTC during this disclosure window.`
        : zh
          ? "本次揭露期間沒有新增 BTC。"
          : "No new BTC was reported during this disclosure window.",
    meta: [
      [zh ? "期間" : "Period", `${formatDate(event.periodStart, locale)} - ${formatDate(event.periodEnd, locale)}`],
      [
        zh ? "區間均價" : "Average buy price",
        event.periodAveragePurchasePrice ? formatUsd(event.periodAveragePurchasePrice, 0, locale) : zh ? "無資料" : "N/A",
      ],
      [zh ? "申報日" : "Filing date", formatDate(event.filingDate, locale)],
    ],
    href: event.sourceUrl,
    linkLabel: zh ? "開啟 SEC 文件" : "Open SEC filing",
  }));
}

export function buildEventMarkers(dataset, visibleSeries, indicator, locale) {
  return dataset.holdingsEvents
    .map((event) => {
      const point = findPointOnOrAfter(visibleSeries, event.asOfDate);
      if (!point) {
        return null;
      }

      return {
        x: point.date,
        y: point[indicator.key],
        label:
          event.btcAcquired > 0
            ? isZh(locale)
              ? `+${formatCompactNumber(event.btcAcquired, 1, locale)} BTC`
              : `+${formatCompactNumber(event.btcAcquired, 1, locale)} BTC`
            : isZh(locale)
              ? `持有量 ${formatCompactNumber(event.btcHeld, 1, locale)}`
              : `Holdings ${formatCompactNumber(event.btcHeld, 1, locale)}`,
      };
    })
    .filter(Boolean);
}

export function buildCurrentSummary(dataset, indicator, locale) {
  const zh = isZh(locale);
  const latest = dataset.stats.latest;

  switch (indicator.id) {
    case "premiumToNav":
      if (latest.premiumToNav >= 0) {
        return zh
          ? "市場仍願意對公司包裝支付高於 BTC 財庫現貨價值的價格。"
          : "The market is still paying above spot treasury value for the corporate wrapper.";
      }

      return zh
        ? "目前股價低於財庫現貨淨值，顯示公司包裝定價偏保守。"
        : "The stock is trading below the marked value of the Bitcoin treasury.";
    case "mnav":
      if (latest.mnav >= 1) {
        return zh ? "股權估值仍高於 BTC 財庫淨值。" : "Equity value is still above treasury NAV.";
      }

      return zh ? "股權估值已跌到 BTC 財庫淨值之下。" : "Equity value is now below treasury NAV.";
    case "navPerShare":
      return zh
        ? "每股 NAV 把財庫規模轉成每股語言，是估值比較的底座。"
        : "NAV per share translates treasury scale into per-share economics.";
    case "satsPerShare":
      return zh
        ? "每股 sats 才是最接近 DAT.co 哲學的持有指標。"
        : "Sats per share is the most DAT.co-native ownership metric.";
    case "treasuryValue":
      return zh
        ? "財庫規模是所有包裝估值討論的起點。"
        : "Treasury scale is the starting point for every wrapper valuation debate.";
    default:
      return "";
  }
}

export function buildChartCaption(activeSeries, indicator, locale) {
  const zh = isZh(locale);
  const latest = activeSeries[activeSeries.length - 1];

  return zh
    ? `目前顯示 ${formatInteger(activeSeries.length, locale)} 個交易日。最新收盤日為 ${formatDate(
        latest.date,
        locale,
      )}，可搭配圖上準星線查看精確數值與揭露節點。`
    : `${formatInteger(activeSeries.length, locale)} trading days shown. Latest close: ${formatDate(
        latest.date,
        locale,
      )}. Use the crosshair to inspect exact ${indicator.label} levels and disclosure timing.`;
}

export function buildFooterMeta(dataset, locale) {
  const zh = isZh(locale);

  return zh
    ? `資料產生時間 ${formatDate(dataset.generatedAt, locale)}。涵蓋期間為 ${formatDate(
        dataset.stats.coverage.startDate,
        locale,
      )} 到 ${formatDate(dataset.stats.coverage.endDate, locale)}，共整合 ${formatInteger(
        dataset.holdingsEvents.length,
        locale,
      )} 次 BTC 揭露與 ${formatInteger(dataset.shareEvents.length, locale)} 次股本揭露。`
    : `Generated ${formatDate(dataset.generatedAt, locale)}. Coverage runs from ${formatDate(
        dataset.stats.coverage.startDate,
        locale,
      )} through ${formatDate(dataset.stats.coverage.endDate, locale)} using ${formatInteger(
        dataset.holdingsEvents.length,
        locale,
      )} BTC disclosures and ${formatInteger(dataset.shareEvents.length, locale)} share disclosures.`;
}

export function buildAiPayload(dataset, activeSeries, indicator, range, locale) {
  const latest = activeSeries[activeSeries.length - 1];
  const start = activeSeries[0];

  return {
    locale,
    range,
    indicator: {
      id: indicator.id,
      label: indicator.label,
      description: indicator.description,
    },
    latest,
    start,
    premiumSummary: dataset.stats.premiumSummary,
    relativeMoves: dataset.stats.relativeMoves,
    recentEvents: dataset.holdingsEvents.slice(-4),
    methodology: dataset.methodology,
  };
}

export function positionPercentile(percentile) {
  return `${clamp(percentile, 0.02, 0.98) * 100}%`;
}
