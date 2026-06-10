---
name: sop-fullstack-iteration
description: 前后端需求迭代流程 - PRD生成→依赖分析→API设计→后端实现→前端实现→联调测试（含多Agent并行+Graphify图谱）
version: 2.2.0
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
  checkpoint_dir: .sop/state
  state_file: .sop/state/fullstack-{id}.json

parallel_tasks:
  - name: 业务分析
    description: 业务域建模与实体关系
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 技术调研
    description: 技术选型与架构设计
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 安全评估
    description: 安全合规与认证授权
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: UI设计调研
    description: UI设计与组件库
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 后端生成
    description: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]
    execution_mode: parallel

  - name: 前端生成
    description: 前端代码生成
    agent: frontend-design
    depends_on: [架构审核]
    execution_mode: parallel

aggregation:
  strategy: merge
  output_format: markdown

# RACI per parallel task (R=Responsible 执行, A=Accountable 问责, C=Consulted 咨询, I=Informed 知会)
raci:
  业务分析:        { R: [sop-library-research], A: [build],    C: [java-reviewer], I: [user] }
  技术调研:        { R: [sop-library-research], A: [build],    C: [java-reviewer], I: [user] }
  安全评估:        { R: [sop-library-research], A: [build],    C: [security-reviewer], I: [user] }
  UI设计调研:      { R: [sop-library-research], A: [build],    C: [frontend-design], I: [user] }
  后端生成:        { R: [dr-jskill],            A: [build],    C: [java-reviewer], I: [user] }
  前端生成:        { R: [frontend-design],      A: [build],    C: [code-reviewer],  I: [user] }
  架构审核:        { R: [arch-reviewer],        A: [build],    C: [java-reviewer, frontend-design], I: [user] }
---

# SOP Fullstack Iteration v2.1 - 前后端需求迭代流程

## 前后端分离规范

> **强制要求**：前后端代码必须分别放在 `backend/` 和 `frontend/` 目录

### 目录结构规范

```
{project}/
├── backend/              # ✅ 后端代码（Spring Boot）
│   ├── src/
│   │   ├── main/java/
│   │   ├── main/resources/
│   │   └── test/
│   ├── pom.xml
│   └── target/
├── frontend/             # ✅ 前端代码（Vue/React）
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

### 前后端分离要求

| 端 | 目录 | 包含内容 |
|---|------|----------|
| 后端 | `{project}/backend/` | pom.xml, src/, target/ |
| 前端 | `{project}/frontend/` | package.json, src/, node_modules/ |

### 禁止事项

- ❌ 后端代码不要放在根目录 `src/`
- ❌ 前端代码不要放在 `backend/` 内
- ❌ 后端代码不要放在 `frontend/` 内

### 生成验证

```bash
# 验证后端目录
Test-Path "{project}/backend/pom.xml"    # 应为 true
Test-Path "{project}/backend/src"         # 应为 true

# 验证前端目录
Test-Path "{project}/frontend/package.json" # 应为 true
Test-Path "{project}/frontend/src"         # 应为 true

# 验证无混搭
Test-Path "{project}/src/main/java"       # 应为 false（后端不在根目录）
Test-Path "{project}/frontend/pom.xml"    # 应为 false（前端无pom）
Test-Path "{project}/backend/package.json" # 应为 false（后端无package.json）
```

## 流程

```
需求确认 → 需求/技术调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 并行生成 → 联调测试 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

> 状态管理通过 `.claude/scripts/sop-state-*.ts` 脚本执行，详见 [sop-framework](../skills/sop-framework/SKILL.md)

**执行内容**：
- 后端接口需求
- 前端页面需求
- 联调验收标准

**持久化**（自动）：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack-iteration 1_confirm in_progress
```

**输出**：
```markdown
---
sop: fullstack-iteration
step: 1_confirm
status: in_progress
---

## 需求确认

### 后端需求
| 接口 | 方法 | 说明 |
|------|------|------|
|      |      |      |

### 前端需求
| 页面 | 功能 |
|------|------|
|      |      |
```

---

## Step 2: 需求/技术调研 [AUTO]

**执行内容**：
5领域 x 2次并行调研：业务分析、技术调研、安全评估、UI设计、性能评估

**执行方式**：
使用 skill 工具加载 sop-library-research 进行调研

```bash
# 加载技术调研 skill
skill(name="sop-library-research")
```

---

## Step 3: 生成 PRD [AUTO]

**执行内容**：
全栈功能通常需要完整 PRD

---

## Step 4: 架构设计 [AUTO]

**执行内容**：
- 后端分层架构
- 前端架构
- 接口契约设计

**输出**：
```markdown
---
sop: fullstack-iteration
step: 4_arch
status: in_progress
---

## 架构设计

### 后端架构
| 层级 | 组件 |
|------|------|
| API | Controller |
| 业务 | Service |
| 数据 | Repository |

### 前端架构
| 层级 | 技术 |
|------|------|
| 视图 | Vue 3 |
| 状态 | Pinia |
| 请求 | Axios |

### 接口契约
| 接口 | 路径 | 请求 | 响应 |
|------|------|------|------|
|      |      |      |      |
```

---

## Step 5: 架构审核 [CONFIRM_REQUIRED]

**执行内容**：
P0/P1/P2 检查点，用户确认

**检查清单**：
| 级别 | 检查项 | 说明 |
|------|-------|------|
| P0 | API设计符合RESTful规范 | 路径、方法正确 |
| P0 | 前后端接口契约一致 | 请求/响应格式匹配 |
| P1 | 事务边界清晰 | 事务范围明确 |
| P1 | 异常处理完善 | 有全局异常处理 |
| P2 | 代码规范一致 | 符合项目规范 |

---

## Step 6: 依赖查询 [AUTO]

> 使用 Graphify 查询（替代 context-mode）+ 业务依赖分析

### 6.1 检查图谱

检查图谱是否存在：

```bash
Test-Path ".sop/dependency-graph/graph.json"
```

### 6.2 图谱更新确认

> 增量更新已有依赖图，需用户确认

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

### 6.3 Graphify 查询

```bash
# ===== 后端图谱（强制分开）=====
graphify update ./backend --out .sop/dependency-graph/{project}/backend

