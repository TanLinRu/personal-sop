---
name: sop-scaffold
description: 前后端脚手架生成流程 - 分析需求→后端→前端→API文档→联调→验证（含dr-jskill集成）
version: 1.1.0
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
---

# SOP Scaffold - 前后端脚手架生成流程

## 概述

本 SOP 提供标准化的项目脚手架生成流程，帮助快速初始化完整的项目骨架。当需要创建新项目时，使用此 SOP 生成包含完整目录结构、依赖配置、基础代码示例的前后端脚手架。

## 使用场景

- 新项目初始化
- 技术栈升级（Spring Boot 2.x→3.x、Vue 2→3）
- 微服务架构转型
- 团队标准化

## 技术栈规范（2026最新）

| 层级 | 技术选择 | 版本 | 说明 |
|------|----------|------|------|
| 后端框架 | Spring Boot | 3.4.x | 最新稳定版 |
| JDK | OpenJDK | 21 LTS | 长期支持版本 |
| ORM | MyBatis-Plus | 3.5.x | 国产优秀ORM |
| 数据库 | MySQL | 8.0.33+ | 关系型数据库 |
| 构建工具 | Maven | 3.9.x | 多模块项目 |
| 前端框架 | Vue | 3.5.x | Composition API |
| UI 组件 | **Element Plus** | **2.9.x** | **推荐：轻量、文档丰富** |
| 备选UI库 | Naive UI | 2.40.x | TypeScript友好 |
| 构建工具 | Vite | 6.x | 快速开发服务器 |
| API 文档 | Knife4j | 4.5.x | 访问地址：/doc.html |

### 版本管理（dr-jskill 集成）⭐

本 SOP 集成 dr-jskill 的版本管理机制，使用 `versions.json` 集中管理依赖版本：

```json
{
  "java": "21",
  "springBoot": "3.4.0",
  "springBootFallback": "3.3.5",
  "node": "20",
  "npm": "10",
  "postgresql": "16",
  "mariadb": "11"
}
```

**优势**：
- 所有脚本自动读取版本配置
- 一键升级依赖版本
- 与 dr-jskill 脚本完全兼容

### 前端UI库对比选择

| 维度 | Element Plus ✅推荐 | Naive UI |
|------|---------------------|----------|
| **定位** | 企业级管理后台 | 现代Web应用 |
| **组件数量** | 80+ | 70+ |
| **TypeScript** | 支持 | **原生TS支持** |
| **体积** | 轻量 (~400KB gzipped) | 轻量 (~350KB gzipped) |
| **文档** | 中文文档丰富 | 中英文文档 |
| **社区** | 活跃 (50k+ stars) | 活跃 (20k+ stars) |
| **主题定制** | CSS变量 | TypeScript主题配置 |
| **表格功能** | **强大** (虚拟滚动、分组) | 强大 |
| **学习曲线** | 低 | 中 |

**选择建议**：

| 场景 | 推荐 | 理由 |
|------|------|------|
| **管理后台** | Element Plus | 表格/表单组件成熟，文档丰富 |
| **需要强TS类型** | Naive UI | 原生TS，类型推断完善 |
| **快速开发** | Element Plus | 上手快，示例丰富 |
| **中后台系统** | Element Plus | 组件完备，企业级功能多 |
| **新项目/前端主导** | Naive UI | API设计现代 |

**本项目推荐**：Element Plus（游戏风控系统为管理后台，表格和表单场景多）

### 技术栈兼容性

```
JDK 21 + Spring Boot 3.4.x → 兼容
Spring Boot 3.4.x + MyBatis-Plus 3.5.x → 兼容
Vue 3.5.x + Element Plus 2.9.x → 兼容
Vite 6.x + Vue 3.5.x → 兼容
```

## 流程步骤

### 步骤零：环境检查（Environment）

**目标**：验证开发环境是否满足要求

