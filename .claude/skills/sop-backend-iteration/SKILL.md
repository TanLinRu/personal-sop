---
name: sop-backend-iteration
description: 后端需求迭代流程 - 需求→调研→架构→PRD→实现（含多Agent并行+context-mode）
version: 2.0.0
triggers:
  - "后端迭代"
  - "后端需求"
  - "后端功能"
  - "/sop backend"
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
  - name: API设计调研
    description: API设计与数据模型调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 技术选型调研
    description: 框架与中间件选型调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 安全合规调研
    description: 安全与合规要求调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 后端代码生成
    description: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]

  - name: 后端代码审查
    description: 后端代码审查
    agent: java-reviewer
    depends_on: [后端代码生成]

aggregation:
  strategy: merge
  output_format: markdown
---

# SOP Backend Iteration v2.0 - 后端需求迭代流程

## 概述

本 SOP 提供标准化的后端需求迭代流程，包含调研、架构设计、PRD 生成、代码实现和知识更新。

### 核心特性

- **多 Agent 并行调研**: 3领域 x 1次并行调研
- **架构审核机制**: P0/P1 分级审核
- **PRD 必要性**: 后端功能通常需要完整 PRD
- **后端并行生成**: dr-jskill + java-reviewer
- **知识库增量更新**: context-mode 追踪变更

### 流程概览

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: 需求确认 [CONFIRM_REQUIRED]                              │
│   - 功能名称、接口需求、数据模型要求                                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: 依赖查询 [AUTO]                                          │
│   - /ctx query 查询已有实体、API、模块                            │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: 技术调研 [AUTO - 3次 sop-library-research 并行]          │
│   - API设计调研 | 技术选型调研 | 安全合规调研                     │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: 架构设计 [AUTO]                                          │
│   - API结构设计                                                    │
│   - 数据模型设计                                                  │
│   - 事务边界设计                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: 架构审核 [CONFIRM_REQUIRED]                              │
│   - P0: API结构、数据模型                                         │
│   - P1: 安全设计、事务边界                                       │
│   - 用户确认/修改                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: PRD生成 [AUTO]                                          │
│   - 后端功能通常需要完整 PRD                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: 后端实现 [AUTO - 多Agent并行]                              │
│   ┌──────────────────┐    ┌──────────────────┐                 │
│   │   dr-jskill       │    │   java-reviewer  │                 │
│   │   代码生成         │    │   代码审查        │                 │
│   └──────────────────┘    └──────────────────┘                 │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: 验证 [AUTO]                                              │
│   - 编译测试                                                      │
│   - 接口测试                                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 9: 知识更新 [AUTO]                                          │
│   - /ctx index 增量更新实体依赖图                                 │
│   - /ctx index 更新 API 依赖映射                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: 需求确认 [CONFIRM_REQUIRED]

### 确认内容

| 项目 | 说明 | 示例 |
|------|------|------|
| **功能名称** | 英文名，用于类名/方法名 | order-service |
| **核心接口** | RESTful 端点设计 | POST /api/v1/orders |
| **数据模型** | 涉及哪些实体 | Order, OrderItem |
| **业务规则** | 核心业务逻辑 | 下单流程、库存扣减 |
| **约束条件** | 性能/并发要求 | QPS>500、事务一致性 |

### 输出

```markdown
---
sop: backend-iteration
step: 1_confirm
status: confirmed
---

## 后端需求

- 功能名: {name}
- API端点: {endpoints}
- 数据模型: {entities}
- 业务规则: {rules}
- 约束条件: {constraints}
```

---

## Step 2: 依赖查询 [AUTO]

### Context-Mode 查询

```bash
# 查询相关实体
ctx query --type entities --last 5

# 查询相关 API
ctx query --type apis --last 5

# 查询相关模块
ctx query --type modules --last 3
```

### 查询输出

```markdown
---
sop: backend-iteration
step: 2_query
status: completed
---

## 已有依赖

### 相关实体
| 实体 | 模块 | 关系 |
|------|------|------|
| User | user-module | 1:N Order |

### 相关 API
| 端点 | 服务 | 说明 |
|------|------|------|
| /api/v1/users | UserService | 用户查询 |

### 风险提示
- [ ] 新增实体是否与现有实体冲突
- [ ] 新增 API 是否与现有 API 一致
- [ ] 模块依赖是否形成循环
```

