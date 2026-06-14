---
name: sop-dependency-analysis
description: 基于 CodeGraph 的业务依赖与冲突分析 - API冲突、实体冲突、路由冲突检测、影响测试集
version: 3.0.0
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

# SOP Dependency Analysis - 基于 CodeGraph 的依赖与冲突分析

> **v3.0.0 (2026-06-14)**：从 Graphify 迁移到 [CodeGraph](https://github.com/colbymchenry/codegraph)。
> 收益：自动同步（不再需要 update）· MCP server（Claude Code/OpenCode 原生集成）· `codegraph affected` 测试影响集 · Spring/Vue 框架路由原生识别 · 100% 本地

## 概述

本 SOP 基于 CodeGraph SQLite 知识图谱（tree-sitter AST 提取），检测业务代码冲突和依赖关系。

**核心优势**：
- **AST 精确分析**（非 grep 文本匹配），覆盖 20+ 语言
- **零配置**：文件保存自动同步，不需要 `graphify update`
- **MCP 原生集成**：Claude Code / OpenCode / Cursor / Codex 全支持
- **测试影响集**：`codegraph affected` 直接给出 git diff 影响的测试文件
- **框架路由识别**：Spring `@GetMapping`、Vue `pages/`、Express、FastAPI 等 17 框架

## 使用场景

- 新增 API 前检测路径冲突（Spring `@*Mapping`、Express、FastAPI）
- 新增 Entity 前检测表名冲突（JPA `@Table`、`@Entity`）
- 新增 Controller 前检测路由冲突
- 修改代码前分析影响范围（`codegraph impact`）
- **回归测试选择**（`codegraph affected`，被 sop-regression 调用）

## 错误处理与降级（双层）

| 错误场景 | 处理方式 | 严重度 |
|----------|----------|--------|
| CodeGraph 未安装 | **软降级**：尝试 Graphify CLI（旧路径）；都失败则 Grep | WARNING |
| `.codegraph/` 未初始化 | 自动 `codegraph init`（仅在 CodeGraph 可用时） | INFO |
| 文件改动但索引未同步 | CodeGraph 文件监听自动同步（默认 2s 防抖）| INFO |
| 查询无结果 | 确认目录路径和符号名 | INFO |
| 查询超时 | 缩小查询范围，指定子目录 | INFO |

## 三级降级策略

```
codegraph <cmd>
    ↓ 命令存在 + 有 .codegraph/  → 一等公民路径
    正常 AST 结果
    ↓ codegraph 不可用
graphify <cmd>  (兼容旧项目)
    ↓ graphify 也不可用
Grep / Glob 文本匹配 (最后兜底)
    ↓
    结果标注: [codegraph-ast] | [graphify-ast] | [fallback-grep]
    ↓
    继续后续步骤 (WARNING，不 BLOCK)
```

### 降级映射表

| 业务问题 | CodeGraph 一等公民 | Graphify 兼容 | Grep 兜底 |
|---------|-------------------|--------------|-----------|
| 所有 REST 端点 | `codegraph search --kind=route` 或 MCP `codegraph_explore "all REST routes"` | `graphify query "REST API 端点"` | `Grep "@(Get\|Post\|Put\|Delete)Mapping" --include=*.java -r .` |
| JPA Entity 表名 | `codegraph search --kind=class` + filter `@Entity` | `graphify query "JPA Entity 表名"` | `Grep "@Table\|@Entity" --include=*.java -r .` |
| 谁调用 X | `codegraph callers X` | `graphify query "依赖 X 的模块"` | `Grep "import.*X\|new X(" --include=*.java -r .` |
| X→Y 路径 | MCP `codegraph_explore "how does X reach Y"` | `graphify path X Y` | 多次 grep（不准） |
| X 改动影响 | `codegraph impact X` | `graphify query "影响范围"` | 不可行 |
| **改了哪些测试受影响** | `codegraph affected $(git diff --name-only)` | ❌ 不支持 | grep `import` 链（不准） |
| 索引同步 | 自动（文件监听）| `graphify update` | N/A |

### 标记规范

降级结果在产出文件顶部必须标注：

```markdown
---
analysis_engine: codegraph | graphify | grep
codegraph_status: available | unavailable | degraded
generated: 2026-06-14
note: <如使用 grep，警告精度低于 AST 分析>
---
```

### 状态记录

每次执行写入 state：

```json
{
  "analysis_engine": "codegraph",
  "codegraph_status": "available",
  "fallback_count": 0,
  "warnings": []
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
| **回归测试** | `sop-regression` | **`codegraph affected` 直接给出受影响测试** |

**调用示例**：
```
# 在 sop-backend-iteration 流程中调用
Skill(skill="sop-dependency-analysis", args="检测新增 OrderService 的冲突")
```

## 流程步骤

### Step 1: 环境检查 [AUTO]

按优先级检测可用引擎：

```bash
# 1. CodeGraph（一等公民）
codegraph version 2>&1 && \
  codegraph status 2>&1 | grep -q "Indexed" && \
  ENGINE="codegraph"

# 2. Graphify（兼容旧项目）
[ -z "$ENGINE" ] && command -v graphify >/dev/null && ENGINE="graphify"

# 3. Grep（兜底）
[ -z "$ENGINE" ] && ENGINE="grep"

echo "[OK] analysis_engine=$ENGINE"
```

---

### Step 2: 图谱构建/更新 [AUTO]

**CodeGraph（推荐）**：

```bash
# 首次：初始化 + 索引一气呵成
codegraph init                                # 创建 .codegraph/，构建图谱

# 之后：完全不用管，文件监听自动同步
# 验证：codegraph status
```

**Graphify（兼容路径）**：

```bash
graphify add .                                 # 首次构建
graphify update ./backend --out .sop/dependency-graph/{project}/backend
```

**Grep（无图谱）**：跳过此步骤，下一步直接 grep。

---

### Step 3: 冲突检测 [AUTO]

#### API 冲突检测

**CodeGraph**：
```bash
# 通过 MCP（agent 自动调用）：codegraph_explore "all REST routes in this project"
# 通过 CLI：
codegraph search --kind=route --json
codegraph search "@GetMapping" --json
codegraph search "@PostMapping" --json
```

**Graphify 兼容**：
```bash
graphify query "搜索所有 REST API 端点及其路径"
```

**Grep 兜底**：
```bash
grep -rE "@(Get|Post|Put|Delete|Request)Mapping" --include='*.java' .
```

#### Entity 冲突检测

**CodeGraph**：
```bash
codegraph search "@Entity" --json
codegraph search "@Table" --json
# 或 MCP: codegraph_explore "all JPA entities and their table names"
```

**Graphify 兼容**：
```bash
graphify query "搜索所有 JPA Entity 及其表名"
```

#### 路由冲突（Vue/Nuxt）

**CodeGraph**（Nuxt `pages/` 自动识别为 route node）：
```bash
codegraph search --kind=route --json | grep '"language":"vue"'
```

---

### Step 4: 影响分析 [AUTO]

#### 谁调用了 X

```bash
# CodeGraph
codegraph callers OrderService.createOrder
codegraph callers UserController.list --json

# 通过 MCP（推荐，agent 一次性获取上下文）：
# codegraph_callers OrderService.createOrder
```

#### 改 X 影响哪些代码

```bash
# CodeGraph blast radius
codegraph impact OrderEntity --depth 3 --json

# 通过 MCP：codegraph_impact OrderEntity
```

#### X→Y 路径（"用户登录如何到达数据库"）

```bash
# 最强工具：codegraph_explore（MCP）
# 一次调用返回所有相关符号源码 + 调用路径
# CLI 等价：
codegraph explore "how does AuthController.login reach UserRepository"
```

#### 改动影响哪些测试

```bash
# 这是 sop-regression 的核心
git diff --name-only | codegraph affected --stdin --json
# 或：
codegraph affected src/main/java/.../OrderService.java
```

---

### Step 5: 输出报告 [AUTO]

```markdown
---
sop: dependency-analysis
analysis_engine: codegraph
codegraph_status: available
generated: 2026-06-14
---

## 冲突检测结果

### API 冲突检查
| 检查项 | 新接口 | 已有接口 | 冲突 | 来源 |
|--------|--------|----------|------|------|
| 1 | `GET /api/v1/orders/{id}` (OrderController) | `GET /api/v1/orders/{id}` (OrderApiConflictController) | ⚠️ 路径和方法完全匹配 | [codegraph-ast] |

### 实体冲突检查
| 新实体 | 已有实体 | 冲突 |
|--------|----------|------|
| `@Table("t_order")` | `t_order` | ⚠️ 表名相同 |

### 影响分析
| 新增代码 | 被引用位置 | 影响范围 | blast-radius |
|---------|-----------|----------|--------------|
| OrderItem | OrderController, OrderService, OrderRepository | 中 | 12 nodes |

### 受影响测试（codegraph affected）

```
git diff: src/main/java/com/example/OrderService.java

Affected tests:
- src/test/java/com/example/OrderServiceTest.java
- src/test/java/com/example/OrderControllerIntegrationTest.java
```

---

## 结论

- [ ] API 冲突：需要修改
- [x] 实体冲突：无
- [ ] 业务影响：需确认
- [x] 受影响测试：2 个，已标记跑回归

### 下一步
请确认是否修改冲突项？输入修改指令继续执行。
```

## CodeGraph 命令速查

| 命令 | 用途 |
|------|------|
| `codegraph init` | 初始化项目 + 构建索引（一步到位） |
| `codegraph status` | 显示索引状态、节点/边数量 |
| `codegraph search <q>` | 名称模糊搜索（FTS5）|
| `codegraph explore "<q>"` | 一次返回相关符号源码 + 调用路径 |
| `codegraph callers <sym>` | 谁调用 X |
| `codegraph callees <sym>` | X 调用了谁 |
| `codegraph impact <sym>` | X 改动的 blast radius |
| `codegraph affected [files]` | 改动文件 → 受影响测试集 |
| `codegraph node <sym\|file>` | 单个符号源码 + 上下文，或读整个文件 |
| `codegraph files [path]` | 列文件树 |
| `codegraph sync` | 手动同步（一般不需要，watcher 自动） |
| `codegraph upgrade` | 升级 |

## 配置要求

### 推荐：CodeGraph

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh

# Windows (PowerShell)
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex

# 或 npm
npm i -g @colbymchenry/codegraph

# 安装到 agent (Claude Code / OpenCode / Cursor / ...)
codegraph install

# 项目初始化（一次）
cd your-project && codegraph init
```

### 兼容：Graphify（不再推荐）

```bash
pip install graphifyy
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
- "改了 OrderService 哪些测试要跑"
