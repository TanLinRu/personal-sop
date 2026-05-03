---
name: sop-scaffold
description: 完整项目初始化流程 - 需求调研→配置确认→PRD→架构→审核→依赖查询→生成→启动验证（含多Agent+Graphify）
version: 3.1.0
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
  checkpoint_dir: .sop/state
  state_file: .sop/state/scaffold-{id}.json

parallel_tasks:
  - name: 业务分析
    description: 业务域建模与实体关系
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 技术调研
    description: 框架对比与技术选型
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 安全评估
    description: 安全合规与认证授权
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
---

# SOP Scaffold v3.0 - 项目初始化流程

## 前后端分离规范

> **强制要求**：所有项目必须遵循前后端分离目录结构

### 目录结构规范

```
{project-name}/
├── backend/              # 后端代码（Spring Boot）
│   ├── src/
│   │   ├── main/java/
│   │   ├── main/resources/
│   │   └── test/
│   ├── pom.xml
│   └── target/
├── frontend/             # 前端代码（Vue/React）
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

### 规范要求

| 要求 | 说明 |
|------|------|
| ✅ 后端代码 | 放在 `{project}/backend/` 目录 |
| ✅ 前端代码 | 放在 `{project}/frontend/` 目录 |
| ❌ 禁止 | 不要将后端代码放在根目录 `src/` |
| ❌ 禁止 | 不要在 `backend/` 内放前端代码 |
| ❌ 禁止 | 不要在 `frontend/` 内放后端代码 |

### 验证检查点

生成后检查目录结构是否符合规范：
```bash
# 检查后端目录存在
Test-Path "{project}/backend/pom.xml"

# 检查前端目录存在
Test-Path "{project}/frontend/package.json"

# 检查后端代码不在根目录
Test-Path "{project}/src/main/java" # 应为 false
```

## 流程

```
需求确认 → 配置确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 并行生成 → 启动验证 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

> 状态管理通过 `.claude/scripts/sop-state-*.ts` 脚本执行，详见 [sop-framework](../skills/sop-framework/SKILL.md)

**执行内容**：
- 项目名称
- 核心场景
- 目标用户
- 约束条件

**持久化**（自动）：
```bash
# 自动保存业务需求到状态文件
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 1_confirm in_progress
```

**输出**：
```markdown
---
sop: scaffold
step: 1_confirm
status: in_progress
---

## 项目基本信息

### 项目名称
-

### 核心场景
-

### 目标用户
-

### 约束条件
-
```

---

## Step 2: 配置确认 [CONFIRM_REQUIRED]

> **关键**：配置确认是生成项目的必要前置步骤

### 执行内容

使用 AskUserQuestion 与用户确认以下配置项：

```javascript
AskUserQuestion({
  question: "请确认项目配置（使用默认配置可快速开始）",
  header: "配置确认",
  options: [
    { label: "默认配置(H2+Vue3)", description: "H2内存数据库 + Vue3 + Naive UI，适合开发验证" },
    { label: "MySQL+Vue3", description: "MySQL数据库 + Vue3，适合生产环境" },
    { label: "MySQL+React", description: "MySQL + React + Tailwind，适合前端技术栈偏好React" },
    { label: "自定义配置", description: "手动配置各项参数" }
  ],
  multiSelect: false
})
```

### 配置项清单

| # | 配置项 | 选项 | 默认值 | 说明 |
|---|--------|------|--------|------|
| 1 | **数据库** | MySQL / H2 / PostgreSQL | H2 | 开发用H2，生产用MySQL |
| 2 | **前端框架** | Vue 3 + Naive UI / React + Tailwind | Vue 3 | 组件库选择 |
| 3 | **后端端口** | 8080 或自定义 | 8080 | Spring Boot端口 |
| 4 | **前端端口** | 3000 或自定义 | 3000 | Vite开发服务器端口 |
| 5 | **API路径** | /api 或自定义 | /api | REST API基础路径 |
| 6 | **Mock数据** | 是 / 否 | 是 | 是否生成示例数据 |
| 7 | **Swagger** | 启用 / 禁用 | 启用 | API文档 |
| 8 | **JWT认证** | 是 / 否 | 是 | 令牌认证 |

