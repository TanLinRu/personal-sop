---
name: sop-backend-iteration
description: 后端需求迭代流程 - 需求→调研→PRD→架构→审核→依赖查询→实现（含多Agent并行+context-mode）
version: 2.1.0
triggers:
  - "后端迭代"
  - "后端需求"
  - "后端功能"
  - "/sop backend"
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
  - name: API设计调研
    description: API设计与数据模型调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 技术选型调研
    description: 框架与中间件选型调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 后端代码生成
    description: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]

  - name: 后端代码审查
    description: 后端代码审查
    agent: java-reviewer
    depends_on: [后端代码生成]

aggregation:
  strategy: merge
  output_format: markdown
---

# SOP Backend Iteration v2.1 - 后端需求迭代流程

## 流程

```
需求确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 后端实现 → 验证 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

功能名称、接口需求、数据模型要求

## Step 2: 需求/技术调研 [AUTO]

3次 sop-library-research：API设计调研、技术选型调研、安全合规调研

## Step 3: 生成 PRD [AUTO]

后端功能通常需要完整 PRD

## Step 4: 架构设计 [AUTO]

API结构设计、数据模型设计、事务边界设计

## Step 5: 架构审核 [CONFIRM_REQUIRED]

P0/P1/P2 检查点，用户确认

## Step 6: 依赖查询 [AUTO]

/ctx query 查询已有实体、API

## Step 7: 后端实现 [AUTO]

dr-jskill 生成 + java-reviewer 审查

## Step 8: 验证 [AUTO]

编译测试、接口测试

## Step 9: 知识更新 [AUTO]

/ctx index 增量更新实体/API依赖图