# SOP 执行框架文档（回归测试用）

> 当 SOP Skill 变更时，基于本文档执行全流程验证

---

## 一、环境配置

| 配置项 | 值 | 说明 |
|--------|---|------|
| JDK | D:\software\jdk-21.0.8 | JDK 21 |
| Maven Settings | D:\mvn\setting.xml | Maven 配置 |
| Maven Repository | D:\mvn\repository | 本地仓库 |
| Node.js | 24.x | 前端工具 |
| Graphify | graphifyy | 知识图谱 |
| 后端端口 | 8080 | Spring Boot |
| 前端端口 | 5173 | Vite |
| API 路径 | /api | REST API |

---

## 二、通用工具

### 2.1 Task State 管理

> SOP 执行时的状态保存、断点恢复、完成后清理

#### 命令速查

```bash
# ===== 状态保存 =====
# 步骤开始
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts <sop> <step> in_progress key=value

# 步骤完成
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts <sop> <step> completed

# 示例
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 1_confirm in_progress project=myapp
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 1_confirm completed

# ===== 状态加载（断点恢复）=====
# 查看所有进行中的状态
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --list

# 查看特定 SOP 状态
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts scaffold

# ===== 状态清理 =====
# 清理完成状态
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts

# 清理特定 SOP
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts scaffold

# 清理所有状态
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts --all
```

---

### 2.2 Graph 依赖分析

> 基于 Graphify 的依赖分析，检测正常和异常场景

#### 图谱构建

```bash
# 构建后端依赖图谱
graphify add ./backend/src --out .sop/dependency-graph/{project}/backend

# 构建前端依赖图谱
graphify add ./frontend/src --out .sop/dependency-graph/{project}/frontend
```

#### 依赖查询

```bash
# 查询依赖（正常路径）
graphify query "哪些模块依赖 {模块}?" --graph .sop/dependency-graph/{project}/backend/graph.json
graphify query "{Controller} 依赖哪些服务?" --graph .sop/dependency-graph/{project}/backend/graph.json
```

#### 风险检测

```bash
# 循环依赖检测（高风险）
graphify query "A 和 B 有循环依赖?" --graph .sop/dependency-graph/{project}/backend/graph.json

# 缺失依赖检测（高风险）
graphify query "哪些 Service 没被任何 Controller 调用?" --graph .sop/dependency-graph/{project}/backend/graph.json

# 孤岛代码检测（中等风险）
graphify query "哪些 Entity 没有任何 Repository?" --graph .sop/dependency-graph/{project}/backend/graph.json
```

#### 风险等级划分

| 风险类型 | 检测场景 | 风险等级 | 处理 |
|----------|----------|----------|------|
| 循环依赖 | A → B → A | 🔴 高 | 立即修复 |
| 缺失依赖 | Service 无调用方 | 🔴 高 | 确认业务 |
| 孤岛代码 | Entity 无 Repository | 🟡 中 | 确认是否需要 |
| 传递依赖 | A → B → C | 🟡 中 | 评估影响 |
| 共用依赖 | 多个 Service 依赖同一 Mapper | 🟢 低 | 记录即可 |

---

## 三、SOP 验证索引

| # | SOP | 触发命令 | 步骤数 | 状态 |
|---|-----|---------|--------|------|
| 1 | **sop-scaffold** | `/sop scaffold {场景}` | 10 | 待验证 |
| 2 | **sop-fullstack-iteration** | `/sop fullstack {功能}` | 9 | 待验证 |
| 3 | **sop-backend-iteration** | `/sop backend {功能}` | 9 | 待验证 |
| 4 | **sop-frontend-iteration** | `/sop frontend {功能}` | 8 | 待验证 |
| 5 | **sop-code-review** | `/sop code-review {模块}` | 4 | 待验证 |
| 6 | **sop-testing** | `/sop testing` | 4 | 待验证 |

---

## 四、sop-scaffold 验证（项目初始化）

### 4.1 执行流程

