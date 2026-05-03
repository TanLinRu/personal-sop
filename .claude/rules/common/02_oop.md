# OOP 规约

> 基于阿里巴巴《Java开发手册》- OOP 规约

---

## 覆写与重载

### 【强制】@Override 必须使用

```java
// ✅ 正确：覆写方法必须加 @Override
@Override
public void onDestroy() {
    super.onDestroy();
}

// ❌ 错误：忘记加 @Override，可能意外变成重载
public void onDestroy() {  // 如果父类有新方法，这里就不是覆写
    super.onDestroy();
}
```

### 【强制】参数类型匹配

```java
// ✅ 正确：参数类型必须完全匹配或兼容
@Override
public void setName(String name) {
    this.name = name;
}

// ❌ 错误：参数类型不能是父类类型的子类
@Override
public void setName(CharSequence name) {  // 编译可能通过，但逻辑错误
    this.name = name.toString();
}
```

---

## extends 与 implements

### 【强制】禁止类继承可变类

```java
// ❌ 禁止：StringBuilder 可变，继承会导致问题
class MyStringBuilder extends StringBuilder {
}

// ✅ 正确：使用组合而非继承
class MyStringBuilder {
    private final StringBuilder builder = new StringBuilder();
    
    public MyStringBuilder append(String s) {
        return builder.append(s);
    }
}
```

### 【强制】接口实现必须完整

```java
// ✅ 正确：实现所有抽象方法
public class UserService implements UserInterface {
    @Override
    public void create() { }
    
    @Override
    public void delete() { }
}

// ❌ 错误：未实现的方法，类必须是 abstract
public abstract class UserService implements UserInterface {
    // 未实现的 delete() 方法
}
```

---

## equals 与 hashCode

### 【强制】必须成对覆写

```java
public class User {
    private Long id;
    private String name;
    
    // ✅ 必须同时覆写
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id != null && id.equals(user.id);
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
```

### 【强制】equals 判空

```java
@Override
public boolean equals(Object o) {
    // ✅ 正确：先判空
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    
    User user = (User) o;
    return id != null && id.equals(user.id);
}

// ❌ 错误：直接调用 equals 可能 NPE
@Override
public boolean equals(Object o) {
    return id.equals(((User) o).id);  // id 可能为 null
}
```

---

## Object 方法

### 【强制】toString() 必须覆写

```java
// ✅ 正确：提供有意义的 toString
@Override
public String toString() {
    return "User{" +
            "id=" + id +
            ", name='" + name + '\'' +
            '}';
}

// ❌ 错误：直接继承 Object.toString() 输出无意义
// class: User@1a2b3c4d
```

### 【强制】Cloneable 必须实现深拷贝

```java
// ✅ 正确：实现深拷贝
public class User implements Cloneable {
    private Long id;
    private List<String> roles;
    
    @Override
    public User clone() {
        try {
            User clone = (User) super.clone();
            clone.roles = new ArrayList<>(this.roles);  // 深拷贝
            return clone;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);
        }
    }
}
```

---

## static 成员访问

### 【强制】通过类名访问 static 成员

```java
public class User {
    public static int MAX_COUNT = 100;
    
    public void method() {
        // ✅ 正确：通过类名访问
        int max = User.MAX_COUNT;
        
        // ❌ 错误：通过实例访问（语义不清）
        User u = new User();
        int max = u.MAX_COUNT;
    }
}
```

### 【强制】static 方法不能调用非 static 成员

```java
public class UserService {
    private String name;  // non-static
    
    // ✅ 正确：static 方法只访问 static 成员
    public static void reset() {
        clearCache();  // clearCache() 必须是 static
    }
    
    // ❌ 错误：static 方法访问实例成员
    public static void setName(String name) {
        this.name = name;  // 编译错误
    }
}
```

---

## final 关键字

### 【强制】String 必须用 final

```java
// ✅ 正确：String 是不可变的
public void process(String input) {
    String result = input.trim().toLowerCase();
}

// ❌ 错误：尝试修改 String（不会生效）
public void process(String input) {
    input = input.trim();  // 形参重新赋值，无意义
}
```

### 【强制】集合作为参数使用 unmodifiable

```java
import java.util.Collections;

// ✅ 正确：返回不可修改的集合
public List<User> getUsers() {
    return Collections.unmodifiableList(users);
}

// ❌ 错误：直接返回可变集合
public List<User> getUsers() {
    return users;  // 外部可以修改内部状态
}
```

---

## 构造方法

### 【强制】避免在构造方法中做复杂操作

```java
// ✅ 正确：构造方法只做简单赋值
public User(Long id, String name) {
    this.id = id;
    this.name = name;
}

// ❌ 错误：构造方法做复杂操作
public User(Long id) {
    this.id = id;
    this.name = loadFromDatabase(id);  // 可能失败，异常处理复杂
}
```

### 【强制】多参数使用 Builder 或静态工厂

```java
// ✅ 推荐：使用 Builder
public class User {
    private Long id;
    private String name;
    private String email;
    
    private User(Builder builder) {
        this.id = builder.id;
        this.name = builder.name;
        this.email = builder.email;
    }
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private Long id;
        private String name;
        private String email;
        
        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public User build() { return new User(this); }
    }
}

// 使用
User user = User.builder()
    .id(1L)
    .name("zhangsan")
    .email("zhangsan@example.com")
    .build();
```

---

## 内部类

### 【推荐】优先使用静态内部类

```java
public class Outer {
    // ✅ 推荐：静态内部类
    public static class Inner {
    }
    
    // ❌ 避免：非静态内部类（持有外部引用）
    public class Inner {  // 如果不需要访问外部成员
    }
}
```

### 【强制】匿名内部类必须捕获 final 变量

```java
// ✅ 正确：匿名内部类使用的变量必须是 final 或 effectively final
final int value = 10;
Runnable r = () -> System.out.println(value);

// ❌ 错误：在匿名内部类中修改外部变量
int value = 10;  // effectively final
Runnable r = () -> {
    value = 20;  // 编译错误
};
```

---

## 参考

- Alibaba P3C: `MandatoryThrowInCheck`, `EqualsHashCodeZone` 规则集