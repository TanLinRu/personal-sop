---
sop: code-review
step: 1_scope
status: pending
---

# SOP Code Review — Execution Steps

## Overview

标准代码审查流程，基于阿里巴巴 Java 规约（p3c）进行多维度审查，含 4 步：确认范围 → 执行审查 → 运行测试 → 输出报告。

---

## Step 1: 确认审查范围 [CONFIRM_REQUIRED]

**目标**：确认审查模式和范围

**执行内容**：

使用 AskUserQuestion 选择审查模式：
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

**输出**：审查范围确认

---

## Step 2: 执行代码审查 [AUTO]

**目标**：使用 java-reviewer Agent 执行审查

**执行内容**：

调用 java-reviewer Agent 执行审查：
```bash
Agent(
  subagent_type="java-reviewer",
  prompt="""执行代码审查，检查以下内容：
1. 格式检查（缩进、命名、导入排序）
2. Lombok规范：Entity使用@Getter/@Setter，DTO使用@Data
3. p3c规范引用
4. 事务管理：@Transactional(readOnly=true) for 查询方法
5. 异常处理：全局异常处理
6. 安全检查：SQL注入、XSS、硬编码密码

审查目录：{path}
"""
)
```

**p3c 规范索引**：

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

**输出**：审查报告（scope.md + review.md）

---

## Step 3: 运行测试 [AUTO]

**目标**：运行测试确认代码无回归

**执行内容**：

```bash
mvn test -q
```

**输出**：测试结果

---

## Step 4: 输出审查报告 [CONFIRM_REQUIRED]

**目标**：生成最终审查报告

**执行内容**：

聚合审查结果，输出结构化报告：

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

**输出**：审查报告到 `.sop/output/review-{path}-{date}/report.md`

---

## Expected Outputs

| Step | File | Required |
|------|------|----------|
| 2_review | `scope.md` | yes |
| 2_review | `review.md` | yes |
| 4_report | `report.md` | yes |

## State Persistence

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts code-review {step} {status}
```

## p3c 关键检查项速查

| 检查项 | 正确 | 错误 |
|--------|------|------|
| 类名 | `UserService` | `userService` |
| 方法名 | `getUserById()` | `getUserByID()` |
| 常量 | `MAX_COUNT` | `maxCount` |
| Entity | `@Getter/@Setter` | `@Data` |
| 异常 | 记录日志或抛出 | 空 catch |
| 事务 | `@Transactional(rollbackFor=Exception.class)` | 无注解 |
