---
sop: prd
version: 6.0.0
default_tier: lite
last_updated: 2026-06-10
---

# SOP PRD — Execution Steps (v6.0.0)

> LITE 默认（7 章节，≤180 行）·FULL 可选（12 章节）·7 步骤 ·2 确认点
> 锚定：Lean/Muda · Kaizen · DoD 硬门

## Overview

| Step | 名称 | 类型 | 标记 |
|------|------|------|------|
| 0 | 依赖检查 | AUTO | - |
| 1 | 业务识别 + 脑暴 | CONFIRM | [DYNAMIC_INPUT] |
| 2 | 文档类型 + 需求深挖 | CONFIRM | [DYNAMIC_INPUT] |
| 3 | 范围决策 | AUTO | - |
| 4 | 生成 PRD | AUTO | [VERIFY] (DoR 门控) |
| 5 | 原型生成 | AUTO | - |
| 6 | 输出 + 自动验证 | AUTO | [VERIFY] |

确认点总数：2（原 v5.1.0 为 5，减少 60%）

---

## Step 0: 依赖检查 [AUTO]

**目标**：检查 sop-knowledge 前置产物

**执行内容**：

1. Glob 搜索 `.sop/knowledge/knowledge-*{keyword}*.md`
2. 找到则加载元数据，未找到则标记 `skipped` 并继续
3. 写状态：`knowledge_id` 或 `null`

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 0_dependency completed
```

**输出**：状态文件 `.sop/state/prd-{id}.json` 中记录 `knowledge_id`

---

## Step 1: 业务识别 + 脑暴 [CONFIRM_REQUIRED] [DYNAMIC_INPUT]

**目标**：单次确认业务类型 + 脑暴开关（Kaizen：一键跳过脑暴）

**执行内容**：

1. 解析用户输入，识别业务类型
2. 触发 `[DYNAMIC_INPUT]` 弹窗（schema: `sop-prd-step1-biz-brief`）：

```json
{
  "schema": "sop-prd-step1-biz-brief",
  "fields": [
    { "name": "business_type", "type": "select", "options": ["电商平台", "管理系统", "物流配送", "小程序", "金融科技", "其他"], "required": true },
    { "name": "core_problem", "type": "text", "description": "≤100 字", "required": true },
    { "name": "target_users", "type": "text", "description": "≤3 个角色", "required": true },
    { "name": "brainstorm", "type": "confirm", "default": false }
  ]
}
```

3. 若 `brainstorm=true`：执行 HMW + 思维导图 + 影响力矩阵（demoted from v5.1.0 CONFIRM → OPTIONAL）
4. 若 `brainstorm=false`：跳过脑暴直接进入 Step 2

**输出**：
- 必填：业务类型 + 核心问题 + 目标用户写入 state
- 可选：`.sop/output/brainstorm-{name}-{date}.md`（仅当 brainstorm=true）

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 1_biz_brief completed \
  business_type={type} brainstorm={true|false}
```

---

## Step 2: 文档类型 + 需求深挖 [CONFIRM_REQUIRED] [DYNAMIC_INPUT]

**目标**：2-way 文档类型选择（LITE 默认）+ 需求深挖

**执行内容**：

1. 触发 `[DYNAMIC_INPUT]` 弹窗（schema: `sop-prd-step2-doc-type`）：

```json
{
  "schema": "sop-prd-step2-doc-type",
  "fields": [
    {
      "name": "tier",
      "type": "select",
      "options": [
        { "label": "LITE（推荐）", "value": "lite", "description": "7 章节，≤180 行" },
        { "label": "FULL", "value": "full", "description": "12 章节，~325 行" }
      ],
      "default": "lite"
    }
  ]
}
```

2. 基于 tier 加载对应模板：
   - **LITE**：7 章节模板，预算见下表
   - **FULL**：LITE + 7 追加章节
3. 需求深挖：5W + 愿景/JTBD/非用户/约束

**LITE 章节预算**：

| # | 章节 | 行数预算 |
|---|------|----------|
| 0 | 执行摘要 | 10 |
| 1 | 业务背景 | 15 |
| 2 | 产品概述 | 20 |
| 3 | 用户故事 | 40（≤8 故事） |
| 4 | 功能规划 | 20 |
| 5 | 技术方案 | 25 |
| 6 | 风险 + 决策 | 15 |
| 7 | 附录 | 10 |
| **合计** | | **≤180** |

**WARN/FAIL 阈值**：

| 模式 | WARN | FAIL |
|------|------|------|
| LITE | 200 行 | 250 行 |
| FULL | 380 行 | 450 行 |

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 2_doc_type_reqs completed \
  tier={lite|full}