### 自定义配置 AskUserQuestion

如果用户选择"自定义配置"：

```javascript
AskUserQuestion({
  question: "请配置各项参数",
  header: "自定义配置",
  options: [
    { label: "数据库", description: "H2 / MySQL / PostgreSQL" },
    { label: "前端框架", description: "Vue3 / React" },
    { label: "后端端口", description: "默认8080" },
    { label: "前端端口", description: "默认3000" },
    { label: "确认配置", description: "确认以上配置并开始生成" }
  ],
  multiSelect: false
})
```

### 配置确认输出

```markdown
---
sop: scaffold
step: 2_config
status: confirmed
---

## 项目配置

| 配置项 | 值 | 说明 |
|--------|---|------|
| 数据库 | H2 | 内存数据库 |
| 前端框架 | Vue 3 + Naive UI | 组合 |
| 后端端口 | 8080 | Spring Boot |
| 前端端口 | 3000 | Vite |
| API路径 | /api | REST基础路径 |
| Mock数据 | 是 | 生成示例数据 |
| Swagger | 启用 | API文档 |
| JWT | 是 | 令牌认证 |
```

---

## Step 3: 需求/技术调研 [AUTO]

5领域 x 2次并行调研：业务分析、技术调研、安全评估、竞品分析、合规分析

---

## Step 4: 生成 PRD [AUTO]

Agent 评估后生成完整/简化 PRD

---

## Step 5: 架构设计 [AUTO]

分层架构、技术选型、数据模型设计

---

## Step 6: 架构审核 [CONFIRM_REQUIRED]

P0/P1/P2 检查点，用户确认

---

## Step 7: 依赖查询 [AUTO]

> 使用 Graphify 查询（替代 context-mode）

### 7.1 检查图谱

检查图谱是否存在：

```bash
Test-Path ".sop/dependency-graph/graph.json"
```

### 7.2 图谱构建/更新确认

> 首次初始化时需要构建图谱

```javascript
AskUserQuestion({
  question: "是否需要构建依赖图谱？（后续 SOP 可增量更新）",
  header: "图谱确认",
  options: [
    { label: "构建图谱", description: "使用 Graphify 构建依赖图" },
    { label: "跳过", description: "跳过本次构建" }
  ],
  multiSelect: false
})
```

### 7.3 Graphify 构建

```bash
# 添加目录构建图谱
graphify add ./backend ./frontend

# 指定输出路径
graphify add ./backend ./frontend --out .sop/dependency-graph
```

---

## Step 8: 并行生成 [AUTO]

> **关键**：后端和前端代码生成必须并行执行
> **目录规范**：后端→`backend/`、前端→`frontend/`

**执行方式**：
1. 先使用 skill 工具加载 dr-jskill
2. 再使用 skill 工具加载 frontend-design
3. 执行生成脚本

```bash
# 1. 加载后端生成 skill
skill(name="dr-jskill")

# 2. 加载前端生成 skill
skill(name="frontend-design")

# 3. 生成后端项目（输出到 backend/）
node scripts/create-project-latest.mjs {project-name} com.{company} {project-name} com.{company}.{app} 21 web

# 4. 创建前端项目（输出到 frontend/）
npm create vite@latest {project-name}/frontend -- --template vue
```

**后端生成 (dr-jskill)**：
1. 使用 `create-project-latest.mjs` 脚本生成 Spring Boot 项目
2. 根据配置生成 pom.xml（数据库驱动、依赖）
3. 生成基础 Entity/DTO/Repository/Service/Controller 脚手架
4. 生成 application.properties / application.yml
5. 生成 Mock 数据（schema.sql + data.sql）
6. **输出到 `{project}/backend/`**

**前端生成 (frontend-design)**：
1. 生成 Vue 3 + Vite 项目结构
2. 配置 axios, vue-router, pinia, Naive UI
3. 生成基础页面组件
4. 配置 Vite 代理到后端 API
5. **输出到 `{project}/frontend/`**

---

