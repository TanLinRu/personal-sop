---
name: sop-backend-iteration
description: 后端需求迭代流程 - 需求→调研→PRD→架构→审核→依赖查询→实现（含多Agent并行+Graphify）
version: 2.2.0
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

  - name: 依赖影响分析
    description: 分析新模块对已有业务的影响
    agent: sop-library-research
    depends_on: [架构审核]
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
---

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

> 状态管理通过 `.claude/scripts/sop-state-*.ts` 脚本执行，详见 [sop-framework](../skills/sop-framework/SKILL.md)

**执行内容**：
- 功能名称
- 接口需求（RESTful）
- 数据模型要求（Entity/DTO）
- 事务边界需求

### DoD 检查点 ⭐

> 在开始开发前，确认以下完成标准（参考 sop-prd Step 3 DoD）：

| 检查项 | 确认状态 | 说明 |
|--------|----------|------|
| 代码已提交并通过 Code Review | ⬜ | |
| 单元测试覆盖率 ≥ 80% | ⬜ | |
| 集成测试通过 | ⬜ | |
| API 文档已更新 | ⬜ | |
| 无 CRITICAL/HIGH 级别 Bug | ⬜ | |
| 验收标准全部通过 | ⬜ | 来自 PRD |

> **提示**：如果 DoD 检查点未满足，应在 Step 5 (架构审核) 之前完成补齐

**持久化**（自动）：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts backend-iteration 1_confirm in_progress
```

**输出**：
```markdown
---
sop: backend-iteration
step: 1_confirm
status: in_progress
---

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

---

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

---
sop: backend-iteration
step: 2_research
status: in_progress
---

## 调研结果

### API设计参考
-

### 技术选型
-
```

---

## Step 3: 生成/引用 PRD [AUTO]

**执行内容**：
- 引用 sop-scaffold 生成的 PRD
- 或生成简化的功能 PRD

**输出**：
```markdown
---
sop: backend-iteration
step: 3_prd
status: in_progress
---

## PRD引用

### 引用来源
-
```

---

## Step 4: 架构设计 [AUTO]

**执行内容**：
- API结构设计（RESTful规范）
- 数据模型设计（Entity/DTO）
- 事务边界设计

**输出**：
```markdown
---
sop: backend-iteration
step: 4_arch
status: in_progress
---

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

---

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

---

## Step 6: 依赖查询 [AUTO]

> 使用 Graphify 查询（替代 Glob/Grep）

### 6.1 检查图谱

检查图谱是否存在：

```bash
Test-Path ".sop/dependency-graph/graph.json"
```

### 6.2 图谱更新确认

> 增量更新已有依赖图

```javascript
AskUserQuestion({
  question: "是否需要更新依赖图谱？",
  header: "图谱确认",
  options: [
    { label: "更新图谱", description: "增量更新 Graphify 依赖图" },
    { label: "跳过", description: "跳过本次更新" }
  ],
  multiSelect: false
})
```

### 6.3 Graphify 查询

```bash
# ===== 后端图谱（强制分开）=====
graphify update ./backend --out .sop/dependency-graph/{project}/backend
```

---

## Step 6.4: 依赖影响分析 [AUTO]

> **目标**：分析新模块对已有业务的影响，提前识别风险

### 6.4.1 查询直接依赖

**执行内容**：查询哪些模块直接依赖新模块

**命令**：
```bash
graphify query "哪些模块依赖 {新模块}?" --graph .sop/dependency-graph/graph.json
```

### 6.4.2 风险评估

**执行内容**：分析依赖类型，评估风险等级

| 依赖类型 | 模式 | 风险等级 | 处理方式 |
|----------|------|----------|----------|
| Service注入 | `private final XxxMapper xxxMapper` | 🔴 高 | 需同步测试 |
| Service调用 | `xxxService.xxxMethod()` | 🔴 高 | 需同步测试 |
| DTO引用 | `private XxxDTO dto` | 🟡 中 | 需接口兼容 |
| 无引用 | - | 🟢 低 | 可独立迭代 |

### 6.4.3 风险报告输出

