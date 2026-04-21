---
name: sop-knowledge
description: 技术框架学习SOP - 快速掌握框架正确用法，避免常见错误，沉淀技术知识
version: 1.0.0
triggers:
  - "学习框架"
  - "技术入门"
  - "框架调研"
  - "快速开始"
  - "/sop knowledge"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
---

# SOP Knowledge - 技术框架学习SOP

## 概述

本 SOP 提供标准化的技术框架学习流程，帮助快速掌握框架的正确用法，避免常见错误。学习结果沉淀为文档，供团队复用。

## 使用场景

- 学习新的框架/库（LiteFlow、Drools、Spring Cloud等）
- 快速掌握框架的Hello World用法
- 避免框架使用中的常见错误
- 沉淀技术知识，形成团队资产

## 流程步骤

### 步骤一：确认学习目标（Clarify）⭐ [CONFIRM_REQUIRED]

**目标**：明确要学习的框架和学习深度

**执行内容**：
1. 确认框架名称和版本
2. 明确学习目标（快速入门 / 深入理解 / 生产使用）
3. 确认学习资源来源

**输出**：
```markdown
---
sop: knowledge
step: 1_clarify
status: in_progress
---

## 学习目标

### 框架信息
- **框架名称**:
- **版本**:
- **官网**:

### 学习目标
- [ ] 快速入门（Hello World）
- [ ] 核心概念理解
- [ ] 生产环境使用
- [ ] 深度定制开发
```

---

### 步骤二：查找官方文档（Search） [AUTO]

**目标**：获取权威的官方文档和示例

**执行内容**：
1. **优先检查 common-mistakes 知识库**
2. 访问官方网站获取文档
3. 查找Hello World示例
4. 确认最新稳定版本

**知识库检查命令**：
```bash
# 检查是否有该框架的常见错误记录
ls .sop/output/common-mistakes/
cat .sop/output/common-mistakes/[框架名]_CommonMistakes.md
```

**输出**：
```markdown
---
sop: knowledge
step: 2_search
status: in_progress
---

## 知识库检查

### 常见错误记录
- [ ] 存在：`.sop/output/common-mistakes/[框架名]_CommonMistakes.md`
- [ ] 不存在，需要新建

### 官方文档

### 资源链接
| 资源 | 链接 | 说明 |
|------|------|------|
| 官方文档 |  | |
| Hello World |  |  |
| API Reference |  |  |

### 版本信息
- 最新稳定版本:
- 发布日期:
- 兼容性:
```

---

### 步骤三：最小示例验证（Verify）

**目标**：运行最小示例，确认环境可用

**执行内容**：
1. 创建最小项目
2. 复制官方Hello World示例
3. 运行验证

**输出**：
```markdown
---
sop: knowledge
step: 3_verify
status: in_progress
---

## 最小示例验证

### 环境信息
- JDK版本:
- 构建工具:
- 操作系统:

### 示例代码
```java
// 最小示例代码
```

### 验证结果
| 步骤 | 状态 |
|------|------|
| 项目创建 | ✅/❌ |
| 依赖添加 | ✅/❌ |
| 编译 | ✅/❌ |
| 运行 | ✅/❌ |
```

---

### 步骤四：核心API学习（Learn）

**目标**：掌握框架的核心API和使用方式

**执行内容**：
1. 学习核心类和方法
2. 验证API调用方式
3. 记录关键发现

**输出**：
```markdown
---
sop: knowledge
step: 4_learn
status: in_progress
---

## 核心API

### 关键类/方法
| 类/方法 | 用途 | 示例 |
|--------|------|------|
| 核心类1 | 功能描述 | 代码示例 |
| 核心方法 | 功能描述 | 代码示例 |

### 重要概念
- 概念1: 说明
- 概念2: 说明
```

---

### 步骤五：常见错误总结（Common Mistakes）⭐重点步骤

**目标**：总结常见错误，避免踩坑（关键步骤！）

**执行内容**：
1. 搜索官方issues/GitHub问题
2. 分析常见错误模式
3. 记录正确用法
4. **产出到 common-mistakes 知识库**

**错误沉淀机制**：
- 所有错误必须记录到 `.sop/output/common-mistakes/[框架名]_CommonMistakes.md`
- 后续学习同一框架时自动检查并提示
- 格式：❌ 错误代码 + ✅ 正确代码 + 错误原因

**输出**：
```markdown
---
sop: knowledge
step: 5_common_mistakes
status: in_progress
---

## 常见错误

### ❌ 错误理解
```
// 错误的代码示例
```

### ✅ 正确理解
```
// 正确的代码示例
```

### 错误原因分析
1. 错误原因1
2. 错误原因2

### 关键区别
| 错误用法 | 正确用法 |
|----------|----------|
| this.getParam() | 直接在process()中写业务逻辑 |
| this.getData() | 通过FlowExecutor传入上下文 |
| 直接获取参数 | 参数由调用方通过上下文传入 |

### 错误沉淀状态
- [ ] 已记录到 common-mistakes 知识库
- [ ] 错误代码已验证
- [ ] 正确用法已验证
```

---

### 步骤六：实战示例（Example）

**目标**：创建实战示例，加深理解

