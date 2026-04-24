---
name: sop-frontend-iteration
description: 前端需求迭代流程 - 需求→调研→设计→审核→依赖查询→实现（含多Agent并行+context-mode）
version: 2.1.0
triggers:
  - "前端迭代"
  - "前端需求"
  - "前端功能"
  - "/sop frontend"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
execution:
  mode: parallel
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/frontend-{id}.json

parallel_tasks:
  - name: UI设计调研
    description: UI设计与组件库调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 组件库调研
    description: 组件库与状态管理调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 前端代码生成
    description: 前端代码生成
    agent: frontend-design
    depends_on: [设计审核]

  - name: 前端代码审查
    description: 前端代码审查
    agent: code-reviewer
    depends_on: [前端代码生成]

aggregation:
  strategy: merge
  output_format: markdown

agent_mapping:
  sop-library-research: sop-library-research
  frontend-design: frontend-design
  code-reviewer: code-reviewer
---

# SOP Frontend Iteration v2.1 - 前端需求迭代流程

## 流程

```
需求确认 → UI/UX调研 → 组件设计 → 设计审核 → 依赖查询 → 前端实现 → 验证 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

页面需求、组件需求、设计风格

## Step 2: UI/UX调研 [AUTO]

2次 sop-library-research 并行：UI设计调研、组件库调研

## Step 3: 组件设计 [AUTO]

组件树结构、状态管理设计、路由设计

## Step 4: 设计审核 [CONFIRM_REQUIRED]

P0/P1 检查点，用户确认

## Step 5: 依赖查询 [AUTO]

/ctx query 查询已有组件、页面

## Step 6: 前端实现 [AUTO]

frontend-design 生成 + code-reviewer 审查

## Step 7: 验证 [AUTO]

构建测试、组件测试

## Step 8: 知识更新 [AUTO]

/ctx index 增量更新组件树