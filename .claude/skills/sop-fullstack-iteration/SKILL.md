---
name: sop-fullstack-iteration
description: 前后端需求迭代流程 - PRD生成→依赖分析→API设计→后端实现→前端实现→联调测试（含多Agent并行+context-mode追踪）
version: 2.0.0
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

parallel_tasks:
  - name: 业务分析-1
    description: 业务域建模与实体关系
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 技术调研-1
    description: 技术选型与架构设计
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 安全评估-1
    description: 安全合规与认证授权
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: UI设计调研-1
    description: UI设计与组件库
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 性能评估-1
    description: 性能优化与缓存策略
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 后端生成
    description: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]

  - name: 前端生成
    description: 前端代码生成
    agent: frontend-design
    depends_on: [架构审核]

aggregation:
  strategy: merge
  output_format: markdown
---

# SOP Fullstack Iteration v2.0 - 前后端需求迭代流程

## 概述

本 SOP 提供标准化的前后端需求迭代流程，包含调研、架构设计、PRD 生成、前后端实现和联调测试。

### 核心特性

- **多 Agent 并行调研**: 5领域 x 1次并行调研
- **架构审核机制**: 前后端整体审核
- **PRD 必要性**: 通常需要完整 PRD
- **前后端并行生成**: 多 Agent 同时生成
- **知识库全量更新**: context-mode 追踪所有变更

### 流程概览

```
┌───────────��─────────────────────────────────────────────────────┐
│ Step 1: 需求确认 [CONFIRM_REQUIRED]                              │
│   - 前后端完整需求                                              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: 依赖查询 [AUTO]                                          │
│   - /ctx query 查询完整依赖（实体/API/组件）                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: 全栈调研 [AUTO - 5次 sop-library-research 并行]         │
│   - 业务分析 | 技术调研 | 安全评估 | UI设计 | 性能评估            │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: 架构设计 [AUTO]                                          │
│   - 后端分层架构                                                │
│   - 前端架构                                                    │
│   - 接口契约（API 结构）                                          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: 架构审核 [CONFIRM_REQUIRED]                              │
│   - P0: 前后端接口契约、数据流                                   │
│   - P1: 部署架构、运维设计                                       │
│   - P2: 性能预估、扩展性                                          │
│   - 用户确认/修改                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: PRD生成 [AUTO]                                          │
│   - 全栈功能通常需要完整 PRD                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: 并行生成 [AUTO - 多Agent]                                 │
│   ┌──────────────────┐    ┌──────────────────┐                   │
│   │   Agent A        │    │   Agent B        │                   │
│   │   dr-jskill      │    │   frontend-design│                   │
│   │   后端生成        │    │   前端生成        │                   │
│   └──────────────────┘    └──────────────────┘                   │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: 联调测试 [AUTO]                                          │
│   - API 联调验证                                              │
│   - 数据流验证                                                │
│   - 端到端测试                                                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 9: 知识更新 [AUTO]                                          │
│   - /ctx index 全量更新所有依赖图                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: 需求确认 [CONFIRM_REQUIRED]

### 确认内容

| 项目 | 说明 | 示例 |
|------|------|------|
| **功能名称** | 完整功能名称 | order-management |
| **后端需求** | API、数据模型、业务规则 | 订单 CRUD + 支付 |
| **前端需求** | 页面、组件、交互 | 订单列表 + 详情 + 表单 |
| **接口契约** | 前后端数据约定 | JSON 结构、字段类型 |
| **约束条件** | 性能/并发/合规 | QPS>500、移动端适配 |

### 输出

```markdown
---
sop: fullstack-iteration
step: 1_confirm
status: confirmed
---

## 全栈需求

- 功能名: {name}
- 后端需求: {backend}
- 前端需求: {frontend}
- 接口契约: {contract}
- 约束条件: {constraints}
```

---

## Step 2: 依赖查询 [AUTO]

### Context-Mode 查询

```bash
# 查询所有相关依赖
ctx query --type all --last 10

# 查询后端实体
ctx query --type entities --last 5

# 查询前端组件
ctx query --type components --last 5

# 查询 API
ctx query --type apis --last 5
```

### 查询输出

```markdown
---
sop: fullstack-iteration
step: 2_query
status: completed
---

## 已有依赖

### 后端
| 实体 | API | 模块 |
|------|-----|------|
| User | /api/users | user-module |

