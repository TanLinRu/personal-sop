import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(REPO_ROOT, ".claude/scripts/sop-biz-graph.ts");

// Use a temp .sop directory so we don't clobber real .sop/biz-graph
const TMP_ROOT = resolve(REPO_ROOT, ".tmp-biz-graph-test");
const TMP_SOP = resolve(TMP_ROOT, ".sop");

function run(cmd: string): string {
  return execSync(
    `npx ts-node --transpile-only ${SCRIPT} ${cmd}`,
    { encoding: "utf-8", cwd: TMP_ROOT, env: { ...process.env, SOP_BIZ_GRAPH_AUTO: "0" } },
  );
}

function setupFixture(): void {
  if (existsSync(TMP_ROOT)) rmSync(TMP_ROOT, { recursive: true, force: true });
  mkdirSync(resolve(TMP_SOP, "state"), { recursive: true });
  mkdirSync(resolve(TMP_SOP, "output"), { recursive: true });
  mkdirSync(resolve(TMP_SOP, "knowledge"), { recursive: true });

  // Fixture state file with trace_id
  writeFileSync(
    resolve(TMP_SOP, "state", "prd-20260101.json"),
    JSON.stringify({
      task_id: "prd-test-001",
      trace_id: "prd-2026-01-01-fixture",
      sop: "prd",
      status: "completed",
      started_at: "2026-01-01T10:00:00Z",
      completed_at: "2026-01-01T11:00:00Z",
      current_step: 7,
      steps: { "1_biz_brief": { status: "completed" } },
    }),
  );

  // Fixture knowledge file
  writeFileSync(
    resolve(TMP_SOP, "knowledge", "knowledge-fixture-20260101.md"),
    `---\ndomain: Test Domain\n---\n\n# Knowledge\n\nSome content.\n`,
  );

  // Fixture LITE PRD with §3 user stories + §4 features + §6 risks
  writeFileSync(
    resolve(TMP_SOP, "output", "prd-fixture-20260101.md"),
    `---
sop: prd
trace_id: prd-2026-01-01-fixture
tier: lite
version: 6.1.0
---

## 0. 执行摘要

Some summary.

## 1. 业务背景

### 1.3 产品目标
- 目标 1
- 目标 2

## 2. 产品概述

### 2.1 产品定位
Test product.

## 3. 用户故事

### 3.1 用户角色
| 角色 | 描述 |
|------|------|
| Admin | Manager |

### 3.2 用户故事矩阵 (MoSCoW + INVEST)

| ID | 角色 | 故事 | 验收标准 (Given/When/Then) | 优先级 | INVEST |
|----|------|------|----------------------------|--------|--------|
| US-001 | Admin | 登录系统 | Given 输入凭证, When 提交, Then 跳转主页 | Must | ✅ |
| US-002 | Admin | 查看报表 | Given 已登录, When 进入报表页, Then 看到数据 | Should | ✅ |

## 4. 功能规划

| 功能 | 优先级 | 描述 | 关联用户故事 |
|------|--------|------|--------------|
| F-01 | Must | 登录模块 | US-001 |
| F-02 | Should | 报表模块 | US-002 |

## 5. 技术方案

Stack: Vue + Spring Boot.

## 6. 风险 + 决策

| 类型 | 内容 | 影响 | 缓解措施 | 决策 |
|------|------|------|----------|------|
| 技术 | 性能瓶颈 | 高 | 引入缓存 | 已决 |
| 业务 | 用户流失 | 中 | 增强 UX | 待决 |

## 7. 附录

### 7.3 参考文档
- 知识库：knowledge-fixture-20260101
`,
  );
}

describe("sop-biz-graph", () => {
  beforeAll(() => {
    setupFixture();
  });

  afterAll(() => {
    if (existsSync(TMP_ROOT)) rmSync(TMP_ROOT, { recursive: true, force: true });
  });

  it("build extracts nodes from fixture", () => {
    const out = run("build");
    expect(out).toContain("[OK] Build complete");
    expect(out).toMatch(/sop_runs:\s+1/);
    expect(out).toMatch(/knowledge:\s+1/);
    expect(out).toMatch(/prds:\s+1/);
    expect(out).toMatch(/user_stories:\s+2/);
    expect(out).toMatch(/features:\s+2/);
    expect(out).toMatch(/risks:\s+2/);
  }, 30000);

  it("status shows correct counts", () => {
    run("build");
    const out = run("status");
    expect(out).toContain("# biz-graph status");
    expect(out).toContain("| user_story | 2 |");
    expect(out).toContain("| feature | 2 |");
    expect(out).toContain("| prd | 1 |");
  }, 30000);

  it("query finds nodes by name", () => {
    run("build");
    const out = run("query 登录");
    expect(out).toMatch(/Search:.*\(/);
    expect(out).toContain("US-001");
  }, 30000);

  it("node shows full details", () => {
    run("build");
    const out = run("node us:prd:fixture-20260101:US-001");
    expect(out).toContain("Type**: user_story");
    expect(out).toContain("US-001");
    expect(out).toContain("Outgoing edges");
    expect(out).toContain("Incoming edges");
  }, 30000);

  it("trace returns all nodes for a trace_id", () => {
    run("build");
    const out = run("trace prd-2026-01-01-fixture");
    expect(out).toContain("# Trace lineage");
    expect(out).toContain("user_story");
    expect(out).toContain("feature");
    expect(out).toContain("prd");
  }, 30000);

  it("affected does BFS downstream", () => {
    run("build");
    const out = run("affected prd:fixture-20260101 3");
    expect(out).toContain("# Affected (downstream BFS)");
    // PRD produces user_stories + features + risks, so depth=1 should include them
    expect(out).toMatch(/\| 1 \| user_story/);
    expect(out).toMatch(/\| 1 \| feature/);
  }, 30000);

  it("idempotent: rebuild from same fixture gives same counts", () => {
    const a = run("build");
    const b = run("build");
    // Extract the "TOTAL nodes: N" line
    const matchA = a.match(/nodes:\s+(\d+)/);
    const matchB = b.match(/nodes:\s+(\d+)/);
    expect(matchA?.[1]).toBe(matchB?.[1]);
  }, 30000);

  it("FULL-tier PRD parsing (§5 stories, §6 features, §9 risks)", () => {
    // Add a FULL-format PRD fixture
    writeFileSync(
      resolve(TMP_SOP, "output", "prd-full-fixture-20260101.md"),
      `---
sop: prd
trace_id: prd-2026-01-01-full
tier: full
---

## 5. 用户故事

| ID | 角色 | 故事 | 验收标准 | 优先级 | INVEST |
|----|------|------|----------|--------|--------|
| US-101 | User | Full feature | Given X, When Y, Then Z | Must | ✅ |

## 6. 功能规划

| 功能 | 优先级 | 描述 | 关联用户故事 |
|------|--------|------|--------------|
| F-101 | Must | Big feature | US-101 |

## 9. 风险评估

| 类型 | 内容 | 影响 | 缓解措施 | 决策 |
|------|------|------|----------|------|
| 业务 | Risk A | 高 | mitigate | done |
`,
    );

    const out = run("build");
    // Now should have +1 prd, +1 user_story, +1 feature, +1 risk
    expect(out).toMatch(/prds:\s+2/);
    expect(out).toMatch(/user_stories:\s+3/);
    expect(out).toMatch(/features:\s+3/);
  }, 30000);
});
