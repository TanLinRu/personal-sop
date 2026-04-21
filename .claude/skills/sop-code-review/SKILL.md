---
name: sop-code-review
description: 标准代码审查流程 - 理解→格式→测试→安全→反馈（含Lombok规范）
version: 1.2.0
triggers:
  - "审查代码"
  - "代码审查"
  - "review"
  - "/sop code-review"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow

# 多agent并发配置 ⭐
execution:
  mode: parallel  # sequential | parallel | hybrid
  timeout: 300000 # 单任务超时(毫秒)

# 并行任务定义 (使用真实ECC Agent)
parallel_tasks:
  - name: 格式检查
    description: 检查代码格式和规范
    agent: code-reviewer
    depends_on: []

  - name: 安全评估
    description: 扫描安全漏洞和权限问题
    agent: security-scan
    depends_on: []

  - name: 性能分析
    description: 分析代码性能问题和潜在风险
    agent: java-reviewer
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge  # merge | first | all
  output_format: markdown

# ECC Agent 列表 (已集成到 OpenCode)
available_agents:
  code-reviewer:
    description: 通用代码审查
    tools: [read, bash]
    use: 格式检查、代码规范
  security-scan:
    description: 安全漏洞扫描
    tools: [read, write, edit, bash]
    use: 安全评估、权限检查
  java-reviewer:
    description: Java/Spring Boot 专家审查
    tools: [read, bash]
    use: 性能分析、代码逻辑审查
---

# SOP Code Review - 标准代码审查流程

## 概述

本 SOP 提供标准化的代码审查流程，确保每次审查都覆盖关键维度：理解变更、格式检查、测试验证、安全评估、反馈输出。

## 使用场景

- PR 审查
- 代码合并前的自检
- 技术债清理
- 重构代码审查
- 新人代码审查

## 多agent并行执行 ⭐

### 执行模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `parallel` | 格式检查、安全评估、性能分析 **并行执行** | 代码审查（推荐） |
| `sequential` | 按顺序执行各步骤 | 需要前置依赖的审查 |

### 并行任务执行

```bash
# 使用 Agent 工具并行执行多个审查任务
Agent(
  subagent_type="everything-claude-code:code-reviewer",
  prompt="执行代码格式审查，检查以下内容：..."
)

Agent(
  subagent_type="everything-claude-code:security-reviewer",
  prompt="执行安全扫描，检查以下内容：..."
)

Agent(
  subagent_type="everything-claude-code:java-reviewer",
  prompt="执行性能分析，检查以下内容：..."
)
```

### 执行流程

```
1. 理解变更 (Understand)
       ↓
2. 并行执行三个审查任务:
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  格式检查   │  │  安全评估   │  │  性能分析   │
   │(code-review)│  │(security)   │  │(java-review)│
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          └────────────────┼────────────────┘
                           ↓
3. 聚合结果 → 反馈 (Feedback)
```

## 流程步骤

### 步骤一：理解变更（Understand）⭐ [CONFIRM_REQUIRED]

**目标**：理解变更意图和内容

**执行内容**：
1. 阅读 PR description 和变更内容
2. 使用 Explore Agent 了解代码结构
3. 理解变更的业务逻辑和影响范围

**输出**：
```markdown
---
sop: code-review
step: 1_understand
status: in_progress
---

## 变更概述

### 基本信息
- **PR 标题**:
- **变更类型**: 功能新增 / Bug 修复 / 重构 / 性能优化
- **影响模块**:

### 业务逻辑说明
-

### 影响范围评估
- [ ] 仅影响单个模块
- [ ] 影响多个模块
- [ ] 需要数据库变更
- [ ] 需要配置变更
- [ ] 需要前端配合
```

**命令参考**：
```bash
# 查看 git 变更
git diff HEAD~1 --stat

# 查看具体变更文件
git diff HEAD~1 --name-only

# 查看 PR 内容（如 GitHub）
gh pr view <pr_number> --json title,body,files
```

---

### 步骤二：格式检查（Format） [AUTO]

**目标**：检查代码格式、Lombok使用规范

**执行内容**：
1. 运行格式化工具
2. 运行 Linter 检查代码问题
3. 检查命名规范是否符合项目约定
4. **检查 Lombok 使用规范**
5. **并行执行三个审查任务**