### 前端
| 组件 | 页面 | 状态 |
|------|------|------|
| DataTable | /user | userStore |

### 风险提示
- [ ] 新增实体是否与现有冲突
- [ ] 新增 API 是否与现有冲突
- [ ] 前后端接口是否一致
```

---

## Step 3: 全栈调研 [AUTO - 5次 sop-library-research 并行]

### 调研分组

| 领域 | 调用次数 | 调研内容 |
|------|---------|---------|
| **业务分析** | 1次 | 业务域建模、实体关系、核心流程 |
| **技术调研** | 1次 | 框架对比、中间件选型、技术方案 |
| **安全评估** | 1次 | 认证授权、数据安全、合规要求 |
| **UI设计** | 1次 | 设计系统、组件选择、状态管理 |
| **性能评估** | 1次 | 缓存策略、性能优化、CDN |

### 输出

```markdown
---
sop: fullstack-iteration
step: 3_research
status: completed
---

## 全栈调研结果

### 业务分析
- 业务域: {domains}
- 实体关系: {relationships}

### 技术调研
- 后端技术: {backend_tech}
- 前端技术: {frontend_tech}

### 安全评估
- 认证方案: {auth}
- 数据安全: {security}

### UI设计
- 设计系统: {design_system}
- 组件库: {components}

### 性能评估
- 缓存策略: {cache}
- 性能目标: {performance}
```

---

## Step 4: 架构设计 [AUTO]

### 4.1 后端分层架构

```
后端:
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (Controller / DTO / VO)              │
└─────────────────────┬───────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│            Service Layer                │
│   (Business Logic / Transaction)        │
└─────────────────────┬───────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│          Repository Layer               │
│   (DAO / Mapper / Entity)               │
└─────────────────────────────────────────┘
```

### 4.2 前端架构

```
前端:
┌─────────────────────────────────────────┐
│           Views Layer                  │
│   (Pages / Routes)                     │
└─────────────────────┬───────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│          Components Layer              │
│   (Business Components)                 │
└─────────────────────┬───────────────────┘
                      ▼
┌─────────────────────────────────────────┐
│           Stores Layer                 │
│   (State Management / API)             │
└─────────────────────────────────────────┘
```

### 4.3 接口契约设计

| 方法 | 端点 | 请求 | 响应 |
|------|------|------|------|
| GET | /api/v1/orders | - | Order[] |
| GET | /api/v1/orders/{id} | - | Order |
| POST | /api/v1/orders | CreateOrderRequest | Order |
| PUT | /api/v1/orders/{id} | UpdateOrderRequest | Order |
| DELETE | /api/v1/orders/{id} | - | - |

### 输出

```markdown
---
sop: fullstack-iteration
step: 4_architecture
status: completed
---

## 架构设计

### 后端架构
| 层级 | 组件 |
|------|------|
| Controller | OrderController |
| Service | OrderService |
| Repository | OrderRepository |

### 前端架构
| 层级 | 组件 |
|------|------|
| Views | OrderList, OrderDetail |
| Components | OrderTable, OrderForm |
| Stores | orderStore |

### 接口契约
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | /api/v1/orders | Order[] |
| POST | /api/v1/orders | Order |
```

---

## Step 5: 架构审核 [CONFIRM_REQUIRED]

### 审核检查点

#### P0 (阻塞级) - 全栈专项

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **接口契约** | 前后端数据一致 | JSON 结构匹配 |
| **数据流** | 请求→处理→响应 | 数据流转正确 |
| **包结构** | 前后端模块分离 | 无循环依赖 |

#### P1 (重要级) - 全栈专项

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **部署架构** | Docker/K8s 配置 | 可独立部署 |
| **运维设计** | 日志/监控/告警 | 符合规范 |
| **安全设计** | 认证/授权/数据校验 | 符合基线 |

#### P2 (优化级)

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **性能预估** | QPS/延迟/并发 | 符合 SLA |
| **扩展性** | 前后端独立扩展 | 可单独部署 |
| **可维护性** | 代码复杂度 | 无过多嵌套 |

### 审核输出

```markdown
---
sop: fullstack-iteration
step: 5_review
status: reviewed
---

## 架构审核结果

### P0 检查点
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 接口契约 | PASS | |
| 数据流 | PASS | |
| 包结构 | PASS | |

### P1 检查点
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 部署架构 | PASS | |
| 运维设计 | PASS | |
| 安全设计 | PASS | |

