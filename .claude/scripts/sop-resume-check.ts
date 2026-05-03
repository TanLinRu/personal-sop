#!/usr/bin/env ts-node

const fs = require("fs");
const path = require("path");

function getStateDir(): string {
  return path.resolve(process.cwd(), ".sop", "state");
}

function loadStepMap(): Record<string, string[]> {
  const mapPath = path.resolve(__dirname, "sop-step-map.json");
  if (!fs.existsSync(mapPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(mapPath, "utf-8"));
}

function findStateFile(sop: string): string | null {
  const dir = getStateDir();
  if (!fs.existsSync(dir)) {
    return null;
  }
  const files = fs.readdirSync(dir)
    .filter((f: string) => f.startsWith(`${sop}-`) && f.endsWith(".json"))
    .sort()
    .reverse();
  return files.length > 0 ? path.resolve(dir, files[0]) : null;
}

function checkResume(sop: string): void {
  const filePath = findStateFile(sop);
  if (!filePath) {
    console.log(JSON.stringify({ has_resume: false, sop }));
    return;
  }

  try {
    const state = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (state.status !== "in_progress") {
      console.log(JSON.stringify({ has_resume: false, sop, status: state.status }));
      return;
    }

    const stepMap = loadStepMap();
    const steps = stepMap[sop] || [];
    const nextStepId = state.current_step > 0 && state.current_step <= steps.length
      ? steps[state.current_step - 1]
      : null;

    console.log(
      JSON.stringify({
        has_resume: true,
        sop: state.sop,
        current_step: state.current_step,
        next_step_id: nextStepId,
        completed_steps: Object.entries(state.steps)
          .filter(([_, v]: [string, any]) => v.status === "completed")
          .map(([k]: [string, any]) => k),
        answers: state.answers,
        state_file: filePath,
      })
    );
  } catch {
    console.log(JSON.stringify({ has_resume: false, sop, error: "Failed to read state file" }));
  }
}

// CLI entry point
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("Usage: node sop-resume-check.ts <sop-name>");
  console.error("Example: node sop-resume-check.ts scaffold");
  process.exit(1);
}

checkResume(args[0]);
process.exit(0);
