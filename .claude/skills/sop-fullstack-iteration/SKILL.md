name: sop-fullstack-iteration
description: 前后端需求迭代流程 - PRD生成→依赖分析→API设计→后端实现→前端实现→联调测试（含多Agent并行+context-mode追踪）
version: 1.2.0
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
    mode: sequential
    timeout: 300000

# 多agent并行配置 ⭐
parallel_tasks:
  - name: 后端代码分析
    description: 分析后端代码结构和依赖
    agent: java-reviewer
    depends_on: []

  - name: 前端代码分析
    description: 分析前端代码结构
    agent: code-reviewer
    depends_on: []

  - name: 安全扫描
    description: 扫描安全漏洞
    agent: security-scan
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge
  output_format: markdown