```

---

## Step 3: 范围决策 [AUTO]

**目标**：明确 MVP 边界（v6.0.0 改为 AUTO，门控下移到 Step 4）

**执行内容**：

1. 解析用户输入，识别 MVP 范围
2. 输出 5 项范围决策到状态文件：
   - MVP 定义
   - Must/Should/Could 排序
   - 关键假设（We believe X will Y）
   - 不做清单
   - 开放问题

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 3_scope completed
```

---

## Step 4: 生成 PRD [AUTO] [VERIFY]

**目标**：生成 PRD 文档 + DoR 硬门控

**执行内容**：

1. 加载所有前期状态
2. 按 tier 模板生成 PRD 内容
3. **DoR 检查**（门控，**必填**）：

**LITE DoR（4 项）**：

| 检查项 | 阈值 |
|--------|------|
| 用户故事数 ≤ 8 | 硬上限 |
| AC 格式 Given/When/Then | 100% |
| INVEST 自检 | 全部 ≥ 4/6 |
| 无孤章 | 0 章节空内容 |

**FULL DoR（LITE 4 项 + 3 项）**：

| 追加检查项 | 阈值 |
|------------|------|
| 市场研究 3.1-3.3 全有 | 3 章节 |
| NFR 8.1-8.4 全有 | 4 章节 |
| 风险/决策分章 | 2 章节 |

4. DoR 通过 → 写入；不通过 → 写入草稿 + WARN
5. 长度预算检查（WARN/FAIL 阈值见 Step 2）

**输出**：
- 通过：`.sop/output/prd-{kebab-name}-{date}.md`
- 不通过：`.sop/output/prd-{kebab-name}-{date}.DRAFT.md`

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 4_generate completed \
  dor_status={passed|failed} line_count={N}
```

---

## Step 5: 原型生成 [AUTO]

**目标**：基于 PRD 生成可编辑 HTML 原型

**执行内容**：

1. 读取 PRD 文档
2. LITE：从 §2.2 目标用户 + §4 功能规划生成
3. FULL：从 §4.1 信息架构 + §4.2 核心页面 + §4.3 交互流程生成
4. 写入 HTML 原型（参考 `references/17_PROTOTYPE.md`）

**输出**：`.sop/output/prototype-{kebab-name}-{date}.html`

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 5_prototype completed
```

---

## Step 6: 输出 + 自动验证 [AUTO] [VERIFY]

**目标**：输出摘要 + sop-verify 自动后置验证（含长度预算）

**执行内容**：

1. 自动运行验证：`npx ts-node --transpile-only .claude/scripts/sop-verify.ts prd`
2. 生成输出摘要 `.sop/output/prd-{name}-{date}.summary.md`
3. 摘要包含：DoR 状态、长度预算偏差、推荐下一步

**输出**：
- 摘要：`.sop/output/prd-{name}-{date}.summary.md`
- 验证报告：`.sop/output/verify-prd-{name}-{date}.md`

**状态命令**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd 6_output completed
```

---

## Expected Outputs (LITE 默认)

| Step | 必填 | 输出文件 |
|------|------|----------|
| 0_dependency | - | state 文件 |
| 1_biz_brief | ✓ | state 文件 + DYNAMIC_INPUT 答案 |
| 2_doc_type_reqs | ✓ | state 文件 + DYNAMIC_INPUT 答案 |
| 3_scope | - | state 文件 |
| 4_generate | ✓ | `.sop/output/prd-{name}-{date}.md`（≤180 行）|
| 5_prototype | ✓ | `.sop/output/prototype-{name}-{date}.html` |
| 6_output | ✓ | `.sop/output/prd-{name}-{date}.summary.md` + `verify-prd-{name}-{date}.md` |
| 1_biz_brief (可选) | - | `.sop/output/brainstorm-{name}-{date}.md`（仅 brainstorm=true）|

## State Persistence

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts prd {step} {status} [key=value ...]
```

State file: `.sop/state/prd-{id}.json`
Step 映射: `.claude/scripts/sop-step-map.json`

## 断点续传

```bash
# 自动检测
npx ts-node --transpile-only .claude/scripts/sop-resume-check.ts prd
```

## Key References

| Reference | Location |
|-----------|----------|
| SKILL.md | `.claude/skills/sop-prd/SKILL.md` |
| expected.yml | `.claude/skills/sop-prd/expected.yml` |
| LITE 模板 | `.claude/skills/sop-prd/references/05_PRD_LITE.md` |
| FULL 模板 | `.claude/skills/sop-prd/references/04_PRD_FULL.md` |
| DoR/DoD | `.claude/skills/sop-prd/references/14_DOR_DOD.md` |
| 原型模板 | `.claude/skills/sop-prd/references/17_PROTOTYPE.md` |
