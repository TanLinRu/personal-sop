---
name: sop-scaffold
description: 完整项目初始化流程 - 需求调研→PRD→架构→审核→依赖查询→生成（含多Agent+context-mode）
version: 2.1.0
triggers:
  - "生成脚手架"
  - "初始化项目"
  - "创建项目"
  - "/sop scaffold"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
execution:
  mode: parallel
  timeout: 600000

parallel_tasks:
  - name: 业务分析
    description: 业务域建模与实体关系
    agent: sop-library-research
    depends_on: []
    count: 2

  - name: 技术调研
    description: 框架对比与技术选型
    agent: sop-library-research
    depends_on: []
    count: 2

  - name: 安全评估
    description: 安全合规与认证授权
    agent: sop-library-research
    depends_on: []
    count: 2

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

# SOP Scaffold v2.1 - 项目初始化流程

## 流程

```
需求确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 并行生成 → 验证 → 知识索引
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

项目名称、核心场景、目标用户、约束条件

## Step 2: 需求/技术调研 [AUTO]

5领域 x 2次并行调研：业务分析、技术调研、安全评估、竞品分析、合规分析

## Step 3: 生成 PRD [AUTO]

Agent 评估后生成完整/简化 PRD

## Step 4: 架构设计 [AUTO]

分层架构、技术选型、数据模型设计

## Step 5: 架构审核 [CONFIRM_REQUIRED]

P0/P1/P2 检查点，用户确认

## Step 6: 依赖查询 [AUTO]

查询现有实体/API/组件，避免重复

## Step 7: 并行生成 [AUTO]

后端 + 前端同时生成

## Step 8: 验证 [AUTO]

编译测试、代码审查

## Step 9: 知识索引 [AUTO]

/ctx index 初始化项目知识库