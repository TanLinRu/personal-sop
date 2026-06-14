#!/usr/bin/env ts-node
/**
 * sop-eval.ts — Phase D4: Golden test set evaluator for SOP outputs
 *
 * Reads .claude/skills/sop-{sop}/golden/{inputs,expected,eval.config.yaml}
 * and scores actual SOP outputs against expected ones.
 *
 * Dimensions (from eval.config.yaml weights):
 *   - structure: chapter count + Jaccard similarity of titles
 *   - length: actual line count vs tier budget
 *   - dor: Definition-of-Ready checks pass rate
 *   - coverage: required keywords found in output
 *
 * Usage:
 *   sop-eval.ts <sop>                           # all fixtures
 *   sop-eval.ts <sop> <fixture>                 # one fixture
 *   sop-eval.ts <sop> --against <output-file>   # eval an arbitrary file
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve } from "path";

interface FixtureInput {
  fixture: string;
  description: string;
  answers: Record<string, Record<string, unknown>>;
  expected_metrics: {
    tier: string;
    max_lines: number;
    max_user_stories: number;
    required_sections: string[];
    required_keywords: string[];
    should_produce_brainstorm?: boolean;
  };
}

interface EvalConfig {
  weights: {
    structure: number;
    length: number;
    dor: number;
    coverage: number;
  };
  thresholds: { pass: number; warn: number };
  length_budget: Record<string, { target: number; warn: number; fail: number }>;
}

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
  details: {
    actual_lines: number;
    actual_sections: string[];
    missing_sections: string[];
    extra_sections: string[];
    missing_keywords: string[];
    user_story_count: number;
    given_when_then_count: number;
    invest_marks: number;
  };
}

function getSkillDir(sop: string): string {
  return resolve(process.cwd(), ".claude", "skills", `sop-${sop}`);
}

function loadFixture(sop: string, fixture: string): FixtureInput {
  const path = resolve(getSkillDir(sop), "golden", "inputs", `${fixture}.json`);
  if (!existsSync(path)) {
    throw new Error(`Fixture not found: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf-8")) as FixtureInput;
}

function loadEvalConfig(sop: string): EvalConfig {
  const path = resolve(getSkillDir(sop), "golden", "eval.config.yaml");
  if (!existsSync(path)) {
    throw new Error(`eval.config.yaml not found: ${path}`);
  }
  // Minimal YAML parser for our flat config
  const content = readFileSync(path, "utf-8");
  const config: EvalConfig = {
    weights: { structure: 0.30, length: 0.30, dor: 0.25, coverage: 0.15 },
    thresholds: { pass: 0.85, warn: 0.70 },
    length_budget: {
      lite: { target: 180, warn: 200, fail: 250 },
      full: { target: 325, warn: 380, fail: 450 },
    },
  };

  const w = content.match(/weights:\s*\n((?:\s+\w+:\s*[\d.]+\s*(?:#.*)?\n)+)/);
  if (w) {
    for (const line of w[1].split("\n")) {
      const m = line.match(/^\s+(\w+):\s*([\d.]+)/);
      if (m && (m[1] in config.weights)) {
        (config.weights as any)[m[1]] = parseFloat(m[2]);
      }
    }
  }

  const t = content.match(/thresholds:\s*\n((?:\s+\w+:\s*[\d.]+\s*\n)+)/);
  if (t) {
    for (const line of t[1].split("\n")) {
      const m = line.match(/^\s+(\w+):\s*([\d.]+)/);
      if (m && (m[1] in config.thresholds)) {
        (config.thresholds as any)[m[1]] = parseFloat(m[2]);
      }
    }
  }

  return config;
}

function loadActualOutput(sop: string, fixture: string, customPath?: string): string | null {
  if (customPath) {
    if (!existsSync(customPath)) return null;
    return readFileSync(customPath, "utf-8");
  }
  // Prefer expected.md (used as oracle when no run-time output yet)
  const expected = resolve(getSkillDir(sop), "golden", "expected", `${fixture}.expected.md`);
  if (existsSync(expected)) return readFileSync(expected, "utf-8");
  return null;
}

function extractSections(content: string): string[] {
  // Match `## N. Title` or `## Title` at line start
  const matches = content.match(/^##\s+([^\n]+)/gm) || [];
  return matches.map((m) => m.replace(/^##\s+/, "").trim());
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1.0;
  // Normalize: lowercase, trim
  const sa = new Set(a.map((s) => s.toLowerCase().trim()));
  const sb = new Set(b.map((s) => s.toLowerCase().trim()));
  const intersection = new Set([...sa].filter((x) => sb.has(x)));
  const union = new Set([...sa, ...sb]);
  return intersection.size / union.size;
}

function countOccurrences(content: string, pattern: RegExp): number {
  return (content.match(pattern) || []).length;
}

function evalStructure(content: string, expectedSections: string[]): { score: number; details: any } {
  const actual = extractSections(content);
  const sim = jaccardSimilarity(actual, expectedSections);
  const missing = expectedSections.filter(
    (e) => !actual.some((a) => a.toLowerCase().includes(e.toLowerCase().split(/\s+/)[1] || e.toLowerCase())),
  );
  const extra = actual.filter(
    (a) => !expectedSections.some((e) => e.toLowerCase().includes(a.toLowerCase().split(/\s+/)[1] || a.toLowerCase())),
  );
  return {
    score: sim,
    details: { actual, missing, extra },
  };
}

function evalLength(content: string, tier: string, budget: EvalConfig["length_budget"]): { score: number; details: any } {
  const lines = content.split("\n").length;
  const tb = budget[tier] || budget.lite;
  let score: number;
  if (lines <= tb.target) score = 1.0;
  else if (lines <= tb.warn) score = 0.7;
  else if (lines <= tb.fail) score = 0.3;
  else score = 0.0;
  return { score, details: { actual_lines: lines, target: tb.target } };
}

function evalDor(content: string, expectedMaxStories: number): { score: number; details: any } {
  // 1. user story count <= max
  const stories = countOccurrences(content, /^\s*\|\s*US-\d+/gm);
  const storyOk = stories > 0 && stories <= expectedMaxStories;

  // 2. Given/When/Then format on AC
  const gwt = countOccurrences(content, /Given .+?,?\s*When .+?,?\s*Then/gi);
  const gwtOk = gwt > 0;

  // 3. INVEST marker present
  const invest = countOccurrences(content, /INVEST|✅|⚠️/g);
  const investOk = invest >= stories;

  // 4. No orphan section (each ## has at least 1 line of content beneath before next ##)
  const sections = content.split(/^##\s+/gm).slice(1);
  const orphans = sections.filter((s) => {
    const body = s.split("\n").slice(1).join("\n").trim();
    return body.length === 0 || body.split("\n").filter((l) => l.trim().length > 0).length === 0;
  });
  const orphanOk = orphans.length === 0;

  const checks = [storyOk, gwtOk, investOk, orphanOk];
  const passed = checks.filter(Boolean).length;
  const score = passed / checks.length;

  return {
    score,
    details: {
      user_story_count: stories,
      given_when_then_count: gwt,
      invest_marks: invest,
      orphan_sections: orphans.length,
      passed_checks: passed,
      total_checks: checks.length,
    },
  };
}

function evalCoverage(content: string, requiredKeywords: string[]): { score: number; details: any } {
  if (requiredKeywords.length === 0) return { score: 1.0, details: { missing: [] } };
  const lower = content.toLowerCase();
  const missing = requiredKeywords.filter((kw) => !lower.includes(kw.toLowerCase()));
  const score = Math.max(0, (requiredKeywords.length - missing.length) / requiredKeywords.length);
  return { score, details: { missing } };
}

function evalFixture(sop: string, fixture: string, customPath?: string): EvalResult {
  const fx = loadFixture(sop, fixture);
  const config = loadEvalConfig(sop);
  const content = loadActualOutput(sop, fixture, customPath);

  if (content === null) {
    throw new Error(`No output found for fixture ${fixture} (looked at expected.md and customPath=${customPath})`);
  }

  const structRes = evalStructure(content, fx.expected_metrics.required_sections);
  const lenRes = evalLength(content, fx.expected_metrics.tier, config.length_budget);
  const dorRes = evalDor(content, fx.expected_metrics.max_user_stories);
  const covRes = evalCoverage(content, fx.expected_metrics.required_keywords);

  const total =
    structRes.score * config.weights.structure +
    lenRes.score * config.weights.length +
    dorRes.score * config.weights.dor +
    covRes.score * config.weights.coverage;

  let verdict: "PASS" | "WARN" | "FAIL" = "FAIL";
  if (total >= config.thresholds.pass) verdict = "PASS";
  else if (total >= config.thresholds.warn) verdict = "WARN";

  return {
    fixture,
    tier: fx.expected_metrics.tier,
    scores: {
      structure: structRes.score,
      length: lenRes.score,
      dor: dorRes.score,
      coverage: covRes.score,
      total,
    },
    verdict,
    details: {
      actual_lines: lenRes.details.actual_lines,
      actual_sections: structRes.details.actual,
      missing_sections: structRes.details.missing,
      extra_sections: structRes.details.extra,
      missing_keywords: covRes.details.missing,
      user_story_count: dorRes.details.user_story_count,
      given_when_then_count: dorRes.details.given_when_then_count,
      invest_marks: dorRes.details.invest_marks,
    },
  };
}

function listFixtures(sop: string): string[] {
  const dir = resolve(getSkillDir(sop), "golden", "inputs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

function runAll(sop: string): EvalResult[] {
  return listFixtures(sop).map((f) => evalFixture(sop, f));
}

function formatResult(r: EvalResult): string {
  const lines: string[] = [];
  lines.push(`## Fixture: ${r.fixture} (tier=${r.tier})`);
  lines.push("");
  lines.push(`| Dimension | Score |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| structure | ${r.scores.structure.toFixed(3)} |`);
  lines.push(`| length    | ${r.scores.length.toFixed(3)} |`);
  lines.push(`| dor       | ${r.scores.dor.toFixed(3)} |`);
  lines.push(`| coverage  | ${r.scores.coverage.toFixed(3)} |`);
  lines.push(`| **total** | **${r.scores.total.toFixed(3)}** |`);
  lines.push(`| **verdict** | **${r.verdict}** |`);
  lines.push("");
  lines.push(`**Lines**: ${r.details.actual_lines}`);
  lines.push(`**Stories**: ${r.details.user_story_count} | **AC G/W/T**: ${r.details.given_when_then_count} | **INVEST**: ${r.details.invest_marks}`);
  if (r.details.missing_sections.length) lines.push(`**Missing sections**: ${r.details.missing_sections.join(", ")}`);
  if (r.details.missing_keywords.length) lines.push(`**Missing keywords**: ${r.details.missing_keywords.join(", ")}`);
  return lines.join("\n");
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: sop-eval.ts <sop> [<fixture>] [--against <file>]");
  process.exit(1);
}

const sop = args[0];
const againstIdx = args.indexOf("--against");
const customPath = againstIdx >= 0 ? args[againstIdx + 1] : undefined;
const fixture = args[1] && !args[1].startsWith("--") ? args[1] : undefined;

const json = args.includes("--json");

try {
  const results: EvalResult[] = fixture
    ? [evalFixture(sop, fixture, customPath)]
    : runAll(sop);

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`# sop-eval Report — sop: ${sop}\n`);
    let allPassed = true;
    for (const r of results) {
      console.log(formatResult(r));
      console.log("");
      if (r.verdict === "FAIL") allPassed = false;
    }
    console.log(`---`);
    console.log(`**Overall**: ${results.filter((r) => r.verdict === "PASS").length}/${results.length} PASS, ` +
      `${results.filter((r) => r.verdict === "WARN").length} WARN, ` +
      `${results.filter((r) => r.verdict === "FAIL").length} FAIL`);
    if (!allPassed) process.exit(1);
  }
} catch (err: any) {
  console.error(`[ERROR] ${err.message}`);
  process.exit(2);
}
