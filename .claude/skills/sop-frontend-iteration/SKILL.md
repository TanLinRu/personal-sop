name: sop-frontend-iteration
description: 前端需求迭代流程 - PRD生成→需求分析→UI设计→前端实现→测试验证（含多Agent并行+context-mode追踪）
version: 1.2.0
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
    mode: sequential
    timeout: 300000

# 多agent并行配置 ⭐
parallel_tasks:
  - name: 前端代码分析
    description: 分析前端代码结构
    agent: code-reviewer
    depends_on: []

  - name: UI设计分析
    description: 分析UI设计和组件结构
    agent: frontend-designer
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge
  output_format: markdown