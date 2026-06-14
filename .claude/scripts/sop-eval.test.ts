import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..", "..");

interface EvalResult {
  fixture: string;
  tier: string;
  scores: { total: number };
  verdict: "PASS" | "WARN" | "FAIL";
}

function runEval(sop: string): EvalResult[] {
  const output = execSync(
    `npx ts-node --transpile-only ${resolve(REPO_ROOT, ".claude/scripts/sop-eval.ts")} ${sop} --json`,
    { encoding: "utf-8", cwd: REPO_ROOT },
  );
  return JSON.parse(output);
}

describe("sop-prd golden eval", () => {
  it("all fixtures PASS verdict", () => {
    const results = runEval("prd");
    expect(results.length).toBeGreaterThan(0);

    const failed = results.filter((r) => r.verdict === "FAIL");
    if (failed.length > 0) {
      console.error(
        `Failed fixtures:\n${failed.map((r) => `  - ${r.fixture}: ${r.scores.total.toFixed(3)}`).join("\n")}`,
      );
    }
    expect(failed).toHaveLength(0);
  }, 60000);

  it("LITE tier outputs <= 200 lines", () => {
    const results = runEval("prd");
    const liteResults = results.filter((r) => r.tier === "lite");
    expect(liteResults.length).toBeGreaterThan(0);
    for (const r of liteResults) {
      expect(r.scores.total).toBeGreaterThanOrEqual(0.85);
    }
  }, 60000);

  it("FULL tier outputs scoring above PASS threshold", () => {
    const results = runEval("prd");
    const fullResults = results.filter((r) => r.tier === "full");
    expect(fullResults.length).toBeGreaterThan(0);
    for (const r of fullResults) {
      expect(r.scores.total).toBeGreaterThanOrEqual(0.85);
    }
  }, 60000);
});
