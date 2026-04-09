export function getIntlLocale(locale = "en") {
  return locale === "zh-TW" ? "zh-TW" : "en-US";
}

export function formatNumber(value, digits = 0, locale = "en") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatSignedNumber(value, digits = 1, locale = "en", suffix = "") {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatNumber(Math.abs(value), digits, locale)}${suffix}`;
}

export function formatPercent(value, digits = 1, locale = "en") {
  return formatSignedNumber(value * 100, digits, locale, "%");
}

export function formatPercentFromPct(value, digits = 1, locale = "en") {
  return formatSignedNumber(value, digits, locale, "%");
}

export function formatRatio(value, digits = 2, locale = "en") {
  return `${formatNumber(value, digits, locale)}x`;
}

export function formatUsd(value, digits = 0, locale = "en") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function formatBillionsUsd(value, digits = 1, locale = "en") {
  return `${formatUsd(value, digits, locale)}B`;
}

export function formatCompactNumber(value, digits = 1, locale = "en") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatInteger(value, locale = "en") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value, locale = "en") {
  const date = new Date(value);
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(value, locale = "en") {
  const date = new Date(value);
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function percentageChange(current, previous) {
  if (!previous) {
    return 0;
  }
  return current / previous - 1;
}

export function calculatePercentile(series, key, value) {
  const values = series
    .map((point) => point[key])
    .filter((entry) => Number.isFinite(entry))
    .sort((left, right) => left - right);

  if (!values.length) {
    return 0.5;
  }

  const rank = values.filter((entry) => entry <= value).length;
  return rank / values.length;
}

export function getRangeSlice(series, rangeKey) {
  if (!series.length) {
    return [];
  }

  if (rangeKey === "ALL") {
    return series.slice();
  }

  if (rangeKey === "YTD") {
    const currentYear = series[series.length - 1].date.slice(0, 4);
    return series.filter((point) => point.date.startsWith(currentYear));
  }

  const tradingDayWindows = {
    "1M": 22,
    "3M": 66,
    "6M": 132,
    "1Y": 252,
  };

  const windowSize = tradingDayWindows[rangeKey] || series.length;
  return series.slice(-windowSize);
}

export function movingAverage(series, key, windowSize = 20) {
  return series.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = series.slice(start, index + 1);
    const total = window.reduce((sum, item) => sum + item[key], 0);
    return {
      x: point.date,
      y: total / window.length,
    };
  });
}

export function rebaseSeries(series, key) {
  if (!series.length) {
    return [];
  }

  const base = series[0][key];
  return series.map((point) => ({
    x: point.date,
    y: (point[key] / base) * 100,
  }));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function findPointOnOrAfter(series, targetDate) {
  return series.find((point) => point.date >= targetDate) || null;
}
