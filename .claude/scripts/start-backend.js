/**
 * Start Backend Service
 * Usage: node start-backend.js <project-dir> [port] [profiles]
 * 
 * Fixed: Use PowerShell Start-Process directly (not nested cmd)
 */

const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const [, , projectDir, port = "8080", profiles = "dev"] = process.argv;

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function log(level, msg) {
  const color = level === "ERROR" ? RED : level === "OK" ? GREEN : YELLOW;
  console.log(color + "[" + level + "]" + RESET + " " + msg);
}

if (!projectDir) {
  log("ERROR", "Usage: node start-backend.js <project-dir> [port] [profiles]");
  process.exit(1);
}

const absProjectDir = path.resolve(projectDir);
if (!fs.existsSync(absProjectDir)) {
  log("ERROR", "Project directory not found: " + absProjectDir);
  process.exit(1);
}

const pomPath = path.join(absProjectDir, "pom.xml");
if (!fs.existsSync(pomPath)) {
  log("ERROR", "pom.xml not found");
  process.exit(1);
}

log("INFO", "Starting backend: " + absProjectDir + ", port: " + port);

// Use PowerShell Start-Process directly (works reliably)
const psCommand = `
Start-Process -FilePath '${path.join(absProjectDir, "mvnw.cmd")}' -ArgumentList 'spring-boot:run' -WorkingDirectory '${absProjectDir}' -WindowStyle Hidden
`.trim();

try {
  // Execute PowerShell command
  execSync(`powershell -NoProfile -Command "${psCommand}"`, { 
    stdio: "ignore", 
    shell: true 
  });
  
  log("OK", "Backend starting in background...");
  log("OK", "Wait ~20-30 seconds for startup");
  log("INFO", "Access: http://localhost:" + port + "/api");
} catch (e) {
  log("ERROR", "Failed to start: " + e.message);
  log("INFO", "Try manually: cd " + projectDir + " && mvnw spring-boot:run");
}

process.exit(0);