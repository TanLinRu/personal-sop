# LiteFlow 快速入门指南

## 概述

LiteFlow是国产轻量级规则引擎，支持组件化业务编排、热部署、多语言脚本。

## 核心概念

| 概念 | 说明 |
|------|------|
| 组件（Component） | 业务逻辑单元，继承`NodeComponent` |
| 链（Chain） | 编排规则，定义组件执行顺序 |
| 执行器（FlowExecutor） | 执行链的入口 |
| 上下文（Context） | 传递数据的容器 |

## 最小示例

### 1. 依赖引入
```xml
<dependency>
    <groupId>com.yomahub</groupId>
    <artifactId>liteflow-spring-boot-starter</artifactId>
    <version>2.15.3</version>
</dependency>
```

### 2. 定义组件
```java
@LiteflowComponent("a")
public class ACmp extends NodeComponent {
    @Override
    public void process() {
        // 只写业务逻辑，不要尝试获取参数
        System.out.println("组件A执行");
    }
}
```

**重要**：组件内不要使用以下错误方法：
- ❌ `this.getParam("key")` - 不存在
- ❌ `this.getData("key")` - 不存在  
- ❌ `this.getContext().setData()` - 简化版不支持
- ✅ `this.getTag()` - 可获取标签

### 3. 配置文件
位置：`resources/config/flow.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<flow>
    <chain name="chain1">
        THEN(a, b, c);
    </chain>
</flow>
```

### 4. application.yml配置
```yaml
liteflow:
  rule-source: config/flow.xml
```

### 5. 执行
```java
@Resource
private FlowExecutor flowExecutor;

public void test() {
    LiteflowResponse response = flowExecutor.execute2Resp(
        "chain1",      // 链名称
        "arg",         // 参数
        DefaultContext.class  // 上下文
    );
}
```

## 关键区别（避免错误）

| ❌ 错误理解 | ✅ 正确理解 |
|------------|-------------|
| 组件内获取参数 | 参数由调用方通过上下文传入 |
| 使用getParam/getData | 直接在process()写业务逻辑 |
| 配置文件放任意位置 | 必须放resources/config/目录 |
| 需要@EnableLiteFlow | 不需要（starter自动配置） |

## 组件类型

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| 普通组件 | 基础业务逻辑 | 大多数场景 |
| 选择组件 | 根据条件选择分支 | 条件分支 |
| 布尔组件 | 返回true/false | 条件判断 |
| 循环组件 | 次数/条件循环 | 重复执行 |

## 规则语法

```xml
<!-- 串行 -->
<chain name="chain1">
    THEN(a, b, c);
</chain>

<!-- 并行 -->
<chain name="chain2">
    WHEN(a, b, c);
</chain>

<!-- 条件 -->
<chain name="chain3">
    WHEN(
        IF(cond, a),
        THEN(b)
    );
</chain>
```

## 常见问题

### Q: 编译报错找不到方法
A: 检查是否错误使用了不存在的API（getParam/getData），应该直接在process()中写业务逻辑

### Q: 配置文件不生效
A: 检查文件位置是否正确，应在resources/config/flow.xml

### Q: 组件不被加载
A: 确保@ComponentScan能扫描到组件所在包

## 参考资源

- 官网：https://liteflow.cc/
- GitHub：https://github.com/bryan31/liteflow
- Gitee：https://gitee.com/dromara/liteFlow