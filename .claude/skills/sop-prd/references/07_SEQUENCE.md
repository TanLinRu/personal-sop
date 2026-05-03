# 系统时序图 / 交互图

> Sequence Diagram / Interaction Diagram

## 文档信息

| 字段 | 内容 |
|------|------|
| 项目名称 | {{project_name}} |
| 版本 | V1.0 |
| 创建日期 | {{date}} |

---

## 1. 核心接口时序图

### 1.1 创建资源时序

```mermaid
sequenceDiagram
  participant U as 用户
  participant F as 前端
  participant A as API网关
  participant S as 服务
  participant D as 数据库

  U->>F: 提交表单
  F->>A: POST /api/v1/resources
  A->>S: 路由请求
  S->>D: INSERT INTO table
  D-->>S: 返回ID
  S-->>A: 返回资源对象
  A-->>F: 201 Created
  F-->>U: 展示成功
```

### 1.2 查询资源时序

```mermaid
sequenceDiagram
  participant U as 用户
  participant F as 前端
  participant A as API网关
  participant S as 服务
  participant D as 数据库

  U->>F: 发起查询
  F->>A: GET /api/v1/resources/:id
  A->>S: 路由请求
  S->>D: SELECT FROM table WHERE id
  D-->>S: 返回数据
  S-->>A: 返回资源对象
  A-->>F: 200 OK
  F-->>U: 展示详情
```

---

## 2. 业务场景时序

### 2.1 场景A：{{scenario_a}}

```mermaid
sequenceDiagram
  participant U as 用户
  participant F as 前端
  participant A as API网关
  participant S1 as 服务A
  participant S2 as 服务B
  participant D as 数据库
  participant Ext as 外部服务

  U->>F: 操作
  F->>A: 请求
  A->>S1: 处理
  S1->>D: 数据操作1
  D-->>S1: 结果
  S1->>S2: 调用
  S2->>Ext: 外部调用
  Ext-->>S2: 响应
  S2-->>S1: 结果
  S1-->>A: 响应
  A-->>F: 响应
  F-->>U: 结果展示
```

### 2.2 异常处理时序

```mermaid
sequenceDiagram
  participant U as 用户
  participant F as 前端
  participant A as API网关
  participant S as 服务
  participant D as 数据库

  U->>F: 提交请求
  F->>A: POST /api
  A->>S: 处理
  S->>D: 操作
  D-->>S: 异常
  S-->>A: 500 Error
  A-->>F: 错误响应
  F-->>U: 错误提示
```

---

## 3. 分布式事务时序（如需）

### 3.1 TCC 模式

```mermaid
sequenceDiagram
  participant C as 协调者
  participant S1 as 服务A
  participant S2 as 服务B

  C->>S1: Try预留资源
  S1-->>C: 成功
  C->>S2: Try预留资源
  S2-->>C: 成功
  C->>S1: Confirm确认
  S1-->>C: 成功
  C->>S2: Confirm确认
  S2-->>C: 成功
```

### 3.2 补偿模式

```mermaid
sequenceDiagram
  participant C as 协调者
  participant S1 as 服务A
  participant S2 as 服务B

  C->>S1: 执行主事务
  S1-->>C: 成功
  C->>S2: 执行从事务
  S2-->>C: 失败
  C->>S1: 补偿回滚
  S1-->>C: 成功
```

---

## 4. 异步任务时序

### 4.1 任务创建与轮询

```mermaid
sequenceDiagram
  participant U as 用户
  participant F as 前端
  participant A as API网关
  participant S as 服务
  participant Q as 消息队列

  U->>F: 提交任务
  F->>A: POST /api/v1/tasks
  A->>S: 创建任务
  S->>Q: 发送任务消息
  Q-->>S: 确认
  S-->>A: 返回task_id
  A-->>F: 返回task_id
  F-->>U: 显示处理中
  
  loop 轮询
    F->>A: GET /api/v1/tasks/:id/status
    A->>S: 查询状态
    S-->>A: 状态更新
    A-->>F: 进度更新
  end
```

---

## 5. 时序图组件说明

### 5.1 参与者定义

| 参与者 | 类型 | 说明 |
|--------|------|------|
| {{participant}} | 前端/后端/DB/外部 | {{description}} |

### 5.2 消息类型

| 类型 | 表示 | 说明 |
|------|------|------|
| 同步请求 | `->>` | 等待响应 |
| 异步消息 | `-->>` | 不等待响应 |
| 返回 | `-->>` | 响应结果 |

---

## 6. 版本记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| V1.0 | {{date}} | 初始版本 | {{author}} |