# SOP Skill 测试文档

## 测试环境

- OpenCode CLI
- Graphify 知识图谱
- 项目目录: `D:\project\ai\personal-sop`

---

## 测试场景 1: 项目初始化 (sop-scaffold)

### 场景描述

使用 `sop-scaffold` 初始化一个新的订单管理系统项目。

### 触发命令

```
sop scaffold
```

### 输入参数

```
项目名称: order-system
核心场景: 订单管理、支付
目标用户: C端用户、管理员
约束条件: QPS>1000
```

### 预期流程

| Step | 名称 | 类型 | 预期输出 |
|------|------|------|----------|
| 1 | 需求确认 | CONFIRM_REQUIRED | 确认项目范围 |
| 2 | 需求调研 | AUTO | 5领域 x 2次 = 10次调研 |
| 3 | 生成 PRD | AUTO | PRD 文档 |
| 4 | 架构设计 | AUTO | 技术方案 |
| 5 | 架构审核 | CONFIRM_REQUIRED | 用户确认 |
| 6 | 依赖查询 | AUTO | 现有依赖列表 |
| 7 | 并行生成 | AUTO | 后端+前端代码 |
| 8 | 验证 | AUTO | 编译测试通过 |
| 9 | 知识索引 | AUTO | 索引到 context-mode |

### 预期产物

```
order-system/
├── src/main/java/com/example/order/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── entity/
├── src/main/resources/
│   └── application.yml
├── pom.xml
└── compose.yaml

order-system-frontend/
├── src/
│   ├── views/
│   ├── components/
│   ├── stores/
│   └── api/
└── package.json
```

### 验证点

- [ ] 命令 `sop scaffold` 触发成功
- [ ] 需求确认步骤暂停等待用户输入
- [ ] 10次并行调研执行
- [ ] PRD 文档生成
- [ ] 架构审核暂停等待确认
- [ ] 后端代码生成
- [ ] 前端代码生成
- [ ] 编译测试通过
- [ ] 知识索引完成

---

## 测试场景 2: 后端功能迭代 (sop-backend-iteration)

### 场景描述

使用 `sop-backend-iteration` 为订单系统新增"订单查询"功能。

### 触发命令

```
sop backend
```

### 输入参数

```
功能名称: order-query
核心接口: GET /api/v1/orders
数据模型: Order, OrderItem
业务规则: 分页查询、时间范围筛选
约束条件: QPS>500
```

### 预期流程

| Step | 名称 | 类型 |
|------|------|------|
| 1 | 需求确认 | CONFIRM_REQUIRED |
| 2 | 需求调研 | AUTO (3次) |
| 3 | 生成 PRD | AUTO |
| 4 | 架构设计 | AUTO |
| 5 | 架构审核 | CONFIRM_REQUIRED |
| 6 | 依赖查询 | AUTO |
| 7 | 后端实现 | AUTO |
| 8 | 验证 | AUTO |
| 9 | 知识更新 | AUTO |

### 验证点

- [ ] `sop backend` 触发成功
- [ ] 依赖查询显示现有 Order 实体
- [ ] 后端代码生成 (Controller/Service/Repository)
- [ ] 知识更新索引新 API

---

## 测试场景 3: 前端功能迭代 (sop-frontend-iteration)

### 场景描述

使用 `sop-frontend-iteration` 为订单系统新增"订单列表页"。

### 触发命令

```
sop frontend
```

### 输入参数

```
页面名称: order-list
功能需求: 订单列表、分页、筛选
设计风格: Element Plus
约束条件: 响应式
```

### 预期流程

| Step | 名称 | 类型 |
|------|------|------|
| 1 | 需求确认 | CONFIRM_REQUIRED |
| 2 | UI/UX调研 | AUTO (2次) |
| 3 | 组件设计 | AUTO |
| 4 | 设计审核 | CONFIRM_REQUIRED |
| 5 | 依赖查询 | AUTO |
| 6 | 前端实现 | AUTO |
| 7 | 验证 | AUTO |
| 8 | 知识更新 | AUTO |

