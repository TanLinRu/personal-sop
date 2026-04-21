# Knife4j API 文档配置

## 快速开始

### 依赖配置

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.5.0</version>
</dependency>
```

### 启动类

```java
@SpringBootApplication
@EnableKnife4j
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 常用注解

### Controller 注解

```java
@RestController
@Tag(name = "用户管理", description = "用户相关接口")
public class UserController {

    @Operation(summary = "获取用户列表", description = "分页获取用户信息")
    @GetMapping("/users")
    public Result<Page<User>> listUsers(
        @Parameter(description = "页码") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "每页数量") @RequestParam(defaultValue = "10") int size
    ) {
        return Result.ok(userService.listUsers(page, size));
    }

    @Operation(summary = "创建用户")
    @PostMapping("/users")
    public Result<User> createUser(@RequestBody User user) {
        return Result.ok(userService.saveUser(user));
    }

    @Operation(summary = "更新用户")
    @PutMapping("/users/{id}")
    public Result<User> updateUser(
        @Parameter(description = "用户ID") @PathVariable Long id,
        @RequestBody User user
    ) {
        user.setId(id);
        return Result.ok(userService.updateUser(user));
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/users/{id}")
    public Result<Void> deleteUser(@Parameter(description = "用户ID") @PathVariable Long id) {
        userService.deleteUser(id);
        return Result.ok();
    }
}
```

### Model 注解

```java
@Data
@Schema(description = "用户信息")
public class User {

    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "用户名", required = true)
    private String username;

    @Schema(description = "邮箱")
    private String email;
}
```

## 配置

### application.properties

```properties
# 基本信息
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs

# Knife4j
knife4j.enable=true
knife4j.setting.language=zh_CN

# 标题
knife4j.basic.title=游戏风控系统API
knife4j.basic.description=游戏风控系统接口文档
knife4j.basic.version=1.0.0
knife4j.basic.contact.name=API Support
knife4j.basic.contact.email=support@example.com
```

## 分组配置

### 创建多个分组

```java
@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
            .group("用户管理")
            .packagesToScan("com.example.controller")
            .build();
    }

    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder()
            .group("订单管理")
            .packagesToScan("com.example.order")
            .build();
    }
}
```

### 对应接口

- `/swagger-ui.html` - 默认UI
- `/doc.html` - Knife4j UI（推荐）
- `/v3/api-docs` - OpenAPI 3.0 规范
- `/v3/api-docs/user` - 用户组API
- `/v3/api-docs/order` - 订单组API

## 安全性配置

### 生产环境禁用

```properties
knife4j.enable=${ENABLE_KNIFE4J:false}
springdoc.swagger-ui.enabled=${ENABLE_SWAGGER:true}
```

### 认证配置

```java
@Bean
public SecurityConfiguration securityConfiguration() {
    return SecurityConfigurationBuilder.builder()
        .clientId("your-client-id")
        .useAuthorizationHeader(true)
        .build();
}
```

## 常见问题

### 1. 不显示接口

检查是否添加了 `@Tag` 或 `@Operation` 注解。

### 2. 参数不显示

添加 `@Parameter` 注解说明参数用途。

### 3. Model 不显示

使用 `@Schema` 或 `@ApiModel` 注解描述。

### 4. 分组不生效

确保使用了正确的包路径配置 `packagesToScan`。

## 访问地址

| 地址 | 说明 |
|------|------|
| `/doc.html` | Knife4j UI（推荐） |
| `/swagger-ui.html` | SpringDoc UI |
| `/v3/api-docs` | OpenAPI JSON |