#!/usr/bin/env ts-node

import { spawn } from "child_process";

interface StopOptions {
  port?: number;
  processName?: string;
}

async function stopService(options: StopOptions): Promise<void> {
  const { port, processName } = options;

  if (!port && !processName) {
    console.error("[ERROR] Please specify port or processName");
    process.exit(1);
  }

  if (port) {
    console.log(`[INFO] Stopping process on port ${port}...`);
    
    // Windows: use netstat + taskkill
    const findPid = spawn("powershell", [
      "-NoProfile",
      "-Command",
      `(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1 | ForEach-Object { $_ }`
    ], { shell: false });

    let pid: number | null = null;

    await new Promise<void>((resolve) => {
      findPid.stdout?.on("data", (data) => {
        const output = data.toString().trim();
        if (output) {
          pid = parseInt(output, 10);
        }
      });
      findPid.on("close", () => resolve());
    });

    if (pid) {
      console.log(`[INFO] Found PID: ${pid}, killing...`);
      try {
        process.kill(pid);
        console.log(`[OK] Process ${pid} killed`);
      } catch (e: any) {
        console.error(`[ERROR] Failed to kill: ${e.message}`);
      }
    } else {
      console.log("[WARN] No process found on port");
    }
  }

  if (processName) {
    console.log(`[INFO] Killing process: ${processName}`);
    const kill = spawn("powershell", [
      "-NoProfile",
      "-Command",
      `Stop-Process -Name "${processName}" -Force -ErrorAction SilentlyContinue`
    ], { shell: false });
    
    await new Promise<void>((resolve) => {
      kill.on("close", () => resolve());
    });
    console.log(`[OK] ${processName} killed`);
  }

  console.log("[OK] Service stopped");
  return;
}

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("Usage: ts-node stop-service.ts <port|process-name>");
  console.error("Example: ts-node stop-service.ts 8080");
  console.error("Example: ts-node stop-service.ts java");
  process.exit(1);
}

const arg = args[0];
const isPort = /^\d+$/.test(arg);

stopService({
  port: isPort ? parseInt(arg, 10) : undefined,
  processName: isPort ? undefined : arg,
})
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`[ERROR] ${err.message}`);
    process.exit(1);
  });