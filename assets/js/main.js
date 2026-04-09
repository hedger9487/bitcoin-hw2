import { applyStaticCopy, getCopy } from "./i18n.js";
import {
  buildAiPayload,
  buildBtcRelationship,
  buildChartCaption,
  buildCurrentSummary,
  buildEventMarkers,
  buildFooterMeta,
  buildHeroFacts,
  buildHeroMeta,
  buildKpis,
  buildMethodologyList,
  buildNarrative,
  buildPhilosophyCards,
  buildReportBtc,
  buildReportIndicator,
  buildTimelineCards,
  formatIndicatorValue,
  getIndicatorById,
  getIndicatorDefinitions,
  positionPercentile,
} from "./insights.js";
import { renderIndicatorChart, renderRelativeChart } from "./charts.js";
import { calculatePercentile, getRangeSlice } from "./utils.js";

const state = {
  dataset: null,
  range: localStorage.getItem("btcl.range") || "1Y",
  indicator: localStorage.getItem("btcl.indicator") || "premiumToNav",
  locale: localStorage.getItem("btcl.locale") || detectInitialLocale(),
};

function detectInitialLocale() {
  const browserLocale = navigator.language || "";
  return browserLocale.toLowerCase().startsWith("zh") ? "zh-TW" : "en";
}

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

async function loadDataset() {
  const response = await fetch("./assets/data/strategy-premium-nav.json");
  if (!response.ok) {
    throw new Error("Unable to load dataset.");
  }
  return response.json();
}

function getLookbackPoint(series, windowSize) {
  return series[Math.max(0, series.length - windowSize - 1)] || series[0];
}

function enhanceDataset(dataset) {
  const series = dataset.series.map((point) => {
    const btcPerShare = point.btcHeld / point.totalShares;

    return {
      ...point,
      btcPerShare,
      satsPerShare: btcPerShare * 100_000_000,
      bitcoinNavBillions: point.bitcoinNav / 1_000_000_000,
      marketCapBillions: point.marketCap / 1_000_000_000,
      navGapBillions: (point.marketCap - point.bitcoinNav) / 1_000_000_000,
    };
  });

  const latest = series[series.length - 1];
  const threeMonthPoint = getLookbackPoint(series, 66);

  return {
    ...dataset,
    series,
    stats: {
      ...dataset.stats,
      latest: latest,
    },
    derived: {
      latest,
      threeMonthPoint,
      threeMonthShareDrift: latest.totalShares / threeMonthPoint.totalShares - 1,
      threeMonthSatsChange: latest.satsPerShare / threeMonthPoint.satsPerShare - 1,
      activePercentile: dataset.stats.premiumSummary.percentile,
    },
  };
}

function renderIndicatorButtons() {
  const indicators = getIndicatorDefinitions(state.locale);
  $("#indicatorToggle").innerHTML = indicators
    .map(
      (indicator) => `
        <button class="indicator-toggle__button" data-indicator="${indicator.id}" role="tab" aria-selected="${
          indicator.id === state.indicator
        }">
          <span class="indicator-toggle__label">${indicator.shortLabel}</span>
          <span class="indicator-toggle__text">${indicator.description}</span>
        </button>
      `,
    )
    .join("");
}

function renderHeroMetaAndFacts() {
  const heroMeta = buildHeroMeta(state.dataset, state.locale);
  const heroFacts = buildHeroFacts(state.dataset.stats.latest, state.locale);

  $("#heroMeta").innerHTML = heroMeta
    .map(
      (item) => `
        <div class="hero-meta__item">
          <div class="hero-meta__label">${item.label}</div>
          <div class="hero-meta__value">${item.value}</div>
        </div>
      `,
    )
    .join("");

  $("#heroFacts").innerHTML = heroFacts
    .map(
      ([label, value]) => `
        <dt>${label}</dt>
        <dd>${value}</dd>
      `,
    )
    .join("");
}

