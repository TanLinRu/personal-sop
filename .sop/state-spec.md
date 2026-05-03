# SOP State Specification

## Overview
SOP 状态文件存储 CLI 工作流引擎 (personal-sop) 的执行状态，支持断点恢复与后续系统集成。

## File Location
- Directory: `.sop/state/`
- Naming: `{sop_name}-{date}.json` (e.g., `scaffold-20260426.json`, `bug-fix-20260427.json`)

## SOPState Interface
```typescript
interface SOPState {
  task_id: string;           // 任务唯一标识: {sop}-{timestamp}
  sop: string;              // SOP 名称: scaffold, bug-fix, etc.
  status: "in_progress" | "completed" | "failed";
  started_at: string;      // ISO 8601 timestamp
  completed_at?: string;   // 完成时间（可选）
  business_requirements?: Record<string, unknown>;
  config?: Record<string, unknown>;
  current_step: number;    // 当前步骤序号 (1-based)
  steps: Record<string, { status: string; timestamp?: string }>;
  answers: Record<string, Record<string, unknown>>;
  resume_from?: string;    // 恢复点标识
}
```

## Step Status Values
- `pending`: 待执行
- `in_progress`: 执行中
- `completed`: 已完成
- `failed`: 失败

## State Lifecycle
```
in_progress → completed  (正常完成)
in_progress → failed    (执行失败)
```

## Storage Scripts
- `sop-state-save.ts`: 保存状态
- `sop-state-load.ts`: 加载/列出状态
- `sop-state-clean.ts`: 清理过期状态

## Usage
```bash
# 保存状态
ts-node sop-state-save.ts <sop> <step> <status> [key=value...]

# 加载状态
ts-node sop-state-load.ts <sop>

# 列出所有进行中状态
ts-node sop-state-load.ts
```

## Integration Points (langgraph-agent)
1. State file directory: configurable via `AGENT_MEMORY_DIR/.sop/state/`
2. Read API: Load SOP state for resume
3. Write API: Optionally mirror state changes back (dual-write)
4. SOP injection: Embed in `think` node system prompt