# 工程结构

> 基于阿里巴巴《Java开发手册》- 工程结构规约

---

## 分层结构

### 【强制】分层清晰

```
┌─────────────────────────────────────────┐
│           Presentation Layer           │
│  Controller / WebSocket / SSE          │
├─────────────────────────────────────────┤
│           Application Layer            │
│  Service / DTO / VO / Assembler         │
├─────────────────────────────────────────┤
│             Domain Layer               │
│  Entity / Domain Event / Repository     │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │
│  DataSource / Cache / MQ / External API │
└─────────────────────────────────────────┘
```

### 【强制】包名组织

```java
// ✅ 正确的包结构
com.company.project
├── controller/      // Controller 层
│   └── UserController.java
├── service/       // Service 层
│   ├── impl/      // Service 实现
│   └── UserService.java
├── repository/     // Repository 层
│   ├── mapper/    // MyBatis Mapper
│   └── UserRepository.java
├── entity/         // 实体
├── dto/            // Data Transfer Object
├── vo/             // View Object
├── config/         // 配置
├── exception/      // 异常定义
└── util/          // 工具类
```

---

## 二方库依赖

### 【强制】版本必须锁定

```java
// ✅ 正确：锁定版本
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.83</version>  // 锁定版本
</dependency>

// ❌ 禁止：不指定版本
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <!-- 无版本 -->
</dependency>
```

### 【推荐】使用 dependencyManagement

```java
// ✅ 推荐：统一管理版本
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>${fastjson.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## 循环依赖

### 【强制】禁止循环依赖

```java
// ❌ 禁止：循环依赖
@Service
public class AService {
    @Autowired
    private BService bService;
}

@Service
public class BService {
    @Autowired
    private AService aService;  // 循环依赖
}

// ✅ 正确：注入接口
@Service
public class AService {
    @Autowired
    private IUserService userService;  // 注入接口而非实现
}
```

---

## 配置与代码

### 【强制】配置独立

```java
// ✅ 正确：配置外部化
# application.properties
app.max-retry=3

// ✅ 正确：配置类读取
@Value("${app.max-retry}")
private int maxRetry;

// ❌ 避免：硬编码
private static final int MAX_RETRY = 3;
```

### 【强制】敏感配置外部化

```java
// ✅ 正确：环境变量或密钥管理
@Value("${db.password}")
private String password;

// ❌ 禁止：配置文件明文
db.password=root123  // ❌
```

---

## 模块化

### 【推荐】Maven 多模块

```
parent-project/
├��─ pom.xml
├── common/          // 公共模块
├── core/           // 核心模块
├── web/            // Web 模块
└── api/            // API 模块
```

### 【推荐】依赖范围正确

```java
// ✅ 正确：scope 正确
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-test</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 代码组织

### 【强制】禁止一个文件多个类

```java
// ✅ 正确：一个文件一个类
// User.java
public class User { }

// UserDTO.java
public class UserDTO { }

// ❌ 禁止：一个文件多个类
// User.java
public class User { }
class UserDTO { }  // ❌ 不建议
```

### 【推荐】类的顺序

```java
// 推荐顺序：类内顺序
1. 常量 (static final)
2. 成员变量
3. 构造方法
4. 公开方法
5. 保护方法
6. 私有方法
7. 内部类
8. 静态内部类
```

---

## 检查表

| 检查项 | ✅ 通过 | ❌ 不通过 |
|--------|---------|-----------|
| 分层 | 清晰分层 | 混在一起 |
| 包名 | 按层组织 | 混乱 |
| 依赖 | 锁定版本 | 无版本 |
| 循环 | 无循环依赖 | 循环依赖 |
| 配置 | 外部化 | 硬编码 |

---

## 参考

- Alibaba P3C: `PackageDependencyCycle` 规则集