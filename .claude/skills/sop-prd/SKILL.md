---
name: sop-prd
description: PRD产品需求文档生成 - 知识驱动 + 可视化原型（LITE默认 / FULL可选）
version: 6.0.0
triggers:
  - "/sop prd"
  - "生成PRD"
  - "产品需求文档"
  - "需求分析"
  - "创建PRD"
  - "原型设计"
permissions:
  task:
    explore: allow
    general: allow
  read:
    - "."
    - ".sop/**"
  write:
    - ".sop/output/**"
    - ".sop/knowledge/**"
    - ".sop/state/**"
  bash: allow
execution:
  mode: async
  checkpoint_dir: .sop/state
  state_file: .sop/state/prd-{id}.json
  parallel_tasks:
    - id: "step2_requirements"
      agent: "sop-knowledge"
      depends_on: ["step1"]
      execution_mode: parallel
    - id: "step5_prototype"
      agent: "frontend-design"
      depends_on: ["step4"]
      execution_mode: parallel
---

# SOP PRD - 产品需求文档生成

> **v6.0.0 优化**：LITE 默认（7章节，≤180 行）·FULL 可选（12章节）·7 步骤 ·2 确认点
>
> 锚定模式：Lean/Muda（消除冗余）· Kaizen（一键默认）· DoD（完成门控）

## 概述

本SOP提供PRD生成框架，核心特点：
1. **LITE 默认**：开箱即用 7 章节模板，输出 ≤180 行
2. **FULL 可选**：通过 `[DYNAMIC_INPUT]` 一次性升级到 12 章节完整版
3. **知识驱动**：自动引用 `sop-knowledge` 收集的领域知识
4. **问题驱动**：HMW + INVEST + Given/When/Then 全流程贯穿
5. **可视化原型**：HTML 原型自动生成（v5.0.0 沿用）
6. **完成门控**：Step 4 通过 DoR 检查才能进入 Step 5（DoD 硬门）

## 与其他 SOP 的关系

| 前置 SOP      | 用途                         |
| ------------- | ---------------------------- |
| sop-knowledge | 收集领域知识（**推荐前置**） |
| sop-prd       | 生成 PRD + 可编辑 HTML 原型  |
| sop-scaffold  | 生成脚手架                   |
| sop-test-design | 从用户故事生成测试用例（**推荐后置**） |

---

## Step 0: 依赖检查 (DEPENDENCY CHECK) [AUTO]

### 执行指令

```agent
# 1. 搜索已存在的知识文档
# 2. 找到则加载元数据，找不到则继续
# 3. 状态保存为 skipped 时不阻塞
```

### 搜索规范

| 产物类型 | 搜索路径          | 搜索模式                     |
| -------- | ----------------- | ---------------------------- |
| 领域知识 | `.sop/knowledge/` | `knowledge-{name}-*.md`      |
| 技术规范 | `.sop/knowledge/` | `knowledge-{name}-spec-*.md` |

### 处理逻辑

