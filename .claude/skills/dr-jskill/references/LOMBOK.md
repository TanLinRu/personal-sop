# Lombok最佳实践

## 概述

Lombok通过注解简化Java代码，减少样板代码。本文档总结游戏风控项目中使用Lombok的最佳实践。

## 常用注解

| 注解 | 用途 |
|------|------|
| @Data | 生成getter/setter/toString/equals/hashCode |
| @Getter/@Setter | 只生成getter或setter |
| @Slf4j | 生成logger日志对象 |
| @AllArgsConstructor | 生成全参构造器 |
| @NoArgsConstructor | 生成无参构造器 |
| @Builder | 生成建造者模式 |

## 最佳实践

### 1. Entity实体类

```java
@Data
@TableName("risk_event")
public class RiskEvent {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String eventType;
    private String userId;
    private Integer riskLevel;
    private String riskScore;
    private String decision;
    private LocalDateTime createTime;
}
```

**要点：**
- Entity必须使用@Data（Lombok会自动生成setRiskScore等方法）
- 配合MyBatis-Plus使用

### 2. Controller请求类

```java
@Data
public static class AntiCheatCheckRequest {
    private String userId;
    private String userIp;
    private String deviceId;
    private String behaviorType;
    private Map<String, Object> gameData;
}
```

**要点：**
- Spring Boot的@RequestBody需要无参构造器
- @Data自动生成getter/setter用于JSON序列化/反序列化
- 内部类必须添加@Data注解

**❌ 错误写法：**
```java
// 缺少无参构造器，400 Bad Request
public static class Request {
    private String name;
    public String getName() { return name; }
}
```

**✅ 正确写法：**
```java
@Data
public static class Request {
    private String name;
}
```

### 3. Service日志

```java
@Slf4j
@Service
public class AntiCheatService {
    
    public void check() {
        log.info("检查结果: {}", result);
    }
}
```

**要点：**
- 使用@Slf4j替代private static final Logger
- 自动生成log对象

### 4. 避免常见错误

#### 问题1：内部类JSON反序列化失败

**原因：** 手动写getter/setter但缺少无参构造器

**解决：** 使用@Data注解

```java
// ❌ 错误
public class Request {
    private String name;
    public String getName() { return name; }
}

// ✅ 正确
@Data
public class Request {
    private String name;
}
```

#### 问题2：编译失败 - 找不到setter方法

**原因：** 没有添加Lombok依赖或注解处理未配置

**解决：** 确认pom.xml中有lombok依赖

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>
```

#### 问题3：@Data与JPA混用

**问题：** @Data会生成equals/hashCode，可能影响JPA实体关系

**解决：** 对于JPA实体使用@Entity注解而非@Data

```java
// JPA实体
@Entity
@Getter // 只生成getter
@Setter(AccessLevel.NONE) // 不生成setter
public class User {
    // ...
}
```

## 项目中的实际用例

### 游戏风控项目

| 文件 | 用法 | 说明 |
|------|------|------|
| RiskEvent.java | @Data | Entity实体 |
| *Controller.java内部类 | @Data | Request请求类 |
| *Service.java | @Slf4j | 日志 |

## 测试验证

使用curl测试：

```bash
curl -X POST "http://localhost:8080/api/risk/anticheat/check" \
  -H "Content-Type: application/json" \
  --data-binary @request.json
```

注意：Windows下使用`--data-binary`避免JSON解析错误。