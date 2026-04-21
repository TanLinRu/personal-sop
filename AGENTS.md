# AGENTS.md

## 项目概述

游戏风控系统 - Spring Boot 2.7.18 + JDK 21 + Vue 3 + MySQL 8。

## 技术栈

| 组件 | 版本 | 端口 |
|------|------|------|
| JDK | 21 | - |
| Spring Boot | 2.7.18 | 8080 |
| MyBatis-Plus | 3.5.3 | - |
| MySQL | 8.0 | 3306 |
| Redis | 7 | 6379 |
| Kafka | 4.0 | 9092 |
| ClickHouse | 23.8 | 8123/9000 |

## 基础设施服务

```powershell
# 启动所有基础设施
docker compose -f docker-compose-dev.yml up -d

# 服务状态
docker compose -f docker-compose-dev.yml ps
```

| 服务 | 端口 | 健康检查 |
|------|------|----------|
| Redis | 6379 | `docker exec gamerisk-redis redis-cli ping` |
| Kafka | 9092 | `kafka-topics.sh --list` |
| ClickHouse | 8123 | `docker exec gamerisk-clickhouse clickhouse-client --query "SELECT 1"` |

## 启动命令

```powershell
# 编译
.\run-compile.ps1

# 后端（非阻塞）
Start-Process powershell -ArgumentList "-Command", "cd backend; mvn spring-boot:run"

# 前端
cd frontend; npm run dev
```

## API端点

| 模块 | 端点 | 阈值 |
|------|------|------|
| 注册 | POST /api/risk/register/check | 70分 |
| 登录 | POST /api/risk/login/check | 70分 |
| 支付 | POST /api/risk/payment/check | 75分 |
| 反作弊 | POST /api/risk/anticheat/check | 80分 |
| 内容 | POST /api/risk/content/check | 75分 |

### Response Decision

| Decision | 含义 |
|----------|------|
| ALLOW | 允许通过 |
| REVIEW | 需要人工审核 |
| BLOCK | 阻止操作 |

### RiskLevel

| Level | 范围 |
|-------|------|
| LOW | 0-29 |
| MEDIUM | 30-59 |
| HIGH | 60-89 |
| CRITICAL | 90+ |

## 测试命令

```powershell
# Windows curl 必须使用 --data-binary
curl -X POST http://localhost:8080/api/risk/anticheat/check -H "Content-Type: application/json" --data-binary @request.json
```

## 常见问题

| 问题 | 解决 |
|------|------|
| 400 Bad Request | Controller内部类必须用`@Data`注解 |
| 编译失败 | 运行`.\run-compile.ps1` |
| curl JSON解析错误 | Windows用`--data-binary` |

## ECC 集成

### 子代理 (Agents)

使用 `task` 工具调用：

```python
# 并行调用多个Agent
search_task = task(
  subagent_type="code-reviewer",
  prompt="搜索相关代码..."
)

analysis_task = task(
  subagent_type="java-reviewer",
  prompt="分析代码..."
)

results = await gather(search_task, analysis_task)
```

| Agent | 用途 |
|-------|------|
| code-reviewer | 代码搜索、通用审查 |
| java-reviewer | Java/Spring Boot 分析 |
| security-scan | 安全漏洞扫描 |
| java-build-resolver | 构建错误修复 |
| security_scan | 安全扫描（别名） |

### SOP 命令

| 命令 | 用途 |
|------|------|
| /sop testing | 测试流程 |
| /sop bug-fix | Bug修复（含并行搜索） |
| /sop code-review | 代码审查（含并行检查） |
| /sop deployment | 部署流程 |

### ContextGraph MCP（可选）

用于迭代过程中的知识共享和状态追踪：

```yaml
# MCP配置 (如需要)
mcpServers:
  contextgraph:
    command: python -m contextgraph.mcp_server
    args: [--local]
```

## Skills

位置：`.claude/skills/`

| 分类 | Skill | 用途 |
|------|-------|------|
| 流程 | sop-testing | 测试执行 |
| 流程 | sop-deployment | 部署发布 |
| 流程 | sop-api-design | API设计 |
| 流程 | sop-database-design | 数据库设计 |
| 流程 | sop-code-review | 代码审查 |
| 流程 | sop-bug-fix | Bug修复 |
| 流程 | sop-incident-response | 线上响应 |
| 工具 | dr-jskill | Java项目生成 |
| 工具 | frontend-design | 前端设计 |

## 参考资料

| 文件 | 用途 |
|------|------|
| `.claude/skills/dr-jskill/references/` | Lombok、MyBatis-Plus等参考 |
| `opencode.json` | 项目级ECC配置 |
| `docker-compose-dev.yml` | 基础设施配置 |