| 检查结果 | 执行动作                               |
| -------- | -------------------------------------- |
| 找到多个 | 选择最新版本（按日期排序），加载元数据 |
| 找到1个  | 加载该文件的元数据                     |
| 没找到   | 状态标记为 `skipped`，继续 Step 1       |

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 0_dependency completed
```

---

## Step 1: 业务识别 + 脑暴 (BIZ + BRAINSTORM) [CONFIRM_REQUIRED] [DYNAMIC_INPUT]
> **auto_default**: SKIP — 需要业务上下文

> v6.0.0 优化：合并 Step 1 + Step 1.2（业务识别 + 脑暴），单次确认。脑暴为 OPTIONAL，可一键跳过。

### 业务类型识别

| 关键词              | 业务类型 | 行业背景     |
| ------------------- | -------- | ------------ |
| 电商、商城、订单    | 电商平台 | 零售电商     |
| 管理、后台、OA、CRM | 管理系统 | 企业服务     |
| 物流、配送、运输    | 物流配送 | 物流行业     |
| 小程序              | 小程序   | 移动互联网   |
| 金融、支付、贷款    | 金融科技 | 金融科技     |
| {自定义关键词}      | {业务类型} | {行业背景} |

### 一次性确认（DYNAMIC_INPUT）

```javascript
[DYNAMIC_INPUT] {
  schema: "sop-prd-step1-biz-brief",
  fields: [
    {
      name: "business_type",
      type: "select",
      options: ["电商平台", "管理系统", "物流配送", "小程序", "金融科技", "其他"],
      required: true
    },
    {
      name: "core_problem",
      type: "text",
      description: "一句话描述核心问题（≤100字）",
      required: true
    },
    {
      name: "target_users",
      type: "text",
      description: "目标用户角色（逗号分隔，≤3个）",
      required: true
    },
    {
      name: "brainstorm",
      type: "confirm",
      description: "是否需要结构化脑暴（HMW + 思维导图）？",
      default: false
    }
  ]
}
```

> **默认行为**：`brainstorm=false` 时跳过脑暴直接进入 Step 2，节省 1 个确认点。Lean 实践：消除"为了脑暴而脑暴"的浪费。

### 脑暴（OPTIONAL，仅当 brainstorm=true 触发）

**Phase A: 发散** — 生成 3-5 个 HMW 问题：

```agent
# 根据业务类型生成 HMW 问题
# 维度：效率 / 体验 / 智能 / 扩展 / 协同
# 输出：HMW 问题列表 + 影响矩阵
```

**Phase B: 收敛** — Quick Wins / Strategic Bets / Fill-ins / Deprioritize 2x2 矩阵

**输出**（仅当 brainstorm=true）：

```bash
# 写入脑暴文档
Write(file_path=".sop/output/brainstorm-{kebab-name}-{date}.md")
```

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 1_biz_brief completed \
  business_type={type} brainstorm={true|false}
```

---

## Step 2: 文档类型 + 需求深挖 (DOC_TYPE + REQUIREMENTS) [CONFIRM_REQUIRED] [DYNAMIC_INPUT]
> **auto_default**: LITE（推荐）

> v6.0.0 优化：合并 Step 1.5 + Step 1.75 + Step 2，2-way 文档类型选择（LITE 默认 / FULL 可选）+ 需求深挖。

### 文档类型选择（DYNAMIC_INPUT — Kaizen 一键默认）

```javascript
[DYNAMIC_INPUT] {
  schema: "sop-prd-step2-doc-type",
  fields: [
    {
      name: "tier",
      type: "select",
      options: [
        { label: "LITE（推荐）", value: "lite", description: "7 章节，≤180 行，适合快速迭代和内部项目" },
        { label: "FULL", value: "full", description: "12 章节，~325 行，适合商业项目和对外汇报" }
      ],
      default: "lite"
    }
  ]
}
```

> **Kaizen 实践**：v5.1.0 的 3-way 选择（精简/标准/完整）使用户每次都选"标准"或"完整"，导致 PRD 普遍 300+ 行。v6.0.0 改为 2-way，默认 LITE，FULL = 显式 opt-in。

### 需求深挖（基于 LITE/FULL 选择）

**LITE（7 章节，必填）**：

| 章节 | 预算 | 内容 |
|------|------|------|
| 0. 执行摘要 | 10 行 | 问题陈述 + Proposed Solution + 关键假设 + 成功指标 |
| 1. 业务背景 | 15 行 | 1.3 产品目标 + 1.4 成功指标 |
| 2. 产品概述 | 20 行 | 2.1 定位 + 2.2 目标用户 + 2.3 产品范围 |
| 3. 用户故事 | 40 行 | MoSCoW + INVEST + Given/When/Then，**硬上限 8 个故事** |
| 4. 功能规划 | 20 行 | MoSCoW 排序的功能列表 |
| 5. 技术方案 | 25 行 | 技术栈 + 关键数据模型（**不含接口设计**） |
| 6. 风险 + 决策 | 15 行 | 合并的风险表 + 决策日志（一个表） |
| 7. 附录 | 10 行 | 术语表 + 追溯矩阵指针 |

