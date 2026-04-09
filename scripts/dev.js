const path = require("path");
const childProcess = require("child_process");

const rootDir = path.resolve(__dirname, "..");
require("./load-env")(rootDir);

function tryRefreshDataset() {
  console.log("Attempting to refresh dataset before starting dev server...");

  const result = childProcess.spawnSync("python3", ["scripts/generate_dataset.py"], {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (result.error || result.status !== 0) {
    console.warn("Dataset refresh skipped. Using the bundled dataset instead.");
    console.warn("If you want fresh data, run `pip3 install -r requirements.txt` and `npm run refresh:data`.");
    return;
  }

  console.log("Dataset refresh completed.");
}

tryRefreshDataset();
require(path.join(rootDir, "server.js"));