---

## Step 3: 技术调研 [AUTO - 3次 sop-library-research 并行]

### 调研分组

| 领域 | 调用次数 | 调研内容 |
|------|---------|---------|
| **API设计调研** | 1次 | RESTful 设计、分页、排序、过滤 |
| **技术选型调研** | 1次 | 缓存策略、消息队列、事务方案 |
| **安全合规调研** | 1次 | 认证授权、数据校验、日志审计 |

### 输出

```markdown
---
sop: backend-iteration
step: 3_research
status: completed
---

## 调研结果

### API设计
- 端点设计: {endpoints}
- 参数规范: {params}
- 响应格式: {response}

### 技术选型
- 缓存方案: {cache}
- 事务方案: {transaction}
- 异步方案: {async}

### 安全合规
- 认证方式: {auth}
- 数据校验: {validation}
- 日志要求: {logging}
```

---

## Step 4: 架构设计 [AUTO]

### 4.1 API 结构设计

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | /api/v1/{resource} | 获取列表 |
| GET | /api/v1/{resource}/{id} | 获取单个 |
| POST | /api/v1/{resource} | 创建 |
| PUT | /api/v1/{resource}/{id} | 更新 |
| DELETE | /api/v1/{resource}/{id} | 删除 |

### 4.2 数据模型设计

| 实体 | 字段 | 类型 | 说明 |
|------|------|------|------|
| Order | id | Long | 主键 |
| Order | userId | Long | 外键 |
| Order | status | Enum | 订单状态 |
| Order | totalAmount | BigDecimal | 总金额 |

### 4.3 事务边界设计

```java
@Transactional(rollbackFor = Exception.class)
public Order createOrder(CreateOrderRequest request) {
    // 1. 校验库存
    // 2. 创建订单
    // 3. 扣减库存
    // 4. 发送消息
}
```

### 4.4 安全设计

| 设计项 | 方案 |
|--------|------|
| 认证 | JWT Token |
| 授权 | RBAC |
| 数据校验 | @Valid + 自定义校验器 |
| 日志 | 操作审计日志 |

### 输出

```markdown
---
sop: backend-iteration
step: 4_architecture
status: completed
---

## 架构设计

### API 结构
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/orders | 创建订单 |

### 数据模型
| Entity | Key Fields |
|--------|------------|
| Order | id, userId, status |

### 事务边界
- createOrder: 订单创建 + 库存扣减

### 安全设计
- 认证: JWT
- 授权: @PreAuthorize
```

---

## Step 5: 架构审核 [CONFIRM_REQUIRED]

### 审核检查点

#### P0 (阻塞级) - 后端专项

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **API 设计** | RESTful 风格、版本管理 | 符合规范 |
| **数据模型** | 实体关系正确、无循环依赖 | ER 图可描述 |
| **包结构** | 按功能模块划分 | 非按类型堆叠 |

#### P1 (重要级) - 后端专项

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **事务设计** | 边界清晰、无过长事务 | 无跨服务事务 |
| **安全设计** | 认证/授权/数据校验 | 符合基线 |
| **异常处理** | 统一异常响应、无信息泄露 | 符合规范 |

#### P2 (优化级)

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **性能设计** | 索引、缓存、异步 | 符合性能要求 |
| **可测试性** | 可单元测试 | 有测试路径 |

### 审核输出

```markdown
---
sop: backend-iteration
step: 5_review
status: reviewed
---

## 架构审核结果

### P0 检查点
| 检查项 | 状态 | 说明 |
|--------|------|------|
| API 设计 | PASS | |
| 数据模型 | PASS | |
| 包结构 | PASS | |

### P1 检查点
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 事务设计 | PASS | |
| 安全设计 | PASS | |
| 异常处理 | PASS | |

### 审核结论
- [ ] 通过
- [ ] 需要修改
```

---

## Step 6: PRD生成 [AUTO]

### 执行条件

后端功能通常需要完整 PRD，因为涉及：
- API 接口定义
- 数据模型设计
- 业务规则说明
- 异常处理流程

### 输出

