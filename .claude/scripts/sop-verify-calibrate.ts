#!/usr/bin/env ts-node
/**
 * sop-verify-calibrate.ts — Phase D3: Calibrate sop-verify weights against
 * golden eval results.
 *
 * The premise: current sop-verify weights (steps:0.30, outputs:0.30,
 * params:0.20, state:0.10, quality:0.10) are unmeasured. We treat the
 * golden eval scores (structure, length, dor, coverage) as ground truth
 * and find weights for sop-verify dimensions that maximally correlate
 * with the eval verdict.
 *
 * For now this implements a *simplified* DMAIC Measure pass:
 *   1. Run sop-eval on all golden fixtures → eval_score per fixture
 *   2. Run sop-verify --deep-review on each → verify dimensions
 *   3. Compute correlation between verify dimensions and eval_score
 *   4. Suggest weight adjustments
 *
 * Usage:
 *   sop-verify-calibrate.ts <sop>           # report only
 *   sop-verify-calibrate.ts <sop> --apply   # write to expected.yml weights
 */

import { execSync } from "child_process";
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve } from "path";

interface EvalResult {
  fixture: string;
  tier: string;
  scores: {
    structure: number;
    length: number;
    dor: number;
    coverage: number;
    total: number;
  };
  verdict: "PASS" | "WARN" | "FAIL";
}

interface VerifyDimensions {
  steps: number;       // basicValidation.stepCompliance.valid -> 1.0 / 0.0
  outputs: number;     // basicValidation.outputCompleteness.valid
  params: number;      // basicValidation.paramConsistency.valid
  state: number;       // basicValidation.stateConsistency.valid
  length: number;      // lengthBudget.status: pass=1, warn=0.5, fail=0
}

const REPO_ROOT = process.cwd();
const SCRIPT_DIR = resolve(REPO_ROOT, ".claude", "scripts");

function runEval(sop: string): EvalResult[] {
  const out = execSync(
    `npx ts-node --transpile-only ${resolve(SCRIPT_DIR, "sop-eval.ts")} ${sop} --json`,
    { encoding: "utf-8", cwd: REPO_ROOT },
  );
  return JSON.parse(out);
}

