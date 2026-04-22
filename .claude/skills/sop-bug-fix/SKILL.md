---
​---
name: sop-bug-fix
description: 标准 Bug 修复流程 - 复现→定位→修复→验证→测试
version: 2.0.0
triggers:
  - "修复 bug"
  - "代码报错"
  - "功能异常"
  - "页面崩溃"
  - "修复错误"
  - "/sop bug-fix"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
execution:
  mode: async
  checkpoint_dir: .sop/state
  state_file: .sop/state/bugfix-{id}.json

​---

# SOP Bug Fix - 标准 Bug 修复流程

## 概述

本 SOP 提供标准化的 Bug 修复流程，确保每个 Bug 都能被系统化地处理：先复现、后定位、再修复、验证后上线。

## 使用场景

- 生产环境问题修复
- 测试环境问题排查
- 代码审查中发现的缺陷
- 回归问题定位与修复

## 流程步骤

### 步骤一：复现（Reproduce）

**目标**：收集复现步骤和环境信息，确认 Bug 可复现

**执行内容**：

1. 使用 Explore Agent 搜索相关代码和历史提交
2. 询问用户复现步骤
3. 在本地环境尝试复现 Bug

**输出**：

```markdown
​---
sop: bug-fix
step: 1_reproduce
status: in_progress
​---

## 复现步骤

### 环境信息
- **OS**: 
- **语言版本**: 
- **依赖版本**: 

### 复现步骤
1. 

### 预期结果
-

### 实际结果
-

### 复现状态
- [ ] 无法复现
- [ ] 可复现
- [ ] 部分复现
```

**命令参考**：

```bash
# 查看项目技术栈
ls -la
cat pom.xml | head -50

# 编译项目
mvn clean compile -q

# 运行特定测试
mvn test -Dtest=ClassName
```

​---

### 步骤二：定位（Locate）

**目标**：搜索相关代码和测试，定位问题根因

**执行内容**：

1. 使用 Explore Agent 深度搜索相关代码
2. 追踪调用链，定位问题根因
3. 使用 java-review Agent 分析代码逻辑

**输出**：

```markdown
​---
sop: bug-fix
step: 2_locate
status: in_progress
​---

## 根因分析

### 根因描述
-

### 相关代码
| 文件 | 行号 | 问题代码 |
|------|------|----------|
| | | |

### 调用链
```

**命令参考**：

```bash
# 搜索相关代码
grep -rn "keyword" src/

# 查看调用链
mvn dependency:tree

# 运行单测
mvn test -Dtest=ClassName#methodName
```

​---

### 步骤三：修复（Fix）

**目标**：实现修复方案

**执行内容**：

1. 编写修复代码
2. 使用 java-review Agent 审核修复方案
3. 自动保存修复状态（或等待确认）

> **自动模式**：审核通过后自动进入验证步骤，无需阻塞等待

**审核确认**：

```javascript
AskUserQuestion({
  question: "修复方案已通过审核，是否继续验证？",
  header: "确认修复",
  options: [
    { label: "继续验证", description: "自动运行测试验证修复效果" },
    { label: "查看代码", description: "查看修复的具体代码" },
    { label: "默认继续(推荐)", description: "自动执行验证步骤" }
  ]
})
```

**自动状态保存**：

```agent
save_state(
  file=".sop/state/bugfix-{id}.json",
  step="3_fix",
  status="completed",
  fix_details={...}
)
```

**输出**：

```markdown
​---
sop: bug-fix
step: 3_fix
status: completed
​---

## 修复方案

### 修复内容
```java
// 修复代码
```

### 修改文件列表

| 文件 | 操作 |
| ---- | ---- |
|      |      |

### 审核状态

- [x] 已通过（自动审核）

```
​---

### 步骤四：验证（Verify）

**目标**：运行测试验证修复有效

**执行内容**：
1. 运行单元测试和集成测试
2. 手动验证修复效果
3. 确保修复没有破坏现有功能

**输出**：
```markdown
​---
sop: bug-fix
step: 4_verify
status: pending
​---

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

**命令参考**：

```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserServiceTest

# 打包（跳过测试）
mvn package -DskipTests
```

​---

### 步骤五：测试（Test）

**目标**：编写或更新测试用例，防止回归

**执行内容**：

1. 编写新的测试用例覆盖修复场景
2. 更新现有测试用例
3. 生成提交信息模板

**输出**：

```markdown
​---
sop: bug-fix
step: 5_test
status: pending
​---

## 测试覆盖

### 新增测试
-

### 修改测试
-