```
Step 1: 需求确认 [CONFIRM_REQUIRED]
Step 2: 配置确认 [CONFIRM_REQUIRED]
Step 3: 需求/技术调研 [AUTO]
Step 4: PRD生成 [AUTO]
Step 5: 架构设计 [AUTO]
Step 6: 架构审核 [CONFIRM_REQUIRED]
Step 7: 依赖查询 [AUTO]
Step 8: 并行生成 [AUTO]
Step 9: 启动验证 [AUTO]
Step 10: 知识更新 [AUTO]
```

### 4.2 Step 详细说明

#### Step 1: 需求确认 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | 用户输入 `/sop scaffold {场景}` |
| **输入** | 项目名称、核心场景、目标用户、约束条件 |
| **行为** | AskUserQuestion 询问用户需求 |
| **输出** | 状态文件 `.sop/state/scaffold-{id}.json` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 1_confirm in_progress project=xxx` |

**AskUserQuestion 示例**：
```javascript
AskUserQuestion({
  question: "请描述项目需求",
  header: "需求确认",
  options: [
    { label: "项目名称", description: "输入项目名称" },
    { label: "核心场景", description: "如：电商订单管理" },
    { label: "目标用户", description: "如：运营人员" },
    { label: "约束条件", description: "如：预算有限" }
  ],
  multiSelect: false
})
```

#### Step 2: 配置确认 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | Step 1 完成 |
| **输入** | 数据库、前端框架、端口等配置 |
| **行为** | AskUserQuestion 确认配置 |
| **输出** | 配置保存到状态文件 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 2_config in_progress database=H2` |

**配置项清单**：

| # | 配置项 | 选项 | 默认值 | 说明 |
|---|--------|------|--------|------|
| 1 | 数据库 | H2 / MySQL / PostgreSQL | H2 | 开发用H2，生产用MySQL |
| 2 | 前端框架 | Vue 3 + Naive UI / React + Tailwind | Vue 3 | 组件库选择 |
| 3 | 后端端口 | 8080 或自定义 | 8080 | Spring Boot端口 |
| 4 | 前端端口 | 5173 或自定义 | 5173 | Vite开发服务器端口 |
| 5 | API路径 | /api 或自定义 | /api | REST API基础路径 |
| 6 | Mock数据 | 是 / 否 | 是 | 是否生成示例数据 |
| 7 | Swagger | 启用 / 禁用 | 启用 | API文档 |
| 8 | JWT认证 | 是 / 否 | 是 | 令牌认证 |

#### Step 3: 需求/技术调研 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 2 完成 |
| **输入** | 项目需求文档 |
| **行为** | 5领域并行调研：业务分析、技术调研、安全评估、竞品分析、合规分析 |
| **输出** | 调研报告 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 3_research completed` |

#### Step 4: PRD生成 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 3 完成 |
| **输入** | 调研报告 |
| **行为** | 生成产品需求文档 |
| **输出** | `.sop/output/prd-{name}-{date}.md` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 4_prd completed` |

#### Step 5: 架构设计 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 4 完成 |
| **输入** | PRD 文档 |
| **行为** | 分层架构、技术选型、数据模型设计 |
| **输出** | 架构设计文档 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 5_arch completed` |

#### Step 6: 架构审核 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | Step 5 完成 |
| **输入** | 架构设计文档 |
| **行为** | P0/P1/P2 检查点，用户确认 |
| **输出** | 审核结果 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 6_review in_progress` |

**审核检查清单**：

| 级别 | 检查项 | 说明 |
|------|--------|------|
| P0 | API设计符合RESTful规范 | 路径、方法正确 |
| P0 | 数据模型完整 | Entity/DTO字段齐全 |
| P1 | 事务边界清晰 | 事务范围明确 |
| P1 | 异常处理完善 | 有全局异常处理 |
| P2 | 代码规范一致 | 符合项目规范 |

#### Step 7: 依赖查询 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 6 完成 |
| **输入** | 现有项目代码 |
| **行为** | Graphify 图谱构建和查询 |
| **输出** | 依赖分析报告 |
| **验证命令** | `graphify add ./backend ./frontend --out .sop/dependency-graph/{project}` |