### 审核结论
- [ ] 通过
- [ ] 需要修改
```

---

## Step 6: PRD生成 [AUTO]

### 执行条件

全栈功能通常需要完整 PRD，因为涉及：
- API 接口定义
- 数据模型设计
- 前后端数据约定
- 异常处理流程
- 联调测试要求

### 输出

```markdown
---
sop: fullstack-iteration
step: 6_prd
status: completed
---

## PRD 生成结果

- 类型: FULL
- 文件: .sop/output/prd-{feature}-{date}.md
```

---

## Step 7: 并行生成 [AUTO - 多Agent]

### Agent 分配

| Agent | 职责 | 输出 |
|-------|------|------|
| **dr-jskill** | 后端代码生成 | Spring Boot 项目 |
| **frontend-design** | 前端代码生成 | Vue 3 项目 |

### 并行执行

```yaml
parallel_tasks:
  - name: 后端生成
    agent: dr-jskill
    depends_on: [架构审核]

  - name: 前端生成
    agent: frontend-design
    depends_on: [架构审核]
```

### 生成内容

#### 后端
```
com.example.app/
├── controller/OrderController.java
├── service/OrderService.java
├── repository/OrderRepository.java
├── entity/Order.java
├── dto/request/CreateOrderRequest.java
└── dto/response/OrderResponse.java
```

#### 前端
```
src/
├── views/order/OrderList.vue
├── views/order/OrderDetail.vue
├── components/order/OrderTable.vue
├── stores/order.ts
├── api/order.ts
└── types/order.ts
```

### 输出

```markdown
---
sop: fullstack-iteration
step: 7_generation
status: completed
---

## 生成结果

### 后端
- 文件: {count} 个
- 状态: completed

### 前端
- 文件: {count} 个
- 状态: completed
```

---

## Step 8: 联调测试 [AUTO]

### 验证项

| 验证类型 | 检查项 | 命令 |
|---------|--------|------|
| 编译 | 后端编译成功 | `mvn compile` |
| 构建 | 前端构建成功 | `npm run build` |
| API 联调 | 接口响应正确 | `curl /api/v1/orders` |
| 数据流 | 前后端数据一致 | E2E 测试 |
| 异常处理 | 统一错误响应 | 错误场景测试 |

### 输出

```markdown
---
sop: fullstack-iteration
step: 8_integration
status: completed
---

## 联调测试结果

| 验证项 | 状态 | 说明 |
|--------|------|------|
| 后端编译 | PASS | |
| 前端构建 | PASS | |
| API 联调 | PASS | |
| 数据流 | PASS | |
| 异常处理 | PASS | |
```

---

## Step 9: 知识更新 [AUTO]

### 9.1 Context-Mode 全量更新

```bash
# 索引后端
ctx index --source "fullstack-{feature}" --path "./src/main/java" --type entities --incremental
ctx index --source "fullstack-{feature}" --path "./src/main/java" --type apis --incremental

# 索引前端
ctx index --source "fullstack-{feature}" --path "./src" --type components --incremental
ctx index --source "fullstack-{feature}" --path "./src" --type pages --incremental
```

### 9.2 知识库全量更新

#### 实体依赖图
#### API 依赖映射
#### 组件树
#### 模块依赖矩阵

### 输出

```markdown
---
sop: fullstack-iteration
step: 9_index
status: completed
---

## 知识更新结果

### Context-Mode
- 后端索引: updated
- 前端索引: updated
- 存储位置: .context-mode/

### 知识库文档
| 文档 | 状态 |
|------|------|
| 实体依赖图 | 全量更新 |
| API 依赖映射 | 全量更新 |
| 组件树 | 全量更新 |
```

---

## 最终输出

```markdown
---
sop: fullstack-iteration
step: final
status: completed
---

## 全栈迭代完成

### 功能信息
- 功能名: {name}
- 复杂度: {complexity}

### 生成产物
| 产物 | 位置 |
|------|------|
| 后端 | src/main/java/ |
| 前端 | src/ |
| API | /api/v1/orders |

### 验证结果
- 联调测试: 通过
- 知识更新: 完成

### 下一步
1. 部署验证
2. 性能压测
3. 用户验收
```

---

## 触发命令

```
sop fullstack
```

或描述场景：
- "全栈新增订单功能"
- "实现用户管理前后端"
- "添加商品查询功能"