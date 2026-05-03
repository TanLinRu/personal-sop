# SOP Execution Rule

> Agent 执行 SOP Skill 时的自动状态记录规范

## 概述

- **目标**：Agent 执行 SOP 时自动记录状态，用户答案，完成后清理
- **存储位置**：`.sop/state/{sop}-{YYYYMMDD}.json`
- **原理**：根据 Step 标记 `[CONFIRM_REQUIRED]` / `[AUTO]` 自动推断
- **脚本**：`.claude/scripts/sop-state-save.ts`、`sop-state-load.ts`、`sop-state-clean.ts`

---

## State 文件格式

```json
{
  "task_id": "scaffold-1714752000000",
  "sop": "scaffold",
  "status": "in_progress",
  "started_at": "2026-05-03T10:00:00Z",
  "current_step": 3,
  "steps": {
    "1_confirm": { "status": "completed", "timestamp": "2026-05-03T10:01:00Z" },
    "2_config": { "status": "completed", "timestamp": "2026-05-03T10:05:00Z" },
    "3_research": { "status": "in_progress", "timestamp": "2026-05-03T10:10:00Z" }
  },
  "answers": {
    "1_confirm": {
      "project_name": "delivery-staff",
      "core_scenario": "物流管理"
    },
    "2_config": {
      "database": "H2",
      "frontend": "Vue3+Naive UI"
    }
  }
}
```

---

## 自动状态记录规则

### Step 标记处理

| 标记                 | Agent 行为   | 状态更新                             |
| -------------------- | ------------ | ------------------------------------ |
| `[CONFIRM_REQUIRED]` | 阻塞等待确认 | 执行前 `in_progress`，确认后 `completed` |
| `[AUTO]`             | 自动执行     | 执行完成自动 `completed`             |
| 无标记               | 默认 AUTO    | 执行完成自动 `completed`             |

### 用户答案记录

```bash
# AskUserQuestion 回答后，保存答案
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts <sop-name> <step-id> completed key1=value1 key2=value2
```

---

## 执行流程

### 1. 会话开始时 - 恢复检查

```bash
# 检查是否有未完成的任务
npx ts-node --transpile-only .claude/scripts/sop-resume-check.ts <sop-name>
```

输出 JSON：
- `has_resume: true` → 提示用户是否继续
- `has_resume: false` → 从头开始

### 2. Step 执行时 - 状态更新

```bash
# [CONFIRM_REQUIRED] - 步骤开始
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts <sop-name> <step-id> in_progress

# 用户确认后 - 步骤完成（含答案）
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts <sop-name> <step-id> completed key1=value1

# [AUTO] - 步骤完成
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts <sop-name> <step-id> completed
```

脚本自动：
- 推进 `current_step` 到下一步
- 最后一步完成时设置 `status: "completed"` + `completed_at`

### 3. 查看状态

```bash
# 查看指定 SOP 的状态
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts <sop-name>

# 查看所有进行中的任务
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all

# 列出所有状态文件
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --list
```

### 4. 清理状态

```bash
# 清理已完成/失败的状态
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts

# 清理指定 SOP 的状态（保留 in_progress）
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts <sop-name>

# 清理所有状态
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts --all
```

---

## 文件命名规范

```
.sop/state/{sop}-{YYYYMMDD}.json
```

| 示例                          | 说明                     |
| ----------------------------- | ------------------------ |
| `scaffold-20260503.json`     | scaffold SOP，2026-05-03 |
| `backend-iteration-20260503.json` | 后端迭代           |
| `bugfix-20260503.json`       | Bug修复                  |

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
3. **自动推进**：脚本自动管理 current_step，无需手动更新
4. **会话恢复**：`sop-resume-check.ts` 检测未完成任务
5. **完成后清理**：`sop-state-clean.ts` 清理已完成状态

---

## 相关

- `.claude/scripts/sop-state-save.ts` - 状态保存脚本
- `.claude/scripts/sop-state-load.ts` - 状态加载脚本
- `.claude/scripts/sop-state-clean.ts` - 状态清理脚本
- `.claude/scripts/sop-resume-check.ts` - 恢复检查脚本
- `.claude/scripts/sop-step-map.json` - SOP 步骤映射表