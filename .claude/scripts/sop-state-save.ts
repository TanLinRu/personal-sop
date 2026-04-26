#!/usr/bin/env ts-node

import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

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

interface SaveOptions {
  sop: string;
  step: string;
  status: "pending" | "in_progress" | "completed";
  data?: Partial<SOPState>;
  answers?: Record<string, unknown>;
}

function getStateDir(): string {
  return resolve(process.cwd(), ".sop", "state");
}

function getStateFilePath(sop: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const dir = getStateDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return resolve(dir, `${sop}-${date}.json`);
}

function loadState(sop: string): SOPState | null {
  const filePath = getStateFilePath(sop);
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const content = require("fs").readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function saveState(options: SaveOptions): void {
  const { sop, step, status, data, answers } = options;
  const filePath = getStateFilePath(sop);

  let state: SOPState;

  if (existsSync(filePath)) {
    try {
      const content = require("fs").readFileSync(filePath, "utf-8");
      state = JSON.parse(content);
    } catch {
      state = createInitialState(sop);
    }
  } else {
    state = createInitialState(sop);
  }

  state.current_step = state.current_step || 1;
  state.steps = state.steps || {};

  if (step) {
    state.steps[step] = {
      status,
      timestamp: new Date().toISOString(),
    };
  }

  if (status === "in_progress") {
    state.status = "in_progress";
  } else if (status === "completed") {
    state.status = "completed";
    state.completed_at = new Date().toISOString();
  }

  if (answers) {
    state.answers = state.answers || {};
    state.answers[step] = answers;
  }

  if (data) {
    Object.assign(state, data);
  }

  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  console.log(`[OK] State saved: ${filePath}`);
  console.log(`[OK] Step: ${step} -> ${status}`);
}

function createInitialState(sop: string): SOPState {
  return {
    task_id: `${sop}-${Date.now()}`,
    sop,
    status: "in_progress",
    started_at: new Date().toISOString(),
    current_step: 1,
    steps: {},
    answers: {},
  };
}

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: ts-node sop-state-save.ts <sop-name> <step> <status> [key=value...]");
  console.error("Example: ts-node sop-state-save.ts scaffold 1_confirm in_progress");
  console.error("Example: ts-node sop-state-save.ts backend 2_research completed database=H2");
  process.exit(1);
}

const sop = args[0];
const step = args[1];
const status = args[2] as "pending" | "in_progress" | "completed";
const answers: Record<string, unknown> = {};

for (const arg of args.slice(3)) {
  const [key, value] = arg.split("=");
  if (key && value) {
    answers[key] = value;
  }
}

saveState({
  sop,
  step,
  status: status || "in_progress",
  answers: Object.keys(answers).length > 0 ? answers : undefined,
});

process.exit(0);