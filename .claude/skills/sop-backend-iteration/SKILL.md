---
​---
name: sop-backend-iteration
description: 后端需求迭代流程 - 需求→调研→PRD→架构→审核→依赖查询→实现（含多Agent并行+context-mode）
version: 2.1.0
triggers:
  - "后端迭代"
  - "后端需求"
  - "后端功能"
  - "/sop backend"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow
execution:
  mode: parallel
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/backend-{id}.json

parallel_tasks:
  - name: API设计调研
    description: API设计与数据模型调研
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 技术选型调研
    description: 框架与中间件选型调研
    agent: sop-library-research
    depends_on: []
    execution_mode: parallel

  - name: 后端代码生成
    description: 后端代码生成
    agent: dr-jskill
    depends_on: [架构审核]
    execution_mode: parallel

  - name: 后端代码审查
    description: 后端代码审查
    agent: java-reviewer
    depends_on: [后端代码生成]
    execution_mode: parallel

aggregation:
  strategy: merge
  output_format: markdown
​---

# SOP Backend Iteration v2.1 - 后端需求迭代流程

## 前后端分离规范

> **强制要求**：后端代码必须放在 `{project}/backend/` 目录

### 目录结构要求

```
{project}/
├── backend/              # ✅ 后端代码放在这里
│   ├── src/
│   │   ├── main/java/
│   │   ├── main/resources/
│   │   └── test/
│   ├── pom.xml
│   └── target/
└── frontend/             # 前端代码（不在本SOP范围内）
```

### 生成路径规范

| 场景 | 生成路径 | 示例 |
|------|----------|------|
| 新项目后端 | `{project}/backend/` | `hotel-system/backend/` |
| 模块追加 | `{project}/backend/src/main/java/` | `hotel-system/backend/src/main/java/` |

### 禁止事项

- ❌ 不要在 `{project}/src/` 生成后端代码
- ❌ 不要在 `{project}/frontend/` 生成后端代码
- ❌ 后端 pom.xml 不要放在根目录

## 流程

```
需求确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 后端实现 → 验证 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

**执行内容**：
- 功能名称
- 接口需求（RESTful）
- 数据模型要求（Entity/DTO）
- 事务边界需求

**输出**：
```markdown
​---
sop: backend-iteration
step: 1_confirm
status: in_progress
​---

## 需求确认

### 功能名称
-

### 接口需求
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/xxx | 获取列表 |
| POST | /api/v1/xxx | 创建 |

### 数据模型
| 实体 | 字段 | 类型 |
|------|------|------|
|      |      |      |
```

​---

## Step 2: 需求/技术调研 [AUTO]

> **重要**：后端迭代必须先了解业务需求，不能跳过

**执行内容**：
- API设计调研：了解同模块最佳实践
- 技术选型调研：确认技术栈兼容性
- 安全合规调研：确认安全要求

**执行方式**：
使用 skill 工具加载 sop-library-research 进行调研

```bash
# 加载技术调研 skill
skill(name="sop-library-research")
```

​---
sop: backend-iteration
step: 2_research
status: in_progress
​---

## 调研结果

### API设计参考
-

### 技术选型
-
```

​---

## Step 3: 生成/引用 PRD [AUTO]

**执行内容**：
- 引用 sop-scaffold 生成的 PRD
- 或生成简化的功能 PRD

**输出**：
```markdown
​---
sop: backend-iteration
step: 3_prd
status: in_progress
​---

## PRD引用

### 引用来源
-
```

​---

## Step 4: 架构设计 [AUTO]

**执行内容**：
- API结构设计（RESTful规范）
- 数据模型设计（Entity/DTO）
- 事务边界设计

**输出**：
```markdown
​---
sop: backend-iteration
step: 4_arch
status: in_progress
​---

## 架构设计

### API设计
| 接口 | 方法 | 路径 |
|------|------|------|
|      |      |      |

### 数据模型
| 实体 | 表名 | 主要字段 |
|------|------|----------|
|      |      |          |

### 事务设计
-
```

​---

## Step 5: 架构审核 [CONFIRM_REQUIRED]

**执行内容**：
P0/P1/P2 检查点，用户确认后进入实现

> **关键**：未通过审核不允许进入实现阶段

**检查清单**：
| 级别 | 检查项 | 说明 |
|------|-------|------|
| P0 | API设计符合RESTful规范 | 路径、方法正确 |
| P0 | 数据模型完整 | Entity/DTO字段齐全 |
| P1 | 事务边界清晰 | 事务范围明确 |
| P1 | 异常处理完善 | 有全局异常处理 |
| P2 | 代码规范一致 | 符合项目规范 |