function renderPhilosophyCards() {
  $("#philosophyGrid").innerHTML = buildPhilosophyCards(state.dataset, state.locale)
    .map(
      (card) => `
        <article class="philosophy-card">
          <p class="eyebrow eyebrow--muted">${card.eyebrow}</p>
          <div class="philosophy-card__value">${card.value}</div>
          <h3>${card.title}</h3>
          <p>${card.copy}</p>
          <div class="philosophy-card__meta">
            ${card.meta
              .map(
                ([label, value]) => `
                  <span><strong>${label}</strong><em>${value}</em></span>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderMethodologyAndReport() {
  $("#methodologyList").innerHTML = buildMethodologyList(state.dataset, state.locale)
    .map((item) => `<li>${item}</li>`)
    .join("");

  $("#btcRelationship").innerHTML = buildBtcRelationship(state.dataset, state.locale)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  $("#reportIndicator").innerHTML = buildReportIndicator(state.dataset, state.locale)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  $("#reportBtc").innerHTML = buildReportBtc(state.dataset, state.locale)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

function renderTimeline() {
  $("#timelineGrid").innerHTML = buildTimelineCards(state.dataset, state.locale)
    .map(
      (card) => `
        <article class="timeline-card">
          <div class="timeline-card__date">${card.date}</div>
          <div class="timeline-card__label">${card.label}</div>
          <div class="timeline-card__value">${card.value}</div>
          <p class="timeline-card__copy">${card.copy}</p>
          <div class="timeline-card__meta">
            ${card.meta.map(([label, value]) => `<span><strong>${label}</strong><em>${value}</em></span>`).join("")}
          </div>
          <a class="text-link timeline-card__link" href="${card.href}" target="_blank" rel="noreferrer">${card.linkLabel}</a>
        </article>
      `,
    )
    .join("");
}

function renderKpis() {
  $("#statsGrid").innerHTML = buildKpis(state.dataset, state.locale)
    .map(
      (item) => `
        <article class="stat-card">
          <div class="stat-card__label">${item.label}</div>
          <div class="stat-card__value ${item.state}">${item.value}</div>
          <div class="stat-card__note">${item.note}</div>
        </article>
      `,
    )
    .join("");
}

function updateAriaAndLabels() {
  const copy = getCopy(state.locale);
  const activeIndicator = getIndicatorById(state.locale, state.indicator);

  document.documentElement.lang = state.locale === "zh-TW" ? "zh-Hant" : "en";
  $(".locale-switch").setAttribute("aria-label", copy.ui.localeSwitchAria);
  $(".range-toggle").setAttribute("aria-label", copy.ui.rangeSelectorAria);
  $("#indicatorToggle").setAttribute("aria-label", copy.ui.indicatorSelectorAria);
  $("#downloadDatasetLink").textContent = copy.ui.downloadDataset;
  $("#heroEyebrow").textContent = `${copy.ui.heroEyebrowPrefix}: ${activeIndicator.label}`;
  $("#aiSummaryBody").textContent = copy.ui.aiDefault;
  $("#aiSummaryButton").textContent = copy.ui.generate;
}

function getHeadlineTone(indicator, latest) {
  if (indicator.id === "premiumToNav") {
    return latest.premiumToNav >= 0 ? "is-positive" : "is-negative";
  }

  if (indicator.id === "mnav") {
    return latest.mnav >= 1 ? "is-positive" : "is-negative";
  }

  return "";
}

function renderDynamicSections() {
  const indicator = getIndicatorById(state.locale, state.indicator);
  const visibleSeries = getRangeSlice(state.dataset.series, state.range);
  const latest = visibleSeries[visibleSeries.length - 1];
  const markers = buildEventMarkers(state.dataset, visibleSeries, indicator, state.locale);
  const percentile = calculatePercentile(state.dataset.series, indicator.key, latest[indicator.key]);

  state.dataset.derived.activePercentile = percentile;

  $("#currentPremium").textContent = formatIndicatorValue(indicator, latest[indicator.key], state.locale);
  $("#currentPremium").className = `headline-stat ${getHeadlineTone(indicator, latest)}`.trim();
  $("#currentSummary").textContent = buildCurrentSummary(state.dataset, indicator, state.locale);
  $("#narrative").innerHTML = buildNarrative(state.dataset, visibleSeries, indicator, state.locale)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  $("#valuationDot").style.left = positionPercentile(percentile);
  $("#valuationLabelLow").textContent = indicator.laneLabels[0];
  $("#valuationLabelMid").textContent = indicator.laneLabels[1];
  $("#valuationLabelHigh").textContent = indicator.laneLabels[2];
  $("#chartCaption").textContent = buildChartCaption(visibleSeries, indicator, state.locale);

  renderIndicatorChart($("#premiumChart"), visibleSeries, indicator, markers, state.locale);
  renderRelativeChart($("#relativeChart"), visibleSeries, state.locale);
}

function setActiveButtons() {
  $all("[data-range]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.range === state.range);
  });

  $all("[data-indicator]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.indicator === state.indicator);
  });

  $all("[data-locale]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.locale === state.locale);
  });
}

function persistState() {
  localStorage.setItem("btcl.range", state.range);
  localStorage.setItem("btcl.indicator", state.indicator);
  localStorage.setItem("btcl.locale", state.locale);
}

function renderApp() {
  applyStaticCopy(state.locale);
  renderIndicatorButtons();
  updateAriaAndLabels();
  renderHeroMetaAndFacts();
  renderPhilosophyCards();
  renderKpis();
  renderMethodologyAndReport();
  renderTimeline();
  renderDynamicSections();
  $("#footerMeta").textContent = buildFooterMeta(state.dataset, state.locale);
  setActiveButtons();
}

function bindControls() {
  $all("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.range = button.dataset.range;
      persistState();
      renderDynamicSections();
      setActiveButtons();
    });
  });

  $("#indicatorToggle").addEventListener("click", (event) => {
    const button = event.target.closest("[data-indicator]");
    if (!button) {
      return;
    }

    state.indicator = button.dataset.indicator;
    persistState();
    renderApp();
  });

  $(".locale-switch").addEventListener("click", (event) => {
    const button = event.target.closest("[data-locale]");
    if (!button) {
      return;
    }

    state.locale = button.dataset.locale;
    persistState();
    renderApp();
  });

  $("#aiSummaryButton").addEventListener("click", requestAiSummary);
}

async function requestAiSummary() {
  const indicator = getIndicatorById(state.locale, state.indicator);
  const visibleSeries = getRangeSlice(state.dataset.series, state.range);
  const payload = buildAiPayload(state.dataset, visibleSeries, indicator, state.range, state.locale);
  const copy = getCopy(state.locale);
  const button = $("#aiSummaryButton");
  const body = $("#aiSummaryBody");

  button.disabled = true;
  button.textContent = copy.ui.generating;
  body.textContent = copy.ui.aiRequesting;

  try {
    const response = await fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Summary request failed.");
    }

    body.innerHTML = data.summary
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  } catch (error) {
    body.innerHTML = `
      <p>${error.message}</p>
      <p>${copy.ui.aiFallback}</p>
    `;
  } finally {
    button.disabled = false;
    button.textContent = copy.ui.generate;
  }
}

async function main() {
  try {
    state.dataset = enhanceDataset(await loadDataset());
    bindControls();
    renderApp();
  } catch (error) {
    console.error(error);
    $("#currentSummary").textContent = getCopy(state.locale).ui.datasetError;
    $("#narrative").innerHTML = `<p>${error.message}</p>`;
  }
}

main();
