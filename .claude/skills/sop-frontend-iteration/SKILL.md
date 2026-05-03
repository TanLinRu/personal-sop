---
name: sop-frontend-iteration
description: 前端需求迭代流程 - 需求→调研→设计→审核→依赖查询→实现（含多Agent并行+Graphify）
version: 2.2.0
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
    execution_mode: parallel

  - name: 组件库调研
    description: 组件库与状态管理调研
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 前端代码生成
    description: 前端代码生成
    agent: frontend-design
    depends_on: [设计审核]
    execution_mode: parallel

  - name: 前端代码审查
    description: 前端代码审查
    agent: code-reviewer
    depends_on: [前端代码生成]
    execution_mode: parallel

aggregation:
  strategy: merge
  output_format: markdown
---

# SOP Frontend Iteration v2.1 - 前端需求迭代流程

## 前后端分离规范

> **强制要求**：前端代码必须放在 `{project}/frontend/` 目录

### 目录结构要求

```
{project}/
├── backend/              # 后端代码（不在本SOP范围内）
├── frontend/             # ✅ 前端代码放在这里
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

### 生成路径规范

| 场景 | 生成路径 | 示例 |
|------|----------|------|
| 新项目前端 | `{project}/frontend/` | `hotel-system/frontend/` |
| 页面追加 | `{project}/frontend/src/views/` | `hotel-system/frontend/src/views/` |
| 组件追加 | `{project}/frontend/src/components/` | `hotel-system/frontend/src/components/` |

### 禁止事项

- ❌ 不要在 `{project}/src/` 生成前端代码
- ❌ 不要在 `{project}/backend/` 生成前端代码
- ❌ 前端 package.json 不要放在根目录

## 流程

```
需求确认 → UI/UX调研 → 组件设计 → 设计审核 → 依赖查询 → 前端实现 → 验证 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

> 状态管理通过 `.claude/scripts/sop-state-*.ts` 脚本执行，详见 [sop-framework](../skills/sop-framework/SKILL.md)

**执行内容**：
- 页面需求
- 组件需求
- 设计风格

**持久化**（自动）：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts frontend-iteration 1_confirm in_progress
```

**输出**：
```markdown
---
sop: frontend-iteration
step: 1_confirm
status: in_progress
---

## 需求确认

### 页面需求
-

### 组件需求
-

### 设计风格
-
```

---

## Step 2: UI/UX调研 [AUTO]

**执行内容**：
- UI设计调研
- 组件库调研

**执行方式**：
使用 skill 工具加载 sop-library-research 进行调研

```bash
# 加载技术调研 skill
skill(name="sop-library-research")
```

**输出**：
```markdown
---
sop: frontend-iteration
step: 2_research
status: in_progress
---

## 调研结果

### UI设计参考
-

### 组件库规范
-
```

---

## Step 3: 组件设计 [AUTO]

**执行内容**：
- 组件树结构
- 状态管理设计
- 路由设计

**输出**：
```markdown
---
sop: frontend-iteration
step: 3_design
status: in_progress
---

## 组件设计

### 组件树
-

### 状态管理
-

### 路由设计
-
```

---

## Step 4: 设计审核 [CONFIRM_REQUIRED]

**执行内容**：
P0/P1 检查点，用户确认

**检查清单**：
| 级别 | 检查项 | 说明 |
|------|-------|------|
| P0 | 组件结构合理 | 符合单一职责 |
| P0 | 状态管理清晰 | 数据流可追溯 |
| P1 | 路由设计规范 | RESTful 路径 |
| P1 | 响应式适配 | 移动端兼容 |

---

## Step 5: 依赖查询 [AUTO]

> 使用 Graphify 查询（替代 Glob/Grep）

### 5.1 检查图谱

检查图谱是否存在：

```bash
Test-Path ".sop/dependency-graph/graph.json"
```

### 5.2 图谱更新确认

> 增量更新已有依赖图

```javascript
AskUserQuestion({
  question: "是否需要更新依赖图谱？",
  header: "图谱确认",
  options: [
    { label: "更新图谱", description: "增量更新 Graphify 依赖图" },
    { label: "跳过", description: "跳过本次更新" }
  ],
  multiSelect: false
})
```

### 5.3 Graphify 查询

```bash
# ===== 前端图谱（强制分开）=====
graphify update ./frontend --out .sop/dependency-graph/{project}/frontend
```

### 5.4 依赖影响分析 [AUTO]

> **目标**：分析前端组件对 API 的依赖，提前识别风险

#### 5.4.1 查询 API 依赖

**命令**：
```bash
# 查询依赖的 API
graphify query "{API模块} 相关?" --graph .sop/dependency-graph/graph.json
```

#### 5.4.2 风险评估

| 依赖类型 | 模式 | 风险等级 | 处理方式 |
|----------|------|----------|----------|
| API 调用 | `axios.get(/api/v1/xxx)` | 🔴 高 | 需同步测试 API |
| Props 传递 | `defineProps<xxx>()` | 🟡 中 | 需字段兼容 |
| Store 引用 | `useXxxStore()` | 🔴 高 | 需同步更新 |
| 无引用 | - | 🟢 低 | 可独立迭代 |

#### 5.4.3 风险报告

```markdown
---
sop: frontend-iteration
step: 5_4_impact
status: in_progress
---

