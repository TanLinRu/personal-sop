---
name: sop-fullstack-iteration
description: 前后端需求迭代流程 - PRD生成→依赖分析→API设计→后端实现→前端实现→联调测试（含多Agent并行+context-mode追踪）
version: 2.1.0
triggers:
  - "需求迭代"
  - "功能迭代"
  - "全栈迭代"
  - "/sop fullstack"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
execution:
  mode: parallel
  timeout: 300000

parallel_tasks:
  - name: 业务分析-1
    description: 业务域建模与实体关系
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 技术调研-1
    description: 技术选型与架构设计
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 安全评估-1
    description: 安全合规与认证授权
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: UI设计调研-1
    description: UI设计与组件库
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 性能评估-1
    description: 性能优化与缓存策略
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 后端生成
    description: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]

  - name: 前端生成
    description: 前端代码生成
    agent: frontend-design
    depends_on: [架构审核]

aggregation:
  strategy: merge
  output_format: markdown
---

# SOP Fullstack Iteration v2.1 - 前后端需求迭代流程

## 流程

```
需求确认 → 需求/技术调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 并行生成 → 联调测试 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

前后端完整需求

## Step 2: 需求/技术调研 [AUTO]

5次 sop-library-research 并行：业务分析、技术调研、安全评估、UI设计、性能评估

## Step 3: 生成 PRD [AUTO]

全栈功能通常需要完整 PRD

## Step 4: 架构设计 [AUTO]

后端分层架构、前端架构、接口契约设计

## Step 5: 架构审核 [CONFIRM_REQUIRED]

P0/P1/P2 检查点，用户确认

## Step 6: 依赖查询 [AUTO]

/ctx query 查询完整依赖

## Step 7: 并行生成 [AUTO]

后端 + 前端同时生成

## Step 8: 联调测试 [AUTO]

API 联调验证、数据流验证

## Step 9: 知识更新 [AUTO]

/ctx index 全量更新所有依赖图