#### Step 8: 并行生成 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 7 完成 |
| **输入** | 架构设计 + 配置 |
| **行为** | 后端 + 前端并行生成 |
| **输出** | 项目代码到 `backend/` 和 `frontend/` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts scaffold 8_generate completed` |

**生成命令**：
```bash
# 后端生成
node .claude/skills/dr-jskill/scripts/create-project-latest.mjs {project} com.{company} {project} com.{company}.{app} 21 web

# 前端生成
npm create vite@latest {project}/frontend -- --template vue
```

#### Step 9: 启动验证 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 8 完成 |
| **输入** | 生成的项目代码 |
| **行为** | 编译、启动、健康检查 |
| **输出** | 验证结果 |
| **验证命令** | 见下方验证命令 |

**验证命令**：

```bash
# ===== 后端验证 =====
# 编译
cd {project}/backend
mvn clean compile -q

# 启动（后台）
mvn spring-boot:run &
sleep 30

# 健康检查
curl http://localhost:8080/actuator/health

# API 验证
curl http://localhost:8080/api/v1/{resource}

# 停止
taskkill /F /IM java.exe

# ===== 前端验证 =====
cd {project}/frontend
npm install
npm run build
npm run dev &
sleep 10

# 页面验证
curl http://localhost:5173

# 停止
taskkill /F /IM node.exe
```

#### Step 10: 知识更新 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 9 完成 |
| **输入** | 生成的项目代码 |
| **行为** | Graphify 图谱增量更新 |
| **输出** | 更新后的图谱文件 |
| **验证命令** | `graphify update ./backend --out .sop/dependency-graph/{project}/backend` |

### 4.3 验证结果记录

> 实际执行：外卖人员管理系统（delivery-staff），执行日期 2026-04-26

| 执行日期 | Step | 输入 | 输出 | 状态 | 备注 |
|---------|------|------|------|------|------|
| 2026-04-26 | 1_confirm | ✅ | ✅ | ✅ | AskUserQuestion 正常 |
| 2026-04-26 | 2_config | ✅ | ✅ | ✅ | H2+Vue3 配置确认 |
| 2026-04-26 | 3_research | ✅ | ✅ | ✅ | 5领域并行调研 |
| 2026-04-26 | 4_prd | ✅ | ✅ | ✅ | PRD已生成 |
| 2026-04-26 | 5_arch | ✅ | ✅ | ✅ | 分层架构完成 |
| 2026-04-26 | 6_review | ✅ | ✅ | ✅ | 审核通过 |
| 2026-04-26 | 7_dependency | ✅ | ✅ | ✅ | graphify图谱: 11 nodes |
| 2026-04-26 | 8_generate | ✅ | ✅ | ✅ | 后端Spring Boot 3.5.14 |
| 2026-04-26 | 9_verify | ✅ | ✅ | ⚠️ | 后端健康✅ 前端启动受限 |
| 2026-04-26 | 10_knowledge | ✅ | ✅ | ✅ | 图谱已更新 |

---

## 五、sop-fullstack-iteration 验证（功能迭代）

### 5.1 执行流程

```
Step 1: 需求确认 [CONFIRM_REQUIRED]
Step 2: 需求/技术调研 [AUTO]
Step 3: 生成 PRD [AUTO]
Step 4: 架构设计 [AUTO]
Step 5: 架构审核 [CONFIRM_REQUIRED]
Step 6: 依赖查询 [AUTO]
Step 7: 并行生成 [AUTO]
Step 8: 联调验证 [AUTO]
Step 9: 知识更新 [AUTO]
```

### 5.2 Step 详细说明

#### Step 1: 需求确认 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | 用户输入 `/sop fullstack {功能}` |
| **输入** | 功能名称、接口需求、前端页面需求 |
| **行为** | AskUserQuestion 询问需求 |
| **输出** | 状态文件 `.sop/state/fullstack-{id}.json` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack 1_confirm in_progress feature=xxx` |