**FULL（12 章节，FULL 模式追加）**：

| 追加章节 | 预算 | 来源 |
|----------|------|------|
| 1.1 行业背景 | +10 行 | 引用知识库 |
| 1.2 行业挑战 | +10 行 | 引用知识库 |
| 2.4 竞品分析 | +15 行 | 引用知识库 |
| 3. 市场研究 | +30 行 | 独立章节（3.1 竞品 + 3.2 最佳实践 + 3.3 技术方案） |
| 4. 产品设计 | +40 行 | 4.1 架构 + 4.2 核心页面 + 4.3 交互流程 + 4.4 设计规范 |
| 8. 非功能需求 | +30 行 | 性能/可用性/安全/合规 |
| 9. 独立风险评估 | +20 行 | 与 §6 风险区分（开发 vs 业务） |

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 2_doc_type_reqs completed \
  tier={lite|full}
```

---

## Step 3: 范围 + DoD 门控 (SCOPE + DOD_GATE) [AUTO]

> v6.0.0 优化：Step 3 原 [CONFIRM_REQUIRED] 改为 [AUTO]，门控逻辑下移到 Step 4。

### MVP 边界确认

| #    | 问题                                     | 输出位置     |
| ---- | ---------------------------------------- | ------------ |
| 1    | **MVP 定义**：最小可验证什么？           | §2.3 产品范围 |
| 2    | **Must/Should/Could**：优先级排序        | §4 功能规划  |
| 3    | **关键假设**：We believe {X} will {Y}... | §0 执行摘要  |
| 4    | **不做**：明确不包含什么                 | §2.3 产品范围 |
| 5    | **开放问题**：什么不确定？               | §7 附录      |

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 3_scope completed
```

---

## Step 4: 生成 PRD 文档 (GENERATE) [AUTO] [VERIFY]

> **v6.0.0 优化**：DoD 硬门控嵌入生成流程，**未通过 DoR 检查的 PRD 不写入磁盘**。
> **v6.1.0 (Phase D2)**：PRD frontmatter 必含 `trace_id`，用于跨 SOP 追溯。

### DoR 检查清单（门控，必填）

> 参考 `references/14_DOR_DOD.md` 的精简版。Tier-aware：LITE = 4 项必查，FULL = 7 项必查。

**LITE DoR（4 项）**：

| 检查项 | 阈值 | 检查方式 |
|--------|------|----------|
| 用户故事数 ≤ 8 | 硬上限 | 解析 §3 故事 ID 数量 |
| 所有故事使用 Given/When/Then | 100% | 正则匹配 AC 列 |
| 所有故事 INVEST 自检 | 全部 ≥ 4/6 | 解析每行 INVEST 标记 |
| 无孤章 | 0 章节空内容 | 章节标题下必须 ≥1 段 |

**FULL DoR（LITE 4 项 + 3 项）**：

| 检查项 | 阈值 | 检查方式 |
|--------|------|----------|
| 市场研究 3.1-3.3 全有 | 3 章节 | 章节标题匹配 |
| 非功能需求 8.1-8.4 全有 | 4 章节 | 章节标题匹配 |
| 风险评估 + 决策日志分章 | 2 章节 | §6 不合并到 §9 |

### DoD 门控执行

