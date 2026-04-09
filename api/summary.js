const https = require("https");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function callOpenAI(payload, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/responses",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          if (response.statusCode >= 400) {
            return reject(new Error(data || "OpenAI request failed."));
          }
          resolve(JSON.parse(data));
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function extractOutputText(response) {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const chunks = [];

  function walk(node) {
    if (!node) {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (typeof node === "object") {
      if (typeof node.text === "string" && node.text.trim()) {
        chunks.push(node.text.trim());
      }
      Object.keys(node).forEach((key) => walk(node[key]));
    }
  }

  walk(response.output);
  return chunks.join("\n").trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 503, {
      error: "OPENAI_API_KEY is not configured for this deployment.",
    });
  }

  try {
    const rawBody = await readBody(req);
    const parsed = rawBody ? JSON.parse(rawBody) : {};
    const locale = parsed.locale === "zh-TW" ? "Traditional Chinese" : "English";
    const indicatorLabel =
      (parsed.indicator && (parsed.indicator.label || parsed.indicator.id)) ||
      "the selected DAT.co indicator";

    const prompt = [
      "You are writing a concise analyst note for a DAT.co dashboard.",
      `Write the answer in ${locale}.`,
      `Explain the current ${indicatorLabel} reading for Strategy.`,
      "Use 2 short paragraphs.",
      "Mention: latest reading, recent BTC vs MSTR relationship, and what the valuation implies for the treasury-company wrapper.",
      "Avoid hype, avoid bullet points, and avoid financial advice.",
      "",
      JSON.stringify(parsed),
    ].join("\n");

    const response = await callOpenAI(
      {
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: prompt,
        max_output_tokens: 220,
      },
      process.env.OPENAI_API_KEY,
    );

    const summary = extractOutputText(response);
    if (!summary) {
      return sendJson(res, 502, { error: "The AI response did not include summary text." });
    }

    return sendJson(res, 200, { summary });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Unexpected summary error." });
  }
};
