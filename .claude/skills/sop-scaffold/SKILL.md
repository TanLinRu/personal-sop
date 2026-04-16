---
name: sop-scaffold
description: 前后端脚手架生成流程 - 分析需求→后端→前端→API文档→联调→验证
version: 1.0.0
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

## 技术栈规范

| 层级 | 技术选择 | 说明 |
|------|----------|------|
| 后端框架 | Spring Boot 3.x | JDK 17+（推荐 JDK 21） |
| ORM | MyBatis-Plus | 国产优秀 ORM 框架 |
| 数据库 | MySQL 8.0 | 关系型数据库 |
| 构建工具 | Maven | 多模块项目 |
| 前端框架 | Vue 3 | Composition API |
| UI 组件 | Element Plus | 轻量级 UI 库 |
| 构建工具 | Vite | 快速开发服务器 |
| API 文档 | Knife4j | 访问地址：/doc.html |

## 流程步骤

### 步骤一：分析需求（Analyze）

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

### 步骤二：后端脚手架（Backend）

**目标**：生成 Spring Boot 项目结构

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

### 后端状态
- [ ] 项目结构已生成
- [ ] pom.xml 已配置
- [ ] 启动类已创建
- [ ] CRUD 示例已生成
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

### 步骤三：前端脚手架（Frontend）

**目标**：生成 Vue 3 + Element Plus 项目

**执行内容**：
1. 创建 Vue 3 项目结构
2. 配置 package.json 依赖
3. 集成 Element Plus
4. 生成用户管理页面

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

### 步骤四：API 文档（API Doc）

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

### 步骤五：配置联调（Integration）

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

### 步骤六：验证运行（Verify）

**目标**：确保脚手架可正常启动和运行

**执行内容**：
1. 构建后端项目
2. 运行单元测试
3. 启动前端项目
4. 验证服务可访问

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