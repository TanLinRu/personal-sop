---
sop: deployment
version: 1.0.0
last_updated: 2026-06-10
---

# SOP Deployment — Execution Steps

> 5 步骤：构建 → 验证 → 预发布 → 正式发布 → 监控与回滚
> 2 确认点（预发布、正式发布）

## Overview

| Step | 名称 | 类型 | 标记 |
|------|------|------|------|
| 1 | 构建 | AUTO | - |
| 2 | 验证 | AUTO | - |
| 3 | 预发布 | CONFIRM | ⭐ |
| 4 | 正式发布 | CONFIRM | ⭐ |
| 5 | 监控与回滚 | AUTO | - |

确认点总数：2

---

## Step 1: 构建 (Build) [AUTO]

**目标**：生成可部署产物

**执行内容**：

1. 清理构建缓存
2. 执行构建命令
3. 生成制品（jar / dist / image）

**命令示例**：

```powershell
# Java 后端
./mvn clean package -DskipTests

# Vue 前端
npm run build
```

**输出**：构建报告 `.sop/output/deploy-{id}/01_build.md`

| 模块 | 产物 | 大小 |
|------|------|------|
| backend | app.jar | 45MB |
| frontend | dist/ | 12MB |

**状态命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts deployment 1_build completed artifact=app-1.2.0.jar
```

---

## Step 2: 验证 (Verify) [AUTO]

**目标**：确保产物可用

**执行内容**：

1. 检查文件完整性
2. 验证配置文件
3. 健康检查

**命令示例**：

```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 端口检查
netstat -an | grep 8080
```

**输出**：验证报告 `.sop/output/deploy-{id}/02_verify.md`

| 检查项 | 状态 |
|--------|------|
| jar 完整性 | ✅ |
| 配置文件存在 | ✅ |
| 健康检查 | ✅ |

**状态命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts deployment 2_verify completed
```

---

## Step 3: 预发布 (Staging) ⭐ [CONFIRM_REQUIRED]

**目标**：在预发环境验证

**执行内容**：

1. 部署到预发环境
2. 执行冒烟测试
3. 验证核心流程

**命令示例**：

```bash
# Docker 部署
docker-compose -f docker-compose-staging.yml up -d

# 检查日志
docker logs -f app-staging
```

**输出**：预发报告 `.sop/output/deploy-{id}/03_staging.md`

| 场景 | 结果 |
|------|------|
| 用户注册 | ✅ |
| 登录 | ✅ |
| 支付 | ✅ |
| 核心功能 | ✅ |

**状态命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts deployment 3_staging completed
```

---

## Step 4: 正式发布 (Production) ⭐ [CONFIRM_REQUIRED]

**目标**：发布到生产环境

**执行内容**：

1. 备份当前版本
2. 停止旧服务
3. 启动新服务
4. 验证运行状态

**命令示例**：

```bash
# Docker 部署
docker-compose -f docker-compose-prod.yml up -d

# Kubernetes
kubectl apply -f deployment.yaml
```

**输出**：发布报告 `.sop/output/deploy-{id}/04_production.md`

| 项目 | 值 |
|------|------|
| 备份 | app-previous.jar |
| 新版本 | app-1.2.0.jar |
| 启动时间 | 15s |
| 状态 | RUNNING |

**状态命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts deployment 4_production completed
```

---

## Step 5: 监控与回滚 (Monitor & Rollback) [AUTO]

**目标**：监控发布后状态

**执行内容**：

1. 监控错误率（阈值 > 1% 触发回滚）
2. 监控响应时间（P99 > 500ms 触发回滚）
3. 异常则执行回滚

**回滚命令**：

```bash
# Docker 回滚
docker-compose -f docker-compose-prod.yml down
docker-compose -f docker-compose-prod-previous.yml up -d

# Kubernetes 回滚
kubectl rollout undo deployment/app
```

**输出**：监控报告 `.sop/output/deploy-{id}/05_monitor.md`

| 指标 | 状态 | 阈值 |
|------|------|------|
| 错误率 | 0.1% ✅ | < 1% |
| P99 响应时间 | 180ms ✅ | < 500ms |
| 健康检查 | ✅ | 连续 3 次通过 |
| 内存使用 | 65% ✅ | < 90% |

**状态命令**：

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts deployment 5_monitor completed
```

---

## 数据库迁移（嵌入 Step 1-4）

发布前必须处理数据库变更：

| 工具 | 适用场景 | 命令 |
|------|----------|------|
| Flyway | Spring Boot 项目 | `flyway migrate` |
| Liquibase | 多数据库支持 | `liquibase update` |
| 手动脚本 | 小型项目 | 按顺序执行 SQL |

**迁移策略**：
1. **先迁移，后发布**：数据库变更先于代码部署
2. **向后兼容**：新增字段用 DEFAULT，避免破坏旧代码
3. **回滚脚本**：每个迁移必须有对应的回滚脚本

---

## 回滚阈值

发布后监控指标超过以下阈值时自动触发回滚：

| 指标 | 阈值 | 监控方式 |
|------|------|----------|
| 错误率 | > 1% | Prometheus / Grafana |
| 响应时间 P99 | > 500ms | APM 工具 |
| 健康检查失败 | 连续 3 次 | 负载均衡器 |
| 内存使用 | > 90% | 系统监控 |

---

## Expected Outputs

| Step | 必填 | 输出文件 |
|------|------|----------|
| 1_build | ✓ | `.sop/output/deploy-{id}/01_build.md` |
| 2_verify | ✓ | `.sop/output/deploy-{id}/02_verify.md` |
| 3_staging | ✓ | `.sop/output/deploy-{id}/03_staging.md` |
| 4_production | ✓ | `.sop/output/deploy-{id}/04_production.md` |
| 5_monitor | ✓ | `.sop/output/deploy-{id}/05_monitor.md` |

## State Persistence

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts deployment {step} {status} [key=value ...]
```

State file: `.sop/state/deployment-{id}.json`
Step 映射: `.claude/scripts/sop-step-map.json`

## 断点续传

```bash
npx ts-node --transpile-only .claude/scripts/sop-resume-check.ts deployment
```

## Key References

| Reference | Location |
|-----------|----------|
| SKILL.md | `.claude/skills/sop-deployment/SKILL.md` |
| expected.yml | `.claude/skills/sop-deployment/expected.yml` |
