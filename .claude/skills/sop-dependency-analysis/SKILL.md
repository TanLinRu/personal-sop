---
name: sop-dependency-analysis
description: 基于 Graphify 的业务依赖与冲突分析 - API冲突、实体冲突、路由冲突检测
version: 2.0.0
triggers:
  - "依赖分析"
  - "冲突检测"
  - "影响分析"
  - "/sop dependency-analysis"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow

execution:
  mode: sequential
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/dependency-{id}.json
---

# SOP Dependency Analysis - 基于 Graphify 的依赖与冲突分析

## 概述

本 SOP 提供基于 Graphify 的知识图谱分析能力，检测业务代码冲突和依赖关系。

**核心优势**：
- Graphify AST 分析（非 Grep 文本匹配）
- O(1) 图查询复杂度
- 精确的符号识别和调用关系

## 使用场景

- 新增 API 前检测路径冲突
- 新增 Entity 前检测表名冲突
- 新增 Controller 前检测路由冲突
- 修改代码前分析影响范围

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| Graphify 未安装 | 提示 `pip install graphifyy`，中止执行 |
| 图谱文件不存在 | 自动执行 `graphify add .` 构建 |
| 查询无结果 | 确认目录路径是否正确 |
| 图谱过期 | 提示执行 `graphify update` 刷新 |
| 查询超时 | 缩小查询范围，指定子目录 |

## 与其他 SOP 的集成

| 场景 | 前置/后续 SOP | 说明 |
|------|---------------|------|
| 后端迭代前 | `sop-backend-iteration` | 先分析冲突，再编写代码 |
| 前端迭代前 | `sop-frontend-iteration` | 检查路由和组件冲突 |
| 全栈开发前 | `sop-fullstack-iteration` | 前后端冲突统一检测 |
| API 设计 | `sop-api-design` | 设计前检测已有接口 |
| 数据库设计 | `sop-database-design` | 设计前检测已有实体 |
| 代码审查 | `sop-code-review` | 审查时补充影响分析 |

**调用示例**：
```
# 在 sop-backend-iteration 流程中调用
Skill(skill="sop-dependency-analysis", args="检测新增 OrderService 的冲突")
```

## 流程步骤

### Step 1: 环境检查 [AUTO]

检查 Graphify 是否可用：

```bash
# 检查 graphify 命令
graphify --help

# 检查图谱是否存在
Test-Path "graphify-out/graph.json"
```

---

### Step 2: 图谱构建/更新 [AUTO]

**首次构建**：
```bash
graphify add .
```

**增量更新**：
```bash
graphify update ./backend --out .sop/dependency-graph/{project}/backend
```

---

### Step 3: 冲突检测 [AUTO]

**API 冲突检测**：
```bash
graphify query "搜索所有 REST API 端点及其路径"
```

**Entity 冲突检测**：
```bash
graphify query "搜索所有 JPA Entity 及其表名"
```

---

### Step 4: 影响分析 [AUTO]

**查询依赖关系**：
```bash
graphify query "哪些模块依赖这个 Service?"
```

**查询调用链**：
```bash
graphify path "OrderService" "OrderController"
```

---

### 输出格式

```markdown
---
sop: dependency-analysis
step: 4_analysis
status: completed
---

## 冲突检测结果

### API 冲突检查
| 检查项 | 新接口 | 已有接口 | 冲突 |
|--------|--------|-----------|------|
| 1 | GET /api/v1/orders/{id} (OrderController) | GET /api/v1/orders/{id} (OrderApiConflictController) | ⚠️ 路径和方法完全匹配 |

### 实体冲突检查
| 检查项 | 新实体 | 已有实体 | 冲突 |
|--------|--------|-----------|------|
| 1 | @Table("t_order") | t_order | ⚠️ 表名相同 |

### 影响分析
| 新增代码 | 被引用位置 | 影响范围 |
|---------|-----------|----------|
| OrderItem | OrderController | 中 |

---

## 结论

- [ ] API 冲突：需要修改
- [x] 实体冲突：无
- [ ] 业务影响：需确认

### 下一步
请确认是否修改冲突项？输入修改指令继续执行。
```

## Graphify 命令参考

| 命令 | 用途 |
|------|------|
| `graphify add <path>` | 添加目录到图谱 |
| `graphify update <path>` | 增量更新图谱 |
| `graphify query "<question>"` | BFS 遍历图谱回答问题 |
| `graphify path "A" "B"` | 查找两点最短路径 |
| `graphify explain "X"` | 解释节点及其邻居 |

## 配置要求

1. 安装 Graphify：
   ```bash
   pip install graphifyy
   ```

2. 为 OpenCode 安装集成：
   ```bash
   graphify opencode install
   ```

## 触发命令

```
/sop dependency-analysis
```

或描述：
- "帮我分析新增代码的冲突"
- "检查 API 是否有冲突"
- "分析这个功能的影响范围"