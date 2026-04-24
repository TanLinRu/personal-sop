---
name: sop-onboarding
description: 标准项目入职流程 - 配置→拉取→测试→探索→任务（含JDTLS导航）
version: 1.1.0
triggers:
  - "入职"
  - "熟悉项目"
  - "上手"
  - "新项目"
  - "/sop onboarding"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
execution:
  mode: sequential
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/onboarding-{id}.json
---

# SOP Onboarding - 标准项目入职流程

## 概述

本 SOP 提供标准化的项目入职流程，帮助新成员快速了解项目并上手开发。从环境配置开始，经过代码拉取、运行测试、理解架构，到完成第一个小任务，形成完整的上手闭环。

## 使用场景

- 新成员入职
- 项目交接
- 跨项目支援
- 长期休假回归
- 外包团队接入

## 流程步骤

### 步骤一：环境配置（Setup）⭐ [CONFIRM_REQUIRED]

**目标**：搭建开发环境，安装依赖

**执行内容**：
1. 检查项目技术栈（JDK、Maven、Node.js 等）
2. 安装必要依赖
3. 配置环境变量

**输出**：
```markdown
---
sop: onboarding
step: 1_setup
status: in_progress
---

## 环境配置

### 项目技术栈
| 组件 | 要求版本 | 当前版本 | 状态 |
|------|----------|----------|------|
| JDK | 17+ | | 待安装/已安装 |
| Maven | 3.8+ | | 待安装/已安装 |
| MySQL | 8.0 | | 待安装/已安装 |
| Redis | 6.0+ | | 待安装/已安装 |
| Node.js | 18+ | | 待安装/已安装 |

### 环境变量配置
| 变量 | 值 | 说明 |
|------|-----|------|
| JAVA_HOME | | Java 安装路径 |
| MAVEN_HOME | | Maven 安装路径 |
| SPRING_PROFILES_ACTIVE | dev | Spring 环境 |

### 依赖安装状态
- [ ] JDK 已安装
- [ ] Maven 已安装
- [ ] 项目依赖已下载
- [ ] 数据库已配置
```

**命令参考**：
```bash
# 检查 Java 版本
java -version

# 检查 Maven 版本
mvn -version

# 检查 Node 版本
node -v

# 下载项目依赖
mvn dependency:resolve

# 安装前端依赖（如有）
npm install
```

---

### 步骤二：代码拉取（Clone） [AUTO]

**目标**：拉取代码，了解项目结构

**执行内容**：
1. 克隆代码仓库
2. 检查目录结构
3. 阅读 README 和文档

**输出**：
```markdown
---
sop: onboarding
step: 2_clone
status: in_progress
---

## 代码拉取

### 仓库信息
- **仓库地址**:
- **分支策略**: main / master / develop
- **代码规模**: 行数、模块数

### 目录结构
```
project/
├── src/
│   ├── main/
│   │   ├── java/          # Java 源码
│   │   └── resources/    # 配置文件
│   └── test/
│       └── java/          # 测试代码
├── pom.xml                # Maven 配置
├── README.md              # 项目说明
└── ...
```

### 关键文件
| 文件 | 作用 |
|------|------|
| README.md | 项目说明 |
| CONTRIBUTING.md | 开发贡献指南 |
| pom.xml | Maven 依赖配置 |
| application.properties | 应用配置 |

### 拉取状态
- [ ] 代码已克隆
- [ ] README 已阅读
- [ ] 目录结构已了解
```

**命令参考**：
```bash
# 克隆仓库
git clone <repository-url>

# 切换分支
git checkout develop

# 查看目录结构
find . -type f -name "*.java" | head -20

# 查看配置文件
cat pom.xml
cat src/main/resources/application.properties
```

---

### 步骤三：运行测试（Test）

**目标**：确保项目可正常运行

**执行内容**：
1. 编译项目
2. 运行测试套件
3. 验证开发服务器可启动

**输出**：
```markdown
---
sop: onboarding
step: 3_test
status: in_progress
---

## 测试验证

### 编译结果
```
[INFO] BUILD SUCCESS
[INFO] Total time: xx s
```

### 测试执行结果
| 测试类型 | 运行数 | 失败数 | 跳过数 |
|----------|--------|--------|--------|
| 单元测试 | | | 0 |
| 集成测试 | | | |

### 测试覆盖率
- 行覆盖率:
- 分支覆盖率:

### 服务启动验证
- [ ] 应用可启动
- [ ] 端口可访问
- [ ] 基础接口正常

### 测试状态
- [ ] 编译成功
- [ ] 测试通过
- [ ] 服务可启动
```

**命令参考**：
```bash
# 清理并编译
mvn clean compile

# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=*Test

# 启动应用
mvn spring-boot:run

# 后台启动
nohup mvn spring-boot:run &
```

