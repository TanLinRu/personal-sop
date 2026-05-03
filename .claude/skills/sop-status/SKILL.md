---
name: sop-status
description: 显示所有 SOP 任务状态 - 进行中、已完成、失败
version: 1.0.0
triggers:
  - "/sop status"
  - "SOP状态"
  - "任务状态"
permissions:
  bash: allow
  read: allow
---

# SOP 状态查看

## 功能

显示所有进行中和已完成的 SOP 任务状态。

## 执行步骤

### Step 1: 加载所有状态 [AUTO]

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all
```

### Step 2: 格式化输出 [AUTO]

将状态数据格式化为可读的表格：

```markdown
## SOP 任务状态

| SOP | 状态 | 当前步骤 | 开始时间 | 完成时间 |
|-----|------|----------|----------|----------|
| scaffold | in_progress | 3/10 | 2026-05-03 10:00 | - |
| code-review | completed | 4/4 | 2026-05-03 09:00 | 2026-05-03 09:15 |
| bug-fix | failed | 2/5 | 2026-05-03 08:00 | - |

### 进行中的任务详情

#### scaffold (Step 3/10)
- 已完成: 1_confirm, 2_config
- 下一步: 3_research
- 已保存答案: project_name=delivery-staff, database=H2
```

### Step 3: 提供操作建议 [AUTO]

根据状态提供操作建议：
- 进行中的任务 → 提示可以 `/sop <name>` 继续
- 失败的任务 → 提示可以清理后重试
- 无任务 → 显示可用的 SOP 列表
