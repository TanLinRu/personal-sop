# 命名规约

> 基于阿里巴巴《Java开发手册》- 编程规约

---

## 包命名

### 【强制】命名规范

```java
// ✅ 正例：全小写，字母间用点分隔
com.alibaba.p3c
com.example.project.module

// ❌ 反例：使用下划线、驼峰、大写
com_Alibaba_p3c
com.Alibaba.P3c
```

### 【强制】顶级包名

| 行业 | 顶级包名 | 示例 |
|------|----------|------|
| 通用 | com.公司名.项目名 | com.alibaba.product |
| 电商 | com.公司名.业务.模块 | com.taobao.trade |
| 金融 | com.公司名.业务.模块 | com.alipay.fund |

---

## 类命名

### 【强制】类名

```java
// ✅ 大驼峰 (UpperCamelCase)
public class UserService { }
public class OrderController { }
public class BaseEntity { }

// ❌ 驼峰错误
public class userService { }
public class order_controller { }
```

### 【强制】特殊类名

```java
// 抽象类：以 Abstract 或 Base 开头
public abstract class AbstractUserService { }
public class BaseController { }

// 接口：以 I 开头或形容词/名词
public interface IUserService { }
public interface Comparable { }

// 异常类：以 Exception 结尾
public class BusinessException { }
public class ResourceNotFoundException { }

// 测试类：以 Test 结尾
public class UserServiceTest { }
public class OrderIntegrationIT { }

// 工厂类：以 Factory 结尾
public class UserFactory { }

// 构建者：以 Builder 结尾
public class UserBuilder { }
```

---

## 方法命名

### 【强制】方法名

```java
// ✅ 小驼峰 (lowerCamelCase)
public void createUser() { }
public User findById(Long id) { }
public List<User> findAllUsers() { }

// ❌ 错误示例
public void CreateUser() { }  // 大驼峰
public void create_user() { }  // 下划线
```

### 【强制】方法动词前缀

| 动词 | 场景 | 示例 |
|------|------|------|
| get | 查询单个 | getUserById() |
| list | 查询列表 | listUsers() |
| query | 复杂查询 | queryUsersByCondition() |
| insert/create | 新增 | createUser() |
| update | 修改 | updateUser() |
| delete/remove | 删除 | deleteUser() |
| count | 统计 | countUsers() |
| batch | 批量操作 | batchInsert() |
| sync | 同步 | syncUserData() |

---

## 变量命名

### 【强制】普通变量

```java
// ✅ 小驼峰
private String userName;
private Integer orderCount;
private List<User> userList;

// ❌ 错误
private String UserName;  // 大驼峰
private String user_name;  // 下划线
private String NAME;      // 常量
```

### 【强制】常量

```java
// ✅ 全大写下划线
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_CHARSET = "UTF-8";

// ❌ 错误
public static final int maxRetryCount = 3;
public static final String defaultCharset = "UTF-8";
```

### 【强制】成员变量与局部变量

```java
// 成员变量：避免暴露直接用 public
private String userName;

// 局部变量：作用域最小化
public void process() {
    if (condition) {
        String temp = compute();  // ✅ 只在使用处定义
        // use temp
    }
}
```

---

## 抽象类/接口/枚举命名

### 【强制】接口

```java
// 方式一：形容词/名词（推荐）
public interface Comparable { }
public interface Readable { }

// 方式二：I + 名词
public interface IUserService { }
```

### 【强制】枚举

```java
// ✅ 枚举所有成员大写，下划线分隔
public enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED,
    COMPLETED,
    CANCELLED
}
```

---

## 命名禁忌

### 【强制】禁止使用

```java
// ❌ 禁止用 $ 开头或结尾
private String $name;
private String name$;

// ❌ 禁止用数字开头
private String 1stUser;
private String 2ndOrder;

// ❌ 避免用下划线
private String _privateVar;
private String privateVar_;

// ❌ 避免单字母（循环变量除外）
private String a;  // 允许: for (int i = 0; i < n; i++)
private String b;
```

### 【强制】避免无意义命名

```java
// ❌ 过于简单，无法表达含义
private String s;
private String data;
private String temp;
private String result;

// ✅ 明确表达含义
private String userName;
private String orderData;
private String tempFilePath;
private String computationResult;
```

---

## POJO 命名

### 【强制】Entity/Model

```java
// 业务实体
public class User { }
public class Order { }

// 数据模型
public class UserDTO { }      // Data Transfer Object
public class UserVO { }       // View Object
public class UserRequest { }  // 请求对象
public class UserResponse { } // 响应对象
```

### 【强制】集合类型

```java
// ✅ 复数形式表达集合
private List<User> users;
private Set<User> userSet;
private Map<Long, User> userMap;

// ❌ 单数形式
private List<User> userList;  // 不推荐
private Map<Long, User> userHashMap;  // 不推荐
```

---

## 命名检查表

| 检查项 | ✅ 通过 | ❌ 不通过 |
|--------|---------|-----------|
| 包名 | 全小写，点分隔 | 包含大写、下划线 |
| 类名 | 大驼峰 | 小驼峰、下划线 |
| 方法名 | 小驼峰 | 大驼峰、下划线 |
| 常量 | 全大写、下划线 | 混合大小写 |
| 变量 | 小驼峰 | 与关键字冲突 |
| 缩写 | 业界通用 (URL, API) | 自创缩写 |

---

## 参考

- Alibaba P3C: `NameConventions` 规则集
- Java SE 命名规范