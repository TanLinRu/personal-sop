# Personal SOP - 标准化项目管理脚手架

基于 Spring Boot + Vue 3 的全栈项目模板，提供标准化的 SOP 流程支持。

## 技术栈

| 组件 | 版本 |
|------|------|
| JDK | 21 |
| Spring Boot | 2.7.18+ |
| MyBatis-Plus | 3.5.3+ |
| MySQL | 8.0 |
| Redis | 7 |
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
├── .claude/skills/        # SOP Skills (20个)
│   ├── sop-prd/           # PRD生成
│   ├── sop-testing/       # 测试执行
│   ├── sop-deployment/    # 部署发布
│   ├── sop-bug-fix/       # Bug修复
│   ├── sop-code-review/   # 代码审查
│   ├── sop-scaffold/      # 脚手架生成
│   ├── sop-backend-iteration/  # 后端迭代
│   ├── sop-frontend-iteration/ # 前端迭代
│   ├── sop-fullstack-iteration/ # 全栈迭代
│   ├── dr-jskill/        # Java项目工具
│   └── frontend-design/  # 前端设计
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

### Windows curl测试

```powershell
curl -X POST http://localhost:8080/api/v1/check -H "Content-Type: application/json" --data-binary @request.json
```

### RESTful端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/{resource} | 获取资源列表 |
| GET | /api/v1/{resource}/{id} | 获取单个资源 |
| POST | /api/v1/{resource} | 创建资源 |
| PUT | /api/v1/{resource}/{id} | 更新资源 |
| DELETE | /api/v1/{resource}/{id} | 删除资源 |

业务检测端点根据项目需求定义。

## 数据模型

根据业务需求定义实体，默认包含审计字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |
| createdBy | String | 创建人 |
| updatedBy | String | 更新人 |

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
  "data": { }
}
```

错误码：
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误

## 数据库

根据业务需求创建表结构，默认包含审计字段。

```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);
```

## 前端

```bash
cd frontend
npm install
npm run dev
```

访问: http://localhost:5173

## SOP Skills

项目包含 20 个标准化流程 Skill，位置：`.claude/skills/`

| 分类 | Skill | 用途 |
|------|-------|------|
| 流程 | sop-prd | PRD 产品需求文档 |
| 流程 | sop-testing | 测试执行 |
| 流程 | sop-deployment | 部署发布 |
| 流程 | sop-code-review | 代码审查 |
| 流程 | sop-bug-fix | Bug 修复 |
| 流程 | sop-incident-response | 线上响应 |
| 流程 | sop-onboarding | 项目入职 |
| 流程 | sop-api-design | API 设计 |
| 流程 | sop-database-design | 数据库设计 |
| 流程 | sop-scaffold | 脚手架生成 |
| 流程 | sop-backend-iteration | 后端迭代 |
| 流程 | sop-frontend-iteration | 前端迭代 |
| 流程 | sop-fullstack-iteration | 全栈迭代 |
| 流程 | sop-product-analysis | 产品分析 |
| 工具 | dr-jskill | Java 项目生成 |
| 工具 | frontend-design | 前端设计 |
| 工具 | tailwind-design-system | Tailwind CSS |
| 通用 | SOP | Skill 规范 |

使用示例：
```
/sop prd           # 生成 PRD
/sop testing       # 执行测试
/sop bug-fix       # 修复 Bug
/sop code-review   # 代码审查
/sop deployment    # 部署发布
/sop scaffold      # 生成脚手架
/sop fullstack     # 全栈迭代
```

## ECC Agents

项目支持并行调用 AI Agent：

| Agent | 用途 |
|-------|------|
| code-reviewer | 代码格式和规范审查 |
| java-reviewer | Java/Spring Boot 专家分析 |
| security-reviewer | 安全漏洞扫描 |
| build-error-resolver | 构建错误修复 |

## ECC Rules

通用编码规范：`.claude/rules/`

| 文件 | 说明 |
|------|------|
| common/coding-style.md | 不可变性、KISS、DRY、YAGNI |
| common/testing.md | TDD、覆盖率要求 |
| INDEX.md | 规则索引 |

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