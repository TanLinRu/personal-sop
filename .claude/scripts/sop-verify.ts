#!/usr/bin/env ts-node

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "fs";
import { resolve, basename } from "path";

interface SOPState {
  task_id: string;
  sop: string;
  status: "in_progress" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  current_step: number;
  steps: Record<string, { status: string; timestamp?: string }>;
  answers: Record<string, Record<string, unknown>>;
  verification?: {
    status: "passed" | "failed" | "needs_review";
    score: number;
    timestamp: string;
    issues: number;
    details: {
      allStepsCompleted: boolean;
      outputsPresent: boolean;
      lengthBudgetOk?: boolean;
      antiPatterns: number;
    };
  };
}

interface BasicValidation {
  stepCompliance: { valid: boolean; issues: { step: string; problem: string }[] };
  outputCompleteness: { valid: boolean; issues: { file: string; problem: string }[] };
  stateConsistency: { valid: boolean; issues: { step: string; problem: string }[] };
  paramConsistency: { valid: boolean; issues: { param: string; problem: string }[] };
}

interface AgentDispatch {
  agent: string;
  priority: "required" | "recommended" | "optional";
  prompt: string;
}

interface DeepReviewPlan {
  sop: string;
  status: string;
  basicValidation: BasicValidation;
  agentsToDispatch: AgentDispatch[];
  hasCodeOutput: boolean;
  hasArchOutput: boolean;
  lengthBudget?: LengthBudgetResult;
}

interface LengthBudgetResult {
  tier: string;
  budget: number;
  failThreshold: number;
  actual: number;
  status: "pass" | "warn" | "fail";
  deviation: number;
  message: string;
}

function parseLengthBudgetFromYaml(sop: string): { maxLines: Record<string, number>; failThresholds: Record<string, number> } | null {
  const path = getExpectedPath(sop);
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8");

  const maxLinesMatch = content.match(/max_lines:\s*\n((?:\s+\w+:\s*\d+\s*\n)+)/);
  const failMatch = content.match(/fail_threshold:\s*\n((?:\s+\w+:\s*\d+\s*\n)+)/);

  if (!maxLinesMatch || !failMatch) return null;

  const parseTierMap = (block: string): Record<string, number> => {
    const map: Record<string, number> = {};
    const lines = block.split("\n");
    for (const line of lines) {
      const m = line.trim().match(/^(\w+):\s*(\d+)$/);
      if (m) map[m[1]] = parseInt(m[2], 10);
    }
    return map;
  };

  return {
    maxLines: parseTierMap(maxLinesMatch[1]),
    failThresholds: parseTierMap(failMatch[1]),
  };
}

function checkLengthBudget(
  sop: string,
  expected: Record<string, any> | null,
  outputs: { path: string; size: number }[],
): LengthBudgetResult | null {
  const budgets = parseLengthBudgetFromYaml(sop);
  if (!budgets) return null;

  const maxLines = budgets.maxLines;
  const failThresholds = budgets.failThresholds;

  const tierAnswers = loadState(sop)?.answers || {};
  const tier = (tierAnswers["2_doc_type_reqs"] as any)?.tier || "lite";
  const budget = maxLines[tier] || 200;
  const fail = failThresholds[tier] || 250;

  const prdFile = outputs.find((o) => o.path.match(/prd-.*\.md$/) && !o.path.includes(".DRAFT.") && !o.path.includes(".summary."));
  if (!prdFile) return null;

  const content = readFileSync(resolve(getOutputDir(), prdFile.path), "utf-8");
  const lineCount = content.split("\n").length;

  let status: "pass" | "warn" | "fail" = "pass";
  let message = `Length within budget (${lineCount} ≤ ${budget})`;
  if (lineCount > fail) {
    status = "fail";
    message = `Length exceeds FAIL threshold (${lineCount} > ${fail})`;
  } else if (lineCount > budget) {
    status = "warn";
    message = `Length exceeds budget (${lineCount} > ${budget})`;
  }

  return {
    tier,
    budget,
    failThreshold: fail,
    actual: lineCount,
    status,
    deviation: lineCount - budget,
    message,
  };
}

