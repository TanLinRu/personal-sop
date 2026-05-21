# 参数定义格式参考

## JSON Schema

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["key", "label", "type"],
    "properties": {
      "key": {
        "type": "string",
        "description": "参数唯一标识，Agent 用于存储结果"
      },
      "label": {
        "type": "string",
        "description": "展示给用户的名称"
      },
      "prompt": {
        "type": "string",
        "description": "弹窗时显示的问题文本"
      },
      "type": {
        "type": "string",
        "enum": ["text", "select", "confirm", "multi_select"],
        "description": "参数类型"
      },
      "options": {
        "type": "array",
        "items": { "type": "string" },
        "description": "select/multi_select 的可选项列表"
      },
      "default": {
        "type": ["string", "boolean", "number", "null"],
        "description": "默认值"
      }
    }
  }
}
```

## 参数类型详解

### text — 自由文本

用户可自由输入任意文本。

```json
{
  "key": "project_name",
  "label": "项目名称",
  "prompt": "请输入项目名称",
  "type": "text",
  "default": "my-app"
}
```

**question 映射**：
```json
{
  "header": "project_name",
  "question": "请输入项目名称（默认: my-app）"
}
```

### select — 单选

用户从预定义选项中选择，也可自定义输入。

```json
{
  "key": "db_type",
  "label": "数据库类型",
  "prompt": "请选择数据库类型",
  "type": "select",
  "options": ["MySQL", "PostgreSQL", "H2"],
  "default": "MySQL"
}
```

**question 映射**：
```json
{
  "header": "db_type",
  "question": "请选择数据库类型",
  "options": ["MySQL", "PostgreSQL", "H2"]
}
```

### confirm — 确认

二选一确认。

```json
{
  "key": "enable_cache",
  "label": "启用缓存",
  "prompt": "是否启用 Redis 缓存",
  "type": "confirm",
  "default": true
}
```

**question 映射**：
```json
{
  "header": "enable_cache",
  "question": "是否启用 Redis 缓存",
  "options": ["是", "否"]
}
```

### multi_select — 多选

用户可勾选多个选项。

```json
{
  "key": "modules",
  "label": "选择模块",
  "prompt": "请选择需要生成的模块（可多选）",
  "type": "multi_select",
  "options": ["用户管理", "订单管理", "支付模块", "消息通知"],
  "default": ["用户管理", "订单管理"]
}
```

**question 映射**：
```json
{
  "header": "modules",
  "question": "请选择需要生成的模块（可多选）",
  "options": ["用户管理", "订单管理", "支付模块", "消息通知"],
  "multiple": true
}
```

## 完整示例

### 项目脚手架参数

```json
[
  {
    "key": "project_name",
    "label": "项目名称",
    "prompt": "请输入项目名称",
    "type": "text",
    "default": "my-app"
  },
  {
    "key": "tech_stack",
    "label": "技术栈",
    "prompt": "请选择后端技术栈",
    "type": "select",
    "options": ["Spring Boot + Vue 3", "Spring Boot + React", "Spring Boot + Angular"],
    "default": "Spring Boot + Vue 3"
  },
  {
    "key": "db_type",
    "label": "数据库",
    "prompt": "请选择数据库类型",
    "type": "select",
    "options": ["MySQL", "PostgreSQL", "H2"],
    "default": "MySQL"
  },
  {
    "key": "enable_swagger",
    "label": "启用 API 文档",
    "prompt": "是否自动生成 API 文档（Knife4j）",
    "type": "confirm",
    "default": true
  }
]
```

### Spring Boot 配置参数

```json
[
  {
    "key": "server_port",
    "label": "服务端口",
    "prompt": "请输入应用启动端口",
    "type": "text",
    "default": "8080"
  },
  {
    "key": "db_url",
    "label": "数据库连接",
    "prompt": "请输入数据库 JDBC URL",
    "type": "text",
    "default": "jdbc:mysql://localhost:3306/mydb"
  },
  {
    "key": "cache_type",
    "label": "缓存方案",
    "prompt": "请选择缓存实现",
    "type": "select",
    "options": ["none", "caffeine", "redis"],
    "default": "caffeine"
  },
  {
    "key": "need_auth",
    "label": "启用认证",
    "prompt": "是否需要集成 Spring Security",
    "type": "confirm",
    "default": false
  }
]
```

### API 部署配置

```json
[
  {
    "key": "deploy_env",
    "label": "部署环境",
    "prompt": "请选择部署环境",
    "type": "select",
    "options": ["dev", "test", "staging", "prod"],
    "default": "staging"
  },
  {
    "key": "app_version",
    "label": "版本号",
    "prompt": "请输入部署版本号",
    "type": "text",
    "default": "v1.0.0"
  },
  {
    "key": "replicas",
    "label": "实例数",
    "prompt": "请输入部署实例数量",
    "type": "text",
    "default": "2"
  },
  {
    "key": "auto_rollback",
    "label": "自动回滚",
    "prompt": "部署失败时是否自动回滚",
    "type": "confirm",
    "default": true
  },
  {
    "key": "notify_channels",
    "label": "通知渠道",
    "prompt": "请选择部署通知渠道（可多选）",
    "type": "multi_select",
    "options": ["钉钉", "企业微信", "邮件", "Slack"],
    "default": ["钉钉", "邮件"]
  }
]
```
