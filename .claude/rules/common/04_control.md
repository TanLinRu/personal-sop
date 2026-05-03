# 控制语句

> 基于阿里巴巴《Java开发手册》- 控制语句规约

---

## switch 语句

### 【强制】switch 必须有 default

```java
// ✅ 正确：必须包含 default
public String getType(String status) {
    switch (status) {
        case "pending":
            return "待处理";
        case "done":
            return "已完成";
        default:
            return "未知状态: " + status;
    }
}

// ❌ 错误：没有 default
public String getType(String status) {
    switch (status) {
        case "pending":
            return "待处理";
        // 缺少 default，可能返回 null
    }
}
```

### 【强制】避免 switch 贯穿

```java
// ✅ 正确：每个 case 加 break
switch (status) {
    case "a":
        doA();
        break;
    case "b":
        doB();
        break;
    default:
        doDefault();
}

// ✅ 也可使用 return
public String getType(String status) {
    return switch (status) {
        case "a" -> doA();
        case "b" -> doB();
        default -> doDefault();
    };
}
```

---

## 循环

### 【强制】循环内避免 try-catch

```java
// ✅ 正确：循环外处理异常
public void processList(List<Item> items) {
    try {
        for (Item item : items) {
            process(item);
        }
    } catch (Exception e) {
        log.error("Process failed", e);
    }
}

// ❌ 错误：在循环内 try-catch
public void processList(List<Item> items) {
    for (Item item : items) {
        try {
            process(item);  // 每次循环都创建异常栈，效率低
        } catch (Exception e) {
            log.error("Failed: " + item.getId(), e);
        }
    }
}
```

### 【强制】使用 for-each 优先

```java
List<User> users = getUsers();

// ✅ 推荐：使用 for-each
for (User user : users) {
    process(user);
}

// ❌ 避免：传统 for 循环（除非需要索引）
for (int i = 0; i < users.size(); i++) {
    User user = users.get(i);
    process(user);
}
```

---

## 条件判断

### 【强制】取反逻辑尽量避免

```java
// ✅ 正确：使用正向逻辑
if (isValid) {
    process();
}

// ❌ 避免：取反逻辑难以理解
if (!isInvalid) {
    process();
}
```

### 【强制】boolean 参数不用于判断

```java
// ✅ 正确：使用卫语句提前返回
public void process(boolean force) {
    if (!force) {
        if (!canProcess()) {
            return;
        }
    }
    doProcess();
}

// ❌ 避免：参数既用于判断又返回值
public boolean process(boolean force) {
    if (force) {
        doProcess();
        return true;
    }
    return false;
}
```

---

## 嵌套层级

### 【推荐】减少嵌套层级

```java
// ✅ 推荐：提前返回，减少嵌套
public void process(User user) {
    if (user == null) {
        log.warn("User is null");
        return;
    }
    
    if (!user.isActive()) {
        log.warn("User is inactive");
        return;
    }
    
    // 核心逻辑
    doProcess(user);
}

// ❌ 避免：多层嵌套
public void process(User user) {
    if (user != null) {
        if (user.isActive()) {
            if (canProcess()) {
                doProcess(user);
            }
        }
    }
}
```

### 【推荐】避免过多 if-else

```java
// ✅ 推荐：使用策略模式或多态
public enum ProcessStrategy {
    A() {
        @Override
        public void process() { }
    },
    B() {
        @Override
        public void process() { }
    }
    
    public abstract void process();
}

// ❌ 避免：过多 if-else
public void process(String type) {
    if ("A".equals(type)) {
        processA();
    } else if ("B".equals(type)) {
        processB();
    } else if ("C".equals(type)) {
        processC();
    } else if ("D".equals(type)) {
        processD();
    } else if ("E".equals(type)) {
        processE();
    }  // 超过 5 个应该用策略模式
}
```

---

## return 语句

### 【强制】方法返回值不为 null 时不返回 null

```java
// ✅ 正确：明确返回值
public List<User> getUsers() {
    if (users.isEmpty()) {
        return Collections.emptyList();  // 返回空集合，而非 null
    }
    return users;
}

// ❌ 错误：返回 null 表示"无结果"，调用方需要额外判断
public List<User> getUsers() {
    if (users.isEmpty()) {
        return null;
    }
    return users;
}
```

### 【推荐】使用 Optional 作为返回值

```java
import java.util.Optional;

// ✅ 推荐：使用 Optional 表示"可能有值"
public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}

// 使用
findById(1L).ifPresent(user -> process(user));
```

---

## 三元运算符

### 【推荐】使用三元运算符简化

```java
// ✅ 推荐：三元运算符
String name = user != null ? user.getName() : "Unknown";

// ❌ 避免：过于复杂的三元运算
String result = a > b ? a > c ? a : c : b > c ? b : c;  // 难以理解
```

### 【强制】三元运算符不为 null

```java
// ✅ 正确：null 情况明确处理
String name = user != null ? user.getName() : "Unknown";

// ❌ 错误：三元运算结果可能为 null
String name = (user != null) ? user.getName() : null;
```

---

## 检查表

| 检查项 | ✅ 通过 | ❌ 不通过 |
|--------|---------|-----------|
| switch | 有 default | 无 default |
| 循环内 | 无 try-catch | 有 try-catch |
| 条件 | 正向逻辑 | 取反逻辑 |
| 嵌套 | ≤4 层 | >4 层 |
| if-else | ≤5 个或用策略模式 | >5 个条件 |
| 返回值 | 明确，不返回 null | 可能返回 null |

---

## 参考

- Alibaba P3C: `SwitchStingRule` 规则集