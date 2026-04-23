# LiteFlow集成失败问题总结

## 实施时间
2026-04-18

## 目标
引入LiteFlow规则引擎，替代当前硬编码规则

## 失败原因

### 1. API不兼容（根本原因）
LiteFlow 2.15.x版本的`NodeComponent` API与预期不同：
- `this.getParam()` 方法不存在
- `this.getData()` 方法签名不匹配
- `this.setResult()` 方法签名不同

### 2. 文档缺失
- 官方文档示例不完整
- Java 21环境兼容性未明确说明
- MCP工具无法获取有效文档

### 3. 版本选择问题
- 选择了最新版本2.15.3，可能存在已知问题
- 应该选择更稳定的LTS版本

## 尝试的代码

```java
// 创建的组件类（编译失败）
@LiteflowComponent(id = "registerRiskCmp", name = "注册风控检查")
public class RegisterRiskComponent extends NodeComponent {
    @Override
    public void process() {
        RiskEvent event = this.getData("event", RiskEvent.class); // 失败
        String phone = this.getParam("phone", String.class); // 失败
    }
}
```

## 错误信息
```
cannot find symbol: method getParam(...)
cannot find symbol: method getData(...)
```

## 后续建议

### 方案A：等待官方文档完善
- 关注LiteFlow GitHub issues
- 等待2.16.x版本稳定

### 方案B：使用LiteFlow脚本模式
- 避免Java组件，使用XML/JSON规则配置
- 参考官方example目录

### 方案C：回退依赖
- 移除liteflow-spring-boot-starter
- 保持当前简单规则引擎
- 成本最低

## 项目当前状态
- pom.xml: 保留LiteFlow依赖（未使用）
- risk-flow.xml: 保留规则配置（未使用）
- 代码: 保持原有Service正常工作

## 损失评估
- 时间消耗: ~30分钟
- 代码损失: 5个组件类文件
- 依赖损失: 无（可回退）