​---

## Step 6: 依赖查询 [AUTO]

**执行内容**：
- 查询已有实体、API
- 避免重复定义

**命令**：
```bash
# 查询已有实体
Glob(pattern="**/entity/*.java")

# 查询已有API
grep(pattern="@(Get|Post|Put|Delete)Mapping")
```

​---

## Step 7: 后端实现 [AUTO]

> **关键**：后端代码生成和代码审查可以并行执行

**并行执行方式**：
```python
# 使用 skill 工具加载 dr-jskill 生成代码
skill(name="dr-jskill")

# 生成后端代码
node scripts/create-project-latest.mjs {module-name} com.{company} {module-name} com.{company}.{module} 21 web

# 使用 java-reviewer agent 进行代码审查
await task(
  subagent_type="java-reviewer",
  prompt="审查后端代码：检查事务管理、readOnly、异常处理"
)
```

**生成内容**：
- Entity 实体类
- DTO 数据传输对象
- Repository 数据访问层
- Service 业务层（含 @Transactional）
- Controller 接口层

**关键规范（coding-style.md）**：
```java
// 查询方法
@Transactional(readOnly = true)
public List<Warehouse> findAll() {
    return this.list();
}

// 写方法
@Transactional(rollbackFor = Exception.class)
public Warehouse createWarehouse(WarehouseDTO dto) {
    // ... save logic
}
```

​---

## Step 8: 启动验证 [AUTO]

> **关键**：使用统一验证脚本 `.claude/scripts/verify-backend.ps1`

**验证命令**：
```powershell
# 使用验证脚本（非阻塞启动 + 自动验证）
powershell -ExecutionPolicy Bypass -File .claude/scripts/verify-backend.ps1 -projectDir ".\{project-name}\backend" -waitSeconds 30
```

**验证输出**：
```markdown
​---
sop: backend-iteration
step: 8_verify
status: in_progress
​---

## 后端启动验证

### 编译验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 编译成功 | verify-backend.ps1 | ✅/❌ |

### 启动验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 启动成功 | verify-backend.ps1 | ✅/❌ |
| 健康检查 | /actuator/health | ✅/❌ |

### API验证
| 端点 | 方法 | 状态 |
|------|------|------|
| /v1/warehouses | GET | ✅/❌ |

### 验证状态
- [ ] 编译失败
- [ ] 启动失败
- [ ] API无法访问
- [ ] 全部通过
```

**错误处理**：
| 错误 | 处理方式 |
|------|----------|
| 编译失败 | 检查 pom.xml 依赖 |
| 测试失败 | 单独运行：`mvn test -Dtest=ClassName` |
| 接口冲突 | 检查已有 API，执行 Step 6 依赖查询 |
| 端口被占用 | `netstat -ano \| findstr 8080` |

​---

## Step 9: 知识更新 [AUTO]

**执行内容**：
- 增量更新实体/API依赖图
- 更新状态文件

**状态文件**：
```json
{
  "sop": "backend-iteration",
  "task_id": "backend-{id}",
  "step": 9_complete",
  "entities": ["Entity1", "Entity2"],
  "apis": ["/api/v1/xxx"]
}
```

​---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 编译失败 | 检查 pom.xml 依赖 |
| 测试失败 | 单独运行：`mvn test -Dtest=ClassName` |
| 接口冲突 | 检查已有 API，执行 Step 6 依赖查询 |

​---

## 触发命令

```
/sop backend
```
或描述：
- "后端添加用户管理功能"
- "帮我实现订单接口"
---

# SOP Backend Iteration v2.1 - 后端需求迭代流程

## 流程

```
需求确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 后端实现 → 验证 → 知识更新
```

## Step 1: 需求确认 [CONFIRM_REQUIRED]

功能名称、接口需求、数据模型要求

## Step 2: 需求/技术调研 [AUTO]

3次 sop-library-research：API设计调研、技术选型调研、安全合规调研

## Step 3: 生成 PRD [AUTO]

后端功能通常需要完整 PRD

## Step 4: 架构设计 [AUTO]

API结构设计、数据模型设计、事务边界设计

## Step 5: 架构审核 [CONFIRM_REQUIRED]

P0/P1/P2 检查点，用户确认

## Step 6: 依赖查询 [AUTO]

/ctx query 查询已有实体、API

## Step 7: 后端实现 [AUTO]

dr-jskill 生成 + java-reviewer 审查

## Step 8: 验证 [AUTO]

编译测试、接口测试

## Step 9: 知识更新 [AUTO]

/ctx index 增量更新实体/API依赖图