---

### 步骤四：理解架构（Explore）

**目标**：理解项目架构和核心模块

**执行内容**：
1. 使用 Explore Agent 了解项目架构
2. 导览核心模块
3. 绘制架构图和数据流

**输出**：
```markdown
---
sop: onboarding
step: 4_explore
status: in_progress
---

## 架构理解

### 系统架构描述
- 架构类型: 分层架构 / DDD / 微服务
- 部署方式: 单体 / 集群 / 云原生

### 核心模块
| 模块 | 职责 | 关键文件 |
|------|------|----------|
| controller | 请求处理 | *Controller.java |
| service | 业务逻辑 | *Service.java |
| mapper | 数据访问 | *Mapper.java |
| entity | 数据模型 | *Entity.java |

### 数据流
```
请求 → Controller → Service → Mapper → Database
              ↓
            Entity
```

### 入口点
| 类型 | 路径 | 说明 |
|------|------|------|
| 后端入口 | Application.java | Spring Boot 启动类 |
| API 路由 | */controller/* | REST 接口 |
| 前端入口 | main.js | Vue/React 入口 |
| 配置文件 | application.properties | 应用配置 |

### 配置文件说明
| 文件 | 用途 |
|------|------|
| application.properties | 主配置 |
| application-dev.properties | 开发环境 |
| application-prod.properties | 生产环境 |

### 理解状态
- [ ] 核心模块已了解
- [ ] 数据流已理解
- [ ] 配置文件已熟悉
```

**命令参考**：
```bash
# 查看包结构
find src/main/java -type d

# 查看 Controller
find src -name "*Controller.java"

# 查看 Service
find src -name "*Service.java"

# 查看实体类
find src -name "*Entity.java"

# 查看配置文件
ls src/main/resources/
```

---

### 步骤五：小任务（Task）⭐ [CONFIRM_REQUIRED]

**目标**：通过小任务上手项目

**执行内容**：
1. 选取合适的入门任务
2. 实现并提交
3. 获得代码审查反馈

**输出**：
```markdown
---
sop: onboarding
step: 5_task
status: pending
---

## 小任务实践

### 建议任务列表
| 任务 | 难度 | 涉及模块 | 预计时间 |
|------|------|----------|----------|
| 修复一个简单 Bug | 低 | controller/service | 2h |
| 添加一个简单功能 | 低 | controller/service/mapper | 4h |
| 编写单元测试 | 低 | test | 2h |
| 重构一个工具类 | 中 | util | 4h |

### 选取的任务
- **任务描述**:
- **预期结果**:
- **涉及文件**:

### 实施记录
| 日期 | 内容 | 状态 |
|------|------|------|
| | | 进行中/已完成 |

### 遇到的问题及解决
1. 问题: 解决方式:

### 收获总结
-

### 上手状态
- [ ] 任务已选择
- [ ] 任务已完成
- [ ] 代码已提交
- [ ] 审查已通过
```

**命令参考**：
```bash
# 创建分支
git checkout -b feature/my-task

# 查看当前状态
git status

# 添加修改
git add .

# 提交代码
git commit -m "feat: add xxx feature"

# 推送到远程
git push -u origin feature/my-task
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 编译失败 | 检查 JDK 版本，检查 pom.xml 依赖 |
| 测试失败 | 查看测试报告，检查是否有前置条件 |
| 服务启动失败 | 检查端口占用，检查数据库连接配置 |
| 依赖下载慢 | 配置阿里云镜像或使用 VPN |

## 可调用的 Skills

| 技能 | 用途 |
|------|------|
| dr-jskill | JDK 21 + Spring Boot 项目环境配置 |
| java-build | 构建配置 |
| java-testing | 测试执行 |
| codebase-onboarding | 项目入职导览 |
| code-tour | 代码导览 |
| java-review | 代码审查反馈 |

## JDTLS 代码导航（Java 项目）⭐

新项目如使用 dr-jskill 生成，默认包含 JDTLS 配置：

**安装 JDTLS（只需一次）**：
```bash
# macOS
brew install jdtls

# Linux
# 参考 .claude/skills/dr-jskill/references/JDTLS.md
```

**AI 工作流中的使用**：
| 任务 | 使用 |
|------|------|
| 查找类/方法定义 | `lsp goToDefinition` |
| 查找引用 | `lsp findReferences` |
| 查看类型/文档 | `lsp hover` |
| 重命名 | `lsp rename` |

**优先级**：`lsp` → `grep` with `.java` glob → `view`

## 触发命令

```
/sop onboarding
```
或描述场景：
- "我是新来的，请帮我熟悉项目"
- "帮我了解这个代码库"
- "如何上手这个项目"