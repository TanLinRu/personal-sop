# Personal SOP - AI 驱动的工作流控制系统

## 核心理念

SOP Workflow System - 基于 OpenCode 的工作流系统，底层引用 ECC（Everything Claude Code）能力池。

### 三层架构

```
┌─────────────────────────────────────────────┐
│  Harness 层：SOP Workflows（业务流程规约） │  ← 控制 AI 按预期执行
├─────────────────────────────────────────────┤
│  规范层：Skill/Spec（基础能力组合）        │
├─────────────────────────────────────────────┤
│  工具层：OpenCode/Claude（执行器/设计器）  │
└─────────────────────────────────────────────┘
```

### Harness 理论核心

> **SOP = AI Agent 的 Harness（控制机制）**

| 要素 | 说明 |
|------|------|
| **规约（Spec）** | 明确输入输出、业务边界 |
| **流程（Flow）** | 标准化执行步骤 |
| **约束（Guardrails）** | 防止 AI 偏离预期 |
| **验证（Verify）** | 确保执行结果符合预期 |

---

## 一、核心亮点

### 1. Graph 代码依赖风险判断（Graphify）

使用 Graphify 在业务迭代前进行风险评估：

| 场景 | 命令 | 用途 |
|------|------|------|
| API冲突检测 | `graphify query "搜索所有 REST API 端点"` | 新增接口前检查路径冲突 |
| 实体依赖分析 | `graphify query "哪些类依赖 StaffService?"` | 修改实体前评估影响范围 |
| 循环依赖检测 | `graphify query "A 和 B 的循环依赖?"` | 避免模块间循环引用 |
| 传递依赖链 | `graphify query "A 的完整依赖链?"` | 分析多层依赖关系 |

**SOP 集成**：
- `sop-scaffold`：项目生成后自动构建依赖图
- `sop-backend-iteration`：后端迭代前依赖查询
- `sop-dependency-analysis`：专用依赖分析 SOP

### 2. Task State 状态管理设计

每个 SOP 执行时自动保存状态到 `.sop/state/`：

```json
{
  "task_id": "prd-001",
  "sop": "prd",
  "status": "in_progress",
  "current_step": 2,
  "steps": {
    "1_confirm": { "status": "completed", "timestamp": "2026-04-26T10:00:00Z" },
    "2_research": { "status": "in_progress", "timestamp": "2026-04-26T10:05:00Z" }
  },
  "answers": {
    "1_confirm": { "project_name": "delivery-system", "type": "logistics" }
  }
}
```

**优势**：
- 会话恢复：下次执行自动从断点继续
- 答案复用：用户确认过的配置无需重复输入
- 审计追踪：每个步骤的执行时间可追溯

### 3. 多 Agent 并行执行

`sop-code-review` 示例：

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ code-reviewer│  │security-scan│  │ java-review │
│ (格式检查)  │  │(安全扫描)  │  │(性能分析)  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       └────────────────┼────────────────┘
                        ↓
               聚合结果 → 统一反馈
```

---

## 二、依赖体系

| 能力 | 来源 | 用途 |
|------|------|------|
| **dr-jskill** | jdubois/dr-jskill | Spring Boot 项目生成，JDTLS 导航，Docker 支持 |
| **everything-claude-code** | affaan-m/everything-claude-code | 多 Agent 能力（code-reviewer, java-reviewer, security-reviewer, search-first） |
| **Graphify** | graphifyy | 代码依赖图谱分析 |

### 技能安装

```bash
# dr-jskill（Java 项目生成）
git clone https://github.com/jdubois/dr-jskill.git ~/.claude/skills/dr-jskill

# everything-claude-code（ECC Agent 能力）
git clone https://github.com/affaan-m/everything-claude-code.git ~/.claude/plugins/ecc
```

---

## 三、SOP 技能体系

### 核心 SOP（Harness 控制）

| SOP | 用途 | 命令 |
|-----|------|------|
| sop-prd | PRD 生成（规约流程） | `/sop prd` |
| sop-scaffold | 脚手架生成（前后端分离） | `/sop scaffold` |
| sop-backend | 后端迭代 | `/sop backend` |
| sop-frontend | 前端迭代 | `/sop frontend` |
| sop-fullstack | 全栈迭代 | `/sop fullstack` |
| sop-testing | 测试执行 | `/sop testing` |
| sop-code-review | 代码审查（三 Agent 并行） | `/sop code-review` |
| sop-bug-fix | Bug 修复 | `/sop bug-fix` |
| sop-deployment | 部署发布 | `/sop deployment` |
| sop-dependency-analysis | 依赖分析 | `/sop dependency-analysis` |

### 效率 SOP

| SOP | 用途 | 命令 |
|-----|------|------|
| sop-onboarding | 项目入职 | `/sop onboarding` |
| sop-knowledge | 领域知识 | `/sop knowledge` |
| sop-library-research | 技术调研 | `/sop library-research` |

---

## 四、代码规范

### Java 规范（基于 dr-jskill + ECC）

| 领域 | 规范 |
|------|------|
| **事务** | `@Transactional(readOnly = true)` 查询 / `@Transactional(rollbackFor = Exception.class)` 写操作 |
| **异常** | 自定义异常 + `@RestControllerAdvice` (RFC 7807) + 禁止空 catch 块 |
| **Entity** | 手动重写 equals/hashCode，基于业务 ID |
| **DTO** | `@Data` + `@Builder` |
| **SQL** | MyBatis-Plus 参数化查询，禁止字符串拼接 |
| **安全** | 密码 BCrypt 加密，JWT 校验，CSRF 保护 |
| **日志** | 参数化日志 `log.info("user {}", username)`，禁止记录敏感信息 |

#### 事务配置示例

```java
// 查询方法（性能优化）
@Transactional(readOnly = true)
public List<Warehouse> findAll() {
    return this.list();
}

