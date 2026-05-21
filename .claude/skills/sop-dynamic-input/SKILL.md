---
name: sop-dynamic-input
description: 动态用户参数输入 — 接口返回参数定义，Agent 弹窗交互收集，支持 text/select/confirm/multi_select
version: 1.1.0
triggers:
  - "需要你填写"
  - "请确认以下参数"
  - "参数配置"
  - "需要用户输入"
  - "[DYNAMIC_INPUT]"
  - "/sop input"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
---

# SOP Dynamic Input — 动态用户参数交互

## 概述

Agent 从外部接口（API / 文件 / 配置）获取参数定义 → 动态识别每个参数的类型和选项 → 根据当前平台使用合适的交互方式收集用户输入 → Agent 收集完整结果后继续执行。

**核心原则**：参数是动态的，Agent 事先不知道有哪些参数，根据接口返回实时弹窗。

## 平台兼容（OpenCode / Claude）

| 能力 | OpenCode | Claude CLI |
|------|----------|------------|
| `question` 工具弹窗 | ✅ 支持 | ❌ 不支持 |
| 自然语言询问 | ✅ 支持 | ✅ 支持 |
| 推荐策略 | 批量 `question` 弹窗 | 自然语言逐项/列表询问 |

### 平台自动判断

Agent 检测当前运行环境：
- 工具栏中有 `question` 工具 → **OpenCode 模式**
- 工具栏中无 `question` 工具 → **Claude 模式**，使用自然语言交互

## 工作流程

```
外部接口返回参数定义数组
    ↓
Agent 解析参数列表（key / label / type / options）
    ↓
┌─ 判断平台 ─────────────────┐
│ OpenCode: question 工具弹窗  │
│ Claude:   自然语言询问       │
└────────────────────────────┘
    ↓
用户填写所有参数
    ↓
Agent 收集所有值 → 合并为结果对象
    ↓
继续执行业务逻辑
```

## Agent 行为规范

### 步骤 1：获取参数定义

Agent 通过接口调用 / 读取文件 / 解析配置获取参数数组：

```json
[
  {
    "key": "env",
    "label": "部署环境",
    "prompt": "请选择要部署的目标环境",
    "type": "select",
    "options": ["dev", "staging", "prod"],
    "default": "dev"
  }
]
```

### 步骤 2：识别参数

Agent 通过接口调用 / 读取文件 / 解析配置获取参数数组，识别每个参数的 `type` 进行交互映射。

### 步骤 3：根据平台选择交互方式

#### OpenCode 模式 — question 工具弹窗

所有参数合并为一次 `question` 工具调用，放入 `questions` 数组：

```javascript
question({
  questions: [
    { header: "env",     question: "请选择部署环境",     options: ["dev", "staging", "prod"] },
    { header: "version", question: "请输入版本号" },
    { header: "rollback",question: "是否自动回滚",       options: ["是", "否"] },
  ]
})
```

| 参数 type | question 配置 |
|-----------|--------------|
| `text` | `{header, question}` → "输入自己的答案" |
| `select` | `{header, question, options}` → 选项列表 |
| `confirm` | `{header, question, options=["是","否"]}` |
| `multi_select` | `{header, question, options, multiple=true}` |

交互效果（一次弹窗展示所有参数）：

```
检测到 3 个参数需要您填写：
1. 部署环境？       [dev / staging / prod]
2. 版本号？         [默认: v1.2.3]
3. 是否自动回滚？   [是 / 否]
```

#### Claude 模式 — 自然语言询问

Agent 用自然语言列出所有参数，等待用户逐一或一次性回复：

```
检测到 3 个参数需要您确认：

1️⃣ **部署环境** — 请选择: dev / staging / prod（默认: staging）
2️⃣ **版本号** — 请输入要发布的版本（默认: v1.2.3）
3️⃣ **自动回滚** — 部署失败时是否自动回滚？（是/否）

请回复以上参数的值，例如: "staging / v2.0.0 / 是"
```

**Claude 交互要点**：
- 一次列出所有参数，让用户一次性回复
- 给一个格式示例降低沟通成本
- 用户回复后解析并回显确认
- 如果用户只回答了部分参数，追问剩余参数

### 步骤 4：收集并返回结果

将所有参数值合并为一个对象：

```json
{
  "env": "staging",
  "version": "v2.0.0",
  "rollback": true
}
```

## 参数定义标准格式

请参考 [PARAMETER_SCHEMA.md](./references/PARAMETER_SCHEMA.md) 查看完整的参数 Schema 定义和更多示例。

## 对话风格指引

1. **一次性询问** — 所有参数合并展示，无论 opencode（弹窗）还是 claude（消息），避免逐个询问
2. **告知数量** — 弹窗前说明 "检测到 N 个参数需要填写"
3. **回显确认** — 用户回答后统一回显所有值
4. **自然语言** — 不要念参数名，用自然语言描述："部署环境" 而非 "env"
5. **有默认值先展示** — 如有 `default`，在提示中告知
6. **Claude 模式下给格式示例** — 让用户知道如何回复，如 `"staging / v2.0.0 / 是"`

## 完整示例

### 场景：API 返回部署配置

```yaml
# 接口 /api/deploy/params 返回
params:
  - key: env
    label: 部署环境
    prompt: 请选择部署目标环境
    type: select
    options: [dev, staging, prod]
    default: staging
  - key: version
    label: 版本号
    prompt: 请输入要发布的版本号
    type: text
    default: v1.0.0
  - key: rollback
    label: 自动回滚
    prompt: 部署失败时是否自动回滚
    type: confirm
    default: true
```

### 场景：配置文件参数

```yaml
# 从 .sop/config/deploy-params.json 读取
params:
  - key: db_host
    label: 数据库地址
    prompt: 请输入数据库主机地址
    type: text
    default: localhost
  - key: db_port
    label: 数据库端口
    prompt: 请输入数据库端口号
    type: text
    default: "3306"
  - key: db_name
    label: 数据库名
    prompt: 请输入数据库名称
    type: text
  - key: db_user
    label: 数据库用户
    prompt: 请输入数据库用户名
    type: text
    default: root
```

## 触发方式

```
/sop input
```

或在对话中自然描述：
- "这个部署需要你确认几个参数"
- "有一些配置需要你填写"
- "请确认以下参数"
