---
sop: verify
step: 1_collect_context
status: pending
---

# SOP Verify — Execution Steps

## Overview

当 `/sop verify [sop-name]` 触发时，按照以下 5 步执行。如果未指定 sop-name，自动检测最近完成的 SOP。

## Step 1: 收集执行上下文 [AUTO]

**目标**：收集 SOP 执行的完整上下文（状态、预期、产出）

**执行内容**：

1. 确定要验证的 SOP（用户指定或最近完成）
2. 运行上下文收集脚本：
   ```bash
   npx ts-node --transpile-only .claude/scripts/sop-verify.ts <sop-name>
   ```
3. 阅读产出文件内容（核心验证素材）

**输出**：
- SOP 执行状态摘要
- expected.yml 定义
- 产出文件列表

---

## Step 2: 加载预期定义 [AUTO]

**目标**：理解 SOP 的预期行为和产出标准

**执行内容**：

1. 读取 `.claude/skills/sop-{name}/expected.yml`
2. 理解以下内容：
   - 预期步骤顺序（expected_steps）
   - 预期参数（expected_params）
   - 预期产出（expected_outputs）
   - 约束条件（constraints）
3. 如无 expected.yml，报 WARN 并使用 step-map 作为 fallback

**输出**：
- expected.yml 解析摘要
- 缺失 expected.yml 的警告

---

## Step 3: 执行基础验证 [AUTO]

**目标**：自动执行 4 项基础检查，无需 Agent 介入

**执行内容**：

### 3.1 步骤合规检查
- 对比 `expected_steps` vs `state.steps`
- 检查：步骤是否缺失？顺序是否一致？有无重复？
- 输出：通过/跳过的步骤清单

### 3.2 产出完整性检查
- 对比 `expected_outputs[required]` vs 实际产出文件
- 检查：必需产出是否存在？内容是否为空？
- 输出：缺失/空文件清单

### 3.3 状态一致性检查
- 对比 `state.steps[step].status` vs 实际产出
- 检查：标记 completed 的步骤是否有对应产出？
- 输出：虚假完成/状态未更新的步骤

### 3.4 参数一致性检查
- 对比 `expected_params` vs `state.answers`
- 检查：必要参数是否有值？参数值是否在产出中被使用？
- 输出：参数缺失/未使用的参数

**输出**：
```markdown
### 基础验证结果
| 维度 | 状态 | 问题数 |
|------|------|--------|
| 步骤合规 | ✅ | 0 |
| 产出完整性 | ⚠️ | 2 |
| 状态一致性 | ✅ | 0 |
| 参数一致性 | ✅ | 0 |
```

---

## Step 4: 分发深度审查 [AUTO]

**目标**：根据基础验证结果和 SOP 类型，分发 subAgent 进行深度审查

**执行内容**：

### 分发策略

```javascript
// 逻辑判断，由 Agent 自行执行
const agentsToDispatch = [];

// 所有 SOP 都必须检查
agentsToDispatch.push("flow-reviewer");

// 基础验证发现问题时深入
if (basicCheck.outputMissing.length > 0) {
  agentsToDispatch.push("output-reviewer");
}
if (basicCheck.paramIssues.length > 0) {
  agentsToDispatch.push("param-reviewer");
}
if (basicCheck.stateIssues.length > 0) {
  agentsToDispatch.push("state-reviewer");
}

// 按产出类型分发
if (hasCodeOutput) {
  agentsToDispatch.push("code-reviewer");
}
if (hasArchOutput) {
  agentsToDispatch.push("arch-reviewer");
}

// 始终检查安全
agentsToDispatch.push("security-reviewer");

// 始终检查质量
agentsToDispatch.push("quality-reviewer");
```

### 调用 subAgent

```bash
# 流程合规审查
task(
  subagent_type="flow-reviewer",
  prompt="""Review SOP <name> execution flow.
  
  State: ...
  Expected steps: ...
  Actual steps: ...
  
  Check for missing, duplicate, or out-of-order steps.
  Return structured report."
)

# 产出完整性审查（如发现问题）
task(
  subagent_type="output-reviewer",
  prompt="""Review output completeness for SOP <name>.
  
  Expected outputs: ...
  Actual outputs: ...
  Missing: ...
  
  Check if missing files are critical.
  Return structured report."
)

# 安全审查（始终执行）
task(
  subagent_type="security-reviewer",
  prompt="""Review security of SOP <name> outputs.
  
  Scan all output files for:
  - Hardcoded secrets
  - API keys
  - Internal URLs exposed
  - Sensitive data leaks
  Return structured report."
)
```

**输出**：
- 每个 subAgent 返回结构化报告（score + findings + suggestions）

---

## Step 5: 生成总报告 [AUTO]

**目标**：聚合基础验证 + 深度审查结果，生成最终报告

**执行内容**：

1. 收集所有子报告
2. 计算各维度评分
3. 生成总报告到 `.sop/output/verify-{sop}-{date}.md`

**报告模板**：

```markdown
# SOP 审查报告: {sop}

## 执行概要
- **SOP**: {name}
- **审查时间**: {date}
- **总体评分**: {score}/100 ({level})

## 基础验证
| 维度 | 状态 | 详情 |
|------|------|------|
| 步骤合规 | ✅/⚠️/❌ | N/N 步骤按序执行 |
| 产出完整性 | ✅/⚠️/❌ | 缺失: file1, file2 |
| 状态一致性 | ✅/⚠️/❌ | 虚假完成: step3 |
| 参数一致性 | ✅/⚠️/❌ | 未使用: param1 |

## 深度审查
{ agent reports }

## 反模式汇总
| # | 类型 | 严重度 | 描述 |
|---|------|--------|------|
| 1 | 步骤跳过 | MEDIUM | step 3 skipped |
| 2 | 产出缺失 | LOW | api-docs.md 未生成 |

## 建议
1. ...
2. ...
```

---

## Auto-healing (可选)

审查发现问题后，Agent 可主动询问是否要修复：

```
Agent: 发现以下问题：
1. api-docs.md 缺失（LOW）
2. step 2 标记 completed 但产出为空（MEDIUM）

是否要自动修复？
[修复] [仅报告]
```

---

## Verify 命令 SOP 注册

```json
{
  "sop verify": {
    "steps": ["1_collect_context", "2_load_expected", "3_basic_check", "4_deep_review", "5_report"]
  }
}
```
