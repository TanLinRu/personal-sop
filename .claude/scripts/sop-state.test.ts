import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync, readdirSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const STATE_DIR = resolve(__dirname, "..", "..", ".sop", "state");
const SCRIPTS_DIR = __dirname;

function tsNodeRun(script: string, args: string, cwd?: string): string {
  const cmd = `npx ts-node --transpile-only "${resolve(SCRIPTS_DIR, script)}" ${args}`;
  return execSync(cmd, { cwd: cwd || resolve(SCRIPTS_DIR, "..", ".."), encoding: "utf-8", timeout: 30000, stdio: ["pipe", "pipe", "pipe"] });
}

function skipNpxCache(): void {
  // Warm up ts-node cache by running a trivial script once
  try {
    execSync(`npx ts-node --transpile-only -e "console.log('warmup')"`, {
      cwd: resolve(SCRIPTS_DIR, "..", ".."),
      timeout: 15000,
      stdio: "pipe",
    });
  } catch {
    // Ignore warmup failures
  }
}

function completeBugFix(): void {
  for (const step of ["1_reproduce", "2_locate", "3_fix", "4_verify", "5_test"]) {
    tsNodeRun("sop-state-save.ts", `bug-fix ${step} completed`);
  }
}

function getStateFiles(): string[] {
  if (!existsSync(STATE_DIR)) return [];
  return readdirSync(STATE_DIR).filter((f) => f.endsWith(".json"));
}

function cleanStateFiles(): void {
  if (existsSync(STATE_DIR)) {
    for (const f of getStateFiles()) {
      rmSync(resolve(STATE_DIR, f));
    }
  }
}

function hasStateFile(sop: string): boolean {
  return getStateFiles().some((f) => f.startsWith(sop));
}

function readStateFile(sop: string): any {
  const files = getStateFiles().filter((f) => f.startsWith(sop));
  if (files.length === 0) return null;
  return JSON.parse(readFileSync(resolve(STATE_DIR, files[0]), "utf-8"));
}

describe("sop-state-save.ts", () => {
  beforeAll(() => {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
    skipNpxCache();
  });

  beforeEach(() => {
    cleanStateFiles();
  });

  afterAll(() => {
    cleanStateFiles();
  });

  it("should create a state file with initial step", () => {
    const output = tsNodeRun("sop-state-save.ts", "scaffold 1_confirm in_progress");
    expect(output).toContain("[OK] State saved");
    expect(hasStateFile("scaffold")).toBe(true);

    const state = readStateFile("scaffold");
    expect(state.sop).toBe("scaffold");
    expect(state.status).toBe("in_progress");
    expect(state.current_step).toBe(1);
    expect(state.steps["1_confirm"].status).toBe("in_progress");
  });

  it("should mark step completed and advance current_step", () => {
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm completed");
    const state = readStateFile("scaffold");
    expect(state.steps["1_confirm"].status).toBe("completed");
    expect(state.current_step).toBe(2);
    expect(state.status).toBe("in_progress");
  });

  it("should mark SOP completed on last step", () => {
    tsNodeRun("sop-state-save.ts", "bug-fix 1_reproduce completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 2_locate completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 3_fix completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 4_verify completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 5_test completed");

    const state = readStateFile("bug-fix");
    expect(state.status).toBe("completed");
    expect(state.current_step).toBe(5);
    expect(state.completed_at).toBeDefined();
  });

  it("should store answers with key=value format", () => {
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm completed project_name=myapp tech_stack=spring-boot");
    const state = readStateFile("scaffold");
    expect(state.answers["1_confirm"].project_name).toBe("myapp");
    expect(state.answers["1_confirm"].tech_stack).toBe("spring-boot");
  });

  it("should validate constraints and reject invalid values", () => {
    tsNodeRun("sop-state-save.ts", "sop-scaffold 1_confirm completed project_name=MyApp");
    const state = readStateFile("sop-scaffold");
    expect(state.validation["1_confirm"].project_name.valid).toBe(false);
    expect(state.validation["1_confirm"].project_name.error).toContain("does not match pattern");
  });

  it("should use correct date-based filename", () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    tsNodeRun("sop-state-save.ts", "code-review 1_scope completed");
    const files = getStateFiles().filter((f) => f.startsWith("code-review"));
    expect(files.length).toBe(1);
    expect(files[0]).toBe(`code-review-${today}.json`);
  });
});