## Step 9: 启动验证 [AUTO]

> **关键**：生成后必须验证项目能否正常启动
> **验证方式**：使用 TypeScript 脚本启动 + 父 Agent 10秒后检查

### 执行内容

#### 9.1 后端启动 + 检查

```bash
# 后端启动（不阻塞）
node .claude/scripts/start-backend.js {project-dir}/backend 8080

# 等待 10 秒
sleep(10)

# 健康检查
curl http://localhost:8080/actuator/health

# API 验证
curl http://localhost:8080/api/v1/{resource}
```

#### 9.2 前端启动 + 检查

```bash
# 前端启动（不阻塞）
node .claude/scripts/start-frontend.js {project-dir}/frontend 5173

# 等待 10 秒
sleep(10)

# 页面访问
curl http://localhost:5173
```

#### 9.3 停止服务（验证完成后）

```bash
# Windows
taskkill /F /IM java.exe
taskkill /F /IM node.exe

# Linux/Mac
pkill -f "spring-boot:run"
pkill -f "vite"
```

### 验证输出

```markdown
---
sop: scaffold
step: 9_verify
status: in_progress
---

## 启动验证结果

### 后端验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 编译成功 | mvn clean compile | ✅/❌ |
| 启动成功 | start-backend.ts | ✅/❌ |
| 健康检查 | /actuator/health | ✅/❌ |

### 前端验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 依赖安装 | npm install | ✅/❌ |
| 启动成功 | start-frontend.ts | ✅/❌ |
| 可访问 | curl localhost:5173 | ✅/❌ |

### API验证
| 端点 | 状态 |
|------|------|
| /v1/{resource} | ✅/❌ |

### 验证状态
- [ ] 后端编译失败
- [ ] 后端启动失败
- [ ] 前端启动失败
- [ ] API无法访问
- [ ] 全部通过
```

### 错误处理

| 错误 | 处理方式 |
|------|----------|
| Maven 编译失败 | 检查 pom.xml 依赖配置 |
| 后端启动失败 | 检查 application.properties 数据库配置 |
| npm install 失败 | 检查 package.json 和网络连接 |
| API 无法访问 | 检查后端端口和 CORS 配置 |

### 验证命令速查

```bash
# 一键验证命令
cd {project-dir}

# 后端
mvn clean compile -q && mvn spring-boot:run &

# 前端（另一个终端）
cd frontend && npm install && npm run dev

# API测试
curl http://localhost:8080/api/v1/warehouses
```

---

## Step 10: 图谱构建 [AUTO]

> 构建后端/前端独立图谱，便于后续 SOP 依赖分析

### 10.1 图谱构建

```bash
# 后端图谱
graphify update ./{project-dir}/backend --out .sop/dependency-graph/{project}/backend

# 前端图谱
graphify update ./{project-dir}/frontend --out .sop/dependency-graph/{project}/frontend
```

### 10.2 图谱输出目录

```
.sop/dependency-graph/{project}/
├── backend/
│   ├── graph.json      # 后端图谱
│   ├── graph.html      # 可视化
│   └── GRAPH_REPORT.md
└── frontend/
    ├── graph.json    # 前端图谱
    ├── graph.html     # 可视化
    └── GRAPH_REPORT.md
```

### 10.3 后续 SOP 引用

```bash
# 后端依赖查询
graphify query "哪些模块依赖 {模块}?" --graph .sop/dependency-graph/{project}/backend/graph.json

# 前端依赖查询
graphify query "哪些组件依赖 {组件}?" --graph .sop/dependency-graph/{project}/frontend/graph.json
```

# 增量更新
graphify update ./backend
```

---

## 验证地址速查

| 服务 | 地址 |
|------|------|
| **后端 API** | http://localhost:8080/api |
| **Swagger UI** | http://localhost:8080/api/swagger-ui.html |
| **H2 Console** | http://localhost:8080/api/h2-console |
| **前端** | http://localhost:3000 |

---

## 触发命令

```
/sop scaffold
```
或描述：
- "生成一个新的物流管理系统"
- "创建一个Vue3+Spring Boot项目"
---
