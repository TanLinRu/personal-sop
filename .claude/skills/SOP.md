# SOP Skill - 标准操作流程

## 概述

通用 SOP Skill，定义标准工作流程。

## 通用原则

### 1. 原子化
- 每个 step 独立完成一件事
- 可单独执行、可复用

### 2. 知识驱动
- 先收集知识，再执行任务
- 引用已有文档，不重复造轮子

### 3. 最小阻塞
- 非核心步骤自动执行
- 核心步骤需确认
- 提供"默认继续"选项

### 4. 状态持久化
- 每个步骤完成后保存状态
- 支持断点续传
- 状态文件：`.sop/state/*.json`

## 触发格式

```
/sop [name]
```

## 输出目录

```
.sop/
├── knowledge/     # 领域知识
├── output/        # 输出文档
└── state/         # 状态文件
```

## 通用工作流

```
用户输入
    ↓
Step 0: 依赖检查
    ↓
Step 1: 理解需求
    ↓
Step 2: 执行任务
    ↓
Step 3: 验证结果
    ↓
Step 4: 输出文档
```

## Skill 规范

### 文件结构

```
.claude/skills/[sop-name]/
├── SKILL.md              # 主文件（必需）
├── references/
│   ├── INDEX.md          # 索引
│   └── *.md              # 规范文档
└── output/               # 可选输出模板
```

### SKILL.md 元数据

```yaml
---
name: [sop-name]
description: [描述]
version: [版本]
triggers:
  - "[触发词]"
  - "/sop [name]"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: [sequential|parallel]
  timeout: [毫秒]
---
```

### Step 注释规则

| 标记 | 含义 | 行为 |
|------|------|------|
| `[AUTO]` | 自动执行 | 无需确认 |
| `[CONFIRM_REQUIRED]` | 需确认 | 阻塞等待 |
| `[OPTIONAL]` | 可选 | 用户决定 |

## 状态文件格式

```json
{
  "sop": "[name]",
  "task_id": "[id]",
  "status": "in_progress|completed",
  "current_step": 1,
  "steps": {
    "1_step": {"status": "completed", "timestamp": "..."}
  },
  "data": {}
}
```

## 错误处理

| 错误 | 处理 |
|------|------|
| Agent 失败 | 降级到手动搜索 |
| 构建失败 | 使用 build-error-resolver |
| 测试失败 | 使用 tdd-workflow |

## 相关

- [sop-prd](./sop-prd/SKILL.md) - PRD 生成
- [sop-testing](./sop-testing/SKILL.md) - 测试执行
- [sop-bug-fix](./sop-bug-fix/SKILL.md) - Bug 修复
- [sop-code-review](./sop-code-review/SKILL.md) - 代码审查
- [sop-deployment](./sop-deployment/SKILL.md) - 部署发布