```agent
# 1. 读取 trace_id（state.trace_id）
trace_id = state.trace_id  # 自 sop-state-save.ts 自动生成

# 2. 生成 PRD 内容（frontmatter 必含 trace_id）
prd_content = generate_prd(state, trace_id=trace_id)

# 3. DoR 检查
dor_check = validate_dor(prd_content, tier=state.tier)
if not dor_check.passed:
    # 修复循环（最多 2 次重试）
    for attempt in 1..2:
        prd_content = fix_issues(prd_content, dor_check.issues)
        dor_check = validate_dor(prd_content, tier=state.tier)
        if dor_check.passed: break

# 4. 通过则写入；不通过则写入草稿并 WARN
if dor_check.passed:
    Write(file_path=".sop/output/prd-{kebab-name}-{date}.md")
    state['dor_status'] = 'passed'
else:
    Write(file_path=".sop/output/prd-{kebab-name}-{date}.DRAFT.md")
    state['dor_status'] = 'failed'
    log.warn("DoR 未通过，已生成草稿")
```

### 必含 frontmatter 字段（v6.1.0）

```yaml
---
sop: prd
trace_id: prd-2026-06-10-abc123        # 自动从 state.trace_id 注入
tier: lite                             # 或 full
version: 6.1.0
generated: 2026-06-10T10:00:00Z
dor_status: passed                     # 或 failed
line_count: 145
---
```

下游 SOP（test-design / scaffold）通过 `parent_trace` 字段关联：

```bash
# Phase D2: 在 sop-test-design 启动时
npx ts-node --transpile-only .claude/scripts/sop-trace.ts --link \
  prd-2026-06-10-abc123 \
  test-design-2026-06-10-xyz789
```

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 4_generate completed \
  dor_status={passed|failed} line_count={N}
```

### 长度预算（自动检查）

| 模式 | 目标行数 | WARN 阈值 | FAIL 阈值 |
|------|----------|-----------|-----------|
| LITE | ≤180 | 200 | 250 |
| FULL | ≤325 | 380 | 450 |

`line_count` 超过 WARN → 在 verify-report 输出长度预算偏差。

---

## Step 5: 原型生成 (PROTOTYPE) [AUTO]

### 执行指令

```agent
# 1. 读取 PRD 文档
Read(file_path=".sop/output/prd-{name}-{date}.md")

# 2. 提取关键信息
# - LITE：从 §2.2 目标用户 + §4 功能规划生成
# - FULL：从 §4.1 信息架构 + §4.2 核心页面 + §4.3 交互流程生成

# 3. 生成 HTML 原型（参考 references/17_PROTOTYPE.md）
Write(file_path=".sop/output/prototype-{kebab-name}-{date}.html")

# 4. 保存状态
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 5_prototype completed
```

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 5_prototype completed
```

---

## Step 6: 输出和后续 (OUTPUT) [AUTO] [VERIFY]

### 执行指令

```agent
# 1. 自动运行 sop-verification（[VERIFY] 后置条件）
npx ts-node --transpile-only .claude/scripts/sop-verify.ts prd

# 2. 输出摘要
Write(file_path=".sop/output/prd-{name}-{date}.summary.md")
```

### 输出摘要模板

```markdown
## PRD 已创建

**文件**:
- PRD: `.sop/output/prd-{name}-{date}.md` ({line_count} 行, tier={tier})
- 原型: `.sop/output/prototype-{name}-{date}.html`
- 脑暴（可选）: `.sop/output/brainstorm-{name}-{date}.md`
- 验证报告: `.sop/output/verify-prd-{name}-{date}.md`

### 摘要

**问题**: {一句话}
**方案**: {一句话}
**关键指标**: {Primary metric}

### DoR 状态

| 检查项 | LITE | FULL | 状态 |
|--------|------|------|------|
| 用户故事数 ≤ 8 | ✓ | ✓ | {passed/failed} |
| AC 格式 Given/When/Then | ✓ | ✓ | {passed/failed} |
| INVEST 自检 | ✓ | ✓ | {passed/failed} |
| 无孤章 | ✓ | ✓ | {passed/failed} |
| 市场研究完整 | — | ✓ | {skipped/passed/failed} |
| NFR 完整 | — | ✓ | {skipped/passed/failed} |
| 风险/决策分章 | — | ✓ | {skipped/passed/failed} |

### 推荐下一步

1. **查看原型**: 在浏览器中打开 `.sop/output/prototype-{name}-{date}.html`
2. **生成测试用例**: 运行 `/sop test-design` — 从用户故事生成测试用例
3. **代码实现**: 运行 `/sop scaffold` 或 `/sop fullstack`
```

