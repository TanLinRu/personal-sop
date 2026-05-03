# 安全规约

> 基于阿里巴巴《Java开发手册》- 安全规约

---

## 敏感数据保护

### 【强制】禁止明文存储密码

```java
// ✅ 正确：使用 BCrypt 加密
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

public void encodePassword() {
    String encoded = passwordEncoder.encode(rawPassword);
}

// ❌ 禁止：明文存储
private String password;  // 明文
private String password = "123456";  // 硬编码
```

### 【强制】禁止在日志中记录敏感信息

```java
// ✅ 正确：脱敏输出
log.info("User login: name={}, id={}", mask(name), userId);

// ❌ 禁止：记录敏感信息
log.info("Password: {}", password);
log.info("Token: {}", token);
log.info("CreditCard: {}", cardNumber);
```

### 【强制】URL 参数禁止明文传递密码

```java
// ❌ 禁止：URL 参数传密码
https://api.example.com/login?password=123456

// ✅ 正确：使用 POST body
POST /login
{
  "username": "xxx",
  "password": "xxx"
}
```

---

## SQL 注入

### 【强制】禁止 SQL 拼接

```java
// ❌ 禁止：SQL 拼接
String sql = "SELECT * FROM users WHERE name = '" + name + "'";
stmt.executeQuery(sql);

// ✅ 正确：使用参数化查询
@Query("SELECT u FROM User u WHERE u.name = :name")
User findByName(@Param("name") String name);
```

### 【强制】使用白名单过滤

```java
// ✅ 正确：白名单
private static final Set<String> ALLOWED_SORT_FIELDS = 
    Set.of("id", "name", "createdAt");

public List<User> find(String sortField) {
    if (!ALLOWED_SORT_FIELDS.contains(sortField)) {
        throw new IllegalArgumentException("Invalid sort field");
    }
    // safe to use
}
```

---

## 权限控制

### 【强制】接口必须权限校验

```java
// ✅ 正确：添加权限注解
@PreAuthorize("hasRole('USER')")
public void deleteUser(Long id) { }

// ✅ 正确：服务层校验
public void deleteUser(Long id) {
    User current = getCurrentUser();
    if (!current.getId().equals(id) && !current.isAdmin()) {
        throw new AccessDeniedException("No permission");
    }
    repository.deleteById(id);
}
```

### 【强制】数据权限校验

```java
// ✅ 正确：数据权限校验
public List<Order> listUserOrders(Long userId) {
    User current = getCurrentUser();
    // 普通用户只能查看自己的数据
    if (!current.isAdmin() && !current.getId().equals(userId)) {
        throw new AccessDeniedException("Cannot view other user's orders");
    }
    return orderRepository.findByUserId(userId);
}
```

---

## XSS 防护

### 【强制】输入过滤

```java
// ✅ 正确：使用框架防护
// Spring: 默认开启 XSS 防护
// 手动过滤
import org.springframework.web.util.HtmlUtils;

public String sanitize(String input) {
    return HtmlUtils.htmlEscape(input);
}
```

### 【强制】输出编码

```java
// ✅ 正确：JSON 序列化自动转义
return ResponseEntity.ok(user);
// 自动设置 Content-Type: application/json

// ✅ 正确：HTML 输出手动转义
// Thymeleaf: 默认转义
// 手动: HtmlUtils.htmlEscape(output)
```

---

## 文件上传

### 【强制】限制文件类型

```java
// ✅ 正确：白名单验证
private static final Set<String> ALLOWED_TYPES = 
    Set.of("image/jpeg", "image/png", "application/pdf");

public void upload(MultipartFile file) {
    if (!ALLOWED_TYPES.contains(file.getContentType())) {
        throw new IllegalArgumentException("File type not allowed");
    }
}
```

### 【强制】限制文件大小

```java
// ✅ 正确：大小限制
@PostMapping("/upload")
public void upload(@RequestParam("file") MultipartFile file) {
    if (file.getSize() > 10 * 1024 * 1024) {  // 10MB
        throw new IllegalArgumentException("File too large");
    }
}
```

---

## 金融安全

### 【强制】金额计算使用 BigDecimal

```java
// ✅ 正确：使用 BigDecimal
private BigDecimal amount = new BigDecimal("100.00");

// ❌ 避免：使用 double/float
private double amount = 100.00;  // 精度问题
```

### 【强制】金额判断用范围比较

```java
// ✅ 正确：使用范围比较
if (amount.compareTo(BigDecimal.ZERO) > 0) { }

// ❌ 避免：使用 equals
if (amount.equals(BigDecimal.ZERO)) { }  // 可能失败
```

---

## 检查表

| 检查项 | ✅ 通过 | ❌ 不通过 |
|--------|---------|-----------|
| 密码 | 加密存储 | 明文/硬编码 |
| 日志 | 脱敏输出 | 敏感信息 |
| SQL | 参数化查询 | SQL 拼接 |
| 权限 | 有校验 | 无校验 |
| 文件 | 类型/大小限制 | 无限制 |

---

## 参考

- Alibaba P3C: `SecurityConfig` 规则集
- OWASP Top 10