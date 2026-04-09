const https = require("https");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function callHook(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: "POST",
      },
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode >= 400) {
            reject(new Error(data || "Deploy hook request failed."));
            return;
          }

          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (_error) {
            resolve({ raw: data });
          }
        });
      },
    );

    request.on("error", reject);
    request.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!process.env.CRON_SECRET) {
    return sendJson(res, 503, {
      error: "CRON_SECRET is not configured for this deployment.",
    });
  }

  if (!process.env.VERCEL_DEPLOY_HOOK_URL) {
    return sendJson(res, 503, {
      error: "VERCEL_DEPLOY_HOOK_URL is not configured for this deployment.",
    });
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  try {
    const response = await callHook(process.env.VERCEL_DEPLOY_HOOK_URL);
    return sendJson(res, 200, {
      ok: true,
      message: "Redeploy triggered. The next build will regenerate the dataset.",
      hookResponse: response,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || "Redeploy trigger failed.",
    });
  }
};
