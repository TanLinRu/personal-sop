# 规则引擎与ML模型技术调研报告

## 一、规则引擎对比

### 1.1 LiteFlow（推荐国产方案）

**简介**：LiteFlow是国产开源的轻量级规则引擎，由Dromara社区维护（2020年开源）。

**特性**：
- 组件化设计，所有逻辑都是组件
- 规则文件支持XML、JSON、YAML三种格式
- 支持热部署，规则变化无需重启应用
- 支持JDK 8-25，无需担心版本兼容
- 支持Springboot 2.x/3.x
- 支持脚本语言：Groovy、Java、JavaScript、Python、Lua、Aviator
- 规则可存储在数据库、Nacos、Etcd、Zookeeper、Redis
- Gitee 6K+ Stars，社区活跃

**版本**：
```xml
<dependency>
    <groupId>com.yomahub</groupId>
    <artifactId>liteflow-spring-boot-starter</artifactId>
    <version>2.15.3</version>
</dependency>
```

**适用场景**：复杂业务流程编排、规则热更新、多系统集成

---

### 1.2 Drools（不推荐）

**简介**：JBoss开源的业务规则管理系统，使用Rete/Phreak算法。

**特性**：
- JSR94标准实现
- 支持DRL规则语言
- 支持DMN决策模型
- 规则与代码分离
- 学习曲线较陡

**缺点**：
- 依赖复杂，引入多个JAR
- 当前项目规模较小（12条规则），属于过度设计
- Maven环境可能存在兼容性问题

**版本建议**：
```xml
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-core</artifactId>
    <version>7.75.1.Final</version>
</dependency>
```

**结论**：不推荐当前项目使用Drools

---

### 1.3 其他轻量级方案

| 引擎 | 特点 | 适用场景 |
|------|------|----------|
| Easy Rules | 纯Java POJO | 简单规则 |
| RuleBook | Lambda链式调用 | 函数式编程 |
| OpenL Tablets | Excel决策表 | 业务人员配置 |

---

## 二、当前推荐方案

### 方案选择

| 阶段 | 方案 | 说明 |
|------|------|------|
| 当前 | 自定义规则引擎 | 12条规则，已满足需求 |
| 未来升级 | LiteFlow | 需要复杂编排时引入 |
| ML模型 | Flask REST API | Python模型独立部署 |

### 理由

1. **规则简单**：当前仅有12条规则，自定义引擎足够
2. **易于维护**：代码即规则，学习成本低
3. **本地可部署**：无外部依赖
4. **性能足够**：规则数量少，加权评分足够

---

## 三、ML模型调研（欺诈检测）

### 3.1 业界实践

**模型对比（信用卡欺诈检测）**：

| 模型 | F1 Score | Precision | Recall |
|------|----------|-----------|--------|
| CatBoost | 0.9161 | 0.9338 | 0.8991 |
| XGBoost | 0.8926 | 0.8925 | 0.8928 |
| LightGBM | 0.8812 | 0.8603 | 0.9032 |

**结论**：
- CatBoost在欺诈检测场景表现最优
- LightGBM训练速度最快，推理延迟最低
- 实际部署中，Stacking（XGBoost+LightGBM）可提升8%准确率

### 3.2 本地部署方案

**Flask REST API（推荐）**：

```python
# fraud_api.py
from flask import Flask, request, jsonify
import lightgbm as lgb
import numpy as np

app = Flask(__name__)
model = lgb.Booster(model_file='fraud_model.txt')

@app.route('/api/predict', methods=['POST'])
def predict():
    features = request.get_json()
    prob = model.predict(np.array([features]))
    return jsonify({
        'probability': float(prob[0]),
        'risk_level': 'HIGH' if prob[0] > 0.7 else 'MEDIUM' if prob[0] > 0.3 else 'LOW'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 3.3 Java调用Python ML

```java
// MLPredictionService.java
@Service
public class MLPredictionService {
    private final RestTemplate restTemplate;
    private final String mlApiUrl = "http://localhost:5000/api/predict";
    
    public RiskPrediction predict(RiskEvent event) {
        Map<String, Object> features = new HashMap<>();
        features.put("amount", event.getAmount());
        // ... 其他特征
        
        return restTemplate.postForObject(mlApiUrl, features, RiskPrediction.class);
    }
}
```

---

## 四、总结

### 推荐技术栈

| 组件 | 技术选型 | 版本 |
|------|----------|------|
| 规则引擎 | 自定义（当前）→LiteFlow（未来） | - |
| ML模型 | Flask REST API + LightGBM | Flask 3.x, LightGBM 4.x |
| 算法 | Rule-Based Scoring（加权评分） | - |

### 技术演进路径

```
当前状态 → LiteFlow(升级) → LiteFlow + Flask ML
  (12条规则)    (100+规则)     (需要ML检测)
```

### 决策建议

1. **保持当前方案**：自定义规则引擎已满足12条规则需求
2. **如需ML检测**：部署Flask REST API独立服务，Java通过HTTP调用
3. **如需复杂编排**：引入LiteFlow替代自定义规则引擎