**执行内容**：
1. 检查JDK版本：`java -version`（推荐JDK 17+）
2. 检查Maven版本：`mvn -version`
3. 检查Node.js版本：`node -version`（推荐18+）
4. 确认JAVA_HOME设置（Windows需手动设置）

**命令检查**：
```bash
# JDK检查 - 推荐JDK 17+
java -version

# Maven检查 - 推荐3.8+
mvn -version

# Node.js检查 - 推荐18+
node -version

# Windows设置JAVA_HOME（如需要）
$env:JAVA_HOME = "D:\software\jdk-21.0.8"
```

**强制要求**：
- [ ] JDK 17+ 已安装
- [ ] Maven 3.6+ 已安装
- [ ] Node.js 18+ 已安装
- [ ] JAVA_HOME已正确设置（如Windows）

### 步骤一：分析需求（Analyze）⭐ [CONFIRM_REQUIRED]

**目标**：确定技术栈、模块结构、分层类型

**执行内容**：
1. 询问用户项目需求
2. 确认技术栈选择
3. 确认架构类型（单体/DDD）
4. 确认输出目录

**输出**：
```markdown
---
sop: scaffold
step: 1_analyze
status: in_progress
---

## 需求分析

### 技术栈确认
| 组件 | 选择 | 版本 |
|------|------|------|
| 后端框架 | Spring Boot | 3.x |
| ORM | MyBatis-Plus | 3.x |
| 数据库 | MySQL | 8.0 |
| 前端框架 | Vue 3 | 3.x |
| UI 组件 | Element Plus | 2.x |
| API 文档 | Knife4j | 4.x |

### 项目类型
- [ ] 单体应用（Controller → Service → Mapper → Model）
- [ ] DDD 微服务（Interface → Application → Domain → Infrastructure）

### 输出目录
-

### 用户管理 CRUD
- [ ] 需要生成（默认包含）
- [ ] 不需要
```

**询问事项**：
1. 项目名称是什么？
2. 使用单体还是 DDD 架构？
3. 需要生成哪些基础功能？（用户管理 CRUD）
4. 输出到哪个目录？

---

### 步骤二：后端脚手架（Backend） [AUTO]

**目标**：生成 Spring Boot 项目结构

**执行方式选择**：

| 方式 | 适用场景 | 优点 |
|------|----------|------|
| **dr-jskill 脚本** | 新项目初始化 | 自动获取最新版本、JDTLS 集成、Docker 支持 |
| 手动创建 | 已有项目扩展 | 更细粒度控制 |

#### 方式一：使用 dr-jskill 脚本生成（推荐）

```bash
# 进入 dr-jskill 脚本目录
cd .claude/skills/dr-jskill

# 使用最新版本生成项目
node scripts/create-project-latest.mjs my-app com.example my-app com.example.myapp 21 fullstack

# 或者使用统一入口
node scripts/create-project my-app com.example my-app com.example.myapp 21 fullstack
```

**生成的特性**：
- ✅ Spring Boot 最新版本（自动获取）
- ✅ JDTLS 配置（代码智能导航）
- ✅ Docker Compose 自动数据库启动
- ✅ GraalVM 原生镜像支持
- ✅ 完整的项目 dotfiles

#### 方式二：手动创建

**执行内容**：
1. 创建 Maven 多模块项目结构
2. 配置 pom.xml 依赖
3. 创建启动类和基础配置
4. 生成用户管理 CRUD 示例

