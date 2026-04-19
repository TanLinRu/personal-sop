# AGENTS.md

## 项目概述

游戏风控系统 - Spring Boot 2.7.18 + JDK 21 + Vue 3 + MySQL 8。

## 启动命令

```powershell
# 编译
.\run-compile.ps1

# 后端（非阻塞）
Start-Process powershell -ArgumentList "-Command", "cd backend; mvn spring-boot:run"

# 前端
cd frontend; npm run dev
```

## 关键约束

- JDK 21（设置JAVA_HOME）
- Spring Boot 2.7.18
- MyBatis-Plus 3.5.3
- Knife4j: /doc.html
- 前端: 5173

## API端点

| 模块 | 端点 |
|------|------|
| 注册 | POST /api/risk/register/check |
| 登录 | POST /api/risk/login/check |
| 支付 | POST /api/risk/payment/check |
| 反作弊 | POST /api/risk/anticheat/check |
| 内容 | POST /api/risk/content/check |

## 测试命令（CRITICAL）

```powershell
# Windows curl 必须使用 --data-binary 而非 -d
curl -X POST http://localhost:8080/api/risk/anticheat/check -H "Content-Type: application/json" --data-binary @request.json
```

## 常见问题

| 问题 | 解决 |
|------|------|
| 400 Bad Request | Controller内部类必须用`@Data`注解 |
| 编译失败 | 运行`.\run-compile.ps1`设置JAVA_HOME |
| curl JSON解析错误 | Windows用`--data-binary` |

## Skills（14个）

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

## Skill参考

`.claude/skills/dr-jskill/references/` - 包含Lombok等参考资料