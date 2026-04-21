# MyBatis-Plus 最佳实践

## 快速开始

### 依赖配置

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.5</version>
</dependency>

<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

### 应用入口

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## 核心配置

### application.properties

```properties
# DataSource
spring.datasource.url=jdbc:mysql://localhost:3306/mydb?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=root

# MyBatis-Plus
mybatis-plus.mapper-locations=classpath*:/mapper/**/*.xml
mybatis-plus.type-aliases-package=com.example.domain
mybatis-plus.configuration.map-underscore-to-camel-case=true
mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

## Entity 实体类

```java
@Data
@TableName("sys_user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_name")
    private String userName;

    private String email;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
```

### 常用注解

| 注解 | 用途 |
|------|------|
| `@TableName` | 表名映射 |
| `@TableId` | 主键字段 |
| `@TableField` | 普通字段 |
| `@Version` | 乐观锁 |
| `@TableLogic` | 逻辑删除 |

## Mapper 层

```java
public interface UserMapper extends BaseMapper<User> {
}
```

## Service 层

```java
@Service
public class UserService extends ServiceImpl<UserMapper, User> {

    public User getUserById(Long id) {
        return getById(id);
    }

    public boolean saveUser(User user) {
        return save(user);
    }

    public boolean updateUser(User user) {
        return updateById(user);
    }

    public boolean deleteUser(Long id) {
        return removeById(id);
    }

    public Page<User> listUsers(int page, int size) {
        return page(new Page<>(page, size));
    }
}
```

## 分页插件

```java
@Configuration
public class MybatisPlusConfig {

    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor());
        return interceptor;
    }
}
```

## 条件构造器

```java
// 简单条件
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("status", 1).like("name", "test").orderByDesc("create_time");
List<User> list = userMapper.selectList(wrapper);

// Lambda写法（推荐）
LambdaQueryWrapper<User> lambdaWrapper = new LambdaQueryWrapper<>();
lambdaWrapper.eq(User::getStatus, 1)
    .like(User::getUserName, "test")
    .orderByDesc(User::getCreateTime);
```

## 常见问题

### 1. 字段命名映射

在application.properties中启用：
```properties
mybatis-plus.configuration.map-underscore-to-camel-case=true
```

### 2. 逻辑删除

实体类添加：
```java
@TableLogic
private Integer deleted;
```

application.properties：
```properties
mybatis-plus.global-config.db-config.logic-delete-value=1
mybatis-plus.global-config.db-config.logic-not-delete-value=0
```

### 3. 自动填充

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

## 性能优化

### 1. 分页查询

```java
IPage<User> page = userMapper.selectPage(
    new Page<>(page, size),
    new QueryWrapper<User>().eq("status", 1)
);
```

### 2. 批量插入

```java
saveBatch(list);  // 默认1000条一批
saveBatch(list, 500);  // 自定义批次大小
```

### 3. 链式调用

```java
userService.lambdaQuery()
    .eq(User::getStatus, 1)
    .like(User::getUserName, "test")
    .orderByDesc(User::getCreateTime)
    .list();
```