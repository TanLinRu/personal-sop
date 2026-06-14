---
sop: biz-graph
version: 0.1.0
last_updated: 2026-06-14
---

# SOP Biz-Graph — Execution Steps

> 4 步骤：初始化 → 查询 → 追溯 → 影响分析
> 全 [AUTO]，无确认点（纯查询工具）

## Overview

| Step | 名称 | 类型 |
|------|------|------|
| 1 | 初始化/构建 | AUTO |
| 2 | 查询业务实体 | AUTO |
| 3 | 跨 SOP 追溯 | AUTO |
| 4 | 影响分析 | AUTO |

---

## Step 1: 初始化/构建 [AUTO]

**目标**：建立或刷新 `.sop/biz-graph/biz.db`

**命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts build
```

**输出统计**：
- sop_runs / knowledge / prds / user_stories / features / risks / decisions / deployments / verifies
- 总节点数、总边数

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts biz-graph 1_build completed
```

---

## Step 2: 查询业务实体 [AUTO]

**目标**：搜索节点（按名称或 metadata）

**命令**：

```bash
# 全文搜索（兼容中文）
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts query "调度"

# 按 ID 查单个
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts node us:prd:logistics-20260508:US-001
```

**输出**：表格列出 type / id / name / trace_id

---

## Step 3: 跨 SOP 追溯 [AUTO]

**目标**：按 trace_id 查全链路

**命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts trace prd-2026-06-10-abc123
```

**输出**：按节点类型分组的全链路列表

---

## Step 4: 影响分析 [AUTO]

**目标**：BFS 下游影响（默认 depth=3）

**命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts affected prd:logistics-20260508 3
```

**输出**：按 depth 排序的受影响节点列表

---

## Expected Outputs

| Step | 必填 | 输出 |
|------|------|------|
| 1_build | ✓ | `.sop/biz-graph/biz.db` (SQLite) |
| 2_query | - | stdout 表格 |
| 3_trace | - | stdout 链路 |
| 4_affected | - | stdout BFS 结果 |

## State Persistence

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts biz-graph {step} {status}
```

State file: `.sop/state/biz-graph-{id}.json`

## Key References

| Reference | Location |
|-----------|----------|
| SKILL.md | `.claude/skills/sop-biz-graph/SKILL.md` |
| SCHEMA.md | `.claude/skills/sop-biz-graph/SCHEMA.md` |
| 实现 | `.claude/scripts/sop-biz-graph.ts` |
| 测试 | `.claude/scripts/sop-biz-graph.test.ts` |
