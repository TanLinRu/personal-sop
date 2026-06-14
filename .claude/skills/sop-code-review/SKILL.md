---
name: sop-code-review
description: 标准代码审查流程 - 整合阿里p3c Java规范
version: 3.0.0
triggers:
  - "代码审查"
  - "审查代码"
  - "/sop code-review"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
---

# SOP Code Review v3.0 - 标准代码审查流程

> 整合阿里p3c Java规范 + Java Reviewer Agent

## 概述

本 SOP 提供标准化的代码审查流程，基于阿里巴巴 Java 规约（p3c）进行多维度审查。

## p3c 规范索引

审查时引用以下规范文件：

| 文件 | 规范名称 | 优先级 |
|------|----------|--------|
| `.claude/rules/common/01_naming.md` | 命名规约 | P1 |
| `.claude/rules/common/02_oop.md` | OOP规约 | P1 |
| `.claude/rules/common/03_concurrency.md` | 并发处理 | P1 |
| `.claude/rules/common/04_control.md` | 控制语句 | P2 |
| `.claude/rules/common/05_exception.md` | 异常处理 | P1 |
| `.claude/rules/common/06_logging.md` | 日志规约 | P2 |
| `.claude/rules/common/08_security.md` | 安全规约 | P1 |
| `.claude/rules/common/10_mysql.md` | MySQL规约 | P1 |

## 执行流程

### Step 1: 确认审查范围 [CONFIRM_REQUIRED]
> **auto_default**: 增量审查

使用 AskUserQuestion 确认审查范围：
```javascript
AskUserQuestion({
  question: "请选择审查模式",
  header: "审查模式",
  options: [
    { label: "快速审查", description: "仅检查格式、Lombok规范（2分钟）" },
    { label: "完整审查", description: "全面检查：格式+p3c+安全+事务（5分钟）" },
    { label: "增量审查", description: "仅审查 git diff 变更部分（1分钟）" }
  ],
  multiSelect: false
})
```

### Step 2: 执行代码审查 [AUTO]

使用 Agent() 调用已配置的 agent 执行审查：

```bash
# Java 代码审查
Agent(
  subagent_type="java-reviewer",
  prompt="""执行代码审查，检查以下内容：
1. 格式检查（缩进、命名、导入排序）
2. Lombok规范：Entity使用@Getter/@Setter，DTO使用@Data
3. p3c规范引用：.claude/rules/common/01_naming.md, 02_oop.md 等
4. 事务管理：@Transactional(readOnly=true) for 查询方法
5. 异常处理：全局异常处理
6. 安全检查：SQL注入、XSS、硬编码密码

审查目录：{path}

返回审查报告，格式：
## 审查结果
| 严重程度 | 文件:行号 | 问题描述 | p3c规则 |
|----------|----------|----------|----------|
| HIGH | xxx:7 | Entity使用@Data | 02_oop.md |"""
)
```

### Step 3: 运行测试 [AUTO] [VERIFY]

```bash
mvn test -q
```

## DoD 硬门 (v3.0 新增)

> 与 `sop-prd` / `sop-scaffold` 的 DoD 门控一致。

### Step 3 DoD 门控（必查项）

| 检查项 | 阈值 | 失败动作 |
|--------|------|----------|
| `mvn test` 退出码 | 0 | BLOCK Step 4 报告输出 |
| 测试覆盖率 | ≥ 80% (LITE) / ≥ 90% (FULL) | BLOCK Step 4 |
| HIGH 级问题 | 0 | BLOCK Step 4 |
| CRITICAL 级问题 | 0 | BLOCK Step 4 |

### 跳过门控

显式 `mode=informational` 时，DoD 仅 WARN 不 BLOCK（仅产出建议清单）。

### Step 4: 输出审查报告 [CONFIRM_REQUIRED]
> **auto_default**: 自动接受报告

```markdown
---
sop: code-review
status: completed
---

## 审查反馈

### 总结
| 严重程度 | 数量 | 状态 |
|----------|------|------|
| CRITICAL | 0 | ✅ pass |
| HIGH | N | ⚠️ warn |
| MEDIUM | N | ℹ️ info |

### 发现的问题

#### HIGH（需修复）
1. [文件:行号] 问题描述 - p3c规则引用

### 修复建议
```java
// ❌ 不符合规范
@Data
public class User { }

// ✅ 符合规范
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User { }
```

### 审查结论
- [ ] 批准合并
- [ ] 需修改后重审
```

## p3c 关键检查项

### 1. 命名规约（01_naming.md）

| 检查项 | 正确 | 错误 |
|--------|------|------|
| 类名 | `UserService` | `userService` |
| 方法名 | `getUserById()` | `getUserByID()` |
| 常量 | `MAX_COUNT` | `maxCount` |

### 2. OOP规约（02_oop.md）

| 检查项 | p3c规则 |
|--------|---------|
| **Entity禁止@Data** | 使用 `@Getter/@Setter` |
| **equals/hashCode** | 手动基于业务ID重写 |

### 3. 异常处理（05_exception.md）

| 检查项 | p3c规则 |
|--------|---------|
| **禁止吞异常** | catch后记录日志或抛出 |
| **事务异常** | `@Transactional(rollbackFor=Exception.class)` |

## 触发命令

```
/sop code-review [path]
```

或描述：
- "审查 delivery-staff 代码"
- "帮我看看代码有没有问题"
