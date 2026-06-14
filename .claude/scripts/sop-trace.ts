#!/usr/bin/env ts-node
/**
 * sop-trace.ts — Phase D2: Cross-SOP traceability
 *
 * Given a trace_id (e.g. prd-2026-06-10-abc123), follow the chain across
 * .sop/state/, .sop/output/, git commits, and produce a traceability report.
 *
 * Usage:
 *   npx ts-node sop-trace.ts <trace_id>           # full chain
 *   npx ts-node sop-trace.ts --list                # all known traces
 *   npx ts-node sop-trace.ts --link <parent> <child>  # link two SOPs
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const STATE_DIR = resolve(process.cwd(), ".sop", "state");
const OUTPUT_DIR = resolve(process.cwd(), ".sop", "output");

interface State {
  task_id: string;
  trace_id?: string;
  sop: string;
  status: string;
  started_at: string;
  completed_at?: string;
  current_step?: number;
  parent_trace?: string | null;
  children?: string[];
  answers?: Record<string, unknown>;
  steps?: Record<string, { status: string; timestamp?: string }>;
}

function loadAllStates(): State[] {
  if (!existsSync(STATE_DIR)) return [];
  return readdirSync(STATE_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(resolve(STATE_DIR, f), "utf-8")) as State;
      } catch {
        return null;
      }
    })
    .filter((s): s is State => s !== null);
}

function findStateByTrace(traceId: string): State | null {
  const all = loadAllStates();
  return all.find((s) => s.trace_id === traceId) || null;
}

function findOutputsForTrace(traceId: string): string[] {
  if (!existsSync(OUTPUT_DIR)) return [];
  // PRD/HTML/summary outputs may embed trace_id in frontmatter
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && /\.(md|html|yaml|json)$/i.test(entry.name)) {
        try {
          const content = readFileSync(full, "utf-8");
          if (content.includes(traceId)) {
            found.push(full.replace(process.cwd() + "\\", "").replace(process.cwd() + "/", ""));
          }
        } catch { /* skip */ }
      }
    }
  };
  walk(OUTPUT_DIR);
  return found;
}

function findGitCommitsForTrace(traceId: string): string[] {
  try {
    // Suppress stderr cross-platform: use shell redirection compatible with both bash and Windows.
    const out = execSync(`git log --all --oneline --grep="${traceId}"`, {
      cwd: process.cwd(),
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function listAllTraces(): void {
  const all = loadAllStates().filter((s) => s.trace_id);
  if (all.length === 0) {
    console.log("(no trace_ids found in .sop/state/)");
    return;
  }
  console.log("# All Known Traces");
  console.log();
  console.log("| trace_id | sop | status | started | parent |");
  console.log("|----------|-----|--------|---------|--------|");
  for (const s of all.sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""))) {
    console.log(
      `| ${s.trace_id} | ${s.sop} | ${s.status} | ${(s.started_at || "").slice(0, 19)} | ${s.parent_trace || "-"} |`,
    );
  }
}

function showTrace(traceId: string): void {
  const state = findStateByTrace(traceId);
  if (!state) {
    console.error(`[ERROR] trace_id not found: ${traceId}`);
    console.error(`Run with --list to see all known traces.`);
    process.exit(1);
  }

  console.log(`# Trace: ${traceId}`);
  console.log();
  console.log(`- **SOP**: ${state.sop}`);
  console.log(`- **Status**: ${state.status}`);
  console.log(`- **Started**: ${state.started_at}`);
  if (state.completed_at) console.log(`- **Completed**: ${state.completed_at}`);
  console.log(`- **Current Step**: ${state.current_step}`);
  if (state.parent_trace) console.log(`- **Parent**: ${state.parent_trace}`);
  if (state.children && state.children.length) console.log(`- **Children**: ${state.children.join(", ")}`);

  console.log();
  console.log(`## Steps`);
  console.log();
  if (state.steps) {
    console.log(`| Step | Status | Timestamp |`);
    console.log(`|------|--------|-----------|`);
    for (const [step, info] of Object.entries(state.steps)) {
      console.log(`| ${step} | ${info.status} | ${info.timestamp || "-"} |`);
    }
  } else {
    console.log("(no steps recorded)");
  }

  console.log();
  console.log(`## Outputs`);
  console.log();
  const outputs = findOutputsForTrace(traceId);
  if (outputs.length === 0) {
    console.log("(no output files reference this trace_id)");
  } else {
    for (const o of outputs) console.log(`- ${o}`);
  }

  console.log();
  console.log(`## Git Commits`);
  console.log();
  const commits = findGitCommitsForTrace(traceId);
  if (commits.length === 0) {
    console.log("(no git commits reference this trace_id)");
    console.log("Tip: include `[trace: <trace_id>]` in commit messages to link.");
  } else {
    for (const c of commits) console.log(`- ${c}`);
  }

  // Recurse into parent / children
  if (state.parent_trace) {
    console.log();
    console.log(`## Parent SOP`);
    const parent = findStateByTrace(state.parent_trace);
    if (parent) {
      console.log(`- ${parent.sop} (${parent.status}) → trace: ${parent.trace_id}`);
    } else {
      console.log(`- ${state.parent_trace} (state file not found)`);
    }
  }

  if (state.children && state.children.length) {
    console.log();
    console.log(`## Child SOPs`);
    for (const childId of state.children) {
      const child = findStateByTrace(childId);
      if (child) {
        console.log(`- ${child.sop} (${child.status}) → trace: ${child.trace_id}`);
      } else {
        console.log(`- ${childId} (state file not found)`);
      }
    }
  }

  console.log();
  console.log(`---`);
  console.log(`*Generated by sop-trace.ts at ${new Date().toISOString()}*`);
}

function linkTraces(parentId: string, childId: string): void {
  const all = loadAllStates();
  const parent = all.find((s) => s.trace_id === parentId);
  const child = all.find((s) => s.trace_id === childId);

  if (!parent || !child) {
    console.error(`[ERROR] trace_id not found:`);
    if (!parent) console.error(`  parent: ${parentId}`);
    if (!child) console.error(`  child: ${childId}`);
    process.exit(1);
  }

  // Update child.parent_trace
  child.parent_trace = parentId;
  // Append to parent.children
  parent.children = parent.children || [];
  if (!parent.children.includes(childId)) {
    parent.children.push(childId);
  }

  // Persist (find the file by task_id)
  for (const file of readdirSync(STATE_DIR).filter((f) => f.endsWith(".json"))) {
    const path = resolve(STATE_DIR, file);
    try {
      const s = JSON.parse(readFileSync(path, "utf-8")) as State;
      if (s.trace_id === parentId) {
        writeFileSync(path, JSON.stringify(parent, null, 2), "utf-8");
        console.log(`[OK] Updated parent: ${file}`);
      } else if (s.trace_id === childId) {
        writeFileSync(path, JSON.stringify(child, null, 2), "utf-8");
        console.log(`[OK] Updated child: ${file}`);
      }
    } catch { /* skip */ }
  }

  console.log(`[OK] Linked ${parentId} → ${childId}`);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage:");
  console.log("  sop-trace.ts <trace_id>                # show full chain");
  console.log("  sop-trace.ts --list                    # list all traces");
  console.log("  sop-trace.ts --link <parent> <child>   # link two SOPs");
  process.exit(1);
}

if (args[0] === "--list") {
  listAllTraces();
} else if (args[0] === "--link") {
  if (args.length < 3) {
    console.error("Usage: sop-trace.ts --link <parent_trace_id> <child_trace_id>");
    process.exit(1);
  }
  linkTraces(args[1], args[2]);
} else {
  showTrace(args[0]);
}
