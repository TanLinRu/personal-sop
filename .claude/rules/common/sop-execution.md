# SOP Execution Rule

> Agent 执行 SOP Skill 时的自动状态记录规范

## 概述

- **目标**：Agent 执行 SOP 时自动记录状态，用户答案，完成后清理
- **存储位置**：`.sop/state/{sop}-{date}.json`
- **原理**：根据 Step 标记 `[CONFIRM_REQUIRED]` / `[AUTO]` 自动推断

---

## State 文件格式

```json
{
  "task_id": "{uuid}",
  "sop": "scaffold",
  "status": "in_progress",
  "started_at": "{timestamp}",
  "business_requirements": {
    "name": "充电桩管理系统",
    "type": "充电桩管理",
    "features": ["充电桩设备管理", "充电记录", "支付"],
    "priority": "P1"
  },
  "current_step": 2,
  "steps": {
    "1_confirm": { "status": "completed", "timestamp": "..." },
    "2_config": { "status": "completed", "timestamp": "..." },
    "3_research": { "status": "in_progress", "timestamp": "..." }
  },
  "answers": {
    "1_confirm": {
      "project_name": "充电桩管理系统",
      "core_scenario": "充电桩设备管理",
      "target_users": "运营商/车主"
    },
    "2_config": {
      "database": "H2",
      "frontend": "Vue3+Naive UI",
      "port": 8080
    }
  }
}
```

---

## 自动状态记录规则

### Step 标记处理

| 标记                 | Agent 行为   | 状态更新                             |
| -------------------- | ------------ | ------------------------------------ |
| `[CONFIRM_REQUIRED]` | 阻塞等待确认 | 执行前 `pending`，确认后 `completed` |
| `[AUTO]`             | 自动执行     | 执行完成自动 `completed`             |
| 无标记               | 默认 AUTO    | 执行完成自动 `completed`             |

### 用户答案记录

```bash
# AskUserQuestion 回答后
answers["{step_name}"] = {
  "{question_key}": "{user_answer}",
  ...
}
```

---

## 执行流程

### 1. 会话开始时 - 恢复检查

```bash
# 查找最新的 state 文件
Glob(pattern=".sop/state/{sop}-*.json")

# 按日期排序，取最新
# 读取并恢复 current_step 和 answers
```

### 2. Step 执行时 - 状态更新

```bash
# [CONFIRM_REQUIRED] - 执行前
Edit(state_file,
  oldString: '"current_step": 1',
  newString: '"current_step": 2')

Edit(state_file,
  oldString: '"1_confirm": { "status": "pending" }',
  newString: '"1_confirm": { "status": "completed", "timestamp": "..." }')

# [AUTO] - 执行完成
Edit(state_file,
  oldString: '"current_step": 2',
  newString: '"current_step": 3')

Edit(state_file,
  oldString: '"2_config": { "status": "in_progress" }',
  newString: '"2_config": { "status": "completed", "timestamp": "..." }')
```

### 3. 用户答案记录

```bash
# AskUserQuestion 回答后
Edit(state_file,
  oldString: '"answers": { }',
  newString: '"answers": {
    "2_config": {
      "database": "H2",
      "frontend": "Vue3+Naive UI"
    }
  }')
```

### 4. 任务完成 - 清理

```bash
# 更新状态
Edit(state_file,
  oldString: '"status": "in_progress"',
  newString: '"status": "completed"')

Edit(state_file,
  oldString: '"completed_at": null',
  newString: '"completed_at": "{timestamp}"')

# 删除 state 文件
Delete(state_file)
```

---

## 文件命名规范

```
.sop/state/{sop}-{date}.json
```

| 示例                                  | 说明                     |
| ------------------------------------- | ------------------------ |
| `scaffold-20260425.json`              | scaffold SOP，2026-04-25 |
| `backend-iteration-erp-20260425.json` | 后端迭代，带项目名       |
| `bugfix-20260425.json`                | Bug修复                  |

---

## 图谱规范（后端/前端分开）

```bash
# 后端图谱
graphify update ./backend --out .sop/dependency-graph/{project}/backend

# 前端图谱
graphify update ./frontend --out .sop/dependency-graph/{project}/frontend
```

---

## Key Points

1. **仅用 .sop/state/** 作为状态管理，不使用 task.md
2. **answers 字段**：记录 AskUserQuestion 用户答案
3. **完成后清理**：删除 state 文件，避免磁盘占用
4. **会话恢复**：读取最新的 {sop}-*.json

---

## 相关

- [.sop/state/](../.sop/state/) - 状态文件目录
- [.claude/skills/SOP.md](../skills/SOP.md) - SOP 顶层规范