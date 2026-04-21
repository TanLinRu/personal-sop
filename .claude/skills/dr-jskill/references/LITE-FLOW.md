# LiteFlow 规则引擎集成

## 快速开始

### 依赖配置

```xml
<dependency>
    <groupId>com.yomahub</groupId>
    <artifactId>liteflow-spring-boot-starter</artifactId>
    <version>2.15.3</version>
</dependency>
```

### 配置文件位置

```
src/main/resources/
└── config/
    └── flow.xml    # 规则定义文件
```

## 核心概念

### 1. 流程 Chain

```xml
<flow>
    <chain name="riskCheckChain">
        THEN(
            componentA,
            componentB,
            componentC
        )
    </chain>
</flow>
```

### 2. 组件 Component

```java
@LiteflowComponent("componentA")
public class ComponentA extends NodeComponent {

    @Override
    public void process() {
        DefaultContext ctx = this.getContextBean(DefaultContext.class);
        // 业务逻辑
        ctx.setData("result", "success");
    }
}
```

## 配置

### application.yml

```yaml
liteflow:
  rule-source: config/flow.xml
```

### flow.xml 示例

```xml
<?xml version="1.0" encoding="UTF-8"?>
<flow>
    <!-- 注册风控链路 -->
    <chain name="registerRiskChain">
        THEN(
            ipCheckComponent,
            deviceCheckComponent,
            behaviorCheckComponent,
            riskScoreComponent
        )
    </chain>

    <!-- 登录风控链路 -->
    <chain name="loginRiskChain">
        THEN(
            accountCheckComponent,
            ipCheckComponent,
            loginFrequencyComponent
        )
    </chain>
</flow>
```

## 组件写法

### 定义组件

```java
@LiteflowComponent("ipCheckComponent")
public class IpCheckComponent extends NodeComponent {

    @Override
    public void process() {
        DefaultContext ctx = this.getContextBean(DefaultContext.class);
        String userIp = ctx.getData("userIp");

        boolean isRisk = checkIpRisk(userIp);
        ctx.setData("ipRisk", isRisk);
    }

    private boolean checkIpRisk(String ip) {
        // 检查IP风险
        return false;
    }
}
```

### 获取参数

```java
@Override
public void process() {
    // 从上下文获取参数
    DefaultContext ctx = this.getContextBean(DefaultContext.class);
    String userIp = ctx.getData("userIp");
    String userId = ctx.getData("userId");

    // 设置结果
    ctx.setData("riskScore", 100);
}
```

### 返回结果

```java
@Override
public void process() {
    DefaultContext ctx = this.getContextBean(DefaultContext.class);

    // 方式1：设置到上下文
    ctx.setData("riskLevel", "HIGH");

    // 方式2：使用setTag
    this.setTag("BLOCK");
}
```

## 执行方式

### Service层调用

```java
@Resource
private FlowExecutor flowExecutor;

public RiskEvent checkRegisterRisk(RegisterRequest request) {
    DefaultContext context = new DefaultContext();
    context.setData("userIp", request.getUserIp());
    context.setData("deviceId", request.getDeviceId());
    context.setData("userId", request.getUserId());

    flowExecutor.execute2Resp("registerRiskChain", context, DefaultContext.class);

    int riskScore = context.getData("riskScore");
    return new RiskEvent(riskScore);
}
```

## 流程控制

### THEN 顺序执行

```xml
<chain name="chain1">
    THEN(componentA, componentB, componentC)
</chain>
```

### WHEN 并行执行

```xml
<chain name="chain1">
    WHEN(componentA, componentB, componentC)
</chain>
```

### IF 条件执行

```xml
<chain name="chain1">
    IF(componentA, componentB, componentC)
</chain>
```

### FOR 循环

```xml
<chain name="chain1">
    FOR(componentA).DO(componentB)
</chain>
```

## 常见问题

### 1. 无法获取参数

检查是否使用 `DefaultContext`，不是 `Slot`：
```java
DefaultContext ctx = this.getContextBean(DefaultContext.class);
```

### 2. 组件找不到

确保 `@LiteflowComponent("xxx")` 名称与 flow.xml 一致。

### 3. 流程不执行

检查 `rule-source` 路径是否正确：
```yaml
liteflow:
  rule-source: config/flow.xml
```

## 最佳实践

### 1. 组件命名

使用有意义的名称：
```java
@LiteflowComponent("registerIpCheck")
@LiteflowComponent("loginFrequencyCheck")
```

### 2. 上下文定义

```java
public class DefaultContext extends ContextBase {
    public static final String USER_IP = "userIp";
    public static final String USER_ID = "userId";
    // ...
}
```

### 3. 异常处理

```java
@Override
public void process() {
    try {
        // 业务逻辑
    } catch (Exception e) {
        this.setTag("ERROR");
        throw new RuntimeException(e);
    }
}
```