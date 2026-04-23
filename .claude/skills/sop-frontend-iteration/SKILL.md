---
name: sop-frontend-iteration
description: 前端需求迭代流程 - 需求→调研→设计→实现（含多Agent并行+context-mode）
version: 2.0.0
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

parallel_tasks:
  - name: UI设计调研
    description: UI设计与组件库调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 组件库调研
    description: 组件库与状态管理调研
    agent: sop-library-research
    depends_on: []
    count: 1

  - name: 前端代码生成
    description: 前端代码生成
    agent: frontend-design
    depends_on: [设计审核]

  - name: 前端代码审查
    description: 前端代码审查
    agent: code-reviewer
    depends_on: [前端代码生成]

aggregation:
  strategy: merge
  output_format: markdown
---

# SOP Frontend Iteration v2.0 - 前端需求迭代流程

## 概述

本 SOP 提供标准化的前端需求迭代流程，包含调研、组件设计、前端实现和知识更新。

### 核心特性

- **多 Agent 并行调研**: 2领域 x 1次并行调研
- **设计审核机制**: P0/P1 分级审核
- **前端并行生成**: frontend-design + code-reviewer
- **知识库增量更新**: context-mode 追踪组件变更

### 流程概览

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: 需求确认 [CONFIRM_REQUIRED]                              │
│   - 页面需求、组件需求、设计风格                                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: 依赖查询 [AUTO]                                          │
│   - /ctx query 查询已有组件、状态管理                            │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: UI/UX调研 [AUTO - 2次 sop-library-research 并行]         │
│   - UI设计调研 | 组件库调研                                     │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: 组件设计 [AUTO]                                          │
│   - 组件树结构                                                  │
│   - 状态管理设计                                                  │
│   - 路由设计                                                  │
└─��──────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: 设计审核 [CONFIRM_REQUIRED]                              │
│   - P0: 组件结构、路由设计                                      │
│   - P1: 状态管理、性能优化                                      │
│   - 用户确认/修改                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: 前端实现 [AUTO - 多Agent并行]                           │
│   ┌──────────────────┐    ┌──────────────────┐               │
│   │   frontend-design│    │   code-reviewer  │               │
│   │   组件生成        │    │   代码审查        │               │
│   └──────────────────┘    └──────────────────┘               │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: 验证 [AUTO]                                              │
│   - 构建测试                                                      │
│   - 组件测试                                                      │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: 知识更新 [AUTO]                                          │
│   - /ctx index 增量更新组件树                                   │
│   - /ctx index 更新页面路由                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: 需求确认 [CONFIRM_REQUIRED]

### 确认内容

| 项目 | 说明 | 示例 |
|------|------|------|
| **页面名称** | 英文名，用于组件名 | order-list |
| **功能需求** | 列表/表单/详情 | 订单列表 + 详情 |
| **设计风格** | Element Plus / Ant Design | Element Plus |
| **约束条件** | 响应式/无障碍 | 需支持移动端 |

### 输出

```markdown
---
sop: frontend-iteration
step: 1_confirm
status: confirmed
---

## 前端需求

- 页面名: {name}
- 功能需求: {features}
- 设计风格: {style}
- 约束条件: {constraints}
```

---

## Step 2: 依赖查询 [AUTO]

### Context-Mode 查询

```bash
# 查询相关组��
ctx query --type components --last 3

# 查询相关页面
ctx query --type pages --last 3

# 查询状态管理
ctx query --type stores --last 2
```

### 查询输出

```markdown
---
sop: frontend-iteration
step: 2_query
status: completed
---

## 已有依赖

### 相关组件
| 组件 | 模块 | 用途 |
|------|------|------|
| DataTable | common-table | 通用表格 |

### 相关页面
| 页面 | 路由 | 状态 |
|------|------|------|
| OrderList | /order | 已实现 |

### 风险提示
- [ ] 新组件是否与现有组件重复
- [ ] 状态管理是否与现有 store 冲突
- [ ] 路由是否与现有路由冲突
```

---

## Step 3: UI/UX调研 [AUTO - 2次 sop-library-research 并行]

### 调研分组

| 领域 | 调用次数 | 调研内容 |
|------|---------|---------|
| **UI设计调研** | 1次 | 设计系统、布局规范、主题 |
| **组件库调研** | 1次 | 组件选择、状态管理、路由 |

### 输出

```markdown
---
sop: frontend-iteration
step: 3_research
status: completed
---

## 调研结果

### UI设计
- 设计系统: {design-system}
- 布局规范: {layout}
- 主题方案: {theme}

### 组件库
- 表格组件: {table-library}
- 表单组件: {form-library}
- 状态管理: {state-management}
```

---

## Step 4: 组件设计 [AUTO]

### 4.1 组件树结构

```
src/
├── views/
│   └── order/
│       ├── OrderList.vue      # 订单列表
│       ├── OrderDetail.vue    # 订单详情
│       └── OrderForm.vue    # 订单表单
├── components/
│   └── order/
│       ├── OrderTable.vue    # 订单表格组件
│       └── OrderFilter.vue   # 筛选组件
└── stores/
    └── order.ts             # 订单状态管理
```

### 4.2 状态管理设计

| Store | 状态 | Actions |
|-------|------|---------|
| order | list, detail, loading | fetchList, fetchDetail, create, update |

### 4.3 路由设计

```typescript
{
  path: '/order',
  name: 'Order',
  component: () => import('@/views/order/OrderList.vue'),
  children: [
    { path: ':id', name: 'OrderDetail', component: OrderDetail },
    { path: 'new', name: 'OrderCreate', component: OrderForm }
  ]
}
```

