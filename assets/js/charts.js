import { formatIndicatorValue } from "./insights.js";
import {
  formatBillionsUsd,
  formatInteger,
  formatNumber,
  formatRatio,
  formatUsd,
  movingAverage,
  rebaseSeries,
} from "./utils.js";

let indicatorChart;
let relativeChart;

const crosshairPlugin = {
  id: "cursorCrosshair",
  afterDatasetsDraw(chart, _args, options) {
    const activeElements = chart.tooltip?.getActiveElements?.() || [];
    if (!activeElements.length || !chart.chartArea) {
      return;
    }

    const { ctx, chartArea } = chart;
    const { x, y } = activeElements[0].element;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = options?.color || "rgba(20,20,19,0.18)";

    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chartArea.left, y);
    ctx.lineTo(chartArea.right, y);
    ctx.stroke();
    ctx.restore();
  },
};

if (globalThis.Chart?.registry && !globalThis.Chart.registry.plugins.get("cursorCrosshair")) {
  globalThis.Chart.register(crosshairPlugin);
}

function formatAxisTick(indicator, value, locale) {
  switch (indicator.unit) {
    case "percent-points":
      return `${formatNumber(value, 0, locale)}%`;
    case "ratio":
      return formatRatio(value, 1, locale);
    case "usd":
      return formatUsd(value, 0, locale);
    case "sats":
      return formatInteger(value, locale);
    case "billions-usd":
      return formatBillionsUsd(value, 0, locale);
    default:
      return formatNumber(value, 0, locale);
  }
}

function buildCommonOptions(locale) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      cursorCrosshair: {
        color: "rgba(20,20,19,0.2)",
      },
      legend: {
        labels: {
          color: "#5e5d59",
          boxWidth: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(20,20,19,0.92)",
        titleColor: "#faf9f5",
        bodyColor: "#f5f4ed",
        borderColor: "#30302e",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
        },
        ticks: {
          color: "#87867f",
        },
        grid: {
          color: "rgba(232,230,220,0.8)",
        },
      },
      y: {
        ticks: {
          color: "#87867f",
        },
        grid: {
          color: "rgba(232,230,220,0.8)",
        },
      },
    },
  };
}

export function renderIndicatorChart(canvas, series, indicator, markers, locale) {
  if (indicatorChart) {
    indicatorChart.destroy();
  }

  const chartData = series.map((point) => ({
    x: point.date,
    y: point[indicator.key],
  }));

  const datasets = [
    {
      label: indicator.lineLabel,
      data: chartData,
      borderColor: indicator.color,
      backgroundColor: indicator.fill,
      fill: indicator.id !== "satsPerShare",
      tension: indicator.stepped ? 0 : 0.24,
      stepped: indicator.stepped,
      pointRadius: 0,
      pointHoverRadius: 0,
      borderWidth: 2.5,
    },
  ];

  if (indicator.showAverage) {
    datasets.push({
      label: indicator.averageLabel,
      data: movingAverage(series, indicator.key, 20),
      borderColor: "#5e5d59",
      borderDash: [6, 6],
      pointRadius: 0,
      borderWidth: 1.8,
      fill: false,
      tension: 0.16,
    });
  }

  datasets.push({
    label: locale === "zh-TW" ? "揭露節點" : "Disclosure markers",
    data: markers,
    type: "scatter",
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: "#66745b",
    pointBorderColor: "#faf9f5",
    pointBorderWidth: 1.5,
  });

  const options = buildCommonOptions(locale);
  options.scales.y.title = {
    display: true,
    text: indicator.axisLabel,
    color: "#5e5d59",
  };
  options.scales.y.ticks.callback = (value) => formatAxisTick(indicator, value, locale);
  options.plugins.tooltip.callbacks = {
    label(context) {
      if (context.dataset.type === "scatter") {
        return context.raw.label;
      }

      return `${context.dataset.label}: ${formatIndicatorValue(indicator, context.parsed.y, locale)}`;
    },
  };

  indicatorChart = new Chart(canvas, {
    type: "line",
    data: { datasets },
    options,
  });
}

export function renderRelativeChart(canvas, series, locale) {
  if (relativeChart) {
    relativeChart.destroy();
  }

  const options = buildCommonOptions(locale);
  options.scales.y.title = {
    display: true,
    text: locale === "zh-TW" ? "重設為 100" : "Rebased to 100",
    color: "#5e5d59",
  };
  options.plugins.tooltip.callbacks = {
    label(context) {
      return `${context.dataset.label}: ${formatNumber(context.parsed.y, 1, locale)}`;
    },
  };

  relativeChart = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "MSTR",
          data: rebaseSeries(series, "mstrClose"),
          borderColor: "#141413",
          backgroundColor: "rgba(20,20,19,0.08)",
          fill: false,
          tension: 0.22,
          borderWidth: 2.4,
          pointRadius: 0,
        },
        {
          label: "BTC-USD",
          data: rebaseSeries(series, "btcClose"),
          borderColor: "#d2ad61",
          backgroundColor: "rgba(210,173,97,0.1)",
          fill: false,
          tension: 0.22,
          borderWidth: 2.2,
          pointRadius: 0,
        },
      ],
    },
    options,
  });
}
