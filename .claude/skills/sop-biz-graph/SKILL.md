---
name: sop-biz-graph
description: 业务文档图谱 - 把 PRD/知识/测试/决策/部署/事件汇成可查询的 SQLite 知识图谱，跨 SOP 追溯
version: 0.1.0
triggers:
  - "/sop biz-graph"
  - "业务图谱"
  - "业务追溯"
  - "lineage"
  - "PRD 影响"
  - "需求追溯"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: sequential
  timeout: 60000
  checkpoint_dir: .sop/state
  state_file: .sop/state/biz-graph-{id}.json
---

# SOP Biz-Graph - 业务文档图谱

> **v0.1.0 (2026-06-14, Phase E2)**：把 SOP 产出汇成 SQLite 业务知识图谱，与 [CodeGraph](https://github.com/colbymchenry/codegraph) 代码层互补
>
> **CodeGraph = 代码层（src/）的 AST 图谱**
> **sop-biz-graph = 业务层（.sop/output/, .sop/knowledge/, .sop/state/）的文档图谱**

## 概述

`sop-biz-graph` 解决业务文档"散落各处、无法追溯"的痛点：

| 问题 | 之前 | 之后（biz-graph） |
|------|------|------------------|
| US-003 在哪里被引用？ | grep 全 .sop/ | `query US-003` |
| trace_id 全链路 | 手动翻 state JSON | `trace prd-2026-06-10-abc123` |
| 这个 PRD 影响多少需求？ | 数表格 | `affected prd:logistics-20260508` |
| 知识库被谁引用？ | grep | `node kn:logistics-20260508` |

## 节点类型（14 类）

| 类型 | 来源 | 示例 ID |
|------|------|---------|
| `sop_run` | `.sop/state/*.json` | `run:prd-2026-06-10-abc123` |
| `prd` | `.sop/output/prd-*.md` | `prd:logistics-20260508` |
| `user_story` | PRD §3/§5 表格 | `us:prd:...:US-001` |
| `acceptance_criterion` | PRD AC 列 | `ac:us:...:US-001` |
| `feature` | PRD §4/§6 表格 | `feat:prd:...:F-01` |
| `test_case` | test-cases-*.md | `tc:OrderServiceTest::testCreate` |
| `knowledge` | `.sop/knowledge/*.md` | `kn:logistics-20260508` |
| `decision` | PRD §6/§10 决策 | `dec:prd:...:1` |
| `risk` | PRD §6/§9 风险 | `risk:prd:...:1` |
| `deployment` | `.sop/output/deploy-*/` | `deploy:20260601-v1.2.0` |
| `incident` | sop-incident-response 产出 | `inc:20260601-1` |
| `verify_report` | `.sop/output/verify-*.md` | `verify:prd-20260610` |
| `prototype` | `.sop/output/prototype-*.html` | `proto:prd:...` |
| `code_ref` | CodeGraph 桥接 | `code:src/.../OrderService.java::createOrder` |

## 边类型（11 类）

| 边 | from → to | 说明 |
|---|----------|------|
| `produces` | sop_run → 任意产出 | SOP 产生了什么 |
| `consumes` | sop_run → 输入产物 | SOP 引用了什么 |
| `traces_to` | child → parent | 跨 SOP 父子关系 |
| `references` | doc → doc | 文档引用 |
| `implements` | feature → user_story | 功能实现哪个故事 |
| `verifies` | test_case → user_story | 测试验证哪个需求 |
| `validates` | ac → user_story | AC 属于哪个故事 |
| `mitigates` | decision → risk | 决策缓解风险 |
| `deploys` | deployment → feature | 部署哪些功能 |
| `caused_by` | incident → deployment\|feature | 故障归因 |
| `code_ref` | feature → code_ref | 业务 → 代码桥接 |

## 命令

| 命令 | 用途 |
|------|------|
| `sop-biz-graph build` | 全量重建（扫描 .sop/output + .sop/state + .sop/knowledge） |
| `sop-biz-graph sync` | 增量同步（自动由 sop-state-save 钩子触发） |
| `sop-biz-graph status` | 节点/边统计 |
| `sop-biz-graph query <text>` | FTS5 + LIKE 搜索（兼容 CJK） |
| `sop-biz-graph node <id>` | 单节点详情 + 入边出边 |
| `sop-biz-graph trace <trace_id>` | 全链路 lineage（同 trace 的所有节点）|
| `sop-biz-graph affected <id> [depth]` | 下游 BFS（默认 depth=3）|
| `sop-biz-graph reset` | 清空数据库 |

## 自动同步

`sop-state-save.ts` 在每个 step 完成时自动触发 `sop-biz-graph sync`：

```
状态 step completed → biz-graph sync (子进程, 30s 超时) → 索引更新
```

opt-out：`SOP_BIZ_GRAPH_AUTO=0` 环境变量（CI/测试用）。

## 流程步骤

### Step 1: 初始化（首次） [AUTO]

```bash
# 创建目录 + SQLite + WAL
mkdir -p .sop/biz-graph
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts build
```

**预期**：扫描 `.sop/state/*.json`、`.sop/output/prd-*.md`、`.sop/knowledge/*.md`，建立节点和边。

### Step 2: 查询业务实体 [AUTO]

**全文搜索**：
```bash
sop-biz-graph query "调度"
# 返回所有 name 包含"调度"的节点
```

**单节点详情**：
```bash
sop-biz-graph node prd:logistics-20260508
# 返回该 PRD 节点 + 所有入边出边
```

### Step 3: 跨 SOP 追溯 [AUTO]

**按 trace_id 查全链路**：
```bash
sop-biz-graph trace prd-2026-06-10-abc123
# 输出按类型分组的所有节点
```

### Step 4: 影响分析 [AUTO]

**改了某个节点，影响哪些下游**：
```bash
sop-biz-graph affected us:prd:logistics-20260508:US-001
# BFS 输出 depth ≤ 3 的所有受影响节点
```

## 与 CodeGraph 的协作

| 业务问题 | 跨图谱查询 |
|---------|----------|
| "改了 OrderService 影响哪些 PRD？" | `codegraph callers OrderService` → `code_ref` 节点 → `feature` 节点 → `prd` 节点 |
| "这个 PRD 涉及多少代码？" | `sop-biz-graph node prd:...` → `feature` 节点 → `code_ref` 节点 → `codegraph node` |
| "改了 US-001 影响哪些测试？" | `sop-biz-graph affected us:...:US-001` (业务层) + `codegraph affected ...` (代码层) |

桥接节点（`code_ref` 类型）的 ID 与 CodeGraph 的 fully-qualified symbol 对齐。

## 与其他 SOP 集成

| SOP | 集成点 |
|-----|--------|
| `sop-prd` | Step 6 输出后，自动 sync biz-graph 索引新 PRD |
| `sop-test-design` | 输出 test-cases 后，建立 `verifies` 边（TC → US）|
| `sop-regression` | `affected` 命令输出测试集时，可结合 biz-graph 反查 PRD 影响 |
| `sop-incident-response` | 故障归因时建立 `caused_by` 边 |
| `sop-deployment` | 部署后建立 `deploys` 边（feature → deployment）|
| `sop-verification` | 验证报告作为 `verify_report` 节点，关联到原 SOP |

## 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts biz-graph 1_init completed
```

State file: `.sop/state/biz-graph-{id}.json`

## 数据库位置

```
.sop/biz-graph/
├── biz.db           # SQLite (WAL mode)
├── biz.db-wal
├── biz.db-shm
└── stats.json       # 上次 build 统计（可选）
```

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| Node 22.5+ 未安装 | `node:sqlite` 不可用 — 提示用户升级（CodeGraph 同需求） |
| `.sop/biz-graph/` 不存在 | 自动创建 |
| 解析 PRD 失败 | 跳过该文件，记录 warning，继续其他 |
| sync 超时（>30s）| 子进程 kill，不阻塞主流程 |
| FTS5 查询语法错误 | 自动降级到 LIKE |

## SCHEMA 设计文档

详见 `references/SCHEMA.md`（位于本 skill 目录）。

## 触发命令

```
/sop biz-graph                                    # 等价 status
/sop biz-graph build                              # 全量重建
/sop biz-graph query "调度"                       # 搜索
/sop biz-graph node prd:logistics-20260508        # 单节点详情
/sop biz-graph trace prd-2026-06-10-abc123        # 链路
/sop biz-graph affected us:prd:...:US-001         # 影响
```

## 相关

- [CodeGraph](https://github.com/colbymchenry/codegraph) — 代码层图谱
- [sop-dependency-analysis v3.0.0](../sop-dependency-analysis/SKILL.md) — CodeGraph 集成
- [sop-trace.ts](../../scripts/sop-trace.ts) — Phase D2 跨 SOP trace_id
- SCHEMA.md（本目录）— 节点/边模型详细定义