**输出格式**：
```markdown
---
sop: backend-iteration
step: 6_4_impact
status: in_progress
---

## 依赖影响分析

### 直接依赖模块
| 模块 | 引用方式 | 风险等级 | 建议 |
|------|----------|----------|------|
| {依赖模块} | {引用方式} | {风险} | {建议} |

### 影响范围
- {影响1}
- {影响2}

### 建议
- {建议1}
- {建议2}
```

### 6.4.4 用户确认

```javascript
AskUserQuestion({
  question: "检测到业务依赖，是否继续？",
  header: "风险确认",
  options: [
    { label: "继续开发", description: "确认风险，继续实现" },
    { label: "先修复依赖", description: "先处理依赖模块" }
  ],
  multiSelect: false
})
```

### 6.5 边界场景分析 [AUTO]

> 分析特殊依赖场景，提前识别风险

#### 6.5.1 循环依赖检测

**场景**：A → B → A

**命令**：
```bash
graphify query "A 和 B 的循环依赖?" --graph .sop/dependency-graph/graph.json
```

**风险等级**：🔴 极高

#### 6.5.2 传递依赖检测

**场景**：A → B → C（修改 A 影响 C）

**命令**：
```bash
graphify query "A 的完整依赖链?" --graph .sop/dependency-graph/graph.json
```

**风险等级**：🔴 高

#### 6.5.3 共用依赖检测

**场景**：多个模块引用同一个 Service/Mapper

**命令**：
```bash
# 搜索引用同一 Mapper 的 Service
grep -r "CustomerMapper" --include="*Service.java"
```

**风险等级**：🟡 中

#### 6.5.4 边界场景报告

```markdown
## 边界场景分析

### 循环依赖
- 检测结果: 无 / 有
- 影响: 可能导致StackOverflow

### 传递依赖
- 层级: N 层
- 影响范围: 模块数量

### 共用依赖
- 被引用次数: N
- 影响模块: [模块列表]
```

---

## Step 7: 后端实现 [AUTO]

> **关键**：后端代码生成和代码审查可以并行执行

**并行执行方式**：
```python
# 使用 skill 工具加载 dr-jskill 生成代码
skill(name="dr-jskill")

# 生成后端代码
node scripts/create-project-latest.mjs {module-name} com.{company} {module-name} com.{company}.{module} 21 web

# 使用 java-reviewer agent 进行代码审查
Agent(
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

**关键规范（.claude/rules/common/）**：
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

---

## Step 8: 启动验证 [AUTO]

> **关键**：使用 TypeScript 脚本启动 + 父 Agent 10秒后检查

**验证命令**：
```bash
# 后端启动（不阻塞）
node .claude/scripts/start-backend.js {project-dir}/backend 8080

# 等待 10 秒
sleep(10)

# 健康检查
curl http://localhost:8080/actuator/health

# API 验证
curl http://localhost:8080/api/v1/{resource}
```

**验证输出**：
```markdown
---
sop: backend-iteration
step: 8_verify
status: in_progress
---

## 后端启动验证

### 编译验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 编译成功 | mvn clean compile | ✅/❌ |

### 启动验证
| 检查项 | 命令 | 状态 |
|--------|------|------|
| 启动成功 | start-backend.ts | ✅/❌ |
| 健康检查 | /actuator/health | ✅/❌ |

### API验证
| 端点 | 方法 | 状态 |
|------|------|------|
| /v1/{resource} | GET | ✅/❌ |

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

---

## Step 9: 知识更新 [AUTO]

**执行内容**：
- 增量更新实体/API依赖图
- 更新状态文件

**状态文件**：
```json
{
  "sop": "backend-iteration",
  "task_id": "backend-{id}",
  "step": "9_complete",
  "entities": ["Entity1", "Entity2"],
  "apis": ["/api/v1/xxx"]
}
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 编译失败 | 检查 pom.xml 依赖 |
| 测试失败 | 单独运行：`mvn test -Dtest=ClassName` |
| 接口冲突 | 检查已有 API，执行 Step 6 依赖查询 |

---

## 触发命令

```
/sop backend
```
或描述：
- "后端添加用户管理功能"
- "帮我实现订单接口"
---