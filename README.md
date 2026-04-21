# Game Risk Control - 游戏风控系统

游戏账号安全风控后端服务，提供注册、登录、支付、反作弊、内容风控等检测能力。

## 技术栈

| 组件 | 版本 |
|------|------|
| JDK | 21 |
| Spring Boot | 2.7.18 |
| MyBatis-Plus | 3.5.3 |
| LiteFlow | 2.15.3 |
| Knife4j | 4.3.0 |
| MySQL | 8.0 |
| Redis | 7.4 |
| Kafka | 4.0 |

## 项目结构

```
personal-sop/
├── backend/                  # Spring Boot后端
│   └── src/main/java/com/gamerisk/
│       ├── controller/        # API控制器
│       ├── service/        # 业务逻辑
│       ├── entity/         # 数据实体
│       └── config/        # 配置类
├── frontend/               # Vue 3前端
│   └── src/
│       ├── views/        # 页面视图
│       ├── components/   # 组件
│       └── stores/       # 状态管理
├── .claude/skills/        # SOP Skills (15个)
│   ├── sop-testing/       # 测试执行
│   ├── sop-deployment/    # 部署发布
│   ├── sop-api-design/    # API设计
│   ├── sop-database-design/# 数据库设计
│   └── dr-jskill/        # Java项目工具
├── docker-compose-dev.yml # 开发环境
└── AGENTS.md            # 项目指南
```

## 快速开始

### 1. 启动后端

```powershell
.\run-compile.ps1
cd backend; mvn spring-boot:run
```

服务启动后访问: http://localhost:8080

### 2. API文档

- Knife4j: http://localhost:8080/doc.html
- Swagger: http://localhost:8080/swagger-ui.html

### 3. 健康检查

```bash
curl http://localhost:8080/actuator/health
```

## API接口

### Windows curl测试命令

```powershell
# 使用 --data-binary 避免JSON解析错误
curl -X POST http://localhost:8080/api/risk/register/check -H "Content-Type: application/json" --data-binary @request.json
```

### API端点

| 模块 | 端点 | 说明 |
|------|------|------|
| 注册 | POST /api/risk/register/check | 设备指纹/虚拟号检测 |
| 登录 | POST /api/risk/login/check | 异地/暴力破解检测 |
| 支付 | POST /api/risk/payment/check | 欺诈/洗钱检测 |
| 反作弊 | POST /api/risk/anticheat/check | 行为分析/速度检测 |
| 内容 | POST /api/risk/content/check | 敏感词/广告检测 |

## 风控规则

### 注册风控
- IP注册次数过多 → +40分
- 设备注册次数过多 → +30分
- 虚拟运营商号段(170/171/178) → +25分
- 代理IP → +35分
- 阈值: 70分

### 登录风控
- 登录失败多次 → +15分/次
- 可疑IP段(10.0./172.16.) → +30分
- 账户锁定 → 100分
- 阈值: 70分

### 支付风控
- 单笔>5000 → +40分
- 日累计>10000 → +35分
- 高风险卡bin → +25分
- 高风险国家(KP/IR/SY) → +30分
- 新用户 → +15分
- 阈值: 75分

### 反作弊
- 移动速度异常(speed>2.5) → 60-90分
- 瞬移(distance/time>50) → 70-95分
- 命中率>95% → +50分
- 反应时间<50ms → +40分
- 脚本行为(点击间隔<100ms) → +40分
- 阈值: 80分

### 内容风控
- 敏感词(+25分): 作弊/外挂/脚本/黑号/代练
- 广告词(+20分): QQ群/微信群/低价
- 违法词(+40分): 枪/毒品/赌博
- URL(+30分)
- 联系方式(+25分)
- 阈值: 75分

## 测试用例

### Windows curl (必须使用 --data-binary)
```powershell
# 注册
curl -X POST http://localhost:8080/api/risk/register/check -H "Content-Type: application/json" --data-binary @test.json

# 反作弊 - 高速检测
curl -X POST http://localhost:8080/api/risk/anticheat/check -H "Content-Type: application/json" --data-binary @anticheat.json
```

### 测试JSON文件示例
```json
// test.json
{"userId":"test001","userIp":"192.168.1.100","deviceId":"device123","phone":"13800138000"}

// anticheat.json
{"userId":"hacker","userIp":"1.1.1.1","deviceId":"dev1","behaviorType":"MOVE_SPEED","gameData":{"speed":10.0}}
```

## 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": null,
    "eventType": "REGISTER",
    "userId": "test001",
    "userIp": "192.168.1.100",
    "deviceId": "device123",
    "riskLevel": 30,
    "riskScore": "0",
    "decision": "ALLOW",
    "details": null,
    "createTime": "2026-04-19T18:30:47.2574348"
  }
}
```

### Decision说明
- `ALLOW` - 允许通过
- `REVIEW` - 需要人工审核
- `BLOCK` - 阻止操作

### RiskLevel说明
- 0-29: LOW - 低风险
- 30-59: MEDIUM - 中风险
- 60-89: HIGH - 高风险
- 90+: CRITICAL - 严重风险

## 数据库

### 初始化
```bash
mysql -u root -p gamerisk < backend/src/main/resources/init.sql
```

### 表结构
- `sys_user` - 系统用户
- `risk_event` - 风控事件记录

## 前端

```bash
cd frontend
npm install
npm run dev
```

前端访问: http://localhost:5173

## SOP Skills

项目包含15个标准化流程Skill，位置：`.claude/skills/`

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
| 工具 | tailwind-design-system | Tailwind CSS |

使用示例：
```
/sop testing        # 执行测试流程
/sop bug-fix       # 修复Bug流程
/sop api-design   # 设计API
```

## ECC Agents

项目支持调用 AI Agent 进行并行代码审查和业务分析：

| Agent | 用途 |
|-------|------|
| code-reviewer | 代码格式和规范审查 |
| java-reviewer | Java/Spring Boot 专家分析 |
| security-scan | 安全漏洞扫描 |
| java-build-resolver | 构建错误修复 |

并行执行示例：
```
# 并行调用多个 Agent
/search [关键词]    # 搜索相关代码
/review [文件]      # 代码审查
```

## 常见问题

| 问题 | 解决 |
|------|------|
| 编译失败 | 运行 `.\run-compile.ps1` |
| 400 Bad Request | 使用 `--data-binary @file.json` |
| curl JSON错误 | Windows必须用 `--data-binary` |

## 基础设施服务

```powershell
# 启动所有基础设施
docker compose -f docker-compose-dev.yml up -d
```

| 服务 | 端口 | 账号 |
|------|------|------|
| MySQL | 3306 | root/(空密码) |
| Redis | 6379 | - |
| Kafka | 9092 | - |
| ClickHouse | 8123 | default/(空密码) |

## 配置说明

### 数据库配置

`backend/src/main/resources/application.yml` 中的数据库密码需要自行配置：

```yaml
spring:
  datasource:
    password: your_password_here  # 修改为你的MySQL密码
```

### 注意事项

- 提交代码前请确保 `application.yml` 不包含敏感密码
- 本地开发时可复制 `application.yml` 为 `application-local.yml` 并配置个人密码
- 已配置 `.gitignore` 忽略 `application-local.yml`

## 迭代文档

项目包含完整的 SOP 迭代流程示例：

- [SOP 迭代流程测试用例](./docs/iteration-example/SOP-ITERATION-TEST.md)
- [测试数据](./docs/iteration-example/payment-high-risk-country.json)