# LiteFlow 常见错误总结

## 错误1：在组件内获取参数

### ❌ 错误代码
```java
@LiteflowComponent("a")
public class ACmp extends NodeComponent {
    @Override
    public void process() {
        // 错误！这些方法不存在
        String param = this.getParam("key", String.class);
        Object data = this.getData("key", Object.class);
        
        // 错误！简化版不支持
        this.getContext().setData("result", object);
    }
}
```

### ✅ 正确代码
```java
@LiteflowComponent("a")
public class ACmp extends NodeComponent {
    @Override
    public void process() {
        // 直接写业务逻辑
        // 参数由调用方通过FlowExecutor的上下文传入
        
        // 可以使用getTag()获取标签
        String tag = this.getTag();
        
        System.out.println("执行业务逻辑");
    }
}
```

### 原因
LiteFlow的组件设计理念是**纯业务逻辑单元**，参数传递通过调用方的`FlowExecutor`实现，而不是组件内部获取。

---

## 错误2：配置文件位置错误

### ❌ 错误位置
```
resources/
├── rule/
│   └── flow.xml      ❌ 错误位置
```

### ✅ 正确位置
```
resources/
├── config/
│   └── flow.xml      ✅ 正确位置
```

### 配置修改
```yaml
# application.yml
liteflow:
  rule-source: config/flow.xml  # 不是 rule/flow.xml
```

---

## 错误3：使用不存在的注解

### ❌ 错误代码
```java
@SpringBootApplication
@EnableLiteFlow  // ❌ 不需要！
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### ✅ 正确代码
```java
@SpringBootApplication
// 不需要@EnableLiteFlow，starter自动配置
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## 错误4：组件ID命名错误

### ❌ 错误代码
```java
@LiteflowComponent(id = "a", name = "组件A")  // ❌ id应该是字符串
public class ACmp extends NodeComponent { }
```

### ✅ 正确代码
```java
@LiteflowComponent("a")  // 直接写ID
public class ACmp extends NodeComponent { }

// 或者
@LiteflowComponent(id = "a")  // 使用id属性
public class ACmp extends NodeComponent { }
```

---

## 错误5：链名称与组件名称混淆

### ❌ 错误理解
```xml
<!-- 错误：组件名和链名混淆 -->
<chain name="a">
    THEN(a);  <!-- 这里a是链名 -->
</chain>
```

### ✅ 正确理解
```xml
<!-- 正确：chain是链名，THEN()里的是组件ID -->
<chain name="registerChain">
    THEN(registerRisk);  <!-- registerRisk是组件ID -->
</chain>

<!-- 组件定义 -->
@LiteflowComponent("registerRisk")  <!-- 组件ID="registerRisk" -->
public class RegisterRiskComponent extends NodeComponent { }
```

---

## 错误6：执行方式错误

### ❌ 错误代码
```java
// 错误：直接在组件外部调用
ACmp cmp = new ACmp();
cmp.process();  // ❌ 不应该直接调用
```

### ✅ 正确代码
```java
@Resource
private FlowExecutor flowExecutor;

public void test() {
    // 通过FlowExecutor执行链
    LiteflowResponse response = flowExecutor.execute2Resp(
        "chain1",           // 链名称
        "param",            // 参数
        DefaultContext.class // 上下文
    );
}
```

---

## 错误7：依赖版本选择

### ❌ 错误版本
```xml
<!-- 使用最新的snapshot版本可能不稳定 -->
<version>2.16.0-SNAPSHOT</version>
```

### ✅ 推荐版本
```xml
<!-- 使用稳定版本 -->
<version>2.15.3</version>
```

---

## 快速检查清单

使用LiteFlow前检查：
- [ ] 组件继承NodeComponent，只写process()方法
- [ ] 不使用getParam/getData等不存在的API
- [ ] 配置文件在resources/config/目录
- [ ] 不需要@EnableLiteFlow注解
- [ ] 通过FlowExecutor执行链
- [ ] 使用稳定版本2.15.3

---

## 总结

| 常见错误 | 正确做法 |
|----------|----------|
| 在组件内获取参数 | 直接写业务逻辑，参数由调用方传入 |
| 配置文件放错位置 | resources/config/flow.xml |
| 添加不需要的注解 | 不需要@EnableLiteFlow |
| 直接new组件调用 | 通过FlowExecutor执行 |