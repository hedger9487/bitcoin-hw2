const siteCopy = {
  en: {
    meta: {
      title: "Bitcoin Treasury Ledger",
      description:
        "A bilingual DAT.co dashboard for Strategy with Premium to NAV, mNAV, NAV per share, sats per share, and BTC treasury value.",
    },
    ids: {
      brandTitle: "Bitcoin Treasury Ledger",
      brandSubtitle: "DAT.co indicator monitor",
      navDashboard: "Dashboard",
      navIndicator: "Indicator",
      navMethodology: "Methodology",
      navReport: "Report",
      heroTitle: "Track how a Bitcoin treasury company trades against the asset base beneath it.",
      heroLede:
        "Premium to NAV remains the formal assignment indicator, while the product goes further with DAT.co lenses like mNAV, NAV per share, sats per share, and treasury value.",
      heroPrimaryCta: "Open Dashboard",
      heroSecondaryCta: "Read Methodology",
      currentReadingLabel: "Current Reading",
      brief1Eyebrow: "Required selected indicator",
      brief1Title: "Premium to NAV",
      brief1Body:
        "Premium to NAV is the official indicator chosen for the assignment. It measures whether Strategy's equity trades above or below the marked value of the Bitcoin it holds.",
      brief2Eyebrow: "Why this choice?",
      brief2Title: "It captures valuation heat",
      brief2Body:
        "The premium isolates how much investors are paying for treasury execution, leverage, and capital-markets optionality beyond raw BTC exposure.",
      brief3Eyebrow: "Relationship with BTC",
      brief3Title: "It shows whether the wrapper is outrunning the asset",
      brief3Body:
        "If BTC rises faster than MSTR, the premium compresses. If MSTR outruns the treasury itself, the premium expands and the equity wrapper becomes more expensive.",
      philosophyEyebrow: "DAT.co lens",
      philosophyTitle: "Built around treasury-company thinking",
      philosophyText:
        "The dashboard goes beyond the minimum requirement by surfacing the per-share treasury stack, dilution path, and capital-wrapper temperature that DAT.co investors actually watch.",
      dashboardEyebrow: "Dashboard",
      dashboardTitle: "Daily DAT.co monitor",
      dashboardText:
        "Switch between multiple treasury-company indicators and inspect how valuation, dilution, and per-share Bitcoin ownership evolve over time.",
      primaryChartEyebrow: "Indicator lab",
      primaryChartTitle: "DAT.co indicators over time",
      primaryChartCaption:
        "Move your cursor on the chart to inspect the crosshair and compare levels precisely.",
      signalEyebrow: "Signal brief",
      signalTitle: "Reading the tape",
      aiEyebrow: "Optional bonus",
      aiTitle: "AI-generated summary",
      aiNote:
        "This sends the current dashboard view to a server-side route only if OPENAI_API_KEY is configured. The rest of the product works without it.",
      contextEyebrow: "Context chart",
      contextTitle: "MSTR versus BTC, rebased",
      contextText:
        "Rebased to 100 at the start of the selected range so you can see whether the equity wrapper is amplifying or lagging Bitcoin.",
      timelineEyebrow: "Treasury flow",
      timelineTitle: "Recent holding updates",
      timelineText:
        "Strategy's 8-K disclosures give the indicator its treasury heartbeat. These cards summarize the latest steps in BTC balance growth.",
      formulaEyebrow: "Formula",
      formulaTitle: "Premium to NAV",
      formulaCode:
        "((share price x common shares outstanding)\n/ (bitcoin held x BTC price)) - 1",
      formulaBody:
        "A value above zero means Strategy trades above the spot value of its Bitcoin. A value below zero means the stock sits below treasury value.",
      methodEyebrow: "Data collection",
      methodTitle: "Source stack",
      interpretEyebrow: "Interpretation",
      interpretTitle: "How this relates to BTC",
      reportEyebrow: "Report support",
      reportTitle: "Submission-ready notes",
      reportText:
        "This section mirrors the assignment structure. Premium to NAV remains the selected indicator, while the dashboard adds extra DAT.co lenses as product upgrades.",
      reportIndicatorTitle: "Selected indicator",
      reportBtcTitle: "Relationship with BTC",
      reportDeployTitle: "Deployment note",
      reportDeployBody:
        "Add your public deployment URL after publishing. The project runs locally with npm and deploys cleanly to Vercel or similar hosting.",
      footerReportLink: "Report draft",
      footerReadmeLink: "README",
    },
    ui: {
      heroEyebrowPrefix: "Current lens",
      valuationLow: "Low",
      valuationMid: "1Y percentile",
      valuationHigh: "High",
      localeSwitchAria: "Language switch",
      indicatorSelectorAria: "Indicator selector",
      rangeSelectorAria: "Time range",
      downloadDataset: "Download dataset",
      generate: "Generate",
      generating: "Generating",
      currentSummaryLoading: "Loading the latest DAT.co signal.",
      chartLoading: "Loading indicator chart and disclosure markers.",
      aiDefault:
        "Use the built-in signal brief, or generate a short LLM note when your deployment is configured for it.",
      aiRequesting: "Requesting a server-side summary for the current view.",
      aiFallback:
        "The built-in signal brief remains fully usable without AI configuration.",
      datasetError: "The dataset could not be loaded.",
      timelineSource: "Open SEC filing",
      latestClose: "Latest close",
      tradingDaysShown: "trading days shown",
    },
  },
  "zh-TW": {
    meta: {
      title: "Bitcoin Treasury Ledger",
      description:
        "一個支援繁中與英文切換的 DAT.co 儀表板，追蹤 Strategy 的 Premium to NAV、mNAV、每股 NAV、每股 sats 與 BTC 財庫價值。",
    },
    ids: {
      brandTitle: "Bitcoin Treasury Ledger",
      brandSubtitle: "DAT.co 指標觀測台",
      navDashboard: "儀表板",
      navIndicator: "指標說明",
      navMethodology: "方法論",
      navReport: "報告",
      heroTitle: "追蹤比特幣財庫公司，如何相對它真正持有的資產被市場定價。",
      heroLede:
        "本作業正式選用的指標仍是 Premium to NAV，但產品本身進一步延伸到 mNAV、每股 NAV、每股 sats 與財庫價值，讓整個 DAT.co 視角更完整。",
      heroPrimaryCta: "打開儀表板",
      heroSecondaryCta: "查看方法論",
      currentReadingLabel: "目前讀值",
      brief1Eyebrow: "作業正式選題",
      brief1Title: "Premium to NAV",
      brief1Body:
        "Premium to NAV 是本次作業正式選擇的指標，用來衡量 Strategy 股價相對其比特幣財庫現貨淨值，究竟是在溢價還是折價交易。",
      brief2Eyebrow: "為什麼選它？",
      brief2Title: "它最能反映估值熱度",
      brief2Body:
        "相較只看股價，這個指標能把 BTC 財庫價值與公司外殼的額外定價拆開，呈現市場對資本操作、槓桿與執行力的評價。",
      brief3Eyebrow: "和 BTC 的關係",
      brief3Title: "它顯示股票包裝是否跑贏底層資產",
      brief3Body:
        "如果 BTC 上漲得比 MSTR 快，溢價就會收斂；如果 MSTR 跑贏財庫本身，代表市場願意對公司包裝支付更高價格。",
      philosophyEyebrow: "DAT.co 視角",
      philosophyTitle: "用財庫公司邏輯來看資料",
      philosophyText:
        "這個版本不只滿足最低要求，還把 DAT.co 投資人真正會看的每股財庫、稀釋路徑與公司包裝溫度一起做進來。",
      dashboardEyebrow: "儀表板",
      dashboardTitle: "DAT.co 日度監測",
      dashboardText:
        "你可以在多個財庫公司指標之間切換，觀察估值、稀釋與每股比特幣權益如何隨時間演變。",
      primaryChartEyebrow: "指標實驗室",
      primaryChartTitle: "DAT.co 指標時間序列",
      primaryChartCaption:
        "把游標移到圖上即可看到準星線，能更精準比較不同時間點的變化。",
      signalEyebrow: "訊號摘要",
      signalTitle: "怎麼解讀這張表",
      aiEyebrow: "加分功能",
      aiTitle: "AI 自動摘要",
      aiNote:
        "只有在部署環境設定 OPENAI_API_KEY 時，才會呼叫伺服器端摘要路由。就算不開 AI，整個產品仍可正常使用。",
      contextEyebrow: "脈絡圖表",
      contextTitle: "MSTR 與 BTC 的相對走勢",
      contextText:
        "以所選區間起點重設為 100，方便比較股票包裝究竟是在放大還是落後 Bitcoin。",
      timelineEyebrow: "財庫流向",
      timelineTitle: "近期持幣更新",
      timelineText:
        "Strategy 的 8-K 揭露提供了財庫節奏。這些卡片濃縮了最新的 BTC 持倉變化。",
      formulaEyebrow: "公式",
      formulaTitle: "Premium to NAV",
      formulaCode:
        "((share price x common shares outstanding)\n/ (bitcoin held x BTC price)) - 1",
      formulaBody:
        "數值大於 0 代表 Strategy 股價高於其比特幣現貨淨值；數值小於 0 則代表股票低於財庫價值交易。",
      methodEyebrow: "資料蒐集",
      methodTitle: "資料來源堆疊",
      interpretEyebrow: "解讀方式",
      interpretTitle: "這個指標如何連到 BTC",
      reportEyebrow: "報告支援",
      reportTitle: "可直接寫進報告的重點",
      reportText:
        "這一區對齊作業報告結構。正式選題仍是 Premium to NAV，但網站額外擴充了更完整的 DAT.co 產品能力。",
      reportIndicatorTitle: "選擇的指標",
      reportBtcTitle: "與 BTC 的關係",
      reportDeployTitle: "部署說明",
      reportDeployBody:
        "公開部署後把網站網址補在這裡即可。專案可用 npm 在本地啟動，也能乾淨部署到 Vercel 或其他平台。",
      footerReportLink: "報告草稿",
      footerReadmeLink: "README",
    },
    ui: {
      heroEyebrowPrefix: "目前觀測指標",
      valuationLow: "低檔",
      valuationMid: "一年分位",
      valuationHigh: "高檔",
      localeSwitchAria: "語言切換",
      indicatorSelectorAria: "指標切換",
      rangeSelectorAria: "時間區間",
      downloadDataset: "下載資料集",
      generate: "產生摘要",
      generating: "產生中",
      currentSummaryLoading: "正在載入最新 DAT.co 訊號。",
      chartLoading: "正在載入指標圖與揭露標記。",
      aiDefault:
        "你可以先直接閱讀內建訊號摘要，若部署環境設定完成，也能呼叫 LLM 產生短版分析。",
      aiRequesting: "正在向伺服器請求目前視圖的 AI 摘要。",
      aiFallback: "即使沒有 AI 設定，內建的訊號摘要也可以完整使用。",
      datasetError: "資料集載入失敗。",
      timelineSource: "開啟 SEC 文件",
      latestClose: "最新收盤",
      tradingDaysShown: "個交易日",
    },
  },
};

export function getCopy(locale) {
  return siteCopy[locale] || siteCopy.en;
}

export function applyStaticCopy(locale) {
  const copy = getCopy(locale);

  Object.entries(copy.ids).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  document.title = copy.meta.title;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", copy.meta.description);
  }
}
