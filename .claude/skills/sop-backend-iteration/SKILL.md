name: sop-backend-iteration
description: 后端需求迭代流程 - PRD生成→依赖分析→API设计→后端实现→测试验证（含多Agent并行+context-mode追踪）
version: 1.2.0
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
    mode: sequential
    timeout: 300000

# 多agent并行配置 ⭐
parallel_tasks:
  - name: 后端代码分析
    description: 分析后端代码结构和依赖
    agent: java-reviewer
    depends_on: []

  - name: 安全扫描
    description: 扫描安全漏洞
    agent: security-scan
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge
  output_format: markdown