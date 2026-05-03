# 异常处理

> 基于阿里巴巴《Java开发手册》- 异常处理规约

---

## 捕获与抛出

### 【强制】异常必须捕获或抛出

```java
// ✅ 正确：捕获处理
public void process() {
    try {
        doSomething();
    } catch (IOException e) {
        log.error("IO error", e);
    }
}

// ✅ 正确：上抛异常
public void process() throws IOException {
    doSomething();
}

// ❌ 错误：捕获后不做任何处理
public void process() {
    try {
        doSomething();
    } catch (IOException e) {
        // emptycatch - 异常被吞掉
    }
}
```

### 【强制】事务必须回滚

```java
// ✅ 正确：RuntimeException 自动回滚
@Transactional(rollbackFor = Exception.class)
public void createOrder(Order order) {
    orderRepository.save(order);
    // 失败自动回滚
}

// ✅ 正确：Checked Exception 也需回滚
@Transactional(rollbackFor = Exception.class)
public void processFile(String path) throws IOException {
    // 无论成功还是失败都会回滚
}
```

### 【强制】finally 块不 return

```java
// ❌ 错误：finally 块 return 会覆盖 try 块的异常
public String getValue() {
    try {
        return getData();
    } catch (Exception e) {
        return "error";
    } finally {
        return "finally";  // 永远返回这个
    }
}

// ✅ 正确：finally 只做清理
public void close() {
    try {
        process();
    } finally {
        // 只清理资源，不 return
        release();
    }
}
```

---

## 异常类型选择

### 【强制】使用具体异常类型

```java
// ✅ 正确：使用具体异常
public void process() throws BusinessException {
    if (!canProcess()) {
        throw new BusinessException("无法处理");  // 具体异常
    }
}

// ❌ 避免：直接抛出 Exception
public void process() throws Exception {
    throw new Exception("错误");
}
```

### 【强制】自定义异常命名

```java
// ✅ 正确：业务异常
public class BusinessException extends RuntimeException {
    private String code;
    
    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }
}

// ✅ 正确：资源不存在异常
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, String id) {
        super(resource + " not found: " + id);
    }
}
```

---

## 异常包装

### 【强制】保留原异常信息

```java
// ✅ 正确：保留原异常
public void process() {
    try {
        doSomething();
    } catch (IOException e) {
        throw new BusinessException("PROCESS_FAIL", "处理失败", e);  // 保留 cause
    }
}

// ❌ 错误：丢失原异常
public void process() {
    try {
        doSomething();
    } catch (IOException e) {
        throw new BusinessException("PROCESS_FAIL", "处理失败");  // 丢失 cause
    }
}
```

### 【推荐】统一异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handle(BusinessException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(e.getCode(), e.getMessage()));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle(ResourceNotFoundException e) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", e.getMessage()));
    }
}
```

---

## 避免 catch Exception

### 【推荐】避免捕获 Exception/Throwable

```java
// ❌ 避免：捕获太宽泛
public void process() {
    try {
        doSomething();
    } catch (Exception e) {  // 捕获所有异常
        log.error("Error", e);
    }
}

// ✅ 推荐：捕获具体异常
public void process() {
    try {
        doSomething();
    } catch (IOException e) {
        log.error("IO Error", e);
        handleIOException(e);
    } catch (SQLException e) {
        log.error("SQL Error", e);
        handleSQLException(e);
    }
}
```

---

## 检查表

| 检查项 | ✅ 通过 | ❌ 不通过 |
|--------|---------|-----------|
| 捕获 | 捕获具体异常 | 捕获 Exception |
| 抛出 | 向上抛出具体异常 | 抛出 Exception/Throwable |
| 事务 | 有 @Transactional | 无事务注解 |
| finally | 只做清理 | 有 return |
| 异常Cause | 保留原异常 | 丢失异常信息 |

---

## 参考

- Alibaba P3C: `AvoidCallSystemTime`, `MethodReturnWrapperSequence` 规则集