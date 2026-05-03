#!/usr/bin/env ts-node

const fs = require("fs");
const path = require("path");

function getStateDir(): string {
  return path.resolve(process.cwd(), ".sop", "state");
}

function getStateFilePath(sop: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const dir = getStateDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.resolve(dir, `${sop}-${date}.json`);
}

function loadStepMap(): Record<string, string[]> {
  const mapPath = path.resolve(__dirname, "sop-step-map.json");
  if (!fs.existsSync(mapPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(mapPath, "utf-8"));
}

function loadState(sop: string): any {
  const filePath = getStateFilePath(sop);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function saveState(sop: string, step: string, status: string, answers?: Record<string, unknown>): void {
  const filePath = getStateFilePath(sop);
  const stepMap = loadStepMap();

  let state: any;
  if (fs.existsSync(filePath)) {
    try {
      state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      state = createInitialState(sop);
    }
  } else {
    state = createInitialState(sop);
  }

  state.steps = state.steps || {};

  if (step) {
    state.steps[step] = {
      status,
      timestamp: new Date().toISOString(),
    };
  }

  if (answers && Object.keys(answers).length > 0) {
    state.answers = state.answers || {};
    state.answers[step] = answers;
  }

  // Advance current_step when a step completes
  if (status === "completed") {
    const steps = stepMap[sop];
    if (steps) {
      const idx = steps.indexOf(step);
      if (idx >= 0 && idx < steps.length - 1) {
        // More steps remain - advance to next
        state.current_step = idx + 2; // 1-based, next step
        state.status = "in_progress";
      } else if (idx === steps.length - 1) {
        // Last step completed - mark entire SOP as done
        state.status = "completed";
        state.completed_at = new Date().toISOString();
        state.current_step = steps.length;
      }
    } else {
      // No step map found - just mark step done, keep in_progress
      state.status = "in_progress";
    }
  } else if (status === "in_progress") {
    state.status = "in_progress";
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  console.log(`[OK] State saved: ${filePath}`);
  console.log(`[OK] Step: ${step} -> ${status}`);
  console.log(`[OK] current_step: ${state.current_step}`);
}

function createInitialState(sop: string): any {
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

// CLI entry point
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node sop-state-save.ts <sop-name> <step> <status> [key=value...]");
  console.error("Example: node sop-state-save.ts scaffold 1_confirm in_progress");
  console.error("Example: node sop-state-save.ts scaffold 1_confirm completed project_name=myapp");
  process.exit(1);
}

const sop = args[0];
const step = args[1];
const status = args[2] || "in_progress";
const answers: Record<string, unknown> = {};

for (const arg of args.slice(3)) {
  const [key, value] = arg.split("=");
  if (key && value) {
    answers[key] = value;
  }
}

saveState(sop, step, status, Object.keys(answers).length > 0 ? answers : undefined);
process.exit(0);