describe("sop-state-load.ts", () => {
  beforeAll(() => {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
  });

  beforeEach(() => {
    cleanStateFiles();
  });

  afterAll(() => {
    cleanStateFiles();
  });

  it("should display state for a given SOP", () => {
    tsNodeRun("sop-state-save.ts", "prd 1_initiate in_progress");
    const output = tsNodeRun("sop-state-load.ts", "prd");
    expect(output).toContain("SOP: prd");
    expect(output).toContain("Status: in_progress");
    expect(output).toContain("1_initiate");
  });

  it("should return all in-progress states with --all", () => {
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm in_progress");
    tsNodeRun("sop-state-save.ts", "bug-fix 1_reproduce in_progress");
    const output = tsNodeRun("sop-state-load.ts", "--all");
    expect(output).toContain("scaffold");
    expect(output).toContain("bug-fix");
  });

  it("should list files with --list", () => {
    tsNodeRun("sop-state-save.ts", "prd 1_initiate in_progress");
    const output = tsNodeRun("sop-state-load.ts", "--list");
    expect(output).toContain("prd-");
    expect(output).toContain(".json");
  });

  it("should warn when no state found", () => {
    const output = tsNodeRun("sop-state-load.ts", "nonexistent");
    expect(output).toContain("[WARN]");
    expect(output).toContain("No state found");
  });

  it("should skip completed states with --all", () => {
    completeBugFix();
    const output = tsNodeRun("sop-state-load.ts", "--all");
    expect(output).toContain("No in-progress states found");
  });
});

describe("sop-state-clean.ts", () => {
  beforeAll(() => {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
  });

  beforeEach(() => {
    cleanStateFiles();
  });

  afterAll(() => {
    cleanStateFiles();
  });

  it("should clean completed state files (via --completed flag)", () => {
    completeBugFix();
    const output = tsNodeRun("sop-state-clean.ts", "--completed");
    expect(output).toContain("[OK] Cleaned");
    expect(hasStateFile("bug-fix")).toBe(false);
  });

  it("should preserve in-progress states when cleaning completed", () => {
    completeBugFix();
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm in_progress");
    const output = tsNodeRun("sop-state-clean.ts", "--completed");
    expect(output).toContain("Cleaned");
    expect(hasStateFile("scaffold")).toBe(true);
  });

  it("should clean ALL state files with --all", () => {
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm in_progress");
    completeBugFix();
    const output = tsNodeRun("sop-state-clean.ts", "--all");
    expect(output).toContain("[OK] Cleaned");
    expect(getStateFiles().length).toBe(0);
  });

  it("should clean completed SOP by name and skip in-progress", () => {
    completeBugFix();
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm in_progress");
    const output = tsNodeRun("sop-state-clean.ts", "bug-fix");
    expect(output).toContain("[OK] Cleaned 1");
    expect(hasStateFile("scaffold")).toBe(true);
  });
});

describe("sop-resume-check.ts", () => {
  beforeAll(() => {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
  });

  beforeEach(() => {
    cleanStateFiles();
  });

  afterAll(() => {
    cleanStateFiles();
  });

  it("should detect in-progress state for resume", () => {
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm completed");
    tsNodeRun("sop-state-save.ts", "scaffold 2_config in_progress");
    const output = tsNodeRun("sop-resume-check.ts", "scaffold");
    const result = JSON.parse(output);
    expect(result.has_resume).toBe(true);
    expect(result.sop).toBe("scaffold");
  });

  it("should return next_step_id from step map", () => {
    tsNodeRun("sop-state-save.ts", "bug-fix 1_reproduce completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 2_locate in_progress");
    const output = tsNodeRun("sop-resume-check.ts", "bug-fix");
    const result = JSON.parse(output);
    expect(result.has_resume).toBe(true);
    expect(result.next_step_id).toBe("2_locate");
    expect(result.completed_steps).toContain("1_reproduce");
  });

  it("should return has_resume=false when SOP is completed", () => {
    tsNodeRun("sop-state-save.ts", "bug-fix 1_reproduce completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 2_locate completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 3_fix completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 4_verify completed");
    tsNodeRun("sop-state-save.ts", "bug-fix 5_test completed");
    const output = tsNodeRun("sop-resume-check.ts", "bug-fix");
    const result = JSON.parse(output);
    expect(result.has_resume).toBe(false);
  });

  it("should return has_resume=false when no state exists", () => {
    const output = tsNodeRun("sop-resume-check.ts", "nonexistent");
    const result = JSON.parse(output);
    expect(result.has_resume).toBe(false);
  });

  it("should include answers in resume response", () => {
    tsNodeRun("sop-state-save.ts", "scaffold 1_confirm completed project_name=myapp");
    tsNodeRun("sop-state-save.ts", "scaffold 2_config in_progress");
    const output = tsNodeRun("sop-resume-check.ts", "scaffold");
    const result = JSON.parse(output);
    expect(result.answers["1_confirm"].project_name).toBe("myapp");
  });
});