**ECC Agent 并行执行**：
```python
# 并行启动三个审查任务
format_task = task(
  subagent_type="code-reviewer",
  prompt="执行代码格式审查，检查缩进、命名、导入排序"
)

security_task = task(
  subagent_type="security-scan",
  prompt="执行安全扫描，检查SQL注入、XSS、权限问题"
)

performance_task = task(
  subagent_type="java-reviewer",
  prompt="分析代码性能问题和潜在风险"
)

# 并行执行
results = await gather(format_task, security_task, performance_task)
```

**Lombok 使用规范检查** ⭐：全面使用，统一规范

| 场景 | 推荐用法 | 注意事项 |
|------|----------|----------|
| **Entity/PO** | `@Getter @Setter @NoArgsConstructor @AllArgsConstructor` | 手动重写 equals/hashCode，基于业务ID |
| **DTO/VO/Request/Response** | `@Data @Builder` | 直接使用，简洁方便 |
| **工具类** | 不用 Lombok | 用 static 方法 |
| **枚举** | 不用 Lombok | 手动实现 |

**统一规范说明**：
- 全面使用 Lombok，无需纠结是否使用
- Entity 使用 `@Getter/@Setter` 而非 `@Data`（避免自动生成的 equals/hashCode 导致 JPA 问题）
- DTO/VO 使用 `@Data @Builder`（需要全部字段的 get/set 和 builder 模式）
- 手动重写 equals/hashCode 是为了避免级联比较问题，这是 Entity 层的必要实践

**正确示例**：
```java
// Entity - 使用 lombok 但手动控制 equals/hashCode
@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Table(name = "user")
public class User {
    @Id @GeneratedValue
    private Long id;
    private String username;

    // 手动重写，仅基于业务ID
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id != null && id.equals(user.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}

// DTO - 直接使用 @Data @Builder
@Data @Builder
public class UserDTO {
    private String username;
    private String nickname;
}

// Response
@Data
public class UserResponse {
    private Long id;
    private String username;
}
```

**检查要点**：
- [ ] Entity 是否手动重写了 equals/hashCode（基于业务ID）
- [ ] DTO/VO 是否使用了 @Data @Builder
- [ ] 是否避免了不必要的 lombok 注解（如 @Log4j 用于非日志类）

**IDE 快捷键检查清单**：

| 快捷键 | 功能 | 检查点 |
|--------|------|--------|
| `Ctrl+Shift+O` (IDEA) | 优化import | 无冗余import |
| `Ctrl+Alt+L` (IDEA) | 格式化代码 | 缩进/空格/换行 |
| `Ctrl+Shift+T` | 定位测试类 | 是否有对应测试 |
| `Ctrl+H` | 查看类继承 | 确认父类正确 |
| `Ctrl+Alt+U` | 查看类图 | 依赖关系正确 |
| `F2` / `Shift+F2` | 跳转错误/警告 | 逐个修复 |
| `Ctrl+F` | 查找 | 确认关键逻辑 |
| `Ctrl+R` | 替换 | 批量重命名 |

**输出**：
```markdown
---
sop: code-review
step: 2_format
status: in_progress
---

## 格式检查结果

### 格式化工具检查
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 代码格式化 | 通过/未通过 | |
| _import 排序_ | 通过/未通过 | |
| 命名规范 | 通过/未通过 | |

### Linter 检查结果
| 工具 | 警告数 | 错误数 |
|------|--------|--------|
| Checkstyle | | |
| PMD | | |
| SpotBugs | | |

### 命名规范检查
- 类名:
- 方法名:
- 变量名:
```

**命令参考**：
```bash
# Checkstyle 检查
mvn checkstyle:check

# 编译检查
mvn compile

# 代码分析
mvn pmd:pmd

# SpotBugs 分析
mvn spotbugs:check
```

---

### 步骤三：运行测试（Test） [AUTO]

**目标**：验证测试通过，确认变更不会破坏现有功能

**执行内容**：
1. 运行单元测试和集成测试
2. 检查测试覆盖率的变化

**输出**：
```markdown
---
sop: code-review
step: 3_test
status: in_progress
---

## 测试执行结果

### 测试运行情况
| 测试类型 | 运行数 | 失败数 | 跳过数 |
|----------|--------|--------|--------|
| 单元测试 | | | |
| 集成测试 | | | |

### 测试覆盖率
- 覆盖率变化:
- 新增测试行数:

### 测试状态
- [ ] 全部通过
- [ ] 部分通过（有非关键测试失败）
- [ ] 失败（存在关键测试失败）
```