```markdown
---
sop: backend-iteration
step: 6_prd
status: completed
---

## PRD 生成结果

- 类型: FULL
- 文件: .sop/output/prd-{feature}-{date}.md
```

---

## Step 7: 后端实现 [AUTO - 多Agent并行]

### Agent 分配

| Agent | 职责 | 输出 |
|-------|------|------|
| **dr-jskill** | 后端代码生成 | Controller/Service/Repository |
| **java-reviewer** | 代码审查 | 审查意见 |

### 并行执行

```yaml
parallel_tasks:
  - name: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]

  - name: 后端代码审查
    agent: java-reviewer
    depends_on: [后端代码生成]
```

### 代码结构

```
com.example.app/
├── controller/
│   └── OrderController.java
├── service/
│   ├── OrderService.java
│   └── impl/
│       └── OrderServiceImpl.java
├── repository/
│   └── OrderRepository.java
├── entity/
│   └── Order.java
├── dto/
│   ├── request/
│   │   └── CreateOrderRequest.java
│   └── response/
│       └── OrderResponse.java
└── config/
    └── SecurityConfig.java
```

### 输出

```markdown
---
sop: backend-iteration
step: 7_implementation
status: completed
---

## 实现结果

### 生成文件
| 文件 | 行数 | 说明 |
|------|------|------|
| OrderController.java | 120 | REST 控制器 |
| OrderService.java | 80 | 服务接口 |

### 代码审查
- 高风险问题: 0
- 中风险问题: 1 (待修复)
- 低风险问题: 2 (建议优化)
```

---

## Step 8: 验证 [AUTO]

### 验证项

| 验证类型 | 检查项 | 命令 |
|---------|--------|------|
| 编译 | 代码编译成功 | `mvn compile` |
| 单元测试 | 核心逻辑测试通过 | `mvn test` |
| 接口测试 | API 响应正确 | `curl /api/v1/orders` |

### 输出

```markdown
---
sop: backend-iteration
step: 8_verification
status: completed
---

## 验证结果

| 验证项 | 状态 | 说明 |
|--------|------|------|
| 编译 | PASS | |
| 单元测试 | PASS | 覆盖率 85% |
| 接口测试 | PASS | 响应正确 |
```

---

## Step 9: 知识更新 [AUTO]

### 9.1 Context-Mode 增量更新

```bash
# 索引新增实体
ctx index --source "backend-iteration-{feature}" --path "./src/main/java" --type entities --incremental

# 索引新增 API
ctx index --source "backend-iteration-{feature}" --path "./src/main/java" --type apis --incremental
```

### 9.2 知识库文档更新

#### 实体依赖图更新

```markdown
# {project} Entity Dependencies (v{version})

## 新增实体
| Entity | Module | Relations |
|--------|--------|-----------|
| Order | order-module | N:1 User, 1:N OrderItem |

## 更新日期: {date}
```

#### API 依赖映射更新

```markdown
# {project} API Map (v{version})

## 新增端点
| Method | Endpoint | Service |
|--------|----------|---------|
| POST | /api/v1/orders | OrderService |

## 更新日期: {date}
```

### 输出

```markdown
---
sop: backend-iteration
step: 9_index
status: completed
---

## 知识更新结果

### Context-Mode
- 实体索引: updated
- API 索引: updated
- 存储位置: .context-mode/

### 知识库文档
| 文档 | 状态 |
|------|------|
| 实体依赖图 | 增量更新 |
| API 依赖映射 | 增量更新 |
```

---

## 最终输出

```markdown
---
sop: backend-iteration
step: final
status: completed
---

## 后端迭代完成

### 功能信息
- 功能名: {name}
- API端点: {endpoints}
- 复杂度: {complexity}

### 生成产物
| 产物 | 位置 |
|------|------|
| Controller | OrderController.java |
| Service | OrderService.java |
| Entity | Order.java |

### 测试覆盖
- 单元测试: 覆盖率 85%
- 接口测试: 已验证

### 下一步
1. 前端对接接口
2. 集成测试
3. 部署验证
```

---

## 触发命令

```
sop backend
```

或描述场景：
- "后端新增订单功能"
- "实现用户管理模块"
- "添加商品查询接口"