### 提交信息模板
```bash
fix: [问题描述]

复现步骤:
1.

根因:
2.

修复方案:
3.

Closes #issue_number
```

```
​---

## 自动执行模式

> v2.0.0 新增：减少阻塞，支持自动化

### 断点续传

```bash
# 检查是否有未完成的bug修复任务
ls .sop/state/bugfix-*.json
```

### 减少阻塞

- 步骤三修复后添加"默认继续"选项
- 审核通过后自动进入验证步骤
- 每个步骤自动保存状态

​---

## 错误处理

| 错误场景       | 处理方式                                      |
| -------------- | --------------------------------------------- |
| Agent 调用失败 | 切换到通用 Agent，使用 Grep 手动搜索          |
| Maven 构建失败 | 检查 pom.xml，尝试 `mvn clean compile`        |
| 测试超时       | 单独运行失败测试：`mvn test -Dtest=ClassName` |
| 端口被占用     | 检查端口：`netstat -ano \| findstr 8080`      |
| 依赖下载失败   | 配置阿里云镜像或使用 VPN                      |

## 可调用的 Skills

| 技能            | 用途               |
| --------------- | ------------------ |
| search-first    | 搜索相关代码和日志 |
| java-review     | Java 代码审查      |
| java-build      | 构建验证           |
| java-testing    | 测试执行           |
| security-review | 安全审查（如需要） |

## 触发命令

```
/sop bug-fix
```

或描述问题：

- "修复用户登录失败的问题"
- "订单提交报错"
- "页面加载白屏"name: sop-bug-fix
description: 标准 Bug 修复流程 - 复现→定位→修复→验证→测试（含多Agent并行+业务验证）
version: 1.2.0
triggers:
  - "修复 bug"
  - "代码报错"
  - "功能异常"
  - "页面崩溃"
  - "修复错误"
  - "/sop bug-fix"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow

# 多agent并发配置 ⭐
execution:
  mode: parallel
  timeout: 300000

# 并行任务定义 (使用真实ECC Agent)
parallel_tasks:
  - name: 代码搜索
    description: 搜索相关代码和日志
    agent: code-reviewer
    depends_on: []

  - name: 代码分析
    description: 分析Java代码逻辑，定位根因
    agent: java-reviewer
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge
  output_format: markdown

# ECC Agent 列表 (已集成到 OpenCode)
available_agents:
  code-reviewer:
    description: 通用代码审查
    tools: [read, bash]
    use: 代码搜索、文件发现
  java-reviewer:
    description: Java/Spring Boot 专家审查
    tools: [read, bash]
    use: Java代码分析、根因定位
  security-scan:
    description: 安全漏洞扫描
    tools: [read, write, edit, bash]
    use: 安全审查
  search_first:
    description: 代码搜索专家
    tools: [read, bash]
    use: 深度搜索
---

# SOP Bug Fix - 标准 Bug 修复流程

## 概述

本 SOP 提供标准化的 Bug 修复流程，确保每个 Bug 都能被系统化地处理：先复现、后定位、再修复、验证后上线。

## 使用场景

- 生产环境问题修复
- 测试环境问题排查
- 代码审查中发现的缺陷
- 回归问题定位与修复

## 流程步骤

### 步骤一：复现（Reproduce）⭐ [CONFIRM_REQUIRED]

**目标**：收集复现步骤和环境信息，确认 Bug 可复现

**执行内容**：
1. 使用 Explore Agent 搜索相关代码和历史提交
2. 询问用户复现步骤
3. 在本地环境尝试复现 Bug

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

### 预期结果
-

### 实际结果
-

### 复现状态
- [ ] 无法复现
- [ ] 可复现
- [ ] 部分复现
```

**命令参考**：
```bash
# 查看项目技术栈
ls -la
cat pom.xml | head -50

# 编译项目
mvn clean compile -q

# 运行特定测试
mvn test -Dtest=ClassName
```

---

### 步骤二：定位（Locate） [AUTO]

**目标**：搜索相关代码和测试，定位问题根因

**执行内容**：
1. 使用 code-reviewer Agent 搜索相关代码
2. 使用 java-reviewer Agent 分析代码定位根因
3. 并行执行两个任务

**ECC Agent 并行执行示例**:
```python
# 并行启动两个 Agent 进行搜索和分析
search_task = task(
  subagent_type="code-reviewer",
  prompt=f"搜索与 [{BUG_KEYWORD}] 相关的代码，返回文件路径和行号"
)

analysis_task = task(
  subagent_type="java-reviewer",
  prompt=f"分析以下代码片段，定位问题根因: {CODE_SNIPPET}"
)

# 等待并行结果
search_results = await search_task
analysis_results = await analysis_task
```