## 依赖影响分析

### API 依赖
| API | 状态 |
|-----|------|
| /api/v1/{resource} | 需后端配合 |

### 组件依赖
| 组件 | 引用方式 | 风险等级 |
|------|----------|----------|
| {组件} | axios 调用 | 🔴 高 |

### 建议
- 确认后端 API 可用
- 建议先启动后端服务
```

#### 5.4.4 用户确认

```javascript
AskUserQuestion({
  question: "检测到后端 API 依赖，是否继续？",
  header: "依赖确认",
  options: [
    { label: "继续开发", description: "确认依赖，继续实现" },
    { label: "先启动后端", description: "先确保后端 API 可用" }
  ],
  multiSelect: false
})
```

---

## Step 6: 前端实现 [AUTO]

**执行内容**：
- frontend-design 生成
- code-reviewer 审查

**执行方式**：
```bash
# 使用 skill 工具加载 frontend-design 生成代码
skill(name="frontend-design")

# 使用 code-reviewer agent 进行代码审查
Agent(
  subagent_type="code-reviewer",
  prompt="审查前端代码：检查Vue 3最佳实践、组件复用"
)
```

**生成内容**：
- Vue 3 页面组件
- 组件库集成
- API 调用封装
- 状态管理（Pinia）

---

## Step 7: 启动验证 [AUTO]

> **关键**：使用 TypeScript 脚本启动 + 父 Agent 10秒后检查

**验证命令**：
```bash
# 前端启动（不阻塞）
node .claude/scripts/start-frontend.js {project-dir}/frontend 5173

# 等待 10 秒
sleep(10)

# 页面访问
curl http://localhost:5173

# 停止服务（如需要）
taskkill /F /IM node.exe
```

**验证输出**：
```markdown
---
sop: frontend-iteration
step: 7_verify
status: in_progress
---

## 前端启动验证

### 依赖验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 依赖安装 | npm install | ✅/❌ |

### 启动验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 启动成功 | start-frontend.ts | ✅/❌ |
| 页面可访问 | curl localhost:5173 | ✅/❌ |

### 验证状态
- [ ] 依赖安装失败
- [ ] 启动失败
- [ ] 页面无法访问
- [ ] 全部通过
- [ ] 全部通过
```

**错误处理**：
| 错误 | 处理方式 |
|------|----------|
| 构建失败 | 检查 package.json 依赖 |
| 组件冲突 | 检查已有组件，执行 Step 5 依赖查询 |
| API 调用失败 | 检查后端接口是否已实现 |

---

## Step 8: 知识更新 [AUTO]

**执行内容**：
- 增量更新组件树
- 更新状态文件

**状态文件**：
```json
{
  "sop": "frontend-iteration",
  "task_id": "frontend-{id}",
  "step": "8_complete",
  "components": ["Component1", "Component2"],
  "pages": ["/page1", "/page2"]
}
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 构建失败 | 检查 package.json 依赖 |
| 组件冲突 | 检查已有组件，执行 Step 5 依赖查询 |
| API 调用失败 | 检查后端接口是否已实现 |

---

## 触发命令

```
/sop frontend
```
或描述：
- "前端添加用户管理页面"
- "帮我实现订单列表"
---
