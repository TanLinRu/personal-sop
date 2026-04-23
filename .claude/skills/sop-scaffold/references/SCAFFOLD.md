# SCAFFOLD.md - 项目脚手架规范

## 生成工具

使用 **dr-jskill** 生成项目

## 支持的类型

| 类型 | 说明 | 命令参数 |
|------|------|---------|
| basic | 基础 Spring Boot | `basic` |
| web | Web 应用 | `web` |
| fullstack | 前后端完整 | `fullstack` |

## 技术栈选项

| 组件 | 选项 | 默认版本 |
|------|------|---------|
| Spring Boot | 2.7.x / 3.x | 3.x |
| JDK | 17 / 21 | 21 |
| 前端 | Vue / React / Angular | Vue |
| 数据库 | MySQL / PostgreSQL | PostgreSQL |

## dr-jskill 脚本

```bash
# 基本项目
node create-basic-project.mjs [name] [groupId] [artifactId] [package] [javaVersion]

# Web 项目
node create-web-project.mjs [name] [groupId] [artifactId] [package] [javaVersion]

# 全栈项目
node create-fullstack-project.mjs [name] [groupId] [artifactId] [package] [javaVersion]

# 最新版本（自动）
node create-project-latest.mjs [name] [groupId] [artifactId] [package] [javaVersion] [type]
```

## 输出结构

```
{project-name}/
├── src/
├── pom.xml
├── compose.yaml
├── Dockerfile
├── .env.sample
└── frontend/          # 仅 fullstack
```

## 检查点

- [ ] 项目编译通过
- [ ] 单元测试通过
- [ ] Docker 环境可用
- [ ] 数据库连接正常

## 注意事项

- Spring Boot 3 需要 **jakarta.*** 而非 javax.*
- 无 Lombok 使用原生 getter/setter
- PostgreSQL 为默认数据库