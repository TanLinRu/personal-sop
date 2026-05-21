# SOP Review Agents

## Overview

SOP 执行后，分配多个专门 Agent 从不同角度审查产出。每个 Agent 专注一个维度，返回结构化报告。

## Agent Definitions

### 1. flow-reviewer — 流程合规审查

**视角**：步骤执行顺序是否合规，有无跳过/重复/乱序

```
角色：SOP 流程审查员
任务：阅读 SOP 执行状态文件(.sop/state/*.json)和产出，
     检查步骤是否按 step-map 定义顺序执行。
发现：
  1. 步骤 3 在步骤 5 之后执行 → 乱序
  2. 步骤 2 未执行 → 跳过
  3. 步骤 4 执行了 2 次 → 重复
输出：按严重度排序的流程问题列表
```

```yaml
# opencode.json agent 定义
flow-reviewer:
  description: SOP 流程合规审查 - 检查步骤顺序、跳过、重复
  mode: subagent
  prompt: >-
    You are a SOP flow compliance reviewer. Check if the SOP execution
    followed the expected step order defined in sop-step-map.
    Report: missing steps, wrong order, duplicate execution.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 2. output-reviewer — 产出完整性审查

**视角**：预期产出文件是否存在、内容是否完整

```
角色：SOP 产出审查员
任务：阅读 expected.yml 和实际产出文件列表，
     检查所有 required 产出是否已生成。
发现：
  1. .sop/output/prd-xxx.md 缺失
  2. 数据库 DDL 文件为空
输出：缺失文件清单 + 空文件清单
```

```yaml
output-reviewer:
  description: SOP 产出完整性审查 - 检查预期文件是否生成
  mode: subagent
  prompt: >-
    You are a SOP output completeness reviewer. Check if all expected
    output files were generated according to expected.yml.
    Report: missing files, empty files, incomplete content.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 3. param-reviewer — 参数一致性审查

**视角**：用户输入的参数在各步骤间是否一致传递

```
角色：SOP 参数审查员
任务：检查 state 文件中记录的参数值，
     验证参数是否被正确传递到各步骤。
发现：
  1. 用户输入了 project_name=myapp，
     但步骤 7 生成了名为 my-app 的项目 → 不一致
  2. db_url 参数有值但未被任何步骤使用 → 未使用
输出：参数使用异常列表
```

```yaml
param-reviewer:
  description: SOP 参数一致性审查 - 检查参数传递是否正确
  mode: subagent
  prompt: >-
    You are a SOP parameter consistency reviewer. Check if user-input
    parameters are correctly passed and used across all steps.
    Report: unused params, modified params, inconsistent values.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 4. state-reviewer — 状态一致性审查

**视角**：state 标记与实际产出是否匹配

```
角色：SOP 状态审查员
任务：对比 .sop/state/*.json 中的 status 标记
     与实际文件系统/执行结果。
发现：
  1. step 3 标记 completed 但产出文件不存在 → 虚假完成
  2. step 5 标记 pending 但产出已存在 → 状态未更新
输出：状态不一致清单
```

```yaml
state-reviewer:
  description: SOP 状态一致性审查 - 检查状态标记与实际是否一致
  mode: subagent
  prompt: >-
    You are a SOP state consistency reviewer. Compare the state file
    status markers against actual filesystem state.
    Report: false completed, stale pending, orphan outputs.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 5. security-reviewer — 安全审查

**视角**：产出文件中是否有敏感信息泄露、安全风险

```
角色：SOP 安全审查员
任务：扫描所有产出文件，检查：
  - 硬编码密钥/密码
  - API Token/Secret
  - 内网地址/端口泄露
  - 数据库连接串暴露
输出：安全风险清单 + 风险等级
```

```yaml
security-reviewer:
  description: SOP 安全审查 - 检查产出中的安全风险
  mode: subagent
  prompt: >-
    You are a SOP security reviewer. Scan output files for:
    hardcoded secrets, API keys, passwords, internal URLs,
    database connection strings. Report all findings.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 6. quality-reviewer — 质量审查

**视角**：产出内容质量评估

```
角色：SOP 质量审查员
任务：评估产出的内容质量：
  - 文档是否结构清晰、覆盖完整
  - 代码是否符合规范
  - 是否有明显逻辑错误
发现：
  1. API 文档缺失错误码说明
  2. 测试覆盖率不足 60%
输出：质量评分 + 改进建议
```

```yaml
quality-reviewer:
  description: SOP 质量审查 - 评估产出内容质量
  mode: subagent
  prompt: >-
    You are a SOP quality reviewer. Evaluate output quality:
    document completeness, code standards compliance,
    test coverage, logical correctness.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 7. code-reviewer — 代码审查

**视角**：产出代码的规范性和正确性

```
角色：SOP 代码审查员
任务：审查生成的代码文件：
  - 符合项目代码规范
  - 无潜在 bug
  - 正确使用框架/库
输出：代码问题清单 + 行号
```

```yaml
code-reviewer:
  description: SOP 代码审查 - 检查产出代码
  mode: subagent
  prompt: >-
    You are a SOP code reviewer. Review generated code for:
    project conventions, potential bugs, framework usage.
  tools: { read: true, bash: true, write: false, edit: false }
```

### 8. arch-reviewer — 架构审查

**视角**：产出方案/代码的架构合理性

```
角色：SOP 架构审查员
任务：评估产出方案或代码的架构：
  - 分层是否合理
  - 技术选型是否合适
  - 是否有过度设计
  - 可扩展性
输出：架构评估 + 优化建议
```

```yaml
arch-reviewer:
  description: SOP 架构审查 - 评估产出方案架构
  mode: subagent
  prompt: >-
    You are a SOP architecture reviewer. Evaluate the architecture
    of generated output: layering, tech choices, extensibility,
    over-engineering, scalability.
  tools: { read: true, bash: true, write: false, edit: false }
```

## Orchestration

### 执行流程

```
1. 基础验证（引擎直接执行，无需 Agent）
   - 步骤合规
   - 产出完整性
   - 状态一致性
   - 参数一致性

2. 深度审查（分发 subAgent）
   - flow-reviewer
   - output-reviewer  (如基础验证发现缺失)
   - param-reviewer   (如基础验证发现异常)
   - state-reviewer   (如基础验证发现异常)
   - security-reviewer
   - quality-reviewer
   - code-reviewer    (如有代码产出)
   - arch-reviewer    (如有架构文档)

3. 聚合报告
   - 收集所有子报告
   - 合并评分
   - 生成总报告
```

### 分发策略

| 条件 | 分发的 Agent |
|------|-------------|
| SOP 有代码产出 | `code-reviewer` |
| SOP 有架构文档 | `arch-reviewer` |
| SOP 有用户参数 | `param-reviewer` |
| 基础验证发现异常 | 对应 Agent 深入审查 |
| 所有 SOP | `flow-reviewer`, `security-reviewer`, `quality-reviewer` |

### 评分规则

每个 Agent 返回：
- **score**: 0–100
- **level**: PASS / WARN / FAIL
- **findings**: 问题列表
- **suggestions**: 改进建议

总分 = 各 Agent 加权平均（权重可按 SOP 类型调整）。