#### Step 2: 需求/技术调研 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 1 完成 |
| **输入** | 功能需求 |
| **行为** | 5领域并行调研 |
| **输出** | 调研报告 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack 2_research completed` |

#### Step 3: 生成 PRD [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 2 完成 |
| **输入** | 调研报告 |
| **行为** | 生成功能 PRD |
| **输出** | `.sop/output/prd-{name}-{date}.md` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack 3_prd completed` |

#### Step 4: 架构设计 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 3 完成 |
| **输入** | PRD 文档 |
| **行为** | 后端分层架构、前端架构、接口契约设计 |
| **输出** | 架构设计文档 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack 4_arch completed` |

#### Step 5: 架构审核 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | Step 4 完成 |
| **输入** | 架构设计文档 |
| **行为** | P0/P1/P2 检查点，用户确认 |
| **输出** | 审核结果 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack 5_review in_progress` |

#### Step 6: 依赖查询 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 5 完成 |
| **输入** | 现有项目代码 |
| **行为** | Graphify 图谱查询 + 业务依赖分析 |
| **输出** | 依赖分析报告 |
| **验证命令** | `graphify query "哪些模块依赖 {新模块}?" --graph .sop/dependency-graph/{project}/backend/graph.json` |

#### Step 7: 并行生成 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 6 完成 |
| **输入** | 架构设计 + 接口契约 |
| **行为** | 后端 + 前端并行生成 |
| **输出** | 更新的项目代码 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts fullstack 7_generate completed` |

#### Step 8: 联调验证 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 7 完成 |
| **输入** | 生成的前后端代码 |
| **行为** | 启动服务、API联调、数据流验证 |
| **输出** | 联调验证结果 |
| **验证命令** | 见下方联调验证命令 |

**联调验证命令**：

```bash
# ===== 后端启动 =====
cd {project}/backend
mvn spring-boot:run &
sleep 30

# ===== 前端启动 =====
cd {project}/frontend
npm run dev &
sleep 10

# ===== API 验证 =====
curl http://localhost:8080/api/v1/{resource}
curl -X POST http://localhost:8080/api/v1/{resource} -H "Content-Type: application/json" -d '{...}'

# ===== 前端验证 =====
curl http://localhost:5173

# ===== 停止 =====
taskkill /F /IM java.exe
taskkill /F /IM node.exe
```

#### Step 9: 知识更新 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 8 完成 |
| **输入** | 更新的项目代码 |
| **行为** | Graphify 图谱增量更新 |
| **输出** | 更新后的图谱文件 |
| **验证命令** | `graphify update ./backend --out .sop/dependency-graph/{project}/backend` |

### 5.3 验证结果记录

| 执行日期 | Step | 输入 | 输出 | 状态 | 备注 |
|---------|------|------|------|------|------|
| | 1_confirm | | | ⏳ | |
| | 2_research | | | ⏳ | |
| | 3_prd | | | ⏳ | |
| | 4_arch | | | ⏳ | |
| | 5_review | | | ⏳ | |
| | 6_dependency | | | ⏳ | |
| | 7_generate | | | ⏳ | |
| | 8_verify | | | ⏳ | |
| | 9_knowledge | | | ⏳ | |

---

## 六、sop-backend-iteration 验证（后端迭代）

### 6.1 执行流程

```
Step 1: 需求确认 [CONFIRM_REQUIRED]
Step 2: 需求/技术调研 [AUTO]
Step 3: 生成/引用 PRD [AUTO]
Step 4: 架构设计 [AUTO]
Step 5: 架构审核 [CONFIRM_REQUIRED]
Step 6: 依赖查询 [AUTO]
Step 7: 后端实现 [AUTO]
Step 8: 启动验证 [AUTO]
Step 9: 知识更新 [AUTO]
```

### 6.2 Step 详细说明

#### Step 1: 需求确认 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | 用户输入 `/sop backend {功能}` |
| **输入** | 功能名称、接口需求、数据模型要求 |
| **行为** | AskUserQuestion 询问需求 |
| **输出** | 状态文件 `.sop/state/backend-{id}.json` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend 1_confirm in_progress feature=xxx` |