**命令参考**：
```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserServiceTest

# 生成测试报告
mvn surefire-report:report

# JaCoCo 覆盖率报告
mvn jacoco:report
```

---

### 步骤四：安全评估（Security） [AUTO]

**目标**：评估代码安全性

**执行内容**：
1. 使用 security-review Agent 检查常见安全漏洞
2. 评估权限和数据安全问题

**输出**：
```markdown
---
sop: code-review
step: 4_security
status: in_progress
---

## 安全评估结果

### 安全检查项
| 检查项 | 状态 | 风险等级 | 说明 |
|--------|------|----------|------|
| SQL 注入 | 通过/未通过 | 高 | |
| XSS 跨站脚本 | 通过/未通过 | 中 | |
| 敏感数据暴露 | 通过/未通过 | 高 | |
| 权限校验缺失 | 通过/未通过 | 高 | |
| 硬编码密码 | 通过/未通过 | 严重 | |
| 依赖漏洞 | 通过/未通过 | 中 | |

### 发现的漏洞列表
1.

### 安全建议
1.

### 安全状态评估
- [ ] 安全
- [ ] 存在低风险
- [ ] 存在中高风险
```

**命令参考**：
```bash
# 依赖审计
mvn dependency:analyze

# 安全检查
mvn audit

# OWASP 依赖检查
mvn org.owasp:dependency-check-maven:check
```

---

### 步骤五：反馈（Feedback）⭐ [CONFIRM_REQUIRED]

**目标**：给出具体、可操作的反馈

**执行内容**：
1. 汇总所有审查结果
2. 按严重程度分类反馈
3. 提供具体的改进建议

**输出**：
```markdown
---
sop: code-review
step: 5_feedback
status: pending
---

## 审查反馈

### 必须修复（阻塞合并）
1. [问题描述] - [文件:行号] - [建议修复方式]
2.

### 建议修复（合并前修复）
1. [问题描述] - [文件:行号] - [建议修复方式]
2.

### 可以改进（非阻塞）
1. [问题描述] - [建议]
2.

### 询问作者
1. [问题] - 需要作者澄清

### 总结评价
-

### 审查结论
- [ ] 批准合并
- [ ] 需要修改后重审
- [ ] 拒绝合并
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 测试运行失败 | 区分单元测试和集成测试失败，确认是否阻塞 |
| Linter 警告过多 | 按严重程度分类，聚焦阻塞项 |
| 安全扫描报错 | 使用手动代码审查替代 |
| 无法运行测试 | 要求提供测试运行环境和日志 |

## 可调用的 Skills

| 技能 | 用途 |
|------|------|
| code-tour | 了解代码结构 |
| java-build | 构建验证 |
| java-testing | 测试执行 |
| security-review | 安全审查 |
| java-review | 生成审查意见 |

## 多agent执行参考

### 并行执行示例

```python
# 使用 Claude Code Agent 并行执行
from anthropic import Anthropic

# 并行启动三个审查任务
tasks = [
    Agent(subagent_type="everything-claude-code:code-reviewer", prompt="审查代码格式..."),
    Agent(subagent_type="everything-claude-code:security-reviewer", prompt="扫描安全漏洞..."),
    Agent(subagent_type="everything-claude-code:java-reviewer", prompt="分析性能问题..."),
]

# 等待所有任务完成
results = await asyncio.gather(*tasks)

# 聚合结果
aggregated_result = merge_results(results)
```

### OpenCode 适配

```python
# OpenCode 使用不同的 agent 名称
opencode_tasks = [
    Agent(subagent_type="code_review", prompt="审查代码格式..."),
    Agent(subagent_type="security_scan", prompt="扫描安全漏洞..."),
    Agent(subagent_type="java_review", prompt="分析性能问题..."),
]
```

### 结果聚合

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| `merge` | 合并所有结果到一个报告 | 代码审查（推荐） |
| `first` | 返回第一个成功的结果 | 快速检查 |
| `all` | 返回所有结果数组 | 需要分别处理 |

## 触发命令

```
/sop code-review
```
或描述场景：
- "审查 PR #123"
- "帮我看看这段代码"
- "检查代码有没有安全问题"