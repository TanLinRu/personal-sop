# 日志规约

> 基于阿里巴巴《Java开发手册》- 日志规约

---

## 日志框架

### 【强制】使用日志门面

```java
// ✅ 正确：使用 SLF4J 门面
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    public void process() {
        log.info("Processing user: {}", userId);
    }
}

// ❌ 避免：直接使用日志实现
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
// 锁定实现导致迁移困难
```

### 【强制】禁止 System.out.println

```java
// ✅ 正确：使用日志
public void process() {
    log.info("Processing started");
    // 业务逻辑
    log.info("Processing completed");
}

// ❌ 禁止：使用 System.out
public void process() {
    System.out.println("Processing started");  // ❌
}
```

---

## 日志级别

### 【强制】正确使用日志级别

```java
// ERROR: 错误日志，需要关注
log.error("Failed to connect to database", e);

// WARN: 警告日志，可能有问题但可继续
log.warn("Retry attempt {} of {}", attempt, maxAttempts);

// INFO: 操作日志，正常业务流程
log.info("User {} logged in", username);

// DEBUG: 调试日志，开发时使用
log.debug("Request params: {}", params);

// TRACE: 详细跟踪，不常用
log.trace("Method entry: {}", methodName);
```

### 【强制】异常日志必须包含堆栈

```java
// ✅ 正确：包含堆栈信息
log.error("Database connection failed", e);

// ❌ 错误：只记录错误消息
log.error("Database connection failed: " + e.getMessage());
```

---

## 日志内容

### 【强制】日志内容不能包含敏感信息

```java
// ✅ 正确：脱敏记录
log.info("User login: name={}, ip={}", mask(username), ip);

// ❌ 禁止：记录敏感信息
log.info("User login: password={}", password);
log.info("Credit card: {}", cardNumber);
log.info("Token: {}", token);
```

### 【推荐】使用占位符而非字符串拼接

```java
// ✅ 推荐：使用占位符
log.info("User {} created order {} for amount {}", userId, orderId, amount);

// ❌ 避免：字符串拼接
log.info("User " + userId + " created order " + orderId);
```

---

## 业务日志

### 【推荐】关键业务操作记录日志

```java
// ✅ 推荐：记录关键操作
public void createOrder(Order order) {
    log.info("Order creation started: userId={}, amount={}", order.getUserId(), order.getAmount());
    
    try {
        orderRepository.save(order);
        log.info("Order created successfully: orderId={}", order.getId());
    } catch (Exception e) {
        log.error("Order creation failed: userId={}", order.getUserId(), e);
        throw e;
    }
}
```

---

## 性能注意事项

### 【推荐】避免日志性能损耗

```java
// ✅ 推荐：先判断再记录
if (log.isDebugEnabled()) {
    log.debug("Processing data: {}", buildExpensiveLogMessage(data));
}

// ❌ 避免：频繁调用日志方法
log.debug("Processing data: {}", buildExpensiveLogMessage(data));
```

### 【推荐】使用异步日志

```java
// ✅ 推荐：高并发场景使用异步日志
// 日志框架配置异步 appender
// Logback: AsyncAppender
// Log4j2: AsyncLogger
```

---

## 检查表

| 检查项 | ✅ 通过 | ❌ 不通过 |
|--------|---------|-----------|
| 框架 | 使用 SLF4J | 使用具体实现 |
| 输出 | 使��日志 API | System.out/err |
| 敏感信息 | 脱敏记录 | 明文记录 |
| 异常 | 包含堆栈 | 只有消息 |
| 级别 | 正确使用 | 滥用 DEBUG |

---

## 参考

- Alibaba P3C: `SystemErrLogRule` 规则集