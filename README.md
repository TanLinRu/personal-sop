# Personal SOP - 标准化项目管理脚手架

基于 Spring Boot + Vue 3 的全栈项目模板，提供标准化的 SOP 流程支持。

## 技术栈

| 组件 | 版本 |
|------|------|
| JDK | 21 |
| Spring Boot | 2.7.18+ |
| MyBatis-Plus | 3.5.3+ |

## 项目结构

```
personal-sop/
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

### 1. 生成项目

```bash
sop scaffold 订单管理系统
```

### 2. SOP 技能

```bash
# PRD 生成
sop prd

# 后端迭代
sop backend

# 前端迭代  
sop frontend

# 全栈迭代
sop fullstack

# 代码审查
sop code-review

# Bug 修复
sop bug-fix

# 测试
sop testing

# 部署
sop deployment
```

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

## SOP v2.1 流程

```
需求确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 代码生成 → 验证 → 知识更新
```

## ECC Agents

项目支持并行调用 AI Agent：

| Agent | 用途 |
|-------|------|
| code-reviewer | 代码格式和规范审查 |
| java-reviewer | Java/Spring Boot 专家分析 |
| security-reviewer | 安全漏洞扫描 |
| build-error-resolver | 构建错误修复 |

## Context-Mode

知识库索引命令：

```bash
# 索引项目
ctx index --source "project-name" --path "./src"

# 查询依赖
ctx query --type entities --last 5
```

```powershell
.\run-compile.ps1
cd backend; mvn spring-boot:run
```

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