#### Step 2: 需求/技术调研 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 1 完成 |
| **输入** | 功能需求 |
| **行为** | API设计调研、技术选型调研、安全合规调研 |
| **输出** | 调研报告 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend 2_research completed` |

#### Step 3: 生成/引用 PRD [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 2 完成 |
| **输入** | 调研报告 |
| **行为** | 引用已有 PRD 或生成简化功能 PRD |
| **输出** | PRD 文档引用 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend 3_prd completed` |

#### Step 4: 架构设计 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 3 完成 |
| **输入** | PRD 文档 |
| **行为** | API结构设计、数据模型设计、事务边界设计 |
| **输出** | 架构设计文档 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend 4_arch completed` |

#### Step 5: 架构审核 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | Step 4 完成 |
| **输入** | 架构设计文档 |
| **行为** | P0/P1/P2 检查点，用户确认 |
| **输出** | 审核结果 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend 5_review in_progress` |

**审核检查清单**：

| 级别 | 检查项 | 说明 |
|------|--------|------|
| P0 | API设计符合RESTful规范 | 路径、方法正确 |
| P0 | 数据模型完整 | Entity/DTO字段齐全 |
| P1 | 事务边界清晰 | 事务范围明确 |
| P1 | 异常处理完善 | 有全局异常处理 |
| P2 | 代码规范一致 | 符合项目规范 |

#### Step 6: 依赖查询 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 5 完成 |
| **输入** | 现有项目代码 |
| **行为** | Graphify 图谱查询 + 依赖影响分析 |
| **输出** | 依赖分析报告 |
| **验证命令** | `graphify query "哪些模块依赖 {新模块}?" --graph .sop/dependency-graph/{project}/backend/graph.json` |

#### Step 7: 后端实现 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 6 完成 |
| **输入** | 架构设计 |
| **行为** | dr-jskill 生成 Entity/DTO/Repository/Service/Controller |
| **输出** | 后端代码 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend 7_implement completed` |

#### Step 8: 启动验证 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 7 完成 |
| **输入** | 后端代码 |
| **行为** | 编译、启动、API测试 |
| **输出** | 验证结果 |
| **验证命令** | 见下方验证命令 |

**验证命令**：

```bash
# 编译
cd {project}/backend
mvn clean compile -q

# 启动
mvn spring-boot:run &
sleep 30

# 健康检查
curl http://localhost:8080/actuator/health

# API 测试
curl http://localhost:8080/api/v1/{resource}
curl -X POST http://localhost:8080/api/v1/{resource} -H "Content-Type: application/json" -d '{...}'

# 停止
taskkill /F /IM java.exe
```

#### Step 9: 知识更新 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 8 完成 |
| **输入** | 更新的后端代码 |
| **行为** | Graphify 图谱增量更新 |
| **输出** | 更新后的图谱文件 |
| **验证命令** | `graphify update ./backend --out .sop/dependency-graph/{project}/backend` |

### 6.3 验证结果记录

| 执行日期 | Step | 输入 | 输出 | 状态 | 备注 |
|---------|------|------|------|------|------|
| | 1_confirm | | | ⏳ | |
| | 2_research | | | ⏳ | |
| | 3_prd | | | ⏳ | |
| | 4_arch | | | ⏳ | |
| | 5_review | | | ⏳ | |
| | 6_dependency | | | ⏳ | |
| | 7_implement | | | ⏳ | |
| | 8_verify | | | ⏳ | |
| | 9_knowledge | | | ⏳ | |

---

## 七、sop-frontend-iteration 验证（前端迭代）

### 7.1 执行流程

```
Step 1: 需求确认 [CONFIRM_REQUIRED]
Step 2: UI/UX调研 [AUTO]
Step 3: 组件设计 [AUTO]
Step 4: 设计审核 [CONFIRM_REQUIRED]
Step 5: 依赖查询 [AUTO]
Step 6: 前端实现 [AUTO]
Step 7: 启动验证 [AUTO]
Step 8: 知识更新 [AUTO]
```

### 7.2 Step 详细说明

#### Step 1: 需求确认 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | 用户输入 `/sop frontend {功能}` |
| **输入** | 页面需求、组件需求、设计风格 |
| **行为** | AskUserQuestion 询问需求 |
| **输出** | 状态文件 `.sop/state/frontend-{id}.json` |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts frontend 1_confirm in_progress feature=xxx` |

