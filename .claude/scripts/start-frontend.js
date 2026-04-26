/**
 * Start Frontend Service
 * Usage: node start-frontend.js <project-dir> [port]
 * 
 * Fixed: Use PowerShell Start-Process directly (not nested cmd)
 */

const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const [, , projectDir, port = "5173"] = process.argv;

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function log(level, msg) {
  const color = level === "ERROR" ? RED : level === "OK" ? GREEN : YELLOW;
  console.log(`${color}[${level}]${RESET} ${msg}`);
}

if (!projectDir) {
  log("ERROR", "Usage: node start-frontend.js <project-dir> [port]");
  process.exit(1);
}

const absProjectDir = path.resolve(projectDir);
if (!fs.existsSync(absProjectDir)) {
  log("ERROR", `Project directory not found: ${absProjectDir}`);
  process.exit(1);
}

const packageJsonPath = path.join(absProjectDir, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  log("ERROR", "package.json not found");
  process.exit(1);
}

// Check node_modules
const nodeModulesPath = path.join(absProjectDir, "node_modules");
if (!fs.existsSync(nodeModulesPath)) {
  log("WARN", "node_modules not found, need to run npm install first");
  log("INFO", "Try: cd " + projectDir + " && npm install");
  process.exit(1);
}

log("INFO", `Starting frontend: ${absProjectDir}, port: ${port}`);

// Use PowerShell Start-Process directly (works reliably)
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const psCommand = `
Start-Process -FilePath '${npmCmd}' -ArgumentList 'run','dev' -WorkingDirectory '${absProjectDir}' -WindowStyle Hidden
`.trim();

try {
  // Execute PowerShell command
  execSync(`powershell -NoProfile -Command "${psCommand}"`, { 
    stdio: "ignore", 
    shell: true 
  });
  
  log("OK", "Frontend starting in background...");
  log("OK", "Wait ~5-10 seconds for startup");
  log("INFO", "Access: http://localhost:" + port);
} catch (e) {
  log("ERROR", "Failed to start: " + e.message);
  log("INFO", "Try manually: cd " + projectDir + " && npm run dev");
}

process.exit(0);