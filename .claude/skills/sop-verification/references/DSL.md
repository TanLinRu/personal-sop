# SOP Expected Output DSL

## Overview

声明式 YAML 定义每个 SOP 执行的预期行为，供验证引擎执行后自动比对。

## File Location

```
.claude/skills/{sop-name}/expected.yml
```

## Schema

```yaml
# SOP 标识
sop: string                        # 必填，SOP 名称，与 step-map 一致

# 版本
version: string                    # 可选，DSL 版本号

# 元信息
metadata:
  description: string              # SOP 简要描述
  author: string                   # 定义者
  updated: date                    # 最后更新日期

# 预期步骤定义
expected_steps:
  - id: string                     # 步骤 ID，与 step-map 一致
    name: string                   # 步骤名称
    type: confirm | auto           # 步骤类型（核心/自动）
    required: boolean              # 是否必须执行
    consumes:                      # 本步骤消费的参数
      - param_name
    produces:                      # 本步骤产出的文件/数据
      - output_path
    validators:                    # 本步骤专属验证
      - type: output_exists        # 产出存在检查
        path: string               # path pattern
      - type: param_used           # 参数使用检查
        param: string              # 参数名

# 预期参数定义
expected_params:
  - name: string                   # 参数名
    description: string            # 参数说明
    type: string | number | boolean | array | object  # 参数类型
    required: boolean              # 是否必填
    source: user_input | auto      # 来源（用户输入/自动生成）
    used_in_steps:                 # 被哪些步骤使用
      - step_id

# 预期产出文件定义
expected_outputs:
  - path: string                   # 产出路径 glob
    description: string            # 文件说明
    type: markdown | code | json | yaml | data | image  # 产出类型
    required: boolean              # 是否必需
    validate:
      - not_empty                  # 非空校验
      - valid_json                 # JSON 合法性
      - valid_yaml                 # YAML 合法性
      - min_length: number         # 最小内容长度
      - contains: string           # 必须包含的关键字
    tags:                          # 标签
      - report
      - code
      - document

# 步骤顺序约束
constraints:
  strict_order: boolean            # 是否严格顺序（true = 不可调换）
  allow_skip: boolean              # 是否允许跳过步骤
  allow_parallel: boolean          # 是否允许并行执行
```

## Example 1: sop-code-review

```yaml
sop: code-review
version: 1.0.0
metadata:
  description: Standard code review workflow
  author: SOP Team
  updated: 2026-05-21

expected_steps:
  - id: 1_scope
    name: 理解变更
    type: confirm
    required: true
    produces: [".sop/output/code-review-*-scope.md"]
  - id: 2_review
    name: 代码审查
    type: auto
    required: true
    produces: [".sop/output/code-review-*-review.md"]
  - id: 3_test
    name: 运行测试
    type: auto
    required: true
  - id: 4_report
    name: 审查报告
    type: confirm
    required: true
    produces: [".sop/output/code-review-*-report.md"]

expected_params:
  - name: target_path
    description: 审查目标路径
    type: string
    required: true
    source: user_input
    used_in_steps: [1_scope, 2_review]

expected_outputs:
  - path: ".sop/output/code-review-*-scope.md"
    description: 变更范围分析
    type: markdown
    required: true
    validate: [not_empty]
    tags: [report]
  - path: ".sop/output/code-review-*-review.md"
    description: 代码审查结果
    type: markdown
    required: true
    validate: [not_empty]
    tags: [report]
  - path: ".sop/output/code-review-*-report.md"
    description: 审查总结报告
    type: markdown
    required: true
    validate: [not_empty]
    tags: [report]

constraints:
  strict_order: true
  allow_skip: false
  allow_parallel: false
```

## Example 2: sop-bug-fix

```yaml
sop: bug-fix
version: 1.0.0

expected_steps:
  - id: 1_reproduce
    name: 复现 Bug
    type: confirm
    required: true
    produces: [".sop/output/bug-fix-*-reproduce.md"]
  - id: 2_locate
    name: 定位原因
    type: auto
    required: true
    produces: [".sop/output/bug-fix-*-locate.md"]
  - id: 3_fix
    name: 修复代码
    type: confirm
    required: true
  - id: 4_verify
    name: 验证修复
    type: auto
    required: true
  - id: 5_test
    name: 测试用例
    type: auto
    required: true

expected_params:
  - name: bug_description
    description: Bug 描述
    type: string
    required: true
    source: user_input
    used_in_steps: [1_reproduce, 2_locate]

expected_outputs:
  - path: ".sop/output/bug-fix-*-reproduce.md"
    description: 复现报告
    type: markdown
    required: true
    validate: [not_empty]
  - path: ".sop/output/bug-fix-*-locate.md"
    description: 根因分析
    type: markdown
    required: true
    validate: [not_empty]
  - path: "**/*.java"
    description: 修改的代码文件
    type: code
    required: true
    validate: [not_empty]
  - path: "**/*Test*.java"
    description: 新增测试
    type: code
    required: false
    validate: [not_empty]

constraints:
  strict_order: true
  allow_skip: false
  allow_parallel: false
```