### 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 6_output completed
```

---

## LITE 模板（默认，7 章节）

```markdown
---

## 0. 执行摘要

### 问题陈述
{Who has what problem, and what's the cost of not solving it?}

### Proposed Solution
{What we're building and why this approach over alternatives}

### 关键假设 (Hypothesis)
We believe {capability} will {solve problem} for {users}.
We'll know we're right when {measurable outcome}.

### 成功指标
| 指标 | 目标 | 衡量方式 |
|------|------|----------|
| {Primary} | {Target} | {Method} |

---

## 1. 业务背景

### 1.3 产品目标
- 目标1：{可量化}
- 目标2：{可量化}

### 1.4 成功指标
| 指标 | 目标值 | 衡量方式 |
|------|--------|----------|
| | | |

---

## 2. 产品概述

### 2.1 产品定位
{产品为谁做什么}

### 2.2 目标用户
| 用户角色 | 描述 | 使用场景 |
|----------|------|----------|
| 角色A | 描述 | 场景 |

### 2.3 产品范围
- **包含**：功能A、功能B
- **不包含**：功能X、功能Y

---

## 3. 用户故事

### 3.1 用户角色
| 角色 | 描述 | 权限范围 |
|------|------|----------|
| | | |

### 3.2 用户故事矩阵 (MoSCoW + INVEST)
> 硬上限 8 个故事，每个必须满足 INVEST。

| ID | 角色 | 故事 | 验收标准 (Given/When/Then) | 优先级 | INVEST |
|----|------|------|----------|--------|--------|
| US-001 | | | | Must | ✅/⚠️ |

### 3.3 异常场景
| 场景 | 处理方式 |
|------|----------|
| 异常1 | 处理描述 |

---

## 4. 功能规划

| 功能 | 优先级 | 描述 | 关联用户故事 |
|------|--------|------|--------------|
| F-01 | Must | 描述 | US-001 |
| F-02 | Should | 描述 | US-002 |
| F-03 | Could | 描述 | US-003 |

---

## 5. 技术方案

### 5.1 技术栈
| 层 | 选型 | 理由 |
|----|------|------|
| 前端 | {框架} | |
| 后端 | {框架} | |
| 数据 | {DB} | |
| 部署 | {容器} | |

### 5.2 关键数据模型
| 实体 | 关键字段 | 关系 |
|------|----------|------|
| | | |

> 详细接口设计见 §7 附录或 NFR 附录。

---

## 6. 风险 + 决策

| 类型 | 内容 | 影响 | 缓解措施 | 决策 |
|------|------|------|----------|------|
| 技术 | 风险描述 | 高/中/低 | 措施 | 已决/待决 |
| 业务 | 风险描述 | 高/中/低 | 措施 | 已决/待决 |

---

## 7. 附录

### 7.1 术语表
| 术语 | 定义 |
|------|------|
| | |

### 7.2 追溯矩阵
| 用户故事 | 功能 | 测试用例 |
|----------|------|----------|
| US-001 | F-01 | TC-001 (运行 /sop test-design 后填充) |

### 7.3 参考文档
- 领域知识：`.sop/knowledge/knowledge-{domain}-{date}.md`
- HTML 原型：`.sop/output/prototype-{name}-{date}.html`

---

**文档状态**: DRAFT → 待 `/sop verify` 通过后转 STABLE
**创建时间**: {date}
**基于知识**: {knowledge_id}
**下一步**: [运行 /sop test-design] 或 [运行 /sop scaffold]
```

---

## FULL 模板（仅 FULL 模式追加，章节 1.x, 2.4, 3, 4, 8, 9）

> 选择 `tier=full` 时，在 LITE 基础上追加以下章节。详见 `references/04_PRD_FULL.md`。

| 追加章节 | LITE 映射 | 来源 |
|----------|-----------|------|
| 1.1 行业背景 | — | 知识库 |
| 1.2 行业挑战 | — | 知识库 |
| 2.4 竞品分析 | — | 知识库 |
| 3. 市场研究（3.1-3.3） | — | 知识库 + Web 搜索 |
| 4. 产品设计（4.1-4.4） | LITE §4 功能规划 → 升级为带 UI 架构 | 知识库 + 用户故事 |
| 8. 非功能需求（8.1-8.4） | LITE §7.3 引用 NFR 附录 | 独立章节 |
| 9. 独立风险评估 | 与 LITE §6 分离（开发风险 vs 业务风险） | 独立章节 |

---

## 完整工作流程

```
用户: "/sop prd {业务系统}"
   ↓
Step 0: 依赖检查 [AUTO] → 加载/跳过知识
   ↓
Step 1: 业务识别 + 脑暴 [CONFIRM] [DYNAMIC_INPUT]
   ↓ brainstrom OPTIONAL（一键跳过）
Step 2: 文档类型 + 需求深挖 [CONFIRM] [DYNAMIC_INPUT]
   ↓ tier=lite (默认) | tier=full
Step 3: 范围决策 [AUTO]
   ↓
Step 4: 生成 PRD + DoR 门控 [AUTO] [VERIFY]
   ↓ DoR 不通过 → 草稿 + WARN
Step 5: 原型生成 [AUTO]
   ↓
Step 6: 输出摘要 + 自动验证 [AUTO] [VERIFY]
   ↓
   sop-verify.ts prd → verify-report.md (含长度预算检查)
```

## 与 v5.1.0 对比

| 维度 | v5.1.0 | v6.0.0 | 变化 |
|------|--------|--------|------|
| 步骤数 | 10 | 7 | -30% |
| 确认点 | 5 | 2 | -60% |
| 默认模板 | 12 章节 | 7 章节（LITE） | -42% |
| 平均输出 | 325 行 | ≤180 行 | -45% |
| 门控 | 无 | DoR 硬门 | +Lean |
| 后置验证 | 手动 | sop-verify 自动 | +DMAIC |
| 行业锚定 | 无 | Lean/Kaizen/DoD | +理论支撑 |

## 测试示例

### 示例 1：LITE 完整流程（推荐）

```
1. Step 0: 检查知识 → 无 → skipped
2. Step 1: DYNAMIC_INPUT 业务简报（business_type=物流配送, brainstorm=false）
3. Step 2: DYNAMIC_INPUT 文档类型（tier=lite）
4. Step 3: 自动完成范围决策
5. Step 4: 生成 PRD（~150 行）→ DoR 4 项全过 → 写入
6. Step 5: 生成原型
7. Step 6: 输出摘要 + sop-verify → 长度预算 PASS
```

### 示例 2：FULL 流程

```
1. Step 0-3: 同 LITE
2. Step 2 选择 tier=full → 追加 7 个章节
3. Step 4: DoR 7 项全过 → 写入 ~325 行 PRD
4. Step 5-6: 同 LITE
```

## 触发命令

```
/sop prd
```

或描述：
- "生成PRD文档"
- "创建产品需求文档"
- "帮我生成一个XXX的PRD"

## 参考

- [sop-knowledge](./sop-knowledge/SKILL.md) - 领域知识管理
- [sop-test-design](./sop-test-design/SKILL.md) - 测试用例设计（推荐后置）
- [references/14_DOR_DOD.md](./references/14_DOR_DOD.md) - DoR/DoD 完整定义
- [references/04_PRD_FULL.md](./references/04_PRD_FULL.md) - FULL 模板（v5.x 沿用）
- [references/05_PRD_LITE.md](./references/05_PRD_LITE.md) - LITE 模板（v5.0 沿用，已成为默认）