#### Step 2: UI/UX调研 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 1 完成 |
| **输入** | 页面需求 |
| **行为** | UI设计调研、组件库调研 |
| **输出** | 调研报告 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts frontend 2_research completed` |

#### Step 3: 组件设计 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 2 完成 |
| **输入** | 调研报告 |
| **行为** | 组件树结构、状态管理设计、路由设计 |
| **输出** | 组件设计文档 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts frontend 3_design completed` |

#### Step 4: 设计审核 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | Step 3 完成 |
| **输入** | 组件设计文档 |
| **行为** | P0/P1 检查点，用户确认 |
| **输出** | 审核结果 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts frontend 4_review in_progress` |

**审核检查清单**：

| 级别 | 检查项 | 说明 |
|------|--------|------|
| P0 | 组件结构合理 | 符合单一职责 |
| P0 | 状态管理清晰 | 数据流可追溯 |
| P1 | 路由设计规范 | RESTful 路径 |
| P1 | 响应式适配 | 移动端兼容 |

#### Step 5: 依赖查询 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 4 完成 |
| **输入** | 现有前端代码 |
| **行为** | Graphify 图谱查询 + API依赖分析 |
| **输出** | 依赖分析报告 |
| **验证命令** | `graphify query "{API模块} 相关?" --graph .sop/dependency-graph/{project}/frontend/graph.json` |

#### Step 6: 前端实现 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 5 完成 |
| **输入** | 组件设计 |
| **行为** | frontend-design 生成页面/组件、API调用封装、状态管理 |
| **输出** | 前端代码 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts frontend 6_implement completed` |

#### Step 7: 启动验证 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 6 完成 |
| **输入** | 前端代码 |
| **行为** | 安装依赖、启动、页面访问测试 |
| **输出** | 验证结果 |
| **验证命令** | 见下方验证命令 |

**验证命令**：

```bash
# 安装依赖
cd {project}/frontend
npm install

# 启动
npm run dev &
sleep 10

# 页面验证
curl http://localhost:5173

# 停止
taskkill /F /IM node.exe
```

#### Step 8: 知识更新 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 7 完成 |
| **输入** | 更新的前端代码 |
| **行为** | Graphify 图谱增量更新 |
| **输出** | 更新后的图谱文件 |
| **验证命令** | `graphify update ./frontend --out .sop/dependency-graph/{project}/frontend` |

### 7.3 验证结果记录

| 执行日期 | Step | 输入 | 输出 | 状态 | 备注 |
|---------|------|------|------|------|------|
| | 1_confirm | | | ⏳ | |
| | 2_research | | | ⏳ | |
| | 3_design | | | ⏳ | |
| | 4_review | | | ⏳ | |
| | 5_dependency | | | ⏳ | |
| | 6_implement | | | ⏳ | |
| | 7_verify | | | ⏳ | |
| | 8_knowledge | | | ⏳ | |

---

## 八、sop-code-review 验证（代码审查）

### 8.1 执行流程

```
Step 1: 理解变更 [CONFIRM_REQUIRED]
Step 2: 并行审查 [AUTO]
Step 3: 运行测试 [AUTO]
Step 4: 反馈 [CONFIRM_REQUIRED]
```

### 8.2 Step 详细说明