## Example 3: sop-fullstack-iteration

```yaml
sop: fullstack-iteration
version: 1.0.0

expected_steps:
  - id: 1_confirm
    name: 需求确认
    type: confirm
    required: true
  - id: 2_research
    name: 技术调研
    type: auto
    required: true
  - id: 3_prd
    name: PRD 生成
    type: auto
    required: true
    produces: [".sop/output/fullstack-*-prd.md"]
  - id: 4_arch
    name: 架构设计
    type: auto
    required: true
    produces: [".sop/output/fullstack-*-arch.md"]
  - id: 5_review
    name: 方案审核
    type: confirm
    required: true
  - id: 6_dependency
    name: 依赖分析
    type: auto
    required: true
  - id: 7_generate
    name: 代码生成
    type: auto
    required: true
  - id: 8_verify
    name: 验证测试
    type: auto
    required: true
    produces: [".sop/output/fullstack-*-verify.md"]
  - id: 9_knowledge
    name: 知识沉淀
    type: auto
    required: true
    produces: [".sop/output/fullstack-*-knowledge.md"]

expected_params:
  - name: requirement
    description: 需求描述
    type: string
    required: true
    source: user_input
    used_in_steps: [1_confirm, 2_research, 3_prd, 7_generate]

expected_outputs:
  - path: ".sop/output/fullstack-*-prd.md"
    description: PRD 文档
    type: markdown
    required: true
    validate: [not_empty]
  - path: ".sop/output/fullstack-*-arch.md"
    description: 架构文档
    type: markdown
    required: true
    validate: [not_empty]
  - path: "delivery-staff/**"
    description: 后端代码
    type: code
    required: true
    tags: [backend]
  - path: "delivery-staff-frontend/**"
    description: 前端代码
    type: code
    required: true
    tags: [frontend]
  - path: ".sop/output/fullstack-*-verify.md"
    description: 验证报告
    type: markdown
    required: true
    validate: [not_empty]
  - path: ".sop/output/fullstack-*-knowledge.md"
    description: 知识沉淀
    type: markdown
    required: false

constraints:
  strict_order: true
  allow_skip: false
  allow_parallel: false
```

## Validation Engine

验证引擎按以下规则执行检查：

### 1. 基础验证

| 检查 | 规则 | 判定 |
|------|------|------|
| 步骤缺失 | `actual_steps ⊇ expected_steps` | 缺失 = ❌ |
| 步骤顺序 | `order(actual) == order(expected)` | 不一致 = ⚠️ |
| 多余步骤 | `actual_steps ⊆ expected_steps` | 多余 = ⚠️ |
| 产出缺失 | `expected_outputs[required]` 全部存在 | 缺失 = ❌ |
| 产出为空 | `validate.not_empty` 通过 | 空文件 = ❌ |
| 参数使用 | `expected_params[required]` 有值 | 缺失 = ❌ |

### 2. 评分公式

```
score = (
    steps_score × 0.3 +
    outputs_score × 0.3 +
    params_score × 0.2 +
    state_score × 0.1 +
    quality_score × 0.1
) × 100
```

### 3. 权重校准 (DMAIC Measure 阶段，v1.1.0 新增)

> 原始权重 0.3/0.3/0.2/0.1/0.1 是经验值，未经实证。Phase C3 校准方法：

**校准数据集**：
- 收集 10+ 历史 SOP 产出（`.sop/output/*.md`）
- 手工标注 6 类反模式（步骤跳过/顺序颠倒/状态不一致/参数未生效/产出偏差/空跑）
- 计算每类反模式在 5 个评分维度上的实际出现频率

**校准公式**（Spearman 相关性）：

```
对于每个反模式 r ∈ {1..6}:
  impact_r = P(quality_score 降低 | 反模式 r 存在)
weight_candidate[v] = Σ impact_r × P(r 出现 | 维度 v 触发)
```

**校准阈值**：
- 任一权重变化 > 0.05 → 调整
- 总权重偏离 1.0 > 0.02 → 重新归一化

**校准结果（待 Phase C3 完成填入）**：

| 维度 | v1.0 权重 | 校准后 | 变化 | 状态 |
|------|----------|--------|------|------|
| steps | 0.30 | _ | _ | pending |
| outputs | 0.30 | _ | _ | pending |
| params | 0.20 | _ | _ | pending |
| state | 0.10 | _ | _ | pending |
| quality | 0.10 | _ | _ | pending |

### 3. 判定标准

| 得分 | 等级 | 说明 |
|------|------|------|
| ≥90 | ✅ PASS | 执行合格 |
| 70–89 | ⚠️ WARN | 有少量问题 |
| <70 | ❌ FAIL | 存在严重反模式 |
