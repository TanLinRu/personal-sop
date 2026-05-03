---
name: sop-testing
description: 标准测试执行流程 - 环境搭建→单元测试→集成测试→E2E→API测试→安全测试→性能测试
version: 2.0.0
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
  checkpoint_dir: .sop/state
  state_file: .sop/state/testing-{id}.json
---

# SOP Testing - 标准测试执行流程

## 概述

本 SOP 提供标准化的测试执行流程，覆盖环境搭建、单元测试、集成测试、端到端测试、API 测试、安全测试和性能测试。

## 与其他 SOP 的关系

| 前置 SOP | 用途 |
|----------|------|
| sop-test-design | 提供结构化测试用例（`.sop/output/test-cases-*.md`） |
| sop-prd | 提供验收标准和用户故事 |

| 后续 SOP | 触发时机 |
|----------|----------|
| sop-regression | 持续回归测试 |
| sop-bug-fix | 测试失败时 |

## 使用场景

- 新功能开发完成后的测试验证
- Bug 修复后的回归测试
- 重构前的基线测试
- 上线前的测试验收

## Agent 委托

本 SOP 委托以下 Agent 执行专项任务：

| Agent | 用途 | 触发时机 |
|-------|------|----------|
| `tdd-guide` | 测试驱动开发，先写测试再实现 | 步骤一（单元测试编写） |
| `code-reviewer` | 审查测试代码质量 | 每个步骤完成后 |
| `e2e-runner` | 端到端测试执行 | 步骤三（E2E 测试） |

**调用示例**：
```
Agent(
  subagent_type="tdd-guide",
  prompt="为 UserService 编写单元测试，覆盖 CRUD 操作和边界条件"
)
```

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 测试框架未安装 | 提示安装命令，中止执行 |
| 测试覆盖率 < 80% | 列出未覆盖的方法，提示补充 |
| 集成测试环境启动失败 | 检查 Docker/数据库配置，给出排查步骤 |
| E2E 测试超时 | 增加重试机制，记录失败截图 |
| 性能测试不达标 | 输出性能报告，建议优化方向 |

## 测试数据管理

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| 内存数据库 | 集成测试 | H2 / Testcontainers |
| 测试 Fixture | 单元测试 | Builder 模式 / Faker |
| 数据库快照 | E2E 测试 | `@Sql` / Flyway 迁移脚本 |
| 数据隔离 | 并行测试 | 每个测试用例独立事务回滚 |

## 状态持久化

每个步骤完成后自动保存状态到 `.sop/state/testing-{id}.json`：

```json
{
  "sop": "testing",
  "task_id": "testing-{id}",
  "status": "in_progress",
  "current_step": 0,
  "steps": {
    "0_setup": { "status": "completed" },
    "1_unit": { "status": "completed", "coverage": 85 },
    "2_integration": { "status": "in_progress" },
    "3_e2e": { "status": "pending" },
    "4_api": { "status": "pending" },
    "5_security": { "status": "pending" },
    "6_performance": { "status": "pending" }
  },
  "results": {
    "total": 150,
    "passed": 148,
    "failed": 2
  }
}
```

## 流程步骤

### 步骤零：环境搭建 (Setup) [AUTO]

**目标**：检测测试框架、验证安装、生成缺失配置

**执行内容**：
1. 检测项目类型和测试框架
2. 验证测试框架已安装
3. 检查测试配置文件
4. 加载 sop-test-design 输出（如有）

**框架检测**：

| 项目文件 | 测试框架 | 配置文件 |
|----------|----------|----------|
| pom.xml | JUnit 5 + Maven Surefire | pom.xml `<surefire>` |
| build.gradle | JUnit 5 + Gradle | build.gradle `test {}` |
| package.json (jest) | Jest | jest.config.js |
| package.json (vitest) | Vitest | vitest.config.ts |
| requirements.txt | pytest | pytest.ini / pyproject.toml |
| playwright.config.ts | Playwright | playwright.config.ts |

**test-design 输入检查**：

```bash
# 检查是否有 sop-test-design 产出
Glob(pattern=".sop/output/test-cases-*.md")

# 有则加载作为测试规格
# 无则使用项目已有测试用例
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts testing 0_setup completed
```

### 步骤一：单元测试（Unit Test） [AUTO]

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

### 步骤二：集成测试（Integration Test） [AUTO]

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

### 步骤三：端到端测试（E2E Test） [AUTO]

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

### 步骤四：API 测试（API Test） [AUTO]

**目标**：验证 API 接口的正确性、契约和安全性

**执行内容**：
1. 加载 API 规格（OpenAPI/Swagger）
2. 执行契约测试
3. 验证响应格式和状态码
4. 检查认证/授权
5. 测试错误码覆盖

**测试内容**：

| 测试类型 | 说明 | 工具 |
|----------|------|------|
| 契约测试 | 验证请求/响应格式 | Postman / REST Assured |
| 响应时间 | 验证接口响应时间 | 自定义断言 |
| 错误码覆盖 | 覆盖所有错误码 | 参数化测试 |
| 认证授权 | 验证 Token/权限 | Spring Security Test |

**命令示例**：
```bash
# REST Assured (Java)
./mvn test -Dtest=ApiTest

# Postman / Newman
newman run collection.json -e environment.json

# Supertest (Node.js)
npm run test:api
```

**输出**：
```markdown
## API 测试结果

| 接口 | 方法 | 状态码 | 响应时间 | 结果 |
|------|------|--------|----------|------|
| /api/users | GET | 200 | 50ms | ✅ |
| /api/users | POST | 201 | 80ms | ✅ |
| /api/users/999 | GET | 404 | 30ms | ✅ |
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts testing 4_api completed
```

---

### 步骤五：安全测试（Security Test） [AUTO]

**目标**：检查常见安全漏洞

**执行内容**：
1. OWASP 依赖检查
2. 输入验证测试
3. SQL 注入基础检查
4. XSS 基础检查
5. 认证绕过检查

**测试内容**：

| 测试类型 | 说明 | 工具 |
|----------|------|------|
| 依赖漏洞 | 检查已知 CVE | OWASP Dependency-Check |
| SQL 注入 | 参数化查询验证 | 代码审查 + SQLMap |
| XSS | 输出编码验证 | 代码审查 |
| CSRF | Token 验证 | 浏览器测试 |
| 认证绕过 | 权限验证 | 手动/自动测试 |

**命令示例**：
```bash
# OWASP Dependency-Check
dependency-check --project myproject --scan ./src

# npm audit
npm audit --production

# Maven dependency-check
./mvn org.owasp:dependency-check-maven:check
```

**输出**：
```markdown
## 安全测试结果

| 检查项 | 结果 | 详情 |
|--------|------|------|
| 依赖漏洞 | ✅ | 无 HIGH/CRITICAL 漏洞 |
| SQL 注入 | ✅ | 全部使用参数化查询 |
| XSS | ✅ | 输出已编码 |
| CSRF | ✅ | Token 已启用 |
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts testing 5_security completed
```

---

### 步骤六：性能测试（Performance Test） [AUTO]

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
- 运行 `/sop bug-fix` 修复失败用例
```

## 推荐下一步

| 场景 | 命令 | 说明 |
|------|------|------|
| 有失败用例 | `/sop bug-fix` | 修复失败的测试 |
| 持续回归 | `/sop regression` | 变更后选择性回归测试 |
| 代码审查 | `/sop code-review` | 审查测试代码质量 |
| 准备部署 | `/sop deployment` | 测试通过后部署 |