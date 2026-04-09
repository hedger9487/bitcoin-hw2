const fs = require("fs");
const path = require("path");
const http = require("http");

const rootDir = __dirname;
require("./scripts/load-env")(rootDir);
const port = Number(process.env.PORT || 3000);
const apiHandlers = {
  "/api/summary": require("./api/summary"),
  "/api/redeploy": require("./api/redeploy"),
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", contentType);
  res.end(body);
}

function resolveStaticPath(pathname) {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const decodedPath = decodeURIComponent(normalizedPath);
  const candidatePath = path.join(rootDir, decodedPath);

  if (!candidatePath.startsWith(rootDir)) {
    return null;
  }

  return candidatePath;
}

async function serveStaticFile(filePath, res) {
  try {
    const stats = await fs.promises.stat(filePath);
    const targetPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const data = await fs.promises.readFile(targetPath);
    const contentType = contentTypes[path.extname(targetPath)] || "application/octet-stream";
    send(res, 200, data, contentType);
  } catch (error) {
    if (error.code === "ENOENT") {
      send(res, 404, "Not found.");
      return;
    }

    send(res, 500, error.message || "Unexpected server error.");
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (apiHandlers[requestUrl.pathname]) {
    return apiHandlers[requestUrl.pathname](req, res);
  }

  const filePath = resolveStaticPath(requestUrl.pathname);
  if (!filePath) {
    send(res, 403, "Forbidden.");
    return;
  }

  await serveStaticFile(filePath, res);
});

server.listen(port, () => {
  console.log(`Bitcoin Treasury Ledger running at http://127.0.0.1:${port}`);
});