function runVerifyDeepReview(sop: string): any | null {
  try {
    const out = execSync(
      `npx ts-node --transpile-only ${resolve(SCRIPT_DIR, "sop-verify.ts")} ${sop} --deep-review`,
      { encoding: "utf-8", cwd: REPO_ROOT },
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function extractVerifyDimensions(plan: any): VerifyDimensions {
  const bv = plan.basicValidation || {};
  const lb = plan.lengthBudget;
  return {
    steps: bv.stepCompliance?.valid ? 1.0 : 0.0,
    outputs: bv.outputCompleteness?.valid ? 1.0 : 0.0,
    params: bv.paramConsistency?.valid ? 1.0 : 0.0,
    state: bv.stateConsistency?.valid ? 1.0 : 0.0,
    length: lb ? (lb.status === "pass" ? 1.0 : lb.status === "warn" ? 0.5 : 0.0) : 0.5,
  };
}

function pearson(xs: number[], ys: number[]): number {
  if (xs.length !== ys.length || xs.length === 0) return 0;
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

interface CalibrationReport {
  sop: string;
  sample_count: number;
  fixtures_used: string[];
  current_weights: Record<string, number>;
  correlations: Record<string, number>;
  suggested_weights: Record<string, number>;
  rationale: string;
  data_sample: any[];
}

function calibrate(sop: string): CalibrationReport {
  const evalResults = runEval(sop);

  // For each eval fixture, run sop-verify --deep-review.
  // Note: in v6.0.0, verify reads .sop/state and .sop/output, not the golden
  // expected.md directly. Without a real run, we can only show one data point
  // (the most recent state/output). This reports the **current** signal.
  const verifyPlan = runVerifyDeepReview(sop);

  const data: any[] = [];

  if (verifyPlan) {
    const dims = extractVerifyDimensions(verifyPlan);
    // Use the highest-scoring eval result as the correlated score.
    // (proper calibration needs N runs, not 1; this is a bootstrap.)
    const evalScore = evalResults.reduce(
      (max, r) => Math.max(max, r.scores.total),
      0,
    );
    data.push({
      source: "current_state",
      verify_dims: dims,
      eval_score: evalScore,
    });
  }

  // Augment with the historical FAIL case (the 343-line PRD)
  const historical = resolve(REPO_ROOT, ".sop", "output", "prd-logistics-20260508.md");
  if (existsSync(historical)) {
    try {
      const evalOut = execSync(
        `npx ts-node --transpile-only ${resolve(SCRIPT_DIR, "sop-eval.ts")} ${sop} logistics --against ${historical} --json`,
        { encoding: "utf-8", cwd: REPO_ROOT },
      );
      const histResults = JSON.parse(evalOut) as EvalResult[];
      if (histResults.length > 0) {
        // Synthesize verify dimensions for the historical case (12-section
        // FULL with no state file → most dims fail).
        data.push({
          source: "historical_fail_logistics",
          verify_dims: { steps: 0, outputs: 0, params: 0, state: 0, length: 0 },
          eval_score: histResults[0].scores.total,
        });
      }
    } catch { /* ignore */ }
  }

  // Add the golden expected.md as the "perfect" case
  data.push({
    source: "golden_expected_pass",
    verify_dims: { steps: 1, outputs: 1, params: 1, state: 1, length: 1 },
    eval_score: evalResults.reduce((s, r) => s + r.scores.total, 0) / evalResults.length,
  });

  // Compute correlations
  const dims = ["steps", "outputs", "params", "state", "length"] as const;
  const correlations: Record<string, number> = {};
  for (const d of dims) {
    const xs = data.map((row) => row.verify_dims[d]);
    const ys = data.map((row) => row.eval_score);
    correlations[d] = pearson(xs, ys);
  }

  // Convert correlations to weights (positive corr → high weight, normalized)
  const positives = Object.fromEntries(
    Object.entries(correlations).map(([k, v]) => [k, Math.max(0, v)]),
  );
  const sum = Object.values(positives).reduce((a, b) => a + b, 0);
  const suggested = sum > 0
    ? Object.fromEntries(Object.entries(positives).map(([k, v]) => [k, +(v / sum).toFixed(3)]))
    : { steps: 0.25, outputs: 0.25, params: 0.20, state: 0.15, length: 0.15 };

  return {
    sop,
    sample_count: data.length,
    fixtures_used: evalResults.map((r) => r.fixture),
    current_weights: { steps: 0.30, outputs: 0.30, params: 0.20, state: 0.10, quality: 0.10 },
    correlations,
    suggested_weights: suggested,
    rationale:
      data.length < 10
        ? `BOOTSTRAP: only ${data.length} samples (need 10+ for reliable calibration). ` +
          `Suggested weights are directional; collect more historical runs before applying.`
        : `Calibrated on ${data.length} samples using Pearson correlation between verify dimensions and golden eval scores.`,
    data_sample: data,
  };
}

function format(report: CalibrationReport): string {
  const lines: string[] = [];
  lines.push(`# sop-verify Calibration Report — ${report.sop}`);
  lines.push("");
  lines.push(`- **Samples**: ${report.sample_count}`);
  lines.push(`- **Fixtures**: ${report.fixtures_used.join(", ")}`);
  lines.push("");
  lines.push(`## Correlations (verify dimension ↔ golden eval score)`);
  lines.push("");
  lines.push(`| Dimension | Correlation |`);
  lines.push(`|-----------|-------------|`);
  for (const [k, v] of Object.entries(report.correlations)) {
    const bar = v >= 0 ? "█".repeat(Math.round(v * 10)) : "░".repeat(Math.round(-v * 10));
    lines.push(`| ${k} | ${v.toFixed(3)} ${bar} |`);
  }
  lines.push("");
  lines.push(`## Current vs Suggested Weights`);
  lines.push("");
  lines.push(`| Dimension | Current | Suggested | Δ |`);
  lines.push(`|-----------|---------|-----------|---|`);
  for (const k of Object.keys(report.suggested_weights)) {
    const cur = report.current_weights[k] || 0;
    const sug = report.suggested_weights[k] || 0;
    const delta = sug - cur;
    const sign = delta >= 0 ? "+" : "";
    lines.push(`| ${k} | ${cur.toFixed(2)} | ${sug.toFixed(3)} | ${sign}${delta.toFixed(3)} |`);
  }
  lines.push("");
  lines.push(`## Rationale`);
  lines.push("");
  lines.push(report.rationale);
  lines.push("");
  lines.push(`## Data Sample`);
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(report.data_sample, null, 2));
  lines.push("```");
  return lines.join("\n");
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: sop-verify-calibrate.ts <sop> [--apply] [--json]");
  process.exit(1);
}

const sop = args[0];
const json = args.includes("--json");
const apply = args.includes("--apply");

try {
  const report = calibrate(sop);
  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(format(report));
  }

  if (apply) {
    console.log("\n[INFO] --apply not yet implemented (would write to expected.yml). " +
      "Suggested weights printed above; manually update expected.yml constraints.weights.");
  }
} catch (err: any) {
  console.error(`[ERROR] ${err.message}`);
  process.exit(2);
}
