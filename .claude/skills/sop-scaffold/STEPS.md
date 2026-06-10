---
sop: scaffold
step: 1_confirm
status: pending
---

# SOP Scaffold — Execution Steps

## Overview

项目初始化流程，含 10 步：需求确认 → 配置确认 → 调研 → PRD → 架构 → 审核 → 依赖查询 → 并行生成 → 启动验证 → 图谱构建。

---

## Step 1: 需求确认 [CONFIRM_REQUIRED]

**目标**：确认项目基本信息（名称、场景、用户、约束）

**执行内容**：

1. 询问用户：项目名称、核心场景、目标用户、约束条件
2. 保存到状态文件

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 1_confirm in_progress
```

**输出**：项目基本信息 markdown 到 `.sop/output/scaffold-{name}-{date}/01_confirm.md`

---

## Step 2: 配置确认 [CONFIRM_REQUIRED]

**目标**：确认技术栈配置（数据库、前端框架、端口等）

**执行内容**：

1. 使用 AskUserQuestion 让用户选择配置：
   - 默认配置(H2 + Vue3)
   - MySQL + Vue3
   - MySQL + React
   - 自定义配置
2. 如选自定义，逐项确认：数据库、前端框架、后端/前端端口、API路径、Mock数据、Swagger、JWT

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 2_config confirmed
```

**输出**：配置确认表到 `.sop/output/scaffold-{name}-{date}/02_config.md`

---

## Step 3: 需求/技术调研 [AUTO]

**目标**：5 领域 x 2 次并行调研（业务分析、技术调研、安全评估、竞品分析、合规分析）

**执行内容**：

1. 并行调用 5 个调研 Agent
2. 合并调研结果

**输出**：调研报告到 `.sop/output/scaffold-{name}-{date}/03_research.md`

---

## Step 4: 生成 PRD [AUTO]

**目标**：基于调研结果生成 PRD

**执行内容**：

1. Agent 评估后确定 PRD 完整度（完整版/精简版）
2. 生成 PRD 文档

**输出**：PRD 文档到 `.sop/output/scaffold-{name}-{date}/04_prd.md`

---

## Step 5: 架构设计 [AUTO]

**目标**：分层架构、技术选型、数据模型设计

**执行内容**：

1. 设计分层架构（Controller → Service → Repository → Entity）
2. 技术选型确认
3. 数据模型 ER 设计

**输出**：架构设计文档到 `.sop/output/scaffold-{name}-{date}/05_architecture.md`

---

## Step 6: 架构审核 [CONFIRM_REQUIRED]

**目标**：P0/P1/P2 检查点，用户确认

**执行内容**：

1. 展示 P0（安全/数据流）检查项
2. 展示 P1（性能/扩展性）检查项
3. 展示 P2（代码质量）检查项
4. 用户确认通过或要求修改

**输出**：审核通过确认

---

## Step 7: 依赖查询 [AUTO]

**目标**：使用 Graphify 查询依赖冲突

**执行内容**：

1. 检查图谱是否存在 `.sop/dependency-graph/graph.json`
2. 如不存在，询问用户是否构建
3. 如需构建：
   ```bash
   graphify add ./backend ./frontend --out .sop/dependency-graph
   ```

**输出**：依赖分析报告

---

## Step 8: 并行生成 [AUTO]

**目标**：后端 + 前端代码并行生成

**执行内容**：

1. 加载 dr-jskill 生成后端到 `{project}/backend/`
2. 加载 frontend-design 生成前端到 `{project}/frontend/`
3. 并行执行

**输出**：
- 后端：`{project}/backend/` + `pom.xml` + Entity/Repository/Service/Controller
- 前端：`{project}/frontend/` + Vue 3 + Vite + Naive UI

---

## Step 9: 启动验证 [AUTO]

**目标**：验证项目能否正常编译启动

**执行内容**：

1. 后端编译：`cd {project-dir}/backend && mvn clean compile -q`
2. 后端启动：`node .claude/scripts/start-backend.js {project-dir}/backend 8080`
3. 等 10 秒后健康检查：`curl http://localhost:8080/actuator/health`
4. 前端依赖安装：`cd {project-dir}/frontend && npm install`
5. 前端启动：`node .claude/scripts/start-frontend.js {project-dir}/frontend 5173`
6. 验证完成后停止服务

**输出**：验证结果表到 `.sop/output/scaffold-{name}-{date}/09_verify.md`

---

## Step 10: 图谱构建 [AUTO]

**目标**：构建后端/前端独立依赖图谱

**执行内容**：

1. 后端图谱：`graphify update ./{project-dir}/backend --out .sop/dependency-graph/{project}/backend`
2. 前端图谱：`graphify update ./{project-dir}/frontend --out .sop/dependency-graph/{project}/frontend`

**输出目录**：
```
.sop/dependency-graph/{project}/
├── backend/graph.json
├── backend/graph.html
├── frontend/graph.json
└── frontend/graph.html
```

---

## Expected Outputs

| Step | File | Required |
|------|------|----------|
| 1_confirm | `.sop/output/scaffold-{name}-{date}/01_confirm.md` | yes |
| 2_config | `.sop/output/scaffold-{name}-{date}/02_config.md` | yes |
| 3_research | `.sop/output/scaffold-{name}-{date}/03_research.md` | yes |
| 4_prd | `.sop/output/scaffold-{name}-{date}/04_prd.md` | yes |
| 5_architecture | `.sop/output/scaffold-{name}-{date}/05_architecture.md` | yes |
| 9_verify | `.sop/output/scaffold-{name}-{date}/09_verify.md` | yes |
| backend | `{project}/backend/pom.xml` | yes |
| frontend | `{project}/frontend/package.json` | yes |

## State Persistence

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold {step} {status}
```

State file: `.sop/state/scaffold-{id}.json`
