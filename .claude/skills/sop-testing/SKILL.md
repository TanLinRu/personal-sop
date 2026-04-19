---
name: sop-testing
description: 标准测试执行流程 - 单元测试→集成测试→端到端测试→性能测试（含多Agent并行）
version: 1.0.0
triggers:
  - "测试"
  - "单元测试"
  - "集成测试"
  - "测试用例"
  - "编写测试"
  - "/sop testing"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow

execution:
  mode: sequential
  timeout: 300000
---

# SOP Testing - 标准测试执行流程

## 概述

本 SOP 提供标准化的测试执行流程，覆盖单元测试、集成测试、端到端测试和性能测试。

## 使用场景

- 新功能开发完成后的测试验证
- Bug 修复后的回归测试
- 重构前的基线测试
- 上线前的测试验收

## 流程步骤

### 步骤一：单元测试（Unit Test）

**目标**：验证单个组件的功能正确性

**执行内容**：
1. 定位待测组件
2. 检查/编写单元测试
3. 运行单元测试
4. 覆盖率检查

**命令示例**：
```bash
# Java - JUnit 5
./mvn test -Dtest=UserServiceTest

# Vue/React
npm run test:unit
```

**输出**：
```markdown
---
sop: testing
step: 1_unit
status: in_progress
---

## 单元测试结果

| 测试类 | 测试数 | 通过 | 失败 |
|--------|-------|------|------|
| UserServiceTest | 15 | 15 | 0 |

覆盖率: 85%
```
---

### 步骤二：集成测试（Integration Test）

**目标**：验证组件间的协作

**执行内容**：
1. 启动测试环境（内存数据库）
2. 运行集成测试
3. 验证数据流转
4. 检查事务一致性

**命令示例**：
```bash
# Java - Testcontainers
./mvn verify -DskipTests=false

# Spring Boot
./mvn test -Dspring.profiles.active=test
```

**输出**：
```markdown
---
sop: testing
step: 2_integration
status: in_progress
---

## 集成测试结果

| 测试类 | 场景 | 结果 |
|--------|------|------|
| UserRepositoryTest | CRUD | PASS |
| PaymentServiceTest | 支付流程 | PASS |
```
---

### 步骤三：端到端测试（E2E Test）

**目标**：模拟真实用户操作

**执行内容**：
1. 启动完整服务
2. 执行用户场景
3. 验证UI/接口响应
4. 检查日志输出

**命令示例**：
```bash
# Playwright
npx playwright test

# Cypress
npx cypress run
```

**输出**：
```markdown
---
sop: testing
step: 3_e2e
status: in_progress
---

## E2E测试结果

| 场景 | 步骤 | 结果 |
|------|------|------|
| 用户注册 | 3步 | PASS |
| 登录 | 2步 | PASS |
| 支付 | 5步 | PASS |
```
---

### 步骤四：性能测试（Performance Test）

**目标**：验证系统的性能指标

**执行内容**：
1. 设计压测场景
2. 配置并发参数
3. 执行压测
4. 分析结果

**工具**：
- JMeter
- k6
- wrk

**命令示例**：
```bash
# k6
k6 run test.js

# JMeter
jmeter -n -t test.jmx
```

**输出**：
```markdown
---
sop: testing
step: 4_performance
status: in_progress
---

## 性能测试结果

| 指标 | 期望值 | 实际值 | 结果 |
|--------|--------|--------|------|
| QPS | >1000 | 1200 | ✅ |
| 响应时间P99 | <200ms | 180ms | ✅ |
| 错误率 | <0.1% | 0.05% | ✅ |
```
---

## 测试报告模板

```markdown
---
sop: testing
step: 4_performance
status: completed
---

## 测试报告

### 摘要
- 总测试数: 150
- 通过: 148
- 失败: 2
- 覆盖率: 85%

### 通过测试
- 单元测试: 120 ✅
- 集成测试: 20 ✅
- E2E测试: 8 ✅
- 性能测试: 通过

### 失败测试
- PaymentServiceTest.testRefund - 参数错误
- UserE2ETest.testPasswordReset - 超时

### 建议
- 修复失败的测试后再上线
```