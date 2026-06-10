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

| 错误场景 | 处理方式 | 严重度 |
|----------|----------|--------|
| Graphify 未安装 | **软降级**：记录 WARNING，切换到 Grep 文本匹配继续 | WARNING (v2.0.0) |
| Graphify 命令超时 (>30s) | 软降级到 Grep，记录 WARNING | WARNING |
| 图谱文件不存在 | 自动执行 `graphify add .` 构建（仅在 Graphify 可用时） | INFO |
| 查询无结果 | 确认目录路径是否正确 | INFO |
| 图谱过期 | 提示执行 `graphify update` 刷新 | INFO |
| 查询超时 | 缩小查询范围，指定子目录 | INFO |

## Graphify 降级策略 (v2.0.0 新增)

> **v2.0.0 之前**：Graphify 不可用 → 中止执行。导致 `sop-dependency-analysis` / `sop-backend-iteration` 等所有依赖 Graphify 的 SOP 在没有 `pip install graphifyy` 的环境中直接失败。
>
> **v2.0.0 起**：软降级，workflow 韧性优先。

### 降级流程

```
graphify <cmd>
    ↓ exit code 0
    正常结果
    ↓ exit code != 0 OR timeout
    log.warn("Graphify unavailable, fallback to Grep")
    Grep <pattern> --include=*.{java,ts,vue} -r .
    ↓
    结果标注: [fallback-grep]  // 区别于 [graphify-ast]
    ↓
    继续后续步骤 (WARNING，不 BLOCK)
```

### 降级映射表

| Graphify 命令 | Grep 降级方案 |
|--------------|--------------|
| `graphify query "REST API 端点"` | `Grep "@(Get\|Post\|Put\|Delete)Mapping" --include=*.java -r .` |
| `graphify query "JPA Entity 表名"` | `Grep "@Table\|@Entity" --include=*.java -r .` |
| `graphify query "依赖 X 的模块"` | `Grep "import.*X" --include=*.java -r .` |
| `graphify path A B` | `Grep "import .*A\|A\." --include=*.java -r .` (粗略) |
| `graphify update` | 跳过（无图谱可更新） |

### 标记规范

降级结果在产出文件顶部必须标注：

```markdown
---
fallback: grep
graphify_status: unavailable
generated: 2026-06-10
note: Graphify CLI 不可用，使用 Grep 文本匹配，结果精度低于 AST 分析
---
```

### 状态记录

每次降级写入 state：

```json
{
  "graphify_status": "unavailable|available|degraded",
  "fallback_count": 3,
  "warnings": ["Step 2: graphify update skipped", "Step 3: grep fallback used"]
}
```

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