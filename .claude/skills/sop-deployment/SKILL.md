---
name: sop-deployment
description: 标准部署发布流程 - 构建→验证→预发布→正式发布→回滚
version: 1.0.0
triggers:
  - "部署"
  - "发布"
  - "上线"
  - "deploy"
  - "/sop deployment"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow

execution:
  mode: sequential
  timeout: 600000
  checkpoint_dir: .sop/state
  state_file: .sop/state/deployment-{id}.json
---

# SOP Deployment - 标准部署发布流程

## 概述

本 SOP 提供标准化的部署发布流程，确保应用安全可靠地部署到生产环境。

## 使用场景

- 新功能上线
- 紧急Bug修复
- 配置变更
- 架构升级

## 流程步骤

### 步骤一：构建（Build） [AUTO]

**目标**：生成可部署产物

**执行内容**：
1. 清理缓存
2. 执行构建
3. 生成制品

**命令示例**：
```powershell
# Java后端
./mvn clean package -DskipTests

# Vue前端
npm run build
```

**输出**：
```markdown
---
sop: deployment
step: 1_build
status: in_progress
---

## 构建结果

| 模块 | 产物 | 大小 |
|------|------|------|
| backend | game-risk-control.jar | 45MB |
| frontend | dist/ | 12MB |
```
---

### 步骤二：验证（Verify）

**目标**：确保产物可用

**执行内容**：
1. 检查文件完整性
2. 验证配置
3. 健康检查

**命令示例**：
```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 端口检查
netstat -an | grep 8080
```

**输出**：
```markdown
---
sop: deployment
step: 2_verify
status: in_progress
---

## 验证结果

| 检查项 | 状态 |
|--------|------|
| jar完整性 | ✅ |
| 配置文件存在 | ✅ |
| 健康检查 | ✅ |
```
---

### 步骤三：预发布（Staging）

**目标**：在预发环境验证

**执行内容**：
1. 部署到预发环境
2. 执行冒烟测试
3. 验证核心流程

**命令示例**：
```bash
# Docker部署
docker-compose -f docker-compose-staging.yml up -d

# 检查日志
docker logs -f app-staging
```

**输出**：
```markdown
---
sop: deployment
step: 3_staging
status: in_progress
---

## 预发布验证

| 场景 | 结果 |
|------|------|
| 用户注册 | ✅ |
| 登录 | ✅ |
| 支付 | ✅ |
| 反作弊 | ✅ |
```
---

### 步骤四：正式发布（Production）

**目标**：发布到生产环境

**执行内容**：
1. 备份当前版本
2. 停止旧服务
3. 启动新服务
4. 验证运行状态

**命令示例**：
```bash
# Docker部署
docker-compose -f docker-compose-prod.yml up -d

# 或Kubernetes
kubectl apply -f deployment.yaml
```

**输出**：
```markdown
---
sop: deployment
step: 4_production
status: in_progress
---

## 发布结果

- 备份: game-risk-control-20240419.jar
- 新版本: game-risk-control-1.2.0.jar
- 启动时间: 15s
- 状态: RUNNING
```
---

### 步骤五：监控与回滚（Monitor & Rollback）

**目标**：监控发布后状态

**执行内容**：
1. 监控错误率
2. 监控响应时间
3. 异常则回滚

**回滚命令**：
```bash
# Docker回滚
docker-compose -f docker-compose-prod.yml up -d --rollback

# Kubernetes回滚
kubectl rollout undo deployment/app
```

**输出**：
```markdown
---
sop: deployment
step: 5_monitor
status: completed
---

## 监控数据（发布后30分钟）

| 指标 | 状态 |
|--------|------|
| 错误率 | 0.1% ✅ |
| 响应时间 | 150ms ✅ |
| CPU使用率 | 45% ✅ |
| 内存使用 | 1.2GB ✅ |

结论: 发布成功
```
---

## 发布检查清单

```markdown
---
sop: deployment
step: verification_checklist
status: completed
---

## 发布检查清单

### 构建阶段
- [ ] 代码已通过CI/CD
- [ ] 单元测试全部通过
- [ ] 构建产物生成成功

### 预发布阶段
- [ ] 冒烟测试通过
- [ ] 核心流程可用
- [ ] 日志正常输出

### 发布阶段
- [ ] 备份已完成
- [ ] 新版本启动成功
- [ ] 健康检查通过
- [ ] 基本功能可用

### 监控阶段
- [ ] 错误率<1%
- [ ] 响应时间正常
- [ ] 无重大报错
```