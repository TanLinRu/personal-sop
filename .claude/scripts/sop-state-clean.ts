#!/usr/bin/env ts-node

import { readdirSync, unlinkSync, existsSync, readFileSync } from "fs";
import { resolve } from "path";

interface SOPState {
  task_id: string;
  sop: string;
  status: "in_progress" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  current_step: number;
  steps: Record<string, { status: string; timestamp?: string }>;
}

function getStateDir(): string {
  return resolve(process.cwd(), ".sop", "state");
}

function listStateFiles(): string[] {
  const dir = getStateDir();
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir).filter((f) => f.endsWith(".json"));
}

function cleanCompleted(): number {
  const files = listStateFiles();
  let cleaned = 0;

  console.log("[INFO] Cleaning completed states...");

  for (const file of files) {
    try {
      const filePath = resolve(getStateDir(), file);
      const content = readFileSync(filePath, "utf-8");
      const state = JSON.parse(content) as SOPState;

      if (state.status === "completed" || state.status === "failed") {
        unlinkSync(filePath);
        console.log(`[CLEAN] Removed: ${file}`);
        cleaned++;
      }
    } catch {
      continue;
    }
  }

  console.log(`[OK] Cleaned ${cleaned} state files`);
  return cleaned;
}

function cleanAll(): number {
  const files = listStateFiles();
  let cleaned = 0;

  console.log("[INFO] Cleaning ALL states...");

  for (const file of files) {
    try {
      const filePath = resolve(getStateDir(), file);
      unlinkSync(filePath);
      console.log(`[CLEAN] Removed: ${file}`);
      cleaned++;
    } catch {
      continue;
    }
  }

  console.log(`[OK] Cleaned ${cleaned} state files`);
  return cleaned;
}

function cleanBySOP(sop: string): number {
  const files = listStateFiles().filter((f) => f.startsWith(sop));
  let cleaned = 0;

  console.log(`[INFO] Cleaning states for: ${sop}`);

  for (const file of files) {
    try {
      const filePath = resolve(getStateDir(), file);
      unlinkSync(filePath);
      console.log(`[CLEAN] Removed: ${file}`);
      cleaned++;
    } catch {
      continue;
    }
  }

  console.log(`[OK] Cleaned ${cleaned} state files`);
  return cleaned;
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: ts-node sop-state-clean.ts [command]");
  console.log("");
  console.log("Commands:");
  console.log("  ts-node sop-state-clean.ts           # Clean completed/failed");
  console.log("  ts-node sop-state-clean.ts --all    # Clean ALL states");
  console.log("  ts-node sop-state-clean.ts scaffold # Clean scaffold states");
  console.log("");
  console.log("Note: Does NOT remove in-progress states");
  process.exit(1);
}

const arg = args[0];

if (arg === "--all") {
  cleanAll();
} else if (arg.startsWith("--")) {
  console.log("[INFO] Cleaning completed states only...");
  cleanCompleted();
} else {
  cleanBySOP(arg);
}

process.exit(0);