### 验证点

- [ ] `sop frontend` 触发成功
- [ ] 组件设计生成
- [ ] 前端代码生成 (Vue 组件)
- [ ] 组件树知识更新

---

## 测试场景 4: 全栈功能迭代 (sop-fullstack-iteration)

### 场景描述

使用 `sop-fullstack-iteration` 一次性开发"订单支付"功能（后端+前端）。

### 触发命令

```
sop fullstack
```

### 输入参数

```
功能名称: order-payment
后端需求: 支付API、回调处理
前端需求: 支付页面、状态展示
约束条件: 微信/支付宝集成
```

### 预期流程

| Step | 名称 | 类型 |
|------|------|------|
| 1 | 需求确认 | CONFIRM_REQUIRED |
| 2 | 需求调研 | AUTO (5次) |
| 3 | 生成 PRD | AUTO |
| 4 | 架构设计 | AUTO |
| 5 | 架构审核 | CONFIRM_REQUIRED |
| 6 | 依赖查询 | AUTO |
| 7 | 并行生成 | AUTO (后端+前端) |
| 8 | 联调测试 | AUTO |
| 9 | 知识更新 | AUTO |

### 验证点

- [ ] `sop fullstack` 触发成功
- [ ] 前后端并行生成
- [ ] API 联调测试通过
- [ ] 全量知识更新

---

## 测试场景 5: 代码审查 (sop-code-review)

### 场景描述

对生成的代码进行审查。

### 触发命令

```
sop code-review
```

### 预期流程

| Step | 名称 | 类型 |
|------|------|------|
| 1 | 理解变更 | CONFIRM_REQUIRED |
| 2 | 格式检查 | AUTO |
| 3 | 安全评估 | AUTO |
| 4 | 反馈 | CONFIRM_REQUIRED |

### 验证点

- [ ] 代码格式检查通过
- [ ] 安全扫描通过
- [ ] 审查报告生成

---

## 测试场景 6: Bug 修复 (sop-bug-fix)

### 场景描述

修复一个订单查询的 bug。

### 触发命令

```
sop bug-fix
```

### Bug 描述

```
订单列表分页参数丢失，导致查询返回全部数据
```

### 预期流程

| Step | 名称 | 类型 |
|------|------|------|
| 1 | 复现 | CONFIRM_REQUIRED |
| 2 | 定位 | AUTO |
| 3 | 修复 | CONFIRM_REQUIRED |
| 4 | 验证 | AUTO |
| 5 | 测试 | AUTO |

### 验证点

- [ ] Bug 复现成功
- [ ] 根因定位
- [ ] 修复代码
- [ ] 验证通过

---

## Graphify 知识图谱测试

### 验证命令

```bash
# 索引项目到图谱
graphify update ./backend --out .sop/dependency-graph/{project}/backend
graphify update ./frontend --out .sop/dependency-graph/{project}/frontend

# 查询实体
graphify query "Order"

# 查询 API 依赖
graphify query "哪些模块依赖 OrderService"

# 路径查询
graphify path "OrderService" "OrderController"
```

### 预期结果

- [ ] 图谱构建成功
- [ ] 查询返回 Order 实体
- [ ] 查询返回 /api/v1/orders 端点
- [ ] 路径查询显示调用链

---

## 总结

| 场景 | 命令 | 预期结果 |
|------|------|----------|
| 项目初始化 | `sop scaffold` | 生成完整项目 |
| 后端迭代 | `sop backend` | 生成后端代码 |
| 前端迭代 | `sop frontend` | 生成前端代码 |
| 全栈迭代 | `sop fullstack` | 生成前后端代码 |
| 代码审查 | `sop code-review` | 生成审查报告 |
| Bug修复 | `sop bug-fix` | 修复并验证 |
| 知识图谱 | `graphify query` | 依赖查询 |

---

## 注意事项

1. 首次运行需要配置 Graphify: `graphify opencode install`
2. 调研次数影响执行时间（5-10分钟）
3. 生成代码后需要手动编译验证
4. 知识图谱更新后可查询依赖关系