# ===== 前端图谱（强制分开）=====
graphify update ./frontend --out .sop/dependency-graph/{project}/frontend
```

### 6.4 业务依赖分析

> 从 PRD（sop-prd 生成）读取业务依赖，分析新功能与已上线模块的业务关联

#### 读取 PRD 业务依赖

检查是否存在 PRD 文档，读取业务依赖章节：

```bash
Glob(pattern=".sop/output/prd-*.md")
```

#### 业务依赖检测结果

| 新模块 | 已上线模块 | 依赖类型 | 风险等级 | 处理方案 |
|--------|------------|----------|----------|----------|
| {新模块} | 模块A | 服务调用 | 中 | 确认后继续 |
| {新模块} | 模块B | 无 | - | - |

#### 风险提示

```javascript
AskUserQuestion({
  question: "检测到业务依赖风险，是否继续？",
  header: "业务依赖",
  options: [
    { label: "继续开发", description: "独立实现，后续联调" },
    { label: "合并开发", description: "与关联模块一起迭代" },
    { label: "取消", description: "先处理依赖模块" }
  ],
  multiSelect: false
})
```

### 6.5 边界场景分析

> 分析特殊依赖场景，提前识别风险

#### 6.5.1 循环依赖检测

**场景**：A → B → A

**命令**：
```bash
graphify query "A 和 B 的循环依赖?" --graph .sop/dependency-graph/graph.json
```

**风险等级**：🔴 极高

#### 6.5.2 传递依赖检测

**场景**：A → B → C（修改 A 影响 C）

**命令**：
```bash
graphify query "A 的完整依赖链?" --graph .sop/dependency-graph/graph.json
```

**风险等级**：🔴 高

#### 6.5.3 共用依赖检测

**场景**：多个模块引用同一个 Service/Mapper

**命令**：
```bash
# 搜索引用同一 Mapper 的 Service
grep -r "CustomerMapper" --include="*Service.java"
```

**风险等级**：🟡 中

#### 6.5.4 边界场景报告

```markdown
## 边界场景分析

### 循环依赖
- 检测结果: 无 / 有
- 影响: 可能导致StackOverflow

### 传递依赖
- 层级: N 层
- 影响范围: 模块数量

### 共用依赖
- 被引用次数: N
- 影响模块: [模块列表]
```

---

## Step 7: 并行生成 [AUTO]

> **关键**：后端和前端代码生成必须并行执行

**并行执行方式**：
```python
# 使用 task 工具并行调用生成任务
Agent(
  subagent_type="dr-jskill",
  prompt="生成后端项目: {project-name}, {group-id}, Spring Boot 3 + MySQL + MyBatis-Plus"
)

Agent(
  subagent_type="frontend-design",
  prompt="创建前端项目: {project-name}/frontend, Vue 3 + Vite"
)
```

**生成内容**：
- 后端：Entity、DTO、Repository、Service、Controller
- 前端：页面组件、API调用封装、路由配置

---

## Step 8: 联调验证 [AUTO]

> **关键**：使用 TypeScript 脚本启动 + 父 Agent 10秒后检查

**验证命令**：
```bash
# 后端启动（不阻塞）
node .claude/scripts/start-backend.js {project-dir}/backend 8080

# 等待 10 秒
sleep(10)

# 前端启动（不阻塞）
node .claude/scripts/start-frontend.js {project-dir}/frontend 5173

# 等待 10 秒
sleep(10)

# 后端健康检查
curl http://localhost:8080/actuator/health

# API 验证
curl http://localhost:8080/api/v1/{resource}

# 前端页面访问
curl http://localhost:5173

# 停止服务（如需要）
taskkill /F /IM java.exe
taskkill /F /IM node.exe
```

**验证输出**：
```markdown
---
sop: fullstack-iteration
step: 8_verify
status: in_progress
---

## 联调验证结果

### 后端验证
| 检查项 | 状态 |
|--------|------|
| 编译成功 | ✅/❌ |
| 启动成功 | ✅/❌ |
| API可用 | ✅/❌ |

### 前端验证
| 检查项 | 状态 |
|--------|------|
| 依赖安装 | ✅/❌ |
| 启动成功 | ✅/❌ |
| 页面可访问 | ✅/❌ |

### 联调验证
| 场景 | 状态 |
|------|------|
| {功能}列表加载 | ✅/❌ |
| {功能}新增 | ✅/❌ |

### 验证状态
- [ ] 编译失败
- [ ] 启动失败
- [ ] API无法访问
- [ ] 联调失败
- [ ] 全部通过
```

---

## Step 9: 知识更新 [AUTO]

**执行内容**：
graphify update ./backend --out .sop/dependency-graph/{project}/backend
graphify update ./frontend --out .sop/dependency-graph/{project}/frontend

**状态文件**：
```json
{
  "sop": "fullstack-iteration",
  "task_id": "fullstack-{id}",
  "step": "9_complete",
  "entities": [],
  "apis": [],
  "components": [],
  "pages": []
}
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 编译失败 | 检查依赖配置 |
| 联调失败 | 检查接口契约是否一致 |
| 前后端不同步 | 以接口契约为准 |

---

## 触发命令

```
/sop fullstack
```
或描述：
- "添加用户管理功能"
- "实现订单模块"
---