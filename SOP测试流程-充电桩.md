# 充电桩管理系统 SOP 执行验证文档

> 基于电桩管理系统验证 SOP Skill 完整执行流程

---

## 测试场景

**项目名称**：充电桩管理系统 (Charging Pile Management System)
**核心功能**：充电桩设备管理、充电记录、支付
**目标用户**：运营商、充电桩主人、车

---

## 执行环境

| 配置项 | 值 | 说明 |
|--------|-----|------|
| JDK | D:\software\jdk-21.0.8 | JDK 21 |
| Maven | D:\mvn\setting.xml | Mavan 配置 |
| Graphify | graphifyy | 知识图谱 |
| 后端端口 | 8080 | Spring Boot |
| 前端端口 | 5173 | Vite |
| API 路径 | /api | REST API |

---

## SOP 1: 项目初始化 (sop-scaffold)

### 触发命令

```
/sop scaffold 充电桩管理系统
```

### 执行流程

```
需求确认 → 配置确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 并行生成 → 启动验证 → 知识更新
```

### 测试步骤

| # | Step | 类型 | 测试结果 |
|-----|------|------|---------|
| 1 | 需求确认 | CONFIRM_REQUIRED | 待测试 |
| 2 | 配置确认 | CONFIRM_REQUIRED | 待测试 |
| 3 | 需求调研 | AUTO | 待测试 |
| 4 | 生成 PRD | AUTO | 待测试 |
| 5 | 架构设计 | AUTO | 待测试 |
| 6 | 架构审核 | CONFIRM_REQUIRED | 待测试 |
| 7 | 依赖查询 | AUTO | 待测试 |
| 8 | 并行生成 | AUTO | 待测试 |
| 9 | 启动验证 | AUTO | 待测试 |
| 10 | 知识更新 | AUTO | 待测试 |

### 预期产物

```
charging-pile-system/
├── backend/
│   ├── src/main/java/com/example/charging/
│   │   ├── controller/
│   │   │   ├── PileController.java
│   │   │   ├── ChargingRecordController.java
│   │   │   └── PaymentController.java
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── stores/
│   │   └── api/
│   └── package.json
└── graphify-out/
```

### 验证命令

```bash
# 后端编译
cd backend
mvn clean compile -s D:\mvn\setting.xml -q

# 后端启动
node .claude/scripts/start-backend.js ./backend 8080

# 等待 30 秒
sleep 30

# 健康检查
curl http://localhost:8080/api/actuator/health

# API 测试
curl http://localhost:8080/api/v1/piles
curl http://localhost:8080/api/v1/charging-records

# 前端启动
cd ../frontend
node .claude/scripts/start-frontend.js ./frontend 5173

# 等待 10 秒
sleep 10

# 前端验证
curl http://localhost:5173
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
| 检查项 | 状态 |
|--------|------|
| 编译成功 | 🔲 |
| 启动成功 | 🔲 |
| 健康检查 | 🔲 |

### 前端验证
| 检查项 | 状态 |
|--------|------|
| 依赖安装 | 🔲 |
| 启动成功 | 🔲 |
| 页面可访问 | 🔲 |

### API验证
| 端点 | 方法 | 状态 |
|------|------|------|
| /v1/piles | GET | 🔲 |
| /v1/charging-records | GET | 🔲 |
| /v1/payments | POST | 🔲 |

### 验证状态
- [ ] 待测试
```

---

## SOP 2: 后端功能迭代 (sop-backend-iteration)

### 触发命令

```
/sop backend 充电桩查询统计
```

### 功能需求

| 功能 | 接口 | 方法 |
|------|------|------|
| 充电桩列表 | /api/v1/piles | GET |
| 充电桩详情 | /api/v1/piles/{id} | GET |
| 创建充电桩 | /api/v1/piles | POST |
| 更新充电桩 | /api/v1/piles/{id} | PUT |
| 删除充电桩 | /api/v1/piles/{id} | DELETE |
| 充电记录列表 | /api/v1/charging-records | GET |
| 充电统计 | /api/v1/charging-records/statistics | GET |

### 测试步骤

| # | Step | 类型 | 测试结果 |
|-----|------|------|---------|
| 1 | 需求确认 | CONFIRM_REQUIRED | 待测试 |
| 2 | 需求调研 | AUTO | 待测试 |
| 3 | 生成 PRD | AUTO | 待测试 |
| 4 | 架构设计 | AUTO | 待测试 |
| 5 | 架构审核 | CONFIRM_REQUIRED | 待测试 |
| 6 | 依赖查询 | AUTO | 待测试 |
| 7 | 后端实现 | AUTO | 待测试 |
| 8 | 启动验证 | AUTO | 待测试 |
| 9 | 知识更新 | AUTO | 待测试 |

### 验证命令

```bash
# 编译
cd backend
mvn clean compile

# 启动
node .claude/scripts/start-backend.js ./backend 8080

# API 测试
curl http://localhost:8080/api/v1/piles
curl http://localhost:8080/api/v1/piles/1
curl -X POST http://localhost:8080/api/v1/piles -H "Content-Type: application/json" -d '{"name":"Pile-001","location":"A1","power":7}'

# 图谱验证
cd ..
graphify query "哪些模块依赖 PileService"
```

### 验证输出

