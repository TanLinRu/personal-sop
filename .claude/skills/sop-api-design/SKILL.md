---
name: sop-api-design
description: 标准REST API设计流程 - 资源建模→接口定义→版本管理→文档编写
version: 1.0.0
triggers:
  - "API设计"
  - "接口设计"
  - "REST"
  - "接口定义"
  - "/sop api-design"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: sequential
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/api-{id}.json
---

# SOP API Design - REST API设计规范

## 概述

本 SOP 提供标准化的 REST API 设计流程，确保接口一致性、安全性和可维护性。

## 使用场景

- 新业务流程的API设计
- 第三方接口对接
- 微服务接口定义
- OpenAPI规范编写

## CodeGraph 集成（v3.0.0）

> 已从 Graphify 迁移到 CodeGraph。详见 `sop-dependency-analysis` v3.0.0。

在设计新 API 前，使用 CodeGraph 检测已有接口冲突：

```bash
# 一等公民：CodeGraph（自动同步，无需 update）
codegraph search "@GetMapping" --json
codegraph search "@PostMapping" --json
codegraph search "@RequestMapping" --json
codegraph search --kind=route --json   # 所有框架路由（Spring/Express/FastAPI/...）

# MCP 调用（agent 自动）
# codegraph_explore "all REST routes in this project"
# codegraph_search "@RequestMapping"

# Graphify 兼容路径（仅当 CodeGraph 不可用）
graphify query "搜索所有 REST API 端点及其路径和方法"
graphify query "搜索所有 @RequestMapping 注解及其路径"
```

**冲突检测策略**：
| 冲突类型 | 检测方式 | 处理建议 |
|----------|----------|----------|
| 路径重复 | 路径 + HTTP 方法完全匹配 | 修改路径或合并接口 |
| 路径歧义 | 路径参数位置不同 | 统一参数命名 |
| 响应格式不一致 | 对比返回类型 | 统一响应格式 |

## 知识更新

API 设计完成后：

- **CodeGraph**：无需手动更新，文件保存后 2 秒内自动同步索引
- **Graphify 兼容**：`graphify update ./backend --out .sop/dependency-graph/{project}/backend`

## 流程步骤

### 步骤一：资源建模（Resource Modeling） [CONFIRM_REQUIRED]

**目标**：定义业务资源和关系

**执行内容**：
1. 识别业务实体
2. 确定资源层级
3. 设计URL结构

**原则**：
- 使用名词而非动词
- 资源使用复数
- 层级不过3层

**示例**：
```
/api/v1/users
/api/v1/users/{userId}/orders
/api/v1/orders/{orderId}/items
```

**输出**：
```markdown
---
sop: api-design
step: 1_resource
status: in_progress
---

## 资源模型

| 资源 | 层级 | 说明 |
|------|------|------|
| users | 1 | 用户 |
| orders | 1 | 订单 |
| order-items | 2 | 订单明细 |
| {resource} | 1 | {资源描述} |
```
---

### 步骤二：HTTP方法设计 [AUTO]

**目标**：正确使用HTTP动词

**执行内容**：
1. GET - 查询
2. POST - 创建
3. PUT - 完整更新
4. PATCH - 部分更新
5. DELETE - 删除

**CRUD映射**：
```bash
GET    /users          # 获取用户列表
GET    /users/{id}     # 获取单个用户
POST   /users          # 创建用户
PUT    /users/{id}     # 完整更新用户
PATCH  /users/{id}    # 部分更新用户
DELETE /users/{id}    # 删除用户
```

**输出**：
```markdown
---
sop: api-design
step: 2_method
status: in_progress
---

## 接口定义

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /users | 获取用户列表 |
| POST | /users | 创建用户 |
| GET | /users/{id} | 获取用户详情 |
| PUT | /users/{id} | 更新用户 |
| DELETE | /users/{id} | 删除用户 |
```
---

### 步骤三：响应格式设计 [AUTO]

**目标**：统一响应结构

**执行内容**：
1. 成功响应
2. 错误响应
3. 分页响应

**标准格式**：
```json
// 成功
{
  "code": 200,
  "message": "success",
  "data": {}
}

// 分页
{
  "code": 200,
  "message": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "size": 10,
    "total": 100
  }
}

// 错误
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

**输出**：
```markdown
---
sop: api-design
step: 3_response
status: in_progress
---

## 响应码定义

| 码 | 含义 |
|----|------|
| 200 | 成功 |
| 400 | 请求错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
```
---

### 步骤四：版本管理 [AUTO]

**目标**：支持API演进

**执行内容**：
1. URL版本控制
2. Header版本控制
3. 废弃策略

**版本策略**：
```bash
# 推荐：URL版本
/api/v1/users
/api/v2/users

# 不推荐：Header版本
Accept: application/vnd.company.v1+json
```

**输出**：
```markdown
---
sop: api-design
step: 4_version
status: in_progress
---

## 版本策略

- 当前版本: v1
- 废弃周期: 6个月
- 废弃通知: Header增加Deprecation
```
---

### 步骤五：安全设计 [AUTO]

**目标**：确保接口安全

**执行内容**：
1. 认证机制
2. 授权控制
3. 速率限制
4. 敏感数据脱敏

**安全头**：
```bash
# 认证
Authorization: Bearer <token>

# 速率限制
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
```

**输出**：
```markdown
---
sop: api-design
step: 5_security
status: in_progress
---

## 安全策略

| 安全措施 | 实现方式 |
|---------|--------|
| 认证 | JWT Token |
| 授权 | RBAC |
| 速率限制 | 100次/分钟 |
| 敏感数据 | 脱敏处理 |
```
---

### 步骤六：文档编写 [AUTO]

**目标**：生成可维护文档

**工具**：
- Swagger/OpenAPI
- Knife4j
- Redoc

**输出**：
```markdown
---
sop: api-design
step: 6_documentation
status: completed
---

## API文档

- 在线文档: /doc.html
- OpenAPI: /v3/api-docs
- 测试端点: 支持
```
---

## RESTful设计原则

| 原则 | 说明 |
|-----|------|
| 统一接口 | 使用标准HTTP方法 |
| 无状态 | 不保存客户端状态 |
| 可缓存 | 添加缓存头 |
| 客户端-服务器 | 分离关注点 |
| 分层系统 | 允许代理/网关 |