**输出**：
```markdown
---
sop: scaffold
step: 2_backend
status: in_progress
---

## 后端脚手架

### 生成的项目结构（单体应用）
```
backend/
├── pom.xml
├── src/
│   └── main/
│       ├── java/com/example/
│       │   ├── Application.java          # 启动类
│       │   ├── config/                    # 配置类
│       │   ├── controller/
│       │   │   └── UserController.java    # 用户控制器
│       │   ├── service/
│       │   │   ├── UserService.java       # 用户服务
│       │   │   └── impl/
│       │   ├── mapper/
│       │   │   └── UserMapper.java        # 用户 Mapper
│       │   ├── entity/
│       │   │   └── User.java              # 用户实体
│       │   └── dto/
│       │       └── UserDTO.java           # 用户 DTO
│       └── resources/
│           ├── application.properties     # 应用配置
│           ├── mapper/
│           │   └── UserMapper.xml         # MyBatis 映射
│           └── sql/
│               └── init.sql               # 建表脚本
└── target/
```

### pom.xml 核心依赖
| 依赖 | 版本 |
|------|------|
| spring-boot-starter-web | 3.2.x |
| mybatis-plus-spring-boot3-starter | 3.5.5 |
| knife4j-openapi3-jakarta-spring-boot-starter | 4.4.0 |
| mysql-connector-java | 8.0.33 |
| lombok | 1.18.30 |

### 启动类配置
```java
@SpringBootApplication
@MapperScan("com.example.mapper")
@EnableKnife4j
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### JDTLS 代码智能导航配置 ⭐

生成的 dr-jskill 项目包含 JDTLS 配置，支持 AI 智能代码导航：

**使用方式**：
```bash
# 安装 JDTLS（只需一次）
brew install jdtls  # macOS
# 或参考 .claude/skills/dr-jskill/references/JDTLS.md

# 在 AI 工作中使用 JDTLS 替代 grep
| 任务 | 使用 |
|------|------|
| 查找定义 | lsp goToDefinition |
| 查找引用 | lsp findReferences |
| 查看类型 | lsp hover |
```

**AI 工作流优先级**：`lsp` → `grep` with `.java` glob → `view`

### Docker Compose 自动数据库启动

dr-jskill 项目集成 `spring-boot-docker-compose`，开发时自动启动数据库：

```bash
# 启动时自动启动 MySQL/PostgreSQL
mvn spring-boot:run

# 或手动启动
docker-compose -f compose.yaml up -d
```

### 后端状态
- [ ] 项目结构已生成
- [ ] pom.xml 已配置
- [ ] 启动类已创建
- [ ] CRUD 示例已生成
- [ ] JDTLS 配置（dr-jskill 方式）
- [ ] Docker Compose 配置（dr-jskill 方式）
```

**命令参考**：
```bash
# 使用 Spring Initializr 生成（可选）
curl https://start.spring.io/starter.tgz \
  -d groupId=com.example \
  -d artifactId=backend \
  -d name=backend \
  -d dependencies=web,mybatis-plus,mysql \
  -d packageName=com.example \
  | tar -xzf -

# Maven 构建
mvn clean compile

# 使用 MyBatis-Plus Generator（可选）
mvn mybatis-plus-generator:generate
```

---

### 步骤三：前端脚手架（Frontend） [AUTO]

**目标**：生成 Vue 3 + Element Plus 项目

**执行内容**：
1. 创建 Vue 3 项目结构
2. 配置 package.json 依赖
3. 集成 Element Plus
4. 生成用户管理页面
5. **应用 frontend-design 设计原则**

#### 前端设计原则（frontend-design 集成）

生成的代码应遵循以下设计原则，避免"AI slop"美学：

| 维度 | 规范 | 示例 |
|------|------|------|
| **字体** | 选择独特字体，避免 Inter/Roboto/Arial | 使用 Noto Sans SC + Roboto Mono |
| **颜色** |  cohesive aesthetic，主色+锐利点缀 | 深蓝主色 + 琥珀色强调 |
| **动画** | CSS 优先，高impact时刻 | 页面加载交错reveal |
| **布局** | 非对称/重叠/对角线流动 | 卡片hover上浮效果 |
| **背景** | 纹理/渐变/噪声，非纯色 | 微妙的渐变网格 |

#### 设计质量检查点

- [ ] 字体选择独特且搭配合理
- [ ] 颜色主题 cohesive 且有视觉层次
- [ ] 关键交互有动画反馈
- [ ] 布局有设计意图，非千篇一律
- [ ] 背景/纹理营造氛围感

#### Tailwind CSS v4 可选集成

如需使用 Tailwind CSS v4，可引入 `tailwind-design-system` skill：

```bash
# 安装 Tailwind v4
npm install tailwindcss@latest @tailwindcss/vite

