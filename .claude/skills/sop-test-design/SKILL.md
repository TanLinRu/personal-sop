---
name: sop-test-design
description: 测试用例设计流程 - 需求分析→测试技术选择→用例设计→追溯矩阵→评审→输出
version: 1.0.0
triggers:
  - "测试用例设计"
  - "测试设计"
  - "用例编写"
  - "测试计划"
  - "/sop test-design"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: sequential
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/test-design-{id}.json
---

# SOP Test Design - 测试用例设计流程

## 概述

本 SOP 是需求（sop-prd）到测试执行（sop-testing）的桥梁。将用户故事和验收标准转化为结构化测试用例，建立需求-测试追溯矩阵。

## 使用场景

- PRD 完成后，开发前的测试用例设计
- 需求变更后的测试用例更新
- 回归测试用例库的建立
- 验收测试用例的编写

## Agent 委托

| Agent | 用途 | 触发时机 |
|-------|------|----------|
| `tdd-guide` | 测试用例设计方法论指导 | 步骤三（用例设计） |
| `code-reviewer` | 审查测试用例质量 | 步骤五（评审） |

## 前置条件

- `.sop/output/prd-*.md` 存在（由 sop-prd 生成）
- 或用户手动提供需求文档

## 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 1_requirement_analysis in_progress
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 6_output completed
```

---

## Step 1: 需求分析 [AUTO]

**执行内容**：
1. 查找 PRD 输出文件
2. 提取用户故事、验收标准、功能需求
3. 识别可测试项
4. 按功能模块分类

**查找 PRD**：
```bash
Glob(pattern=".sop/output/prd-*.md")
```

**需求提取模板**：
```markdown
## 需求提取摘要

### 功能模块
| 模块 | 用户故事数 | 验收标准数 | 可测试项 |
|------|-----------|-----------|----------|
| 用户管理 | 3 | 8 | 12 |
| 订单管理 | 5 | 15 | 20 |

### 用户故事列表
| ID | 模块 | 用户故事 | 验收标准 | 优先级 |
|----|------|----------|----------|--------|
| US-001 | 用户管理 | 作为用户，我需要注册账号以便使用系统 | 3条 | Must |
| US-002 | 用户管理 | 作为用户，我需要登录以便访问个人数据 | 4条 | Must |
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 1_requirement_analysis completed
```

---

## Step 2: 测试技术选择 [CONFIRM_REQUIRED]

**执行内容**：
1. 展示可用测试设计技术
2. 用户选择每功能区域应用哪些技术
3. 默认推荐（基于需求类型自动选择）

**测试设计技术**：

| 技术 | 适用场景 | 说明 |
|------|----------|------|
| 等价类划分 | 输入验证 | 将输入分为有效/无效等价类 |
| 边界值分析 | 数值/长度限制 | 测试边界值及边界±1 |
| 决策表 | 多条件组合 | 条件-动作映射表 |
| 状态转换 | 有状态的系统 | 状态-事件-动作矩阵 |
| 配对测试 | 多参数组合 | 两两组合覆盖 |
| 因果图 | 复杂逻辑关系 | 输入-输出因果关系 |

**推荐策略**：
- 输入验证类 → 等价类划分 + 边界值分析
- 业务规则类 → 决策表
- 工作流类 → 状态转换
- 配置类 → 配对测试

**AskUserQuestion**：
```javascript
AskUserQuestion({
  question: "请选择测试设计技术（可多选）",
  header: "测试技术",
  options: [
    { label: "自动推荐", description: "根据需求类型自动选择最合适的技术" },
    { label: "等价类+边界值", description: "适用于输入验证场景" },
    { label: "决策表", description: "适用于多条件组合场景" },
    { label: "状态转换", description: "适用于有状态系统" }
  ],
  multiSelect: true
})
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 2_test_techniques completed
```

---

## Step 3: 测试用例设计 [AUTO]

**执行内容**：
1. 对每个用户故事，使用选定技术设计测试用例
2. 生成正向/负向/边界/边缘用例
3. 分配优先级（P0-P3）和类型
4. 组织按模块分组

**测试用例格式**：
```markdown
### TC-001: 用户注册 - 正常流程
- **用户故事**: US-001
- **优先级**: P0
- **类型**: 功能测试
- **前置条件**: 用户未注册
- **测试步骤**:
  1. 访问注册页面
  2. 输入有效用户名 "testuser"
  3. 输入有效邮箱 "test@example.com"
  4. 输入密码 "Pass123!"
  5. 点击注册按钮