**简化调用**:
```bash
# 直接使用命令
/code-review [BUG_KEYWORD]
/java-review [CODE_CONTEXT]
```

**输出**：
```markdown
---
sop: bug-fix
step: 2_locate
status: in_progress
---

## 根因分析

### 根因描述
-

### 相关代码
| 文件 | 行号 | 问题代码 |
|------|------|----------|
| | | |

### 调用链
```

**命令参考**：
```bash
# 搜索相关代码
grep -rn "keyword" src/

# 查看调用链
mvn dependency:tree

# 运行单测
mvn test -Dtest=ClassName#methodName
```

---

### 步骤三：修复（Fix）⭐ [CONFIRM_REQUIRED]

**目标**：实现修复方案

**执行内容**：
1. 编写修复代码
2. 使用 java-review Agent 审核修复方案
3. 等待用户确认

**输出**：
```markdown
---
sop: bug-fix
step: 3_fix
status: pending
---

## 修复方案

### 修复内容
​```java
// 修复代码
```

### 修改文件列表
| 文件 | 操作 |
|------|------|
| | |

### 审核状态
- [ ] 待审核
- [ ] 已通过
- [ ] 需修改
```

---

### 步骤四：验证（Verify） [AUTO]

**目标**：运行测试验证修复有效

**执行内容**：
1. 运行单元测试和集成测试
2. 手动验证修复效果
3. **业务逻辑验证**
4. 确保修复没有破坏现有功能

#### 业务验证检查清单 ⭐

| 验证项 | 检查内容 | 通过标准 |
|--------|----------|----------|
| **功能正确性** | 修复的逻辑是否符合业务需求 | 业务方确认 |
| **边界条件** | 空值、临界值、超出范围 | 不报错且逻辑正确 |
| **副作用** | 是否影响其他模块 | 关联模块测试通过 |
| **数据一致性** | 前后端数据格式统一 | 接口测试通过 |
| **权限校验** | 越权操作是否被拦截 | 返回403/401 |
| **日志记录** | 关键操作是否有日志 | 日志可查 |

**业务验证方法**：
​```bash
# 接口测试
curl -X POST http://localhost:8080/api/xxx -d '{...}'

# 边界测试
# 1. 空值
curl -X POST http://localhost:8080/api/xxx -d '{"name":null}'
# 2. 超长
curl -X POST http://localhost:8080/api/xxx -d '{"name":"xxx...xxx"}'
# 3. 特殊字符
curl -X POST http://localhost:8080/api/xxx -d '{"name":"<script>"}'
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

**命令参考**：
```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserServiceTest

# 打包（跳过测试）
mvn package -DskipTests
```

---

### 步骤五：测试（Test）

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
​```bash
fix: [问题描述]

复现步骤:
1.

根因:
2.

修复方案:
3.

Closes #issue_number
```
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| Agent 调用失败 | 切换到通用 Agent，使用 Grep 手动搜索 |
| Maven 构建失败 | 检查 pom.xml，尝试 `mvn clean compile` |
| 测试超时 | 单独运行失败测试：`mvn test -Dtest=ClassName` |
| 端口被占用 | 检查端口：`netstat -ano \| findstr 8080` |
| 依赖下载失败 | 配置阿里云镜像或使用 VPN |

## 可调用的 ECC Agents

使用 OpenCode 的 `task` 工具调用 ECC Agent：

| Agent | 用途 | 调用方式 |
|-------|------|----------|
| code-reviewer | 代码搜索和通用审查 | `task(subagent_type="code-reviewer", ...)` |
| java-reviewer | Java/Spring Boot 分析 | `task(subagent_type="java-reviewer", ...)` |
| security-scan | 安全扫描 | `task(subagent_type="security-scan", ...)` |
| java-build-resolver | 构建错误修复 | `task(subagent_type="java-build-resolver", ...)` |

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| Agent 调用失败 | 切换到通用 Agent，使用 Grep 手动搜索 |
| Maven 构建失败 | 使用 `java-build-resolver` Agent 修复 |
| 测试超时 | 单独运行失败测试：`mvn test -Dtest=ClassName` |
| 端口被占用 | 检查端口：`netstat -ano \| findstr 8080` |
| 依赖下载失败 | 配置阿里云镜像或使用 VPN |

## 触发命令

```
/sop bug-fix
```
或描述问题：
- "修复用户登录失败的问题"
- "订单提交报错"
- "页面加载白屏"
```