#### Step 1: 理解变更 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | 用户输入 `/sop code-review {模块}` |
| **输入** | PR/Commit 信息、变更文件列表 |
| **行为** | 阅读变更内容、理解业务逻辑和影响范围 |
| **输出** | 变更概述文档 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts codereview 1_understand in_progress module=xxx` |

#### Step 2: 并行审查 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 1 完成 |
| **输入** | 变更文件 |
| **行为** | 3个 Agent 并行审查（格式、安全、性能） |
| **输出** | 审查报告 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts codereview 2_review completed` |

**并行审查 Agent**：

| Agent | 检查内容 |
|-------|----------|
| code-reviewer | 格式检查：缩进、命名、导入排序、Lombok规范 |
| security-reviewer | 安全扫描：SQL注入、XSS、权限、硬编码密码 |
| java-reviewer | 性能分析：事务管理、readOnly、异常处理 |

#### Step 3: 运行测试 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 2 完成 |
| **输入** | 变更代码 |
| **行为** | 运行单元测试、集成测试 |
| **输出** | 测试结果 |
| **验证命令** | `mvn test -Dtest={TestClass}` |

#### Step 4: 反馈 [CONFIRM_REQUIRED]

| 项目 | 内容 |
|------|------|
| **触发** | Step 3 完成 |
| **输入** | 审查报告 + 测试结果 |
| **行为** | 汇总反馈、按严重程度分类 |
| **输出** | 最终审查意见 |
| **验证命令** | `npx ts-node --transpile-only .claude/scripts/sop-state-save.ts codereview 4_feedback completed` |

### 8.3 验证结果记录

> 实际执行：delivery-staff 初始代码审查，执行日期 2026-04-26

| 执行日期 | Step | 输入 | 输出 | 状态 | 备注 |
|---------|------|------|------|------|------|
| 2026-04-26 | 1_understand | ✅ | ✅ | ✅ | 2个Java文件+1个JS配置 |
| 2026-04-26 | 2_review | ✅ | ✅ | ✅ | 2个MEDIUM非阻塞 |
| 2026-04-26 | 3_test | ✅ | ✅ | ✅ | mvn test 通过 |
| 2026-04-26 | 4_feedback | ✅ | ✅ | ✅ | 批准合并 |

---

## 九、sop-testing 验证（测试执行）

### 9.1 执行流程

```
Step 1: 单元测试 [AUTO]
Step 2: 集成测试 [AUTO]
Step 3: 端到端测试 [AUTO]
Step 4: 性能测试 [AUTO]
```

### 9.2 Step 详细说明

#### Step 1: 单元测试 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | 用户输入 `/sop testing` |
| **输入** | 项目代码 |
| **行为** | 运行单元测试、检查覆盖率 |
| **输出** | 单元测试报告 |
| **验证命令** | `mvn test` |

#### Step 2: 集成测试 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 1 完成 |
| **输入** | 项目代码 + 测试数据库 |
| **行为** | 运行集成测试、验证数据流转 |
| **输出** | 集成测试报告 |
| **验证命令** | `mvn verify` |

#### Step 3: 端到端测试 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 2 完成 |
| **输入** | 完整服务 |
| **行为** | 运行 E2E 测试、模拟用户操作 |
| **输出** | E2E 测试报告 |
| **验证命令** | `npx playwright test` 或 `npx cypress run` |

#### Step 4: 性能测试 [AUTO]

| 项目 | 内容 |
|------|------|
| **触发** | Step 3 完成 |
| **输入** | 部署的服务 |
| **行为** | 运行压测、分析性能指标 |
| **输出** | 性能测试报告 |
| **验证命令** | `k6 run test.js` 或 `jmeter -n -t test.jmx` |

### 9.3 验证结果记录

| 执行日期 | Step | 输入 | 输出 | 状态 | 备注 |
|---------|------|------|------|------|------|
| | 1_unit | | | ⏳ | |
| | 2_integration | | | ⏳ | |
| | 3_e2e | | | ⏳ | |
| | 4_performance | | | ⏳ | |

---

## 十、验证执行日志

| 日期 | SOP | 结果 | 执行人 | 备注 |
|------|-----|------|--------|------|
| | | | | |

---

## 十一、文档版本

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-04-26 | 初始版本 |
