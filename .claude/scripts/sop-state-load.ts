#!/usr/bin/env ts-node

import { readdirSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

interface SOPState {
  task_id: string;
  sop: string;
  status: "in_progress" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  business_requirements?: Record<string, unknown>;
  current_step: number;
  steps: Record<string, { status: string; timestamp?: string }>;
  answers: Record<string, Record<string, unknown>>;
  resume_from?: string;
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

function loadLatestState(sop?: string): SOPState | null {
  const files = listStateFiles();

  const filtered = sop
    ? files.filter((f) => f.startsWith(sop))
    : files;

  if (filtered.length === 0) {
    return null;
  }

  filtered.sort().reverse();

  for (const file of filtered) {
    try {
      const filePath = resolve(getStateDir(), file);
      const content = readFileSync(filePath, "utf-8");
      const state = JSON.parse(content) as SOPState;

      if (state.status === "in_progress") {
        return state;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function loadState(sop: string): SOPState | null {
  const files = listStateFiles().filter((f) => f.startsWith(sop));

  if (files.length === 0) {
    return null;
  }

  files.sort().reverse();

  for (const file of files) {
    try {
      const filePath = resolve(getStateDir(), file);
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content) as SOPState;
    } catch {
      continue;
    }
  }

  return null;
}

function printState(state: SOPState): void {
  console.log("=".repeat(50));
  console.log(`SOP: ${state.sop}`);
  console.log(`Status: ${state.status}`);
  console.log(`Task ID: ${state.task_id}`);
  console.log(`Started: ${state.started_at}`);

  if (state.status === "in_progress") {
    console.log(`Current Step: ${state.current_step}`);
  }

  if (state.completed_at) {
    console.log(`Completed: ${state.completed_at}`);
  }

  console.log("-".repeat(50));
  console.log("Steps:");

  for (const [step, info] of Object.entries(state.steps)) {
    console.log(`  ${step}: ${info.status} (${info.timestamp || "N/A"})`);
  }

  if (Object.keys(state.answers).length > 0) {
    console.log("-".repeat(50));
    console.log("Answers:");

    for (const [step, ans] of Object.entries(state.answers)) {
      console.log(`  ${step}:`, JSON.stringify(ans));
    }
  }

  console.log("=".repeat(50));
}

function findInProgress(): void {
  const files = listStateFiles();

  console.log("[INFO] In-progress SOP states:");

  let found = false;

  for (const file of files.sort()) {
    try {
      const filePath = resolve(getStateDir(), file);
      const content = readFileSync(filePath, "utf-8");
      const state = JSON.parse(content) as SOPState;

      if (state.status === "in_progress") {
        found = true;
        printState(state);
      }
    } catch {
      continue;
    }
  }

  if (!found) {
    console.log("[INFO] No in-progress states found");
  }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: ts-node sop-state-load.ts [sop-name]");
  console.log("");
  console.log("Commands:");
  console.log("  ts-node sop-state-load.ts           # List all in-progress states");
  console.log("  ts-node sop-state-load.ts scaffold # Load latest scaffold state");
  console.log("  ts-node sop-state-load.ts --list    # List all state files");
  process.exit(1);
}

const arg = args[0];

if (arg === "--list") {
  const files = listStateFiles();
  console.log("[INFO] State files:");
  for (const file of files.sort().reverse()) {
    console.log(`  ${file}`);
  }
  process.exit(0);
}

if (arg === "--all") {
  findInProgress();
  process.exit(0);
}

const state = loadState(arg);

if (!state) {
  console.log(`[WARN] No state found for: ${arg}`);
  process.exit(0);
}

printState(state);

if (state.status === "in_progress") {
  console.log("\n[OK] Ready for resume. Use current_step:", state.current_step);
}

process.exit(0);