# 配置 vite.config.js
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
```

**适用场景**：需要高度自定义 UI、组件库无法满足的设计

**输出**：
```markdown
---
sop: scaffold
step: 3_frontend
status: in_progress
---

## 前端脚手架

### 生成的项目结构
```
frontend/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.js                    # 入口文件
│   ├── App.vue                    # 根组件
│   ├── api/
│   │   └── user.js                # 用户 API
│   ├── views/
│   │   └── user/
│   │       ├── index.vue          # 用户列表
│   │       ├── add.vue            # 新增用户
│   │       └── edit.vue           # 编辑用户
│   ├── components/
│   │   └── HelloWorld.vue
│   └── router/
│       └── index.js               # 路由配置
└── public/
```

### package.json 核心依赖
| 依赖 | 版本 |
|------|------|
| vue | 3.4.x |
| vue-router | 4.x |
| axios | 1.6.x |
| element-plus | 2.5.x |
| vite | 5.x |
| @vitejs/plugin-vue | 5.x |

### main.js 配置
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

### vite.config.js 配置
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### 前端状态
- [ ] 项目结构已生成
- [ ] package.json 已配置
- [ ] Element Plus 已集成
- [ ] 用户管理页面已生成
```

**命令参考**：
```bash
# 使用 Vite 创建 Vue 项目
npm create vite@latest frontend -- --template vue

# 安装依赖
cd frontend
npm install

# 安装额外依赖
npm install vue-router axios element-plus

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

### 步骤四：API 文档（API Doc） [AUTO]

**目标**：配置 Knife4j API 文档

**执行内容**：
1. 添加 Knife4j 依赖和配置
2. 添加 Swagger 注解到 Controller
3. 验证文档访问