```markdown
---
sop: backend-iteration
step: 8_verify
status: in_progress
---

## 后端验证

### 编译验证
| 检查项 | 状态 |
|--------|------|
| 编译成功 | 🔲 |

### 启动验证
| 检查项 | 状态 |
|--------|------|
| 启动成功 | 🔲 |
| 健康检查 | 🔲 |

### API验证
| 端点 | 方法 | 状态 |
|------|------|------|
| /v1/piles | GET | 🔲 |
| /v1/piles | POST | 🔲 |
| /v1/piles/{id} | GET | 🔲 |
| /v1/piles/{id} | PUT | 🔲 |
| /v1/piles/{id} | DELETE | 🔲 |
| /v1/charging-records/statistics | GET | 🔲 |

### 图谱验证
| 检查项 | 状态 |
|--------|------|
| 图谱更新 | 🔲 |
| 依赖查询 | 🔲 |

### 验证状态
- [ ] 待测试
```

---

## SOP 3: 前端功能迭代 (sop-frontend-iteration)

### 触发命令

```
/sop frontend 充电桩管理页面
```

### 页面需求

| 页面 | 功能 |
|------|------|
| /piles | 充电桩列表 |
| /piles/:id | 充电桩详情 |
| /piles/add | 新增充电桩 |
| /charging-records | 充电记录 |
| /statistics | 统计报表 |

### 测试步骤

| # | Step | 类型 | 测试结果 |
|-----|------|------|---------|
| 1 | 需求确认 | CONFIRM_REQUIRED | 待测试 |
| 2 | UI/UX调研 | AUTO | 待测试 |
| 3 | 组件设计 | AUTO | 待测试 |
| 4 | 设计审核 | CONFIRM_REQUIRED | 待测试 |
| 5 | 依赖查询 | AUTO | 待测试 |
| 6 | 前端实现 | AUTO | 待测试 |
| 7 | 启动验证 | AUTO | 待测试 |
| 8 | 知识更新 | AUTO | 待测试 |

### 验证命令

```bash
cd frontend
node .claude/scripts/start-frontend.js ./frontend 5173

# 页面验证
curl http://localhost:5173/piles
curl http://localhost:5173/charging-records
curl http://localhost:5173/statistics

# API 联调
curl http://localhost:5173/api/v1/piles
```

---

## SOP 4: 代码审查 (sop-code-review)

### 触发命令

```
/sop code-review 充电桩管理系统
```

### 审查清单

| Agent | 检查内容 |
|-------|----------|
| code-reviewer | 格式、命名、Lombok规范 |
| security-reviewer | SQL注入、XSS、权限 |
| java-reviewer | 事务、readOnly、异常处理 |

### 验证命令

```bash
# 查看变更
git diff --stat

# 3 个 Agent 并行审查
sop-code-review
```

---

## SOP 5: 知识图谱验证 (Graphify)

### 验证命令

```bash
# 构建图谱
graphify update ./backend --out .sop/dependency-graph/charging-system/backend
graphify update ./frontend --out .sop/dependency-graph/charging-system/frontend

# 查询实体
graphify query "Pile"

# 查询 API
graphify query "充电桩"

# 查询依赖
graphify query "哪些模块依赖 PileService"

# 路径查询
graphify path "PileService" "PileController"
```

### 预期输出

```
NODE PileController.java
NODE PileService.java  
NODE Pile.java (Entity)
NODE ChargingRecord.java

EDGE PileService --method--> PileController.java
EDGE PileController.java --calls--> PileService
```

---

## 验证状态总览

| # | SOP | 状态 |
|-----|------|------|
| 1 | sop-scaffold | 🔲 待测试 |
| 2 | sop-backend-iteration | 🔲 待测试 |
| 3 | sop-frontend-iteration | 🔲 待测试 |
| 4 | sop-code-review | 🔲 待测试 |
| 5 | Graphify 图谱验证 | 🔲 待测试 |

---

## 快捷验证命令

```bash
# ===== 1. 初始化项目 =====
sop scaffold 充电桩管理系统

# ===== 2. 构建图谱 =====
graphify update ./backend --out .sop/dependency-graph/charging-system/backend

# ===== 3. 验证后端 =====
node .claude/scripts/start-backend.js ./backend 8080
sleep 30
curl http://localhost:8080/api/actuator/health

# ===== 4. 验证前端 =====
node .claude/scripts/start-frontend.js ./frontend 5173
sleep 10
curl http://localhost:5173

# ===== 5. 图谱查询 =====
graphify query "Pile"
graphify query "充电桩"

# ===== 6. 停止服务 =====
# Ctrl+C 或关闭终端
```

---

## 验证检查表

### 后端检查表

- [ ] 编译成功 `mvn clean compile`
- [ ] 启动成功 `mvn spring-boot:run`
- [ ] 健康检查 `/actuator/health`
- [ ] CRUD API 可用
- [ ] 数据库连接正常

### 前端检查表

- [ ] 依赖安装 `npm install`
- [ ] 启动成功 `npm run dev`
- [ ] 页面可访问
- [ ] API 联调正常

### 图谱检查表

- [ ] 后端图谱构建
- [ ] 前端图谱构建
- [ ] 实体查询
- [ ] API 查询
- [ ] 依赖路径查询