- **预期结果**: 注册成功，跳转到登录页面
- **测试技术**: 等价类划分（有效等价类）
```

**用例生成规则**：
| 用户故事类型 | 正向用例 | 负向用例 | 边界用例 | 边缘用例 |
|-------------|---------|---------|---------|---------|
| 输入验证 | 1 | 每个无效等价类1个 | 每个边界2个 | 空值/特殊字符 |
| 业务规则 | 每个规则1个 | 每个违反规则1个 | - | 组合场景 |
| 工作流 | 正常流程1个 | 每个异常分支1个 | - | 并发/超时 |
| CRUD | 每个操作1个 | 权限不足/数据不存在 | - | 并发修改 |

**优先级定义**：
| 优先级 | 含义 | 执行时机 |
|--------|------|----------|
| P0 | 核心功能，阻塞发布 | 每次提交 |
| P1 | 重要功能 | 每日构建 |
| P2 | 一般功能 | 每周回归 |
| P3 | 边缘场景 | 发布前回归 |

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 3_test_case_design completed
```

---

## Step 4: 追溯矩阵 [AUTO]

**执行内容**：
1. 构建需求-测试用例追溯矩阵
2. 确保每个用户故事至少有一个测试用例
3. 标记未覆盖的需求
4. 计算覆盖率

**追溯矩阵格式**：
```markdown
## 需求追溯矩阵

| 用户故事 | 验收标准 | 测试用例 | 覆盖状态 |
|----------|----------|----------|----------|
| US-001 | AC-001-1 | TC-001, TC-002 | ✅ 已覆盖 |
| US-001 | AC-001-2 | TC-003 | ✅ 已覆盖 |
| US-001 | AC-001-3 | - | ❌ 未覆盖 |
| US-002 | AC-002-1 | TC-004, TC-005 | ✅ 已覆盖 |

### 覆盖率统计
- 用户故事覆盖率: 2/2 = 100%
- 验收标准覆盖率: 4/5 = 80%
- 未覆盖项: AC-001-3（需补充测试用例）
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 4_traceability completed
```

---

## Step 5: 评审 [CONFIRM_REQUIRED]

**执行内容**：
1. 展示测试用例摘要
2. 检查完整性
3. 用户审批或要求修改

**评审检查清单**：
| 检查项 | 状态 |
|--------|------|
| 所有用户故事都有测试用例 | ✅/❌ |
| 所有验收标准都被覆盖 | ✅/❌ |
| 正向/负向用例齐全 | ✅/❌ |
| 边界值已测试 | ✅/❌ |
| 错误路径已覆盖 | ✅/❌ |
| 优先级分配合理 | ✅/❌ |
| 测试步骤可执行 | ✅/❌ |

**AskUserQuestion**：
```javascript
AskUserQuestion({
  question: "测试用例评审结果如何？",
  header: "评审结果",
  options: [
    { label: "通过", description: "用例完整，继续输出" },
    { label: "需补充", description: "部分用例需补充或修改" },
    { label: "重新设计", description: "用例质量不足，重新设计" }
  ],
  multiSelect: false
})
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 5_review completed
```

---

## Step 6: 输出 [AUTO]

**执行内容**：
1. 生成测试计划文档
2. 生成测试用例文档
3. 生成追溯矩阵文档
4. 保存状态

**输出文件**：
```
.sop/output/
├── test-plan-{name}-{date}.md      # 测试计划
├── test-cases-{name}-{date}.md     # 测试用例
└── traceability-{name}-{date}.md   # 追溯矩阵
```

**测试计划模板**：
```markdown
# 测试计划: {项目名称}

## 概述
- **目标**: 验证 {项目名称} 的功能正确性
- **范围**: {模块列表}
- **测试用例数**: {总数}
- **优先级分布**: P0: {n}, P1: {n}, P2: {n}, P3: {n}

## 测试策略
| 测试类型 | 用例数 | 覆盖模块 |
|----------|--------|----------|
| 功能测试 | {n} | {模块} |
| 边界测试 | {n} | {模块} |
| 异常测试 | {n} | {模块} |

## 执行计划
- P0 用例: 每次提交执行
- P1 用例: 每日构建执行
- P2 用例: 每周回归执行
- P3 用例: 发布前执行

## 风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| {风险描述} | {影响} | {措施} |
```

**交接到 sop-testing**：
```
测试用例已生成，运行 `/sop testing` 执行测试。
测试用例文件: .sop/output/test-cases-{name}-{date}.md
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts test-design 6_output completed
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| PRD 文件不存在 | 提示用户先运行 `/sop prd` 或手动提供需求文档 |
| 用户故事格式不规范 | 尝试解析，标记需确认的项 |
| 验收标准缺失 | 为每个用户故事生成默认验收标准，用户确认 |
| 测试用例过多 | 按优先级分批输出，P0/P1 优先 |

---

## 相关技能

| 技能 | 关系 | 说明 |
|------|------|------|
| sop-prd | 上游 | 提供用户故事和验收标准 |
| sop-testing | 下游 | 执行测试用例 |
| sop-regression | 下游 | 使用测试用例进行回归测试 |
| sop-bug-fix | 联动 | 测试失败时触发 |