**输出**：
```markdown
---
sop: scaffold
step: 4_api_doc
status: in_progress
---

## API 文档配置

### application.properties 配置
```properties
# Knife4j 配置
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
springdoc.group-configs[0].group=default
springdoc.group-configs[0].paths-to-match=/api/**
springdoc.group-configs[0].packages-to-scan=com.example.controller

# Knife4j 增强配置
knife4j.enable=true
knife4j.setting.language=zh_CN
```

### Controller 注解示例
```java
@RestController
@RequestMapping("/api/user")
@Api(tags = "用户管理")
public class UserController {

    @GetMapping("/list")
    @ApiOperation("查询用户列表")
    public Result<List<User>> list() {
        return Result.success(userService.list());
    }

    @GetMapping("/{id}")
    @ApiOperation("根据ID查询用户")
    @ApiParam(name = "id", value = "用户ID", required = true)
    public Result<User> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }

    @PostMapping
    @ApiOperation("新增用户")
    public Result<Boolean> add(@RequestBody @Valid UserDTO dto) {
        return Result.success(userService.add(dto));
    }

    @PutMapping
    @ApiOperation("修改用户")
    public Result<Boolean> update(@RequestBody @Valid UserDTO dto) {
        return Result.success(userService.update(dto));
    }

    @DeleteMapping("/{id}")
    @ApiOperation("删除用户")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(userService.delete(id));
    }
}
```

### 访问地址
- Swagger UI: http://localhost:8080/swagger-ui.html
- Knife4j: http://localhost:8080/doc.html

### API 文档状态
- [ ] Knife4j 依赖已添加
- [ ] 配置文件已添加
- [ ] Controller 注解已添加
- [ ] 文档可访问
```

---

### 步骤五：配置联调（Integration） [AUTO]

**目标**：配置数据库连接和前后端联调

**执行内容**：
1. 配置数据库连接
2. 配置 CORS
3. 配置前后端代理
4. 初始化数据库

**输出**：
```markdown
---
sop: scaffold
step: 5_integration
status: in_progress
---

## 配置联调

### 数据库配置（application.properties）
```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/dbname?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# MyBatis-Plus 配置
mybatis-plus.mapper-locations=classpath:mapper/*.xml
mybatis-plus.type-aliases-package=com.example.entity
mybatis-plus.configuration.map-underscore-to-camel-case=true
mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

### CORS 配置
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 初始化 SQL（init.sql）
```sql
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `status` tinyint DEFAULT 1 COMMENT '状态 0禁用 1正常',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 初始化数据
INSERT INTO `user` (`username`, `password`, `nickname`, `email`) VALUES
('admin', '$2a$10$xxx', '管理员', 'admin@example.com');
```

### 环境变量配置
```bash
# .env 文件
VITE_API_BASE_URL=http://localhost:8080
```

### 联调状态
- [ ] 数据库连接已配置
- [ ] CORS 已配置
- [ ] 代理已配置
- [ ] 数据库已初始化
```

---

### 步骤六：验证运行（Verify） [AUTO]

**目标**：确保脚手架可正常启动和运行

**执行内容**：
1. 构建后端项目
2. 运行单元测试
3. 启动前端项目
4. 验证服务可访问
5. **生成测试数据**
6. **生成测试文档模板**
7. **验证 JDTLS 配置（dr-jskill 方式）**
8. **验证 Docker Compose 数据库启动**

#### 测试数据生成 ⭐

**SQL 初始化数据**（必须包含）：
```sql
-- 测试用户数据
INSERT INTO `user` (`username`, `password`, `nickname`, `email`, `status`) VALUES
('admin', '$2a$10$xxxx', '管理员', 'admin@test.com', 1),
('test01', '$2a$10$xxxx', '测试用户1', 'test01@test.com', 1),
('test02', '$2a$10$xxxx', '测试用户2', 'test02@test.com', 0);

-- 测试业务数据（根据项目调整）
INSERT INTO `risk_event` (...) VALUES (...);
```

**Mock 测试数据**（Spring Boot）：
```java
// src/test/resources/data.sql
@Sql("/data.sql")  // JUnit5 测试数据初始化
```

#### 测试文档模板 ⭐

**测试用例模板**：
```markdown
# 测试用例文档 - {模块名}

## 功能点：{功能描述}

### 测试用例 TC-001：正常场景
| 字段 | 内容 |
|------|------|
| 前置条件 | 用户已登录 |
| 测试步骤 | 1. 调用API 2. 验证返回 |
| 预期结果 | 返回200，data非空 |

### 测试用例 TC-002：异常场景-参数为空
| 字段 | 内容 |
|------|------|
| 前置条件 | 用户已登录 |
| 测试步骤 | 1. 调用API(param=null) |
| 预期结果 | 返回400，msg="参数不能为空" |

## 测试数据
| 数据ID | 用途 | 创建方式 |
|--------|------|----------|
| USER_001 | 正常用户 | SQL初始化 |
| USER_002 | 禁用用户 | SQL初始化 |
```

**输出位置**：
```
.sql/
├── init.sql           # 建表语句
└── test-data.sql      # 测试数据

docs/
└── test-case/
    └── {module}-test-cases.md  # 测试用例文档
```

#### JDTLS 验证（可选）

```bash
# 检查 JDTLS 是否可用
which jdtls

# 在 AI 中验证 LSP 诊断
lsp --check  # 或使用 IDE 插件
```

#### Docker Compose 验证

```bash
# 验证 compose.yaml 存在
ls -la compose.yaml

# 启动数据库服务
docker-compose -f compose.yaml up -d

# 验证数据库可连接
mysql -h localhost -u root -p -e "SELECT 1"
```

**输出**：
```markdown
---
sop: scaffold
step: 6_verify
status: pending
---

## 验证结果

### 后端构建
| 步骤 | 命令 | 状态 |
|------|------|------|
| 清理编译 | mvn clean compile | ✅ 通过 / ❌ 失败 |
| 打包 | mvn package -DskipTests | ✅ 通过 / ❌ 失败 |
| 单元测试 | mvn test | ✅ 通过 / ❌ 失败 |

### 后端启动
- 启动命令: `mvn spring-boot:run`
- 访问地址: http://localhost:8080
- API 文档: http://localhost:8080/doc.html
- 状态: ✅ 启动成功 / ❌ 启动失败

### 前端构建
| 步骤 | 命令 | 状态 |
|------|------|------|
| 安装依赖 | npm install | ✅ 成功 / ❌ 失败 |
| 开发服务器 | npm run dev | ✅ 成功 / ❌ 失败 |
| 生产构建 | npm run build | ✅ 成功 / ❌ 失败 |

### 前端启动
- 启动命令: `npm run dev`
- 访问地址: http://localhost:5173
- 状态: ✅ 启动成功 / ❌ 启动失败

### 接口验证
| 接口 | 地址 | 状态 |
|------|------|------|
| 用户列表 | GET /api/user/list | ✅ 正常 / ❌ 异常 |
| 新增用户 | POST /api/user | ✅ 正常 / ❌ 异常 |
| 修改用户 | PUT /api/user | ✅ 正常 / ❌ 异常 |
| 删除用户 | DELETE /api/user/{id} | ✅ 正常 / ❌ 异常 |

### 整体验证状态
- [ ] 后端构建成功
- [ ] 后端启动成功
- [ ] 前端构建成功
- [ ] 前端启动成功
- [ ] 接口联调成功
- [ ] 测试数据已生成（sql/test-data.sql）
- [ ] 测试文档模板已生成（docs/test-case/）
```

**命令参考**：
```bash
# 后端构建和启动
cd backend
mvn clean compile
mvn spring-boot:run

# 前端启动
cd frontend
npm install
npm run dev

# 验证接口
curl http://localhost:8080/api/user/list

# 停止服务
# Ctrl + C
```

---

## 输出目录结构

生成的项目结构如下：

```
{output-dir}/
├── backend/                      # 后端项目
│   ├── pom.xml
│   ├── src/
│   │   └── main/
│   │       ├── java/com/example/
│   │       │   ├── Application.java
│   │       │   ├── config/
│   │       │   ├── controller/UserController.java
│   │       │   ├── service/UserService.java
│   │       │   ├── mapper/UserMapper.java
│   │       │   └── entity/User.java
│   │       └── resources/
│   │           ├── application.properties
│   │           └── mapper/UserMapper.xml
│   └── target/
├── frontend/                     # 前端项目
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── api/user.js
│   │   ├── views/user/
│   │   └── router/index.js
│   └── public/
└── sql/
    └── init.sql                  # 数据库初始化脚本
```

---

## 错误处理

| 错误 | 修复方案 |
|------|----------|
| UnsupportedClassVersionError | 确认 JDK 21 已安装 |
| maven wrapper 无法执行 | 使用 `mvn` 代替 `./mvnw` |
| npm install 失败 | 配置国内镜像：`npm config set registry https://registry.npmmirror.com` |
| 端口被占用（8080/5173） | 修改 application.properties 或 vite.config.js 端口 |
| 数据库连接失败 | 检查 MySQL 服务是否启动，验证用户名密码 |
| CORS 错误 | 检查前端请求地址和后端 CORS 配置 |

---

## 可调用的 Skills

| 技能 | 用途 |
|------|------|
| dr-jskill | 后端项目生成（JDK 21, Spring Boot 3.4, JDTLS） |
| frontend-design | 前端设计原则（独特美学、字体、动画） |
| tailwind-design-system | Tailwind CSS v4 设计系统 |
| java-build | 构建验证 |
| java-testing | 测试执行 |
| tdd-workflow | 前端项目生成 |
| api-design | API 设计规范 |
| security-review | 安全配置审查 |
| backend-patterns | 后端分层架构 |

---

## 触发命令

```
/sop scaffold
```
或描述场景：
- "帮我生成一个 Spring Boot + Vue 3 项目"
- "创建一个前后端分离的项目脚手架"
- "初始化新项目"