**执行内容**：
1. 创建贴近业务的示例
2. 验证完整流程
3. 记录关键代码

**输出**：
```markdown
---
sop: knowledge
step: 6_example
status: in_progress
---

## 实战示例

### 场景描述
业务场景说明

### 完整代码
```java
// 完整示例代码
```

### 执行流程
1. 步骤1
2. 步骤2
3. 步骤3
```

---

### 步骤七：文档沉淀（Document）⭐ [CONFIRM_REQUIRED]

**目标**：生成可复用的技术文档

**执行内容**：
1. 整理学习笔记
2. 生成快速入门指南
3. **产出到 common-mistakes 知识库（必须）**
4. 更新AGENTS.md

**输出位置**：
| 文档类型 | 输出路径 |
|----------|----------|
| 快速入门 | `.sop/output/[框架名]_QuickStart.md` |
| **常见错误（必须）** | `.sop/output/common-mistakes/[框架名]_CommonMistakes.md` |
| API速查 | `.sop/output/[框架名]_APICheatSheet.md` |

**输出**：
```markdown
---
sop: knowledge
step: 7_document
status: completed
---

## 学习成果

### 文档列表
- 快速入门指南: `.sop/output/[框架名]_QuickStart.md`
- 常见错误总结: `.sop/output/common-mistakes/[框架名]_CommonMistakes.md`
- API速查: `.sop/output/[框架名]_APICheatSheet.md`

### 关键发现
1. 发现1
2. 发现2

### 后续行动
- [ ] 分享给团队
- [ ] 实际项目中使用
- [ ] 深入学习
- [ ] common-mistakes 已更新
```

---

## 框架特定指南

### LiteFlow 快速要点

**正确理解**：
- 组件继承`NodeComponent`，只写`process()`方法
- 不要尝试在组件内获取参数（没有getParam/getData）
- 通过`FlowExecutor`执行链，参数通过上下文传递
- 配置文件位置：`resources/config/flow.xml`
- 使用`DefaultContext`传递数据

**最小示例**：
```java
@LiteflowComponent("a")
public class ACmp extends NodeComponent {
    @Override
    public void process() {
        DefaultContext ctx = this.getContextBean(DefaultContext.class);
        String input = (String) ctx.getData("input");
        ctx.setData("output", input.toUpperCase());
    }
}
```

**配置文件**：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<flow>
    <chain name="chain1">
        THEN(a, b, c);
    </chain>
</flow>
```

**执行方式**：
```java
@Resource
private FlowExecutor flowExecutor;

public void test() {
    DefaultContext context = new DefaultContext();
    context.setData("input", "hello");
    flowExecutor.execute2Resp("chain1", context, DefaultContext.class);
    String result = (String) context.getData("output");
}
```

---

### Drools 快速要点

**核心概念**：
- KieServices: 规则引擎入口
- KieContainer: 加载规则包
- KieSession: 执行规则会话
- KIE module (.kjars): 规则文件打包

**Maven依赖**：
```xml
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-core</artifactId>
    <version>8.40.0.Final</version>
</dependency>
<dependency>
    <groupId>org.drools</groupId>
    <artifactId>drools-compiler</artifactId>
    <version>8.40.0.Final</version>
</dependency>
```

**最小示例**：
```java
KieServices ks = KieServices.Factory.get();
KieContainer kc = ks.getKieClasspathContainer();
KieSession ksession = kc.newKieSession("ksession-rules");
ksession.insert(new Fact());
ksession.fireAllRules();
```

**规则文件(.drl)**：
```drools
rule " Hello World "
    when
        $f: Fact(value > 10)
    then
        System.out.println("Fact value: " + $f.getValue());
end
```

**注意**：
- 需要JDK 17+
- 规则文件放在`src/main/resources/rules/`
- 需要在`kmodule.xml`中注册规则包

---

### Flask ML API 快速要点

**场景**：独立ML模型服务（推荐与主业务分离部署）

**最小示例**：
```python
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load('model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = data['features']
    prediction = model.predict([features])
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**启动**：
```bash
pip install flask scikit-learn joblib
flask run --port 5000
```

**调用**：
```bash
curl -X POST http://localhost:5000/predict \
     -H "Content-Type: application/json" \
     -d '{"features": [1.0, 2.0, 3.0]}'
```

**优点**：
- 独立部署，不影响主业务
- 支持模型热更新
- 可用Python生态（scikit-learn, TensorFlow, PyTorch）

---

## 常见框架学习清单

| 框架 | 快速入门文档 | 常见错误 | 适用场景 |
|------|-------------|----------|----------|
| LiteFlow | LiteFlow_QuickStart.md | 组件内获取参数 | 轻量级规则引擎 |
| Drools | - | DRL语法 | 复杂企业规则 |
| Flask ML | - | - | Python模型服务 |
| MyBatis-Plus | AGENTS.md | 版本冲突 | ORM持久层 |
| Knife4j | AGENTS.md | namespace | API文档 |

---

## 输出位置

所有学习成果输出到：
- `.sop/output/` - 学习文档
- `.claude/skills/sop-knowledge/` - SOP Skill
- `AGENTS.md` - 更新项目配置