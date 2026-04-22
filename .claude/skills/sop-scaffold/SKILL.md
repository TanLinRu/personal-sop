- ---
  name: sop-scaffold
  description: 项目脚手架初始化 - 使用 dr-jskill 自动生成项目（详细步骤参考 dr-jskill）
  version: 1.2.0
  triggers:
    - "生成脚手架"
    - "初始化项目"
    - "创建项目"
    - "新项目"
    - "/sop scaffold"
  permissions:
      task: allow
      read: allow
      write: allow
      bash: allow
      web: allow
  execution:
      mode: sequential
  ---

  # SOP Scaffold - 项目脚手架初始化

  ## 概述

  本 SOP 用于初始化新项目。详细生成逻辑由 **dr-jskill** 脚本执行，本 SOP 仅负责确认需求和调用。

  ## 使用场景

  - 新项目初始化
  - 技术栈升级

  ## 技术栈规范

  | 层级    | 技术         | 版本   |
  | ------- | ------------ | ------ |
  | 后端    | Spring Boot  | 3.4.x  |
  | JDK     | OpenJDK      | 21 LTS |
  | ORM     | MyBatis-Plus | 3.5.x  |
  | 数据库  | MySQL        | 8.0+   |
  | 前端    | Vue 3        | 3.5.x  |
  | UI      | Element Plus | 2.9.x  |
  | 构建    | Vite         | 6.x    |
  | API文档 | Knife4j      | 4.5.x  |

  ---

  ## 步骤一：需求确认 ⭐ [CONFIRM_REQUIRED]

  **确认内容**：
  1. 项目名称
  2. 包名 (com.example.xxx)
  3. 输出目录

  **输出**：
  ```markdown
  ---
  sop: scaffold
  step: 1_confirm
  status: confirmed
  ---
  
  ## 项目信息
  
  - 项目名: xxx
  - 包名: com.example.xxx
  - 目录: ./
  ```
  ---

  ## 步骤二：生成项目 [AUTO]

  **执行**：调用 dr-jskill 生成项目

  ```bash
  # 使用 dr-jskill 生成
  cd .claude/skills/dr-jskill
  node scripts/create-project-latest.mjs {项目名} {artifactId} {项目名} {包名} 21 fullstack
  ```

  **生成内容**：
  - ✅ Spring Boot 项目（含 JDTLS 配置）
  - ✅ Vue 3 + Element Plus 前端
  - ✅ Docker Compose 数据库配置

  ---

  ## 步骤三：知识库索引 ⭐ [AUTO]

  **目标**：初始化后自动构建知识库

  ### 3.1 Context Mode 索引

  **执行**：自动调用 ctx_index

  ```bash
  # 索引项目结构到知识库
  /ctx index
    --source "scaffold-{project_name}"
    --path "./{project_name}"
  ```

  **存储路径**：
  - Windows: `E:\software\ai\.context-mode\content\`

  ### 3.2 Markdown 知识库创建

  **目标**：创建持久化依赖图谱

  ```markdown
  # {项目名} 依赖知识库
  
  ## 元数据
  - 创建时间: {timestamp}
  - 项目名: {project_name}
  - 技术栈: Spring Boot + Vue 3
  
  ## 初始实体
  
  | 模块 | Entity | 状态 | 依赖 |
  |------|--------|------|------|
  | 用户 | User | ✅ | - |
  | - | - | - | - |
  
  ## API 初始
  
  | 模块 | 端点 | 状态 |
  |------|------|------|
  | 用户 | /api/user | 待实现 |
  
  ## 依赖关系图谱
  
  ```
  {project_name}
  │
  └── user_module
      └── (无依赖)
  ```
  
  **存储位置**：`docs/sop-knowledge/{project_name}-dependencies.md`
  
  ### 3.3 验证查询
  
  ​```bash
  # 查询知识库
  /ctx query scaffold --last 1
  /ctx-stats
  ```

  **输出**：
  ```markdown
  ### 知识库索引 ⭐
  - [x] 已索引项目结构
  - [x] 已创建依赖图谱
  - 存储: docs/sop-knowledge/{project_name}-dependencies.md
  ```

  ---

  ## 触发命令

  ```
  /sop scaffold
  ```

  或描述场景：
  - "初始化新项目"
  - "创建项目脚手架"