// 写方法（原子事务）
@Transactional(rollbackFor = Exception.class)
public Warehouse createWarehouse(WarehouseDTO dto) {
    return this.save(dto);
}
```

### 前端规范

| 领域 | 规范 |
|------|------|
| 框架 | Vue 3 + Naive UI |
| 风格 | Composition API + `<script setup>` |
| 状态 | Pinia |

---

## 五、未来强化方向

### 1. Token 优化

- **动态上下文压缩**：根据当前 SOP 进度选择性加载 skill 文档
- **Skill 分层**：核心 skill（必须加载）vs 扩展 skill（按需加载）
- **增量技能加载**：只加载当前步骤需要的 skill，而非全部
- **参考文档外置**：将大型参考文档移至外部，按需读取

### 2. Java 编码规范强化

| 方向 | 内容 |
|------|------|
| **代码范式** | 统一 Entity/DTO/VO 命名，Lombok 使用规范，equals/hashCode 强制规范 |
| **事务细化** | 事务传播行为，嵌套事务，readonly 与性能优化 |
| **SQL 安全** | 参数化查询强制检查，N+1 检测，JOIN FETCH 规范 |
| **安全基线** | OWASP Top 10 防护，敏感数据加密，API 鉴权 |
| **异常体系** | 统一异常码，异常分类（业务/系统），日志规范 |

### 3. UI 优化

- **样式模板库**：沉淀高质量 Vue 组件模板（列表、表单、详情、图表）
- **行业 UI 规范**：封装 Naive UI / Element Plus 最佳实践
- **配色方案**：预定义行业配色（企业后台、物流、医疗、电商）
- **组件规范**：统一按钮、表单、表格、弹窗的样式模板

### 4. 上下文控制强化

- **本地知识库**：Memory 长期记忆系统
- **上下文压缩**：动态选择加载内容
- **多 Agent 协作**：跨流程状态交互

---

## 六、快速开始

```bash
# 生成项目脚手架（受控流程）
/sop scaffold

# 需求迭代（规约控制）
/sop fullstack

# 代码审查（三 Agent 并行）
/sop code-review

# 依赖分析（Graphify）
/sop dependency-analysis
```

---

## 七、SOP 执行状态

| 状态 | 说明 |
|------|------|
| `[CONFIRM_REQUIRED]` | 需用户确认，阻塞执行 |
| `[AUTO]` | 自动执行，无需确认 |
| `[OPTIONAL]` | 可选步骤，用户决定 |

---

## 八、目录结构

```
.claude/
├── skills/                           # SOP Skills（Harness 控制层）
│   ├── SOP.md                       # Skill 规范
│   ├── sop-prd/                    # PRD 生成
│   ├── sop-scaffold/               # 脚手架生成
│   ├── sop-backend-iteration/      # 后端迭代
│   ├── sop-frontend-iteration/     # 前端迭代
│   ├── sop-fullstack-iteration/   # 全栈迭代
│   ├── sop-testing/               # 测试执行
│   ├── sop-code-review/           # 代码审查
│   ├── sop-bug-fix/               # Bug 修复
│   ├── sop-deployment/            # 部署发布
│   ├── sop-dependency-analysis/    # 依赖分析
│   ├── sop-onboarding/            # 项目入职
│   ├── sop-knowledge/             # 领域知识
│   ├── sop-library-research/      # 技术调研
│   ├── dr-jskill/                # Java 项目工具
│   └── frontend-design/           # 前端设计工具
├── rules/                          # 编码规范
│   └── common/
│       ├── coding-style.md        # Java/Spring 规范
│       └── testing.md             # 测试规范
└── scripts/                       # 验证脚本
```

---

## 九、参考文档

- dr-jskill: `.claude/skills/dr-jskill/references/`
- ECC Agents: `everything-claude-code-main/agents/`
- ECC Commands: `everything-claude-code-main/commands/`