### 输出

```markdown
---
sop: frontend-iteration
step: 4_architecture
status: completed
---

## 组件设计

### 组件树
| 层级 | 组件 |
|------|------|
| 页面 | OrderList, OrderDetail |
| 业务组件 | OrderTable, OrderFilter |
| 基础组件 | DataTable, SearchForm |

### 状态管理
- Store: order.ts
- Actions: fetchList, fetchDetail

### 路由结构
- /order - 列表页
- /order/:id - 详情页
- /order/new - 新建页
```

---

## Step 5: 设计审核 [CONFIRM_REQUIRED]

### 审核检查点

#### P0 (阻塞级) - 前端专项

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **组件结构** | 组件划分合理、可复用 | 无重复代码 |
| **路由设计** | RESTful 风格、层级清晰 | /resource/:id 模式 |
| **包结构** | 按页面/组件/类型划分 | 非按文件类型堆叠 |

#### P1 (重要级) - 前端专项

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **状态管理** | 集中管理、无冗余 | Pinia/Vuex |
| **类型安全** | TypeScript 类型完整 | 无 any |
| **性能优化** | 懒加载、虚拟滚动 | 符合性能要求 |

#### P2 (优化级)

| 检查项 | 审核标准 | 通过条件 |
|--------|---------|---------|
| **可访问性** | 无障碍支持 | WCAG 2.1 |
| **响应式** | 移动端适配 | 需适配 |

### 审核输出

```markdown
---
sop: frontend-iteration
step: 5_review
status: reviewed
---

## 设计审核结果

### P0 检查点
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 组件结构 | PASS | |
| 路由设计 | PASS | |
| 包结构 | PASS | |

### P1 检查点
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 状态管理 | PASS | |
| 类型安全 | PASS | |
| 性能优化 | PASS | |

### 审核结论
- [ ] 通过
- [ ] 需要修改
```

---

## Step 6: 前端实现 [AUTO - 多Agent并行]

### Agent 分配

| Agent | 职责 | 输出 |
|-------|------|------|
| **frontend-design** | 组件生成 | Vue 3 组件 |
| **code-reviewer** | 代码审查 | 审查意见 |

### 并行执行

```yaml
parallel_tasks:
  - name: 前端代码生成
    agent: frontend-design
    depends_on: [设计审核]

  - name: 前端代码审查
    agent: code-reviewer
    depends_on: [前端代码生成]
```

### 代码结构

```
src/
├── views/order/
│   ├── OrderList.vue
│   ├── OrderDetail.vue
│   └── OrderForm.vue
├── components/order/
│   ├── OrderTable.vue
│   └── OrderFilter.vue
├── stores/
│   └── order.ts
├── api/
│   └── order.ts
└── types/
    └── order.ts
```

### 输出

```markdown
---
sop: frontend-iteration
step: 6_implementation
status: completed
---

## 实现结果

### 生成文件
| 文件 | 行数 | 说明 |
|------|------|------|
| OrderList.vue | 150 | 订单列表页 |
| OrderTable.vue | 100 | 订单表格组件 |

### 代码审查
- 高风险问题: 0
- 中风险问题: 1 (待修复)
- 低风险问题: 2 (建议优化)
```

---

## Step 7: 验证 [AUTO]

### 验证项

| 验证类型 | 检查项 | 命令 |
|---------|--------|------|
| 构建 | 前端构建成功 | `npm run build` |
| 类型检查 | TypeScript 无错误 | `npm run type-check` |
| 组件测试 | 组件渲染正常 | `npm run test` |

### 输出

```markdown
---
sop: frontend-iteration
step: 7_verification
status: completed
---

## 验证结果

| 验证项 | 状态 | 说明 |
|--------|------|------|
| 构建 | PASS | |
| 类型��查 | PASS | |
| 组件测试 | PASS | |
```

---

## Step 8: 知识更新 [AUTO]

### 8.1 Context-Mode 增量更新

```bash
# 索引新增组件
ctx index --source "frontend-iteration-{feature}" --path "./src" --type components --incremental

# 索引新增页面
ctx index --source "frontend-iteration-{feature}" --path "./src/views" --type pages --incremental
```

### 8.2 知识库文档更新

#### 组件树更新

```markdown
# {project} Component Tree (v{version})

## 新增页面
| 页面 | 路由 | 组件 |
|------|------|------|
| OrderList | /order | OrderList.vue |

## 新增组件
| 组件 | 类型 | 依赖 |
|------|------|------|
| OrderTable | 业务组件 | DataTable |

## 更新日期: {date}
```

### 输出

```markdown
---
sop: frontend-iteration
step: 8_index
status: completed
---

## 知识更新结果

### Context-Mode
- 组件索引: updated
- 页面索引: updated
- 存储位置: .context-mode/

### 知识库文档
| 文档 | 状态 |
|------|------|
| 组件树 | 增量更新 |
| 页面路由 | 增量更新 |
```

---

## 最终输出

```markdown
---
sop: frontend-iteration
step: final
status: completed
---

## 前端迭代完成

### 功能信息
- 页面名: {name}
- 路由: {routes}
- 复杂度: {complexity}

### 生成产物
| 产物 | 位置 |
|------|------|
| 页面 | views/order/ |
| 组件 | components/order/ |
| 状态 | stores/order.ts |

### 测试覆盖
- 组件测试: 通过
- 类型检查: 通过

### 下一步
1. 后端接口对接
2. E2E 测试
3. 部署验证
```

---

## 触发命令

```
sop frontend
```

或描述场景：
- "前端新增订单列表页"
- "实现用户管理页面"
- "添加商品详情页"