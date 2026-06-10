---
sop: bug-fix
step: 1_reproduce
status: pending
---

# SOP Bug Fix — Execution Steps

## Overview

标准 Bug 修复流程，含 5 步：复现 → 定位 → 修复 → 验证 → 测试。

---

## Step 1: 复现 [CONFIRM_REQUIRED]

**目标**：收集复现步骤和环境信息，确认 Bug 可复现

**执行内容**：

1. 使用 Explore Agent 搜索相关代码和历史提交
2. 询问用户复现步骤（环境、操作路径、预期 vs 实际结果）
3. 在本地环境尝试复现 Bug

**命令参考**：
```bash
# 查看项目技术栈
cat pom.xml | head -50

# 编译项目
mvn clean compile -q

# 运行特定测试
mvn test -Dtest=ClassName
```

**输出**：
```markdown
---
sop: bug-fix
step: 1_reproduce
status: in_progress
---

## 复现步骤

### 环境信息
- **OS**:
- **语言版本**:
- **依赖版本**:

### 复现步骤
1.

### 复现状态
- [ ] 无法复现
- [ ] 可复现
- [ ] 部分复现
```

---

## Step 2: 定位 [AUTO]

**目标**：搜索相关代码和测试，定位问题根因

**执行内容**：

1. 使用 Explore Agent 深度搜索相关代码
2. 追踪调用链，定位问题根因
3. 使用 java-review Agent 分析代码逻辑

**命令参考**：
```bash
# 搜索相关代码
grep -rn "keyword" src/

# 查看调用链
mvn dependency:tree

# 运行单测
mvn test -Dtest=ClassName#methodName
```

**输出**：
```markdown
---
sop: bug-fix
step: 2_locate
status: completed
---

## 根因分析

### 根因描述
-

### 相关代码
| 文件 | 行号 | 问题代码 |
|------|------|----------|

### 调用链
-
```

---

## Step 3: 修复 [CONFIRM_REQUIRED]

**目标**：实现修复方案

**执行内容**：

1. 编写修复代码
2. 使用 java-review Agent 审核修复方案
3. 自动保存修复状态（审核通过后自动进入验证）

**审核确认**：
```javascript
AskUserQuestion({
  question: "修复方案已通过审核，是否继续验证？",
  header: "确认修复",
  options: [
    { label: "继续验证", description: "自动运行测试验证修复效果" },
    { label: "查看代码", description: "查看修复的具体代码" },
    { label: "默认继续(推荐)", description: "自动执行验证步骤" }
  ],
  multiSelect: false
})
```

**状态保存**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts bug-fix 3_fix completed
```

**输出**：
```markdown
---
sop: bug-fix
step: 3_fix
status: completed
---

## 修复方案

### 修改文件列表
| 文件 | 操作 |
|------|------|

### 审核状态
- [x] 已通过（自动审核）
```

---

## Step 4: 验证 [AUTO]

**目标**：运行测试验证修复有效

**执行内容**：

1. 运行单元测试和集成测试
2. 手动验证修复效果
3. 确保修复没有破坏现有功能

**命令参考**：
```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserServiceTest
```

**输出**：
```markdown
---
sop: bug-fix
step: 4_verify
status: pending
---

## 验证结果

### 测试结果
| 测试类型 | 状态 | 说明 |
|----------|------|------|
| 单元测试 | | |
| 集成测试 | | |
| 手动验证 | | |

### 验证状态
- [ ] 通过
- [ ] 失败
- [ ] 部分通过
```

---

## Step 5: 测试 [AUTO]

**目标**：编写或更新测试用例，防止回归

**执行内容**：

1. 编写新的测试用例覆盖修复场景
2. 更新现有测试用例
3. 生成提交信息模板

**输出**：
```markdown
---
sop: bug-fix
step: 5_test
status: pending
---

## 测试覆盖

### 新增测试
-

### 修改测试
-

### 提交信息模板
fix: [问题描述]

Closes #issue_number
```
```

---

## Expected Outputs

| Step | Description | Required |
|------|-------------|----------|
| 1_reproduce | 复现步骤文档 | yes |
| 2_locate | 根因分析文档 | yes |
| 3_fix | 修复代码 + 审核记录 | yes |
| 4_verify | 验证结果文档 | yes |
| 5_test | 测试用例文档 | yes |

## State Persistence

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts bug-fix {step} {status}
```

State file: `.sop/state/bugfix-{id}.json`

## Auto-healing

- Agent 调用失败 → 切换到通用 Agent + Grep 手动搜索
- Maven 构建失败 → 检查 pom.xml，重试 `mvn clean compile`
- 测试超时 → 单独运行失败测试
- 端口被占用 → `netstat -ano | findstr 8080`
