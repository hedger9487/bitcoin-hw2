const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "public");

function removeDirectory(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
}

function ensureDirectory(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyRecursive(sourcePath, destinationPath) {
  const stats = fs.statSync(sourcePath);

  if (stats.isDirectory()) {
    ensureDirectory(destinationPath);

    fs.readdirSync(sourcePath).forEach((entry) => {
      copyRecursive(path.join(sourcePath, entry), path.join(destinationPath, entry));
    });
    return;
  }

  ensureDirectory(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
}

function main() {
  removeDirectory(outputDir);
  ensureDirectory(outputDir);

  [
    "index.html",
    "README.md",
    "REPORT.md",
    "assets",
  ].forEach((entry) => {
    copyRecursive(path.join(rootDir, entry), path.join(outputDir, entry));
  });

  console.log("Prepared static build output in public/.");
}

main();