function getStateDir(): string {
  return resolve(process.cwd(), ".sop", "state");
}

function getOutputDir(): string {
  return resolve(process.cwd(), ".sop", "output");
}

function getExpectedPath(sop: string): string {
  return resolve(process.cwd(), ".claude", "skills", `sop-${sop}`, "expected.yml");
}

function getStepMapPath(): string {
  return resolve(process.cwd(), ".claude", "scripts", "sop-step-map.json");
}

function getSkillDir(sop: string): string {
  return resolve(process.cwd(), ".claude", "skills", `sop-${sop}`);
}

function loadState(sop: string): SOPState | null {
  const dir = getStateDir();
  if (!existsSync(dir)) return null;

  const files = readdirSync(dir)
    .filter((f) => f.startsWith(sop) && f.endsWith(".json"))
    .sort()
    .reverse();

  for (const file of files) {
    try {
      return JSON.parse(readFileSync(resolve(dir, file), "utf-8")) as SOPState;
    } catch { continue; }
  }
  return null;
}

function loadExpected(sop: string): string | null {
  const path = getExpectedPath(sop);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

function loadStepMap(): Record<string, string[]> | null {
  const path = getStepMapPath();
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function loadExpectedYaml(sop: string): Record<string, any> | null {
  const path = getExpectedPath(sop);
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8");
  const result: Record<string, any> = { expected_steps: [], expected_outputs: [], expected_params: [], constraints: {}, contracts: {} };

  const lines = content.split("\n");
  let section: string | null = null;
  let currentItem: Record<string, any> = {};
  let inListItem = false;

  const pushOutput = (): void => {
    if (Object.keys(currentItem).length > 0) {
      const path = currentItem.file || currentItem.path || "";
      if (path) {
        const existing = result.expected_outputs.find((o: any) => (o.file || o.path) === path);
        if (!existing) result.expected_outputs.push({ ...currentItem });
      }
      currentItem = {};
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") continue;

    const sectionMatch = trimmed.match(/^(\w+):$/);
    if (sectionMatch && !trimmed.startsWith("-") && !trimmed.startsWith("  ")) {
      if (section === "expected_outputs") pushOutput();
      if (section === "expected_steps") { /* keep parsing */ }
      if (section === "expected_params") { /* keep parsing */ }
      section = sectionMatch[1];
      inListItem = false;
      continue;
    }

    if (section === "expected_steps" && trimmed.startsWith("- id:")) {
      result.expected_steps.push(trimmed.replace("- id:", "").trim());
      continue;
    }

    if (section === "expected_outputs" && trimmed.match(/^-\s+\w+:/)) {
      pushOutput();
      inListItem = true;
      const kv = trimmed.replace(/^-\s+/, "").split(/:\s*/);
      if (kv[0] === "file" || kv[0] === "path") currentItem[kv[0]] = kv[1] || "";
      else currentItem[kv[0]] = kv[1] || "";
      continue;
    }

    if (section === "expected_outputs" && inListItem) {
      const kv = trimmed.split(/:\s*/);
      if (kv.length >= 2) {
        if (kv[0] === "file" || kv[0] === "path") currentItem[kv[0]] = kv.slice(1).join(":").trim();
        else currentItem[kv[0]] = kv.slice(1).join(":").trim();
      }
      continue;
    }

    if (section === "expected_params" && trimmed.startsWith("- name:")) {
      result.expected_params.push(trimmed.replace("- name:", "").trim());
      continue;
    }
  }

  if (section === "expected_outputs") pushOutput();

  return result;
}

function listOutputs(sop: string): { path: string; size: number; modified: Date }[] {
  const dir = getOutputDir();
  if (!existsSync(dir)) return [];

  const files = readdirSync(dir)
    .filter((f) => f.startsWith(sop))
    .map((f) => {
      const fullPath = resolve(dir, f);
      const statFn = statSync(fullPath);
      return { path: f, size: statFn.size, modified: statFn.mtime };
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime());

  return files;
}

function hasCodeFiles(sop: string): boolean {
  const skillDir = getSkillDir(sop);
  if (!existsSync(skillDir)) return false;

  const files = readdirSync(skillDir);
  return files.some((f) => f.endsWith(".java") || f.endsWith(".ts") || f.endsWith(".js"));
}

function outputFilesContainCode(outputs: { path: string }[]): boolean {
  return outputs.some((o) =>
    o.path.endsWith(".java") || o.path.endsWith(".ts") ||
    o.path.endsWith(".js") || o.path.endsWith(".vue") ||
    o.path.endsWith(".jsx") || o.path.endsWith(".tsx")
  );
}

function runBasicValidation(
  sop: string,
  state: SOPState | null,
  expected: Record<string, any> | null,
  stepMap: Record<string, string[]> | null,
  outputs: { path: string }[],
): BasicValidation {
  const result: BasicValidation = {
    stepCompliance: { valid: true, issues: [] },
    outputCompleteness: { valid: true, issues: [] },
    stateConsistency: { valid: true, issues: [] },
    paramConsistency: { valid: true, issues: [] },
  };

  // Step compliance: compare actual vs expected
  if (state && stepMap && stepMap[sop]) {
    const expectedSteps = stepMap[sop];
    const actualSteps = Object.keys(state.steps);

    for (const step of expectedSteps) {
      if (!actualSteps.includes(step)) {
        result.stepCompliance.valid = false;
        result.stepCompliance.issues.push({ step, problem: "missing" });
      }
    }

    for (const step of actualSteps) {
      if (!expectedSteps.includes(step)) {
        result.stepCompliance.issues.push({ step, problem: "unexpected (not in step-map)" });
      }
    }

    // Check step order
    const orderedActual = actualSteps.filter((s) => expectedSteps.includes(s));
    for (let i = 1; i < orderedActual.length; i++) {
      const expIdx = expectedSteps.indexOf(orderedActual[i]);
      const prevExpIdx = expectedSteps.indexOf(orderedActual[i - 1]);
      if (expIdx < prevExpIdx) {
        result.stepCompliance.valid = false;
        result.stepCompliance.issues.push({
          step: orderedActual[i],
          problem: `out of order: appears after ${orderedActual[i - 1]}`,
        });
      }
    }
  }

  // Output completeness: check required expected outputs exist
  if (expected && expected.expected_outputs) {
    for (const out of expected.expected_outputs) {
      if (out.required !== false) {
        const outputDir = getOutputDir();
        if (!existsSync(outputDir)) {
          result.outputCompleteness.valid = false;
          result.outputCompleteness.issues.push({ file: out.file || out.path, problem: "output directory missing" });
          continue;
        }

        const expectedPath = (out.file || out.path || "").trim();
        const partialName = expectedPath.replace(/\.md$/, "").replace(/^.*\//, "").replace(/^\*/, "").replace(/\*.*$/, "");
        const found = readdirSync(outputDir).some((f) => f.startsWith(sop) && (partialName === "" || f.includes(partialName)));
        if (!found) {
          result.outputCompleteness.valid = false;
          result.outputCompleteness.issues.push({ file: expectedPath, problem: "required output missing" });
        }
      }
    }
  } else {
    // Fallback: at least check there are output files
    if (outputs.length === 0) {
      result.outputCompleteness.issues.push({ file: "(any)", problem: "no output files found" });
    }
  }

  // State consistency: completed steps should have matching outputs
  if (state) {
    for (const [step, info] of Object.entries(state.steps)) {
      if (info.status === "completed") {
        // Check if output directory has files for this SOP
        const outDir = getOutputDir();
        if (!existsSync(outDir) || readdirSync(outDir).filter((f) => f.startsWith(sop)).length === 0) {
          result.stateConsistency.valid = false;
          result.stateConsistency.issues.push({ step, problem: "marked completed but no outputs found" });
        }
        // If the step map says this is an [AUTO] step, it should have output
        // (soft warning, not critical)
      }
    }
  }

  // Param consistency: answers should exist for steps that need them
  if (state && expected && expected.expected_params) {
    const allAnswers: Record<string, unknown> = {};
    for (const answers of Object.values(state.answers)) {
      Object.assign(allAnswers, answers);
    }

    for (const param of expected.expected_params) {
      if (!(param in allAnswers)) {
        result.paramConsistency.issues.push({ param, problem: "expected param not provided in answers" });
      } else if (allAnswers[param] === "" || allAnswers[param] === null) {
        result.paramConsistency.issues.push({ param, problem: "expected param has empty value" });
      }
    }
  }

  return result;
}

function determineAgentDispatch(
  sop: string,
  validation: BasicValidation,
  hasCode: boolean,
): AgentDispatch[] {
  const agents: AgentDispatch[] = [];

  // Always dispatch flow-reviewer
  agents.push({
    agent: "flow-reviewer",
    priority: validation.stepCompliance.valid ? "optional" : "required",
    prompt: `Review SOP "${sop}" execution flow for step compliance issues.`,
  });

  // Output reviewer if issues found
  if (!validation.outputCompleteness.valid) {
    agents.push({
      agent: "output-reviewer",
      priority: "required",
      prompt: `Review output completeness for SOP "${sop}". Missing required outputs identified.`,
    });
  }

  // Param reviewer if issues found
  if (!validation.paramConsistency.valid) {
    agents.push({
      agent: "param-reviewer",
      priority: "required",
      prompt: `Review parameter consistency for SOP "${sop}". Expected params missing or empty.`,
    });
  }

  // State reviewer if issues found
  if (!validation.stateConsistency.valid) {
    agents.push({
      agent: "state-reviewer",
      priority: "required",
      prompt: `Review state consistency for SOP "${sop}". Steps marked completed without matching outputs.`,
    });
  }

  // Code reviewer if SOP produces code
  if (hasCode) {
    agents.push({
      agent: "code-reviewer",
      priority: "recommended",
      prompt: `Review code quality for SOP "${sop}" outputs.`,
    });
  }

  // Architect reviewer if arch-related
  if (["scaffold", "backend-iteration", "fullstack-iteration", "api-design", "database-design"].includes(sop)) {
    agents.push({
      agent: "arch-reviewer",
      priority: "recommended",
      prompt: `Review architecture decisions for SOP "${sop}".`,
    });
  }

  return agents;
}

function runDeepReview(sop: string): DeepReviewPlan {
  const state = loadState(sop);
  const expectedRaw = loadExpected(sop);
  const expected = expectedRaw ? loadExpectedYaml(sop) : null;
  const stepMap = loadStepMap();
  const outputs = listOutputs(sop);
  const hasCode = hasCodeFiles(sop) || outputFilesContainCode(outputs);
  const stateStatus = state ? state.status : "no_state";

  const basicValidation = runBasicValidation(sop, state, expected, stepMap, outputs);
  const agentsToDispatch = determineAgentDispatch(sop, basicValidation, hasCode);
  const lengthBudget = checkLengthBudget(sop, expected, outputs);

  return {
    sop,
    status: stateStatus,
    basicValidation,
    agentsToDispatch,
    hasCodeOutput: hasCode,
    hasArchOutput: ["scaffold", "backend-iteration", "fullstack-iteration", "api-design", "database-design"].includes(sop),
    lengthBudget: lengthBudget || undefined,
  };
}

function printContext(sop: string): void {
  const state = loadState(sop);
  const expected = loadExpected(sop);
  const stepMap = loadStepMap();
  const outputs = listOutputs(sop);
  const skillDir = getSkillDir(sop);

  console.log("# SOP Verification Context\n");

  console.log("## SOP Info");
  console.log(`- **Name**: ${sop}`);
  console.log(`- **Skill dir**: ${skillDir}`);
  console.log(`- **has expected.yml**: ${expected ? "yes" : "no"}`);
  console.log(`- **has state**: ${state ? "yes" : "no"}`);

  if (stepMap && stepMap[sop]) {
    console.log(`\n## Expected Step Order (from step-map)`);
    console.log("```");
    stepMap[sop].forEach((step, i) => console.log(`  ${i + 1}. ${step}`));
    console.log("```");
  }

  if (state) {
    console.log(`\n## Execution State`);
    console.log(`- **Task ID**: ${state.task_id}`);
    console.log(`- **Status**: ${state.status}`);
    console.log(`- **Started**: ${state.started_at}`);
    if (state.completed_at) console.log(`- **Completed**: ${state.completed_at}`);
    console.log(`- **Current Step**: ${state.current_step}`);

    console.log(`\n### Step Statuses`);
    console.log(`| Step | Status |`);
    console.log(`|------|--------|`);
    for (const [step, info] of Object.entries(state.steps)) {
      console.log(`| ${step} | ${info.status} |`);
    }

    if (Object.keys(state.answers).length > 0) {
      console.log(`\n### User Answers`);
      console.log("```json");
      console.log(JSON.stringify(state.answers, null, 2));
      console.log("```");
    }
  } else {
    console.log(`\n## Execution State: *No state file found*`);
  }

  if (expected) {
    console.log(`\n## Expected Definition (expected.yml)`);
    console.log("```yaml");
    console.log(expected.trim());
    console.log("```");
  } else {
    console.log(`\n## Expected Definition: *No expected.yml found*`);
  }

  console.log(`\n## Output Files`);
  if (outputs.length === 0) {
    console.log("*No output files found in .sop/output/*");
  } else {
    console.log(`| File | Size | Modified |`);
    console.log(`|------|------|----------|`);
    for (const out of outputs) {
      const sizeStr = out.size > 1024
        ? `${(out.size / 1024).toFixed(1)}KB`
        : `${out.size}B`;
      console.log(`| ${out.path} | ${sizeStr} | ${out.modified.toISOString().slice(0, 19)} |`);
    }
  }

  console.log(`\n## Skills Directory`);
  console.log(`- **Path**: ${skillDir}`);
  console.log(`- **Exists**: ${existsSync(skillDir)}`);

  console.log(`\n---`);
  console.log(`*Generated by sop-verify.ts at ${new Date().toISOString()}*`);

  if (state && expected) {
    const expectedSteps = expected.match(/^\s+- id:/gm);
    const actualSteps = Object.keys(state.steps);
    const outputCount = outputs.length;
    const stepCount = actualSteps.length;
    const expectedStepCount = expectedSteps ? expectedSteps.length : 0;

    console.log(`\n## Quick Stats`);
    console.log(`- **Expected Steps**: ${expectedStepCount}`);
    console.log(`- **Actual Steps**: ${stepCount}`);
    console.log(`- **Output Files**: ${outputCount}`);
    console.log(`- **All Steps Completed**: ${Object.values(state.steps).every((s) => s.status === "completed")}`);
  }

  console.log(`\n## Anti-pattern Checks (manual)`);
  console.log(`1. **Step compliance**: Compare actual steps vs expected step-map order`);
  console.log(`2. **Output completeness**: Check all required outputs exist`);
  console.log(`3. **State consistency**: Verify completed steps have matching outputs`);
  console.log(`4. **Parameter consistency**: Verify user answers were used in execution`);
  console.log(`5. **Length budget** (sop-prd only): Compare PRD line count vs tier budget`);

  const lengthBudget = checkLengthBudget(sop, expected ? loadExpectedYaml(sop) : null, outputs);
  if (lengthBudget) {
    console.log(`\n## Length Budget Check (sop-prd)`);
    console.log(`| Metric | Value |`);
    console.log(`|--------|-------|`);
    console.log(`| Tier | ${lengthBudget.tier} |`);
    console.log(`| Budget | ${lengthBudget.budget} lines |`);
    console.log(`| Fail Threshold | ${lengthBudget.failThreshold} lines |`);
    console.log(`| Actual | ${lengthBudget.actual} lines |`);
    console.log(`| Deviation | ${lengthBudget.deviation >= 0 ? '+' : ''}${lengthBudget.deviation} lines |`);
    console.log(`| Status | **${lengthBudget.status.toUpperCase()}** |`);
    console.log(`| Message | ${lengthBudget.message} |`);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: ts-node sop-verify.ts <sop-name> [--deep-review] [--save]");
  console.log("");
  console.log("Examples:");
  console.log("  ts-node sop-verify.ts code-review            # Print context");
  console.log("  ts-node sop-verify.ts code-review --deep-review  # Auto-dispatch plan");
  console.log("  ts-node sop-verify.ts code-review --save     # Print context + save to state file");
  process.exit(1);
}

const sop = args[0];
const deepReviewMode = args.includes("--deep-review");
const saveMode = args.includes("--save");

if (deepReviewMode) {
  const plan = runDeepReview(sop);
  console.log(JSON.stringify(plan, null, 2));
} else {
  printContext(sop);
  if (saveMode) {
    const result = saveVerification(sop);
    console.log(`\n[VERIFY] Verification saved: status=${result.status}, score=${result.score}, issues=${result.issues}`);
  }
}

function saveVerification(sop: string): { status: string; score: number; issues: number } {
  const state = loadState(sop);
  if (!state) {
    console.log(`\n[VERIFY] No state file found for ${sop}, skipping save`);
    return { status: "needs_review", score: 0, issues: 0 };
  }

  const outputs = listOutputs(sop);
  const expected = loadExpected(sop);
  const allCompleted = Object.values(state.steps).every((s) => s.status === "completed");
  const hasOutputs = outputs.length > 0;
  const lengthBudget = checkLengthBudget(sop, expected ? loadExpectedYaml(sop) : null, outputs);

  let score = 0;
  if (allCompleted) score += 40;
  if (hasOutputs) score += 30;
  if (lengthBudget && lengthBudget.status === "pass") score += 15;
  else if (lengthBudget && lengthBudget.status === "warn") score += 8;
  if (state.status === "completed") score += 15;

  let issues = 0;
  if (!allCompleted) issues++;
  if (!hasOutputs) issues++;
  if (lengthBudget && lengthBudget.status === "fail") issues++;

  const vStatus = score >= 70 ? "passed" : score >= 40 ? "needs_review" : "failed";

  const verification = {
    status: vStatus,
    score,
    timestamp: new Date().toISOString(),
    issues,
    details: {
      allStepsCompleted: allCompleted,
      outputsPresent: hasOutputs,
      lengthBudgetOk: lengthBudget ? lengthBudget.status === "pass" : undefined,
      antiPatterns: issues,
    },
  };

  const stateDir = getStateDir();
  if (!existsSync(stateDir)) {
    console.log(`\n[VERIFY] State directory missing, cannot save`);
    return { status: vStatus, score, issues };
  }

  const files = readdirSync(stateDir)
    .filter((f) => f.startsWith(sop) && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log(`\n[VERIFY] No state files found for ${sop}`);
    return { status: vStatus, score, issues };
  }

  const filePath = resolve(stateDir, files[0]);
  const currentState = JSON.parse(readFileSync(filePath, "utf-8"));
  currentState.verification = verification;
  writeFileSync(filePath, JSON.stringify(currentState, null, 2), "utf-8");

  return { status: vStatus, score, issues };
}
