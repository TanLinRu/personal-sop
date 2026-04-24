---
name: sop-database-design
description: 标准数据库设计流程 - 需求分析→ER建模→表结构设计→索引优化→范式化
version: 1.0.0
triggers:
  - "数据库设计"
  - "表结构"
  - "Schema"
  - "ER图"
  - "/sop database-design"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: sequential
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/database-{id}.json
---

# SOP Database Design - 标准数据库设计流程

## 概述

本 SOP 提供标准化的数据库设计流程，确保数据模型合理、可扩展。

## 使用场景

- 新业务系统设计
- 微服务数据建模
- 数据迁移
- 性能优化

## 流程步骤

### 步骤一：需求分析

**目标**：理解业务数据需求

**执行内容**：
1. 识别业务实体
2. 确定实体属性
3. 分析业务规则

**输出**：
```markdown
---
sop: database-design
step: 1_requirement
status: in_progress
---

## 业务实体分析

| 实体 | 核心属性 | 关系 |
|------|---------|------|
| User | id,name,phone | 1:N→Order |
| Order | id,userId,amount | N:1→User |
| RiskEvent | id,userId,type | N:1→User |
```
---

### 步骤二：ER建模

**目标**：设计实体关系图

**执行内容**：
1. 绘制ER图
2. 确定主键
3. 定义关系基数

**关系类型**：
- 1:1 一对一
- 1:N 一对多
- N:M 多对多

**输出**：
```markdown
---
sop: database-design
step: 2_er
status: in_progress
---

## ER图

┌─────────┐       ┌─────────┐
│  User   │       │  Order  │
├─────────┤  1───N ├─────────┤
│  id (PK)│───────│user_id │
│  name   │       │amount  │
│  phone  │       │status  │
└─────────┘       └─────────┘
```
---

### 步骤三：表结构设计

**目标**：生成具体表DDL

**执行内容**：
1. 定义字段
2. 选择数据类型
3. 设置约束
4. 添加审计字段

**命名规范**：
- 表名：snake_case，复数
- 字段名：snake_case
- 主键：id 或 {table}_id
- 外键：{table}_id

**输出**：
```markdown
---
sop: database-design
step: 3_schema
status: in_progress
---

## 表结构

### sys_user
| 字段 | 类型 | 约束 |
|-------|------|------|
| id | BIGINT | PK,AI |
| username | VARCHAR(50) | UNIQUE,NOT NULL |
| password | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | |
| created_at | DATETIME | DEFAULT NOW |
| updated_at | DATETIME | ON UPDATE |

### risk_event
| 字段 | 类型 | 约束 |
|-------|------|------|
| id | BIGINT | PK,AI |
| user_id | BIGINT | FK→sys_user.id |
| event_type | VARCHAR(20) | NOT NULL |
| risk_score | INT | |
| decision | VARCHAR(10) | |
```
---

### 步骤四：索引设计

**目标**：优化查询性能

**执行内容**：
1. 主键索引
2. 唯一索引
3. 普通索引
4. 复合索引

**索引原则**：
- WHERE条件字段加索引
- JOIN字段加索引
- ORDER BY字段加索引
- 避免过多索引

**输出**：
```markdown
---
sop: database-design
step: 4_index
status: in_progress
---

## 索引设计

| 表 | 索引名 | 字段 | 类型 |
|----|--------|------|------|
| sys_user | PRIMARY | id | 主键 |
| sys_user | uk_phone | phone | 唯一 |
| risk_event | idx_user_id | user_id | 普通 |
| risk_event | idx_type | event_type | 普通 |
| risk_event | idx_created | created_at | 普通 |
```
---

### 步骤五：范式化检查

**目标**：确保数据一致性

**执行内容**：
1. 1NF：原子性
2. 2NF：唯一主键
3. 3NF：无传递依赖
4. 反范式化（性能考虑）

**输出**：
```markdown
---
sop: database-design
step: 5_normalization
status: in_progress
---

## 范式检查

| 范式 | 状态 |
|--------|------|
| 1NF | ✅ 无重复组 |
| 2NF | ✅ 唯一主键 |
| 3NF | ✅ 无传递依赖 |
| 反范式化 | risk_score冗余存储优化查询 |
```
---

### 步骤六：DDL生成

**目标**：生成可执行脚本

**输出**：
```markdown
---
sop: database-design
step: 6_ddl
status: completed
---

## DDL脚本

```sql
CREATE TABLE `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `risk_event` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `event_type` VARCHAR(20) NOT NULL,
  `risk_score` INT DEFAULT NULL,
  `decision` VARCHAR(10) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
```