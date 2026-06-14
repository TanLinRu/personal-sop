# Personal SOP - AI 驱动的工作流控制系统

> **v6.2.0 (2026-06-14)**：迁移到 [CodeGraph](https://github.com/colbymchenry/codegraph)（替换 Graphify）+ 新增 `sop-biz-graph` 业务文档图谱
>
> v6.1.0 (2026-06-14)：黄金测试集 + Trace ID 追溯 + Eval 自动化 + 权重校准（Phase D 度量与回归）
>
> v6.0.0 (2026-06-10)：sop-prd LITE 默认（7 章节，≤180 行）· DoD 硬门 · 长度预算 · 行业锚点（Lean/PDCA/DMAIC/DoD/RACI/BPMN-lite）落地

## 快速开始

```bash
# 1. Clone 仓库
git clone <repo-url> personal-sop && cd personal-sop

# 2. 运行安装脚本
bash setup.sh

# 3. 开始使用 (Claude Code)
/sop scaffold        # 生成新项目
/sop prd             # 生成 PRD（LITE 默认，≤180 行）
/sop code-review     # 代码审查
/sop bug-fix         # Bug 修复
/sop verify          # 验证上次 SOP 执行质量
/sop status          # 查看任务状态
```

### 依赖项

| 依赖 | 必需 | 说明 |
|------|------|------|
| Node.js 18+ | 是 | 状态管理 + 验证脚本 + Vitest |
| Git | 是 | 版本控制 |
| JAVA_HOME | 否 | Java/Spring Boot 项目需要 |
| **CodeGraph** | 否（强烈推荐）| AI 代码知识图谱（48k stars, MIT, MCP 原生）— 自动同步、Spring/Vue 路由识别、`codegraph affected` 测试影响集 |
| Graphify | 否（legacy）| 旧版代码依赖分析，已被 CodeGraph 替代但保留兼容性 |

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

### 行业锚点（v6.0.0 引入）

> v5.1.0 之前 SOP 是"无锚点"的工具集。v6.0.0 引入 6 个行业方法论作为设计依据。

| 锚点 | 适用 | sop-prd 应用 | 其他 SOP 应用 |
|------|------|------------|--------------|
| **Lean / Muda** | 消除浪费 | LITE 7 章节默认（FULL = opt-in）| 全 SOP 步骤精简 |
| **Kaizen** | 一键默认 | 3-way → 2-way tier 选择 | dynamic-input 默认值 |
| **DoD** | 完成门控 | sop-prd Step 4 DoR 硬门 | sop-scaffold Step 9、sop-code-review Step 3 |
| **PDCA** | 持续改进 | Plan(knowledge+prd)→Do(iteration)→Check(verify)→Act(improve) | 全 SOP 周期 |
| **DMAIC** | 流程优化 | sop-verify 5 项评分 | sop-verification 6 类反模式 |
| **RACI** | 职责清晰 | sop-prd 确认点收敛 | sop-fullstack-iteration RACI 表 |
| **BPMN-lite** | 流程纪律 | sop-prd STEPS.md 7 步骤 | 5/27 SOPs 有 STEPS.md |

---

## 一、核心亮点

### 1. Code Knowledge Graph（CodeGraph，v6.2.0 起替代 Graphify）

使用 [CodeGraph](https://github.com/colbymchenry/codegraph)（48k+ ⭐，MIT，MCP 原生）在业务迭代前做代码层风险评估：

| 场景 | 命令 | 用途 |
|------|------|------|
| API 冲突检测 | `codegraph search "@GetMapping" --json` 或 MCP `codegraph_explore "all REST routes"` | 新接口前查路径冲突 |
| 实体依赖分析 | `codegraph callers StaffService` | 修改实体前评估影响范围 |
| 影响范围 | `codegraph impact OrderEntity --depth 3` | 改 X 影响哪些代码 |
| 路径追溯 | `codegraph_explore "how does X reach Y"`（MCP）| X→Y 调用链 |
| **测试影响集** | `git diff --name-only \| codegraph affected --stdin --json` | 改了什么 → 哪些测试要跑 |

**关键优势 vs 旧 Graphify**：
- ✅ **自动同步**（FSEvents/inotify 监听），不需要 `update`
- ✅ **MCP 原生**（Claude Code/OpenCode/Cursor/Codex 一键安装）
- ✅ **测试影响集**（`codegraph affected`，sop-regression v2.0 核心）
- ✅ **20+ 语言**（Java/Vue/TS/Python/Go/Rust/...）+ 17 框架路由识别（Spring/Express/FastAPI/Vue/Nuxt/...）
- ✅ **零配置 + 100% 本地**

**SOP 集成**：
- `sop-dependency-analysis` v3.0.0：CodeGraph → Graphify → Grep 三级降级
- `sop-backend-iteration` / `sop-frontend-iteration`：迭代前依赖查询
- `sop-api-design` / `sop-database-design`：设计前冲突检测
- `sop-regression` v2.0.0：`codegraph affected` 精准回归

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

### 4. SOP 验证与反模式检测（sop-verification）

SOP 执行完成后，自动验证执行质量，检测 6 类反模式：

| 类型 | 检测内容 | 严重度 |
|------|----------|--------|
| **步骤跳过** | required 步骤未执行 | HIGH |
| **顺序颠倒** | 步骤顺序与 expected.yml 定义不一致 | MEDIUM |
| **状态不一致** | state 标记 completed 但产出文件不存在 | HIGH |
| **参数未生效** | 用户输入的参数未被步骤使用 | MEDIUM |
| **产出偏差** | expected.yml 声明的 required 产出缺失或为空 | HIGH |
| **空跑** | SOP 标记为 done 但无任何实际产出 | CRITICAL |

**验证架构（三层）**:

```
┌──────────────────────────────────────────────────┐
│   DSL 层：expected.yml（声明预期）               │
│   定义步骤/参数/产出/约束                        │
├──────────────────────────────────────────────────┤
│   引擎层：基础验证（自动执行）                   │
│   步骤合规 → 产出完整性 → 状态一致 → 参数一致    │
├──────────────────────────────────────────────────┤
│   Agent 层：多 Agent 深度审查                    │
│   flow/output/param/state/security/quality       │
└──────────────────────────────────────────────────┘
```

**关键文件**：
- `.claude/skills/{sop}/expected.yml` — 各 SOP 的预期产出声明
- `.claude/scripts/sop-verify.ts` — 验证上下文收集脚本
- `.sop/output/verify-{sop}-{date}.md` — 审查总报告

**评分公式**：

```
score = steps(30%) + outputs(30%) + params(20%) + state(10%) + quality(10%)
Pass: ≥90 | Warn: 70–89 | Fail: <70
```

**v6.0.0 新增：长度预算检查（sop-prd 专属）**：

```
LITE 目标 ≤180 行 | WARN 200 | FAIL 250
FULL 目标 ≤325 行 | WARN 380 | FAIL 450
```

sop-prd 历史产出（`prd-logistics-20260508.md` 344 行）已在 v6.0.0 LITE 标准下判定为 FAIL（属预期，因其按 v5.1.0 的 12 章节 FULL 模板生成）。

---



## 二、依赖体系

| 能力 | 来源 | 用途 |
|------|------|------|
| **dr-jskill** | jdubois/dr-jskill | Spring Boot 项目生成，JDTLS 导航，Docker 支持 |
| **everything-claude-code** | affaan-m/everything-claude-code | 多 Agent 能力（code-reviewer, java-reviewer, security-reviewer, search-first） |
| **CodeGraph** | colbymchenry/codegraph | 代码知识图谱（48k stars，MCP 原生，自动同步，20+ 语言）— v6.2.0 替代 Graphify |
| Graphify (legacy) | graphifyy | 旧版依赖图谱（仍兼容） |

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
| sop-prd | PRD 生成（v6.0.0 LITE 默认，≤180 行）| `/sop prd` |
| sop-scaffold | 脚手架生成（前后端分离） | `/sop scaffold` |
| sop-backend | 后端迭代 | `/sop backend` |
| sop-frontend | 前端迭代 | `/sop frontend` |
| sop-fullstack | 全栈迭代 | `/sop fullstack` |
| sop-testing | 测试执行 | `/sop testing` |
| sop-code-review | 代码审查（三 Agent 并行） | `/sop code-review` |
| sop-bug-fix | Bug 修复 | `/sop bug-fix` |
| sop-deployment | 部署发布 | `/sop deployment` |
| sop-dependency-analysis | 依赖分析 | `/sop dependency-analysis` |
| sop-verification | SOP 执行验证（反模式检测） | `/sop verify` |

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

## 五、v6.2.0 进展（2026-06-14） — Phase E CodeGraph 迁移 + 业务图谱

| 能力 | 落地 |
|------|------|
| **代码图谱（CodeGraph）** | 替换 Graphify。MCP 原生集成，自动同步，20+ 语言，17 框架路由识别 |
| **测试影响分析（TIA）** | `git diff \| codegraph affected` 取代手工 grep（sop-regression v2.0.0）|
| **业务文档图谱** | `sop-biz-graph` 新 SOP — SQLite + 14 节点类型 + 11 边类型 |
| **跨层追溯** | 业务层 ↔ 代码层桥接（`code_ref` 节点）|
| **三级降级** | CodeGraph (1st) → Graphify (2nd) → Grep (3rd) |
| **Vitest 用例数** | 23 → 31（+8 biz-graph）|

### 用法

```bash
# 代码层（CodeGraph）
codegraph init                                # 项目初始化
codegraph search "@GetMapping"                # 找 Spring 路由
git diff --name-only | codegraph affected --stdin   # 受影响测试

# 业务层（sop-biz-graph）
cd .opencode && npm run biz-graph:build       # 构建图谱
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts query "调度"
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts trace prd-2026-06-14-abc
```

## 六、v6.1.0 进展（2026-06-14） — Phase D 度量与回归

| 能力 | 落地 |
|------|------|
| **黄金测试集** | `.claude/skills/sop-prd/golden/`：3 fixtures (delivery-staff/logistics/e-commerce) + eval.config.yaml |
| **Eval 自动化** | `.claude/scripts/sop-eval.ts` 4 维度评分（structure/length/dor/coverage），vitest 集成 23/23 通过 |
| **Trace ID 追溯** | `sop-state-save.ts` 自动生成 trace_id，`sop-trace.ts` 跨 SOP 链路（PRD→test→code→deploy）|
| **权重校准** | `sop-verify-calibrate.ts` Pearson correlation 计算 verify 权重，bootstrap 报告已出 |
| **快速命令** | `npm run eval` / `npm run trace` / `npm test`（在 `.opencode/`）|

### 用法

```bash
# 黄金测试（PRD 修改后必跑）
cd .opencode && npm run eval

# 跨 SOP 链路追溯
npx ts-node --transpile-only .claude/scripts/sop-trace.ts <trace_id>

# 评估某个 PRD 文件
npx ts-node --transpile-only .claude/scripts/sop-eval.ts prd logistics --against .sop/output/prd-foo.md
```

## 七、v6.0.0 进展（2026-06-10）

| 缺陷 | 状态 | 落地 |
|------|------|------|
| sop-prd 12 章节过长 (325 行 avg) | ✅ | LITE 7 章节默认，≤180 行 |
| 步骤数 10 / 确认点 5 过多 | ✅ | 7 步骤 / 2 确认点 |
| DoD 装饰未落地 | ✅ | 3 SOP 硬门（prd/scaffold/code-review）|
| Graphify 中止执行 | ✅ | CodeGraph 替代（v6.2.0）+ Graphify→Grep 软降级 |
| 验证浅 (1/6 SOPs) | ✅ | 6/6 SOPs verify-ready |
| state 脚本 0 测试 | ✅ | Vitest 20/20 通过 |
| RACI 缺位 | ✅ | sop-fullstack-iteration RACI 表 |

## 八、未来强化方向

### 1. Token 优化

- **动态上下文压缩**：根据当前 SOP 进度选择性加载 skill 文档
- **Skill 分层**：核心 skill（必须加载）vs 扩展 skill（按需加载）
- **增量技能加载**：只加载当前步骤需要的 skill，而非全部
- **参考文档外置**：将大型参考文档移至外部，按需读取

### 2. 验证权重校准（DMAIC Measure）

`sop-verification/references/DSL.md` 已记录 Spearman impact 校准方法，待 10+ 历史样本标注后填入实际权重。

### 3. Java 编码规范强化

| 方向 | 内容 |
|------|------|
| **代码范式** | 统一 Entity/DTO/VO 命名，Lombok 使用规范，equals/hashCode 强制规范 |
| **事务细化** | 事务传播行为，嵌套事务，readonly 与性能优化 |
| **SQL 安全** | 参数化查询强制检查，N+1 检测，JOIN FETCH 规范 |
| **安全基线** | OWASP Top 10 防护，敏感数据加密，API 鉴权 |
| **异常体系** | 统一异常码，异常分类（业务/系统），日志规范 |

### 4. UI 优化

- **样式模板库**：沉淀高质量 Vue 组件模板（列表、表单、详情、图表）
- **行业 UI 规范**：封装 Naive UI / Element Plus 最佳实践
- **配色方案**：预定义行业配色（企业后台、物流、医疗、电商）
- **组件规范**：统一按钮、表单、表格、弹窗的样式模板

### 5. 上下文控制强化

- **本地知识库**：Memory 长期记忆系统
- **上下文压缩**：动态选择加载内容
- **多 Agent 协作**：跨流程状态交互

---

## 九、快速开始

### 8.1 SOP 工作流命令

```bash
# 生成项目脚手架（受控流程）
/sop scaffold

# 生成 PRD（v6.0.0+ LITE 默认 ≤180 行）
/sop prd

# 需求迭代（规约控制）
/sop fullstack

# 代码审查（三 Agent 并行）
/sop code-review

# 依赖分析（CodeGraph）
/sop dependency-analysis

# 精准回归测试（v6.2.0 codegraph affected）
/sop regression

# 业务文档图谱（v6.2.0 新能力）
/sop biz-graph build
/sop biz-graph query "调度"
/sop biz-graph trace prd-2026-06-14-abc123

# SOP 执行验证（反模式检测）
/sop verify              # 自动检测最近完成的 SOP
/sop verify code-review  # 指定验证 code-review
/sop verify all          # 验证所有已完成的 SOP
```

### 8.2 工具命令（脚本入口）

```bash
# 状态管理
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all
npx ts-node --transpile-only .claude/scripts/sop-resume-check.ts <sop>
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts

# 跨 SOP 追溯（Phase D2）
npx ts-node --transpile-only .claude/scripts/sop-trace.ts <trace_id>
npx ts-node --transpile-only .claude/scripts/sop-trace.ts --list
npx ts-node --transpile-only .claude/scripts/sop-trace.ts --link <parent> <child>

# 黄金测试集回归（Phase D4）
cd .opencode && npm run eval                      # 跑全部 fixture
cd .opencode && npm run eval:json                 # JSON 输出（CI 用）
npx ts-node --transpile-only .claude/scripts/sop-eval.ts prd <fixture>
npx ts-node --transpile-only .claude/scripts/sop-eval.ts prd <fixture> --against <file>

# 验证权重校准（Phase D3）
npx ts-node --transpile-only .claude/scripts/sop-verify-calibrate.ts prd

# 业务文档图谱（Phase E2）
cd .opencode && npm run biz-graph                 # status
cd .opencode && npm run biz-graph:build           # full rebuild
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts query "<text>"
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts node <id>
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts trace <trace_id>
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts affected <id> [depth]

# 代码图谱（CodeGraph，Phase E1）
codegraph init                                    # 项目初始化（一次）
codegraph status                                  # 索引状态
codegraph search "@GetMapping" --json             # 找 Spring 路由
codegraph callers OrderService.createOrder        # 谁调用 X
codegraph impact UserEntity --depth 3             # blast radius
git diff --name-only | codegraph affected --stdin # 受影响测试集
codegraph explore "how does X reach Y"            # 自然语言路径

# Vitest 全套
cd .opencode && npm test                          # 31/31 用例（state + eval + biz-graph）
```

---

## 十、SOP 执行状态

### 步骤类型

| 类型 | 说明 |
|------|------|
| `[CONFIRM_REQUIRED]` | 需用户确认，阻塞执行 |
| `[AUTO]` | 自动执行，无需确认 |
| `[OPTIONAL]` | 可选步骤，用户决定 |

### SOP 生命周期

```
PENDING → IN_PROGRESS → COMPLETED → VERIFIED (通过验证)
                                        ↓
                                     REJECTED (反模式检测失败)
```

| 状态 | 说明 |
|------|------|
| `pending` | 任务已创建，未开始执行 |
| `in_progress` | 执行中 |
| `completed` | 步骤/任务完成 |
| `done` | 整个 SOP 完成 |
| `verified` | 通过反模式验证 |
| `rejected` | 验证发现反模式，需修复 |

---

## 十一、目录结构

```
.claude/
├── skills/                              # SOP Skills（Harness 控制层）
│   ├── SOP.md                          # Skill 规范
│   ├── sop-prd/                        # PRD 生成（v6.0.0 LITE 默认）
│   │   ├── SKILL.md                    # 7 步骤定义
│   │   ├── STEPS.md                    # 执行模型
│   │   ├── expected.yml                # 预期产出 + 长度预算
│   │   ├── golden/                     # 黄金测试集（Phase D1）
│   │   │   ├── inputs/                 # DYNAMIC_INPUT 答案
│   │   │   ├── expected/               # 标杆 PRD
│   │   │   └── eval.config.yaml        # 评估配置
│   │   └── references/                 # 18 个 PRD 模板（BRD/MRD/...)
│   ├── sop-biz-graph/                  # 业务文档图谱（v6.2.0 新增）
│   │   ├── SKILL.md
│   │   ├── STEPS.md
│   │   ├── expected.yml
│   │   └── SCHEMA.md                   # 14 节点类型 + 11 边类型
│   ├── sop-scaffold/                   # 脚手架生成
│   ├── sop-backend-iteration/          # 后端迭代
│   ├── sop-frontend-iteration/         # 前端迭代
│   ├── sop-fullstack-iteration/        # 全栈迭代（含 RACI）
│   ├── sop-testing/                    # 测试执行
│   ├── sop-code-review/                # 代码审查（DoD 硬门）
│   ├── sop-bug-fix/                    # Bug 修复
│   ├── sop-deployment/                 # 部署发布
│   ├── sop-dependency-analysis/        # 依赖分析（v3.0.0 CodeGraph）
│   ├── sop-regression/                 # 回归测试（v2.0.0 codegraph affected）
│   ├── sop-test-design/                # 测试用例设计
│   ├── sop-onboarding/                 # 项目入职
│   ├── sop-knowledge/                  # 领域知识
│   ├── sop-library-research/           # 技术调研
│   ├── sop-incident-response/          # 故障响应
│   ├── sop-api-design/                 # API 设计（CodeGraph 冲突检测）
│   ├── sop-database-design/            # 数据库设计（CodeGraph 实体冲突）
│   ├── sop-product-analysis/           # 产品分析
│   ├── sop-brainstorming/              # 结构化脑暴
│   ├── sop-dynamic-input/              # 动态参数收集
│   ├── sop-status/                     # 状态查看
│   ├── sop-framework/                  # SOP 框架本身
│   ├── sop-verification/               # SOP 验证（反模式检测 + 长度预算）
│   ├── dr-jskill/                      # Java 项目工具
│   ├── frontend-design/                # 前端设计工具
│   └── tailwind-design-system/         # Tailwind v4 设计系统
├── rules/                              # 编码规范
│   └── common/
│       ├── 01_naming.md                # 命名规约
│       ├── 02_oop.md                   # OOP 规约
│       ├── 03_concurrency.md           # 并发处理
│       ├── 04_control.md               # 控制语句
│       ├── 05_exception.md             # 异常处理
│       ├── 06_logging.md               # 日志规约
│       ├── 07_testing.md               # 测试规约
│       ├── 08_security.md              # 安全规约
│       ├── 09_project.md               # 工程结构
│       └── 10_mysql.md                 # MySQL 规约
├── scripts/                            # 工具脚本
│   ├── sop-state-save.ts               # 状态保存（含 trace_id 生成 + biz-graph 钩子）
│   ├── sop-state-load.ts               # 状态恢复
│   ├── sop-state-clean.ts              # 状态清理
│   ├── sop-resume-check.ts             # 断点检测
│   ├── sop-step-map.json               # 步骤映射表
│   ├── sop-verify.ts                   # 验证（含长度预算 + 多 agent 分发）
│   ├── sop-verify-calibrate.ts         # 权重校准（Phase D3）
│   ├── sop-trace.ts                    # 跨 SOP 链路（Phase D2）
│   ├── sop-eval.ts                     # 黄金测试评估（Phase D4）
│   ├── sop-biz-graph.ts                # 业务文档图谱（Phase E2）
│   ├── sop-state.test.ts               # 20 vitest 用例
│   ├── sop-eval.test.ts                # 3 vitest 用例
│   └── sop-biz-graph.test.ts           # 8 vitest 用例
└── agents/                             # Sub-agent 定义
    ├── flow-reviewer.md
    ├── output-reviewer.md
    ├── param-reviewer.md
    ├── state-reviewer.md
    ├── code-reviewer.md
    ├── arch-reviewer.md
    ├── security-reviewer.md
    ├── java-reviewer.md
    └── build-error-resolver.md

.sop/                                   # 运行时数据
├── state/                              # SOP 执行状态（gitignored）
├── output/                             # SOP 产出文档
├── knowledge/                          # 领域知识
├── biz-graph/                          # 业务图谱 SQLite（gitignored）
└── verification/                       # 验证结果历史

.codegraph/                             # CodeGraph 索引（gitignored, per-machine）

.opencode/
├── opencode.json                       # OpenCode 配置 + MCP server 注册
├── plugins/                            # OpenCode 插件（v6.2.0 已删除 graphify.js）
└── package.json                        # vitest + npm scripts
```

---

## 十二、使用用例

### 用例 1：生成 LITE PRD（v6.0.0+，默认 ≤180 行）

```bash
# 启动 PRD 生成
/sop prd 物流配送系统

# 7 步骤流程（仅 2 个确认点）：
# Step 0: 依赖检查 [AUTO]              → 自动搜索 .sop/knowledge/
# Step 1: 业务识别 + 脑暴 [CONFIRM]    → DYNAMIC_INPUT 弹窗
#          { business_type: 物流配送, brainstorm: false }
# Step 2: 文档类型 + 需求深挖 [CONFIRM] → DYNAMIC_INPUT 弹窗
#          { tier: lite }   ← 默认 LITE，按需 opt-in FULL
# Step 3-6: AUTO

# 产出：
#   .sop/output/prd-logistics-20260614.md          (146 lines, 7 sections)
#   .sop/output/prototype-logistics-20260614.html  (可编辑 HTML 原型)
#   .sop/output/prd-logistics-20260614.summary.md  (DoR 状态 + 长度预算)
#   .sop/output/verify-prd-20260614.md             (sop-verify 自动报告)

# DoR 硬门：未通过 4 项检查（故事≤8、AC=GWT、INVEST、无孤章）
# 写入 prd-*.DRAFT.md 而不是 prd-*.md
```

### 用例 2：黄金测试集回归（v6.1.0 Phase D）

```bash
# 修改 sop-prd/SKILL.md 后必跑
cd .opencode && npm run eval

# 输出示例：
# ## Fixture: delivery-staff (tier=lite)
# | Dimension | Score |
# |-----------|-------|
# | structure | 1.000 |   ← 7/7 章节齐全
# | length    | 1.000 |   ← 146 行 ≤ 180 预算
# | dor       | 1.000 |   ← 7 stories, 6 GWT, 8 INVEST 标记
# | coverage  | 1.000 |   ← 关键词全覆盖
# | **total** | **1.000** |
# | **verdict** | **PASS** |
#
# Overall: 3/3 PASS, 0 WARN, 0 FAIL

# 单独跑某个 fixture：
npx ts-node --transpile-only .claude/scripts/sop-eval.ts prd delivery-staff

# 评估某个真实 PRD 文件（如历史 343 行 PRD）：
npx ts-node --transpile-only .claude/scripts/sop-eval.ts prd logistics \
  --against .sop/output/prd-logistics-20260508.md
# → FAIL (0.393)：length 0、structure 0.176（12 sections，超 LITE 7）
```

### 用例 3：跨 SOP 全链路追溯（v6.1.0 Phase D2）

```bash
# 每次 SOP 启动自动生成 trace_id
/sop prd 配送系统
# → state.trace_id = "prd-2026-06-14-abc123"

/sop test-design                                 # 下游 SOP
# → state.trace_id = "test-design-2026-06-14-xyz789"

# 关联两个 SOP
npx ts-node --transpile-only .claude/scripts/sop-trace.ts \
  --link prd-2026-06-14-abc123 test-design-2026-06-14-xyz789

# 查全链路
npx ts-node --transpile-only .claude/scripts/sop-trace.ts prd-2026-06-14-abc123
# 输出：
#   - SOP / 状态 / 时间 / 当前步骤 / 父子链
#   - 关联的输出文件（PRD, prototype, summary）
#   - 关联的 git 提交（如 commit message 含 [trace: xxx]）
#   - Parent / Child SOP 列表

# 列出所有 trace
npx ts-node --transpile-only .claude/scripts/sop-trace.ts --list
```

### 用例 4：CodeGraph 代码层依赖分析（v6.2.0）

```bash
# 一次性安装（项目级别）
codegraph init                                # 创建 .codegraph/，索引 + 文件监听

# 检测 API 路径冲突（设计新接口前）
codegraph search "@GetMapping" --json
# 或更智能：让 agent 通过 MCP 调用 codegraph_explore "all REST routes"

# 改动 OrderService 影响哪些代码（blast radius）
codegraph impact OrderService --depth 3 --json

# 谁调用了 UserController.list
codegraph callers UserController.list --json

# 改动 → 受影响测试集（业界 TIA = Test Impact Analysis）
git diff --name-only | codegraph affected --stdin --json
# {
#   "changed_files": ["src/main/java/.../OrderService.java"],
#   "affected_tests": [
#     "src/test/.../OrderServiceTest.java",
#     "src/test/.../OrderControllerIntegrationTest.java"
#   ],
#   "test_count": 2
# }

# 自然语言查询（最强武器）
# 通过 MCP：codegraph_explore "how does AuthController.login reach UserRepository"
# 一次返回所有相关符号源码 + 调用路径
```

### 用例 5：sop-regression 精准回归（v6.2.0 升级）

```bash
# v1.0.0：手工 grep 影响（不准）
# v2.0.0：codegraph affected 精准（业界 TIA）

/sop regression

# Step 1: 变更分析（git diff）
# Step 2: 影响评估（codegraph affected → JSON 输出受影响测试集）
# Step 3: 用例筛选（与已有测试合并）
# Step 4: 执行（自动检测框架：mvn test / npx vitest / pytest 等）
# Step 5: 报告

# 实际命令：
git diff --name-only HEAD~1 | codegraph affected --stdin --json > .sop/state/affected.json
# 然后只跑这个文件里列出的测试 → 测试时间从 5 分钟缩短到 30 秒
```

### 用例 6：业务文档图谱 sop-biz-graph（v6.2.0 新能力）

```bash
# 全量构建（首次或重建）
cd .opencode && npm run biz-graph:build
# [OK] Build complete:
#   sop_runs:    0
#   knowledge:   2
#   prds:        2
#   user_stories: 12   ← 自动从 §3/§5 表格提取
#   acceptance_criterion: 11
#   nodes: 27 / edges: 24

# 状态查看
cd .opencode && npm run biz-graph

# 模糊搜索（兼容中文）
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts query "调度"
# | Type        | ID                                | Name              |
# |-------------|-----------------------------------|-------------------|
# | user_story  | us:prd:logistics-...:US-001      | US-001: 收到调度推送 |
# | user_story  | us:prd:logistics-...:US-004      | US-004: 调整调度策略 |

# 查单个节点（详情 + 入边出边）
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts \
  node us:prd:logistics-20260508:US-001
# - Type: user_story
# - Source: .sop/output/prd-logistics-20260508.md
# - Metadata: { us_id, role, priority: Must, invest: ✅, ac: "Given..." }
# - Incoming edges:
#   - prd:logistics-20260508 -[produces]-> us:...:US-001
#   - ac:us:...:US-001 -[validates]-> us:...:US-001

# 跨 SOP 追溯（按 trace_id 查全链路）
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts \
  trace prd-2026-06-14-abc123

# 影响分析（BFS 下游，默认 depth=3）
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts \
  affected prd:logistics-20260508 3
# | Depth | Type        | ID                                  |
# | 1     | user_story  | us:prd:...:US-001                  |
# | 1     | user_story  | us:prd:...:US-002                  |
# | 1     | knowledge   | kn:logistics-20260508              |
```

### 用例 7：业务图谱 + 代码图谱联合查询（v6.2.0 双层）

> **跨层追溯**：业务层（biz-graph）"改了 US-003 影响哪些代码？"+ 代码层（CodeGraph）反查

```bash
# 场景：PM 要改 US-003，开发想知道动哪些代码 + 哪些测试

# Step 1: 业务层 — 找 US-003 关联的 feature
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts \
  affected us:prd:logistics-20260508:US-003 2
# → feat:prd:...:F-03 实现该 US

# Step 2: 业务层 → 代码层桥接（code_ref 节点存 FQN）
npx ts-node --transpile-only .claude/scripts/sop-biz-graph.ts \
  node feat:prd:logistics-20260508:F-03
# → code_ref: src/.../OrderService.java::createOrder

# Step 3: 代码层 — 找 createOrder 的 caller + 测试
codegraph callers OrderService.createOrder --json
codegraph affected src/main/java/.../OrderService.java --json
# → 受影响测试集（精确）
```

### 用例 8：SOP 执行后自动验证

```bash
# 执行 code-review SOP
/sop code-review

# 自动验证（含 v6.0.0 长度预算 + v6.1.0 多 agent 分发）
/sop verify

# 输出示例：
# === SOP Verify: code-review ===
# State: code-review | status=done | steps=4/4
# Expected outputs:
#   ✓ code-review-2026-05-21-scope.md
#   ✓ code-review-2026-05-21-review.md
#   ✓ code-review-2026-05-21-report.md
#
# Length Budget Check (sop-prd 仅):
#   tier=lite, actual=146 lines, budget=200, status=PASS
#
# Multi-agent dispatch (v6.1.0):
#   ✓ flow-reviewer (priority: optional)
#   ✓ output-reviewer (priority: required)
#   ✓ code-reviewer (priority: recommended)
#   ✓ security-reviewer (priority: required)
#
# === VERDICT: PASS (score: 92) ===
```

### 用例 9：检测反模式（DoR 硬门 v6.0.0）

```bash
# 故意写一个超过 8 个故事的 PRD（违反 LITE DoR）
/sop prd 复杂系统
# Step 4: 生成时检测到 12 个 user stories（>8）
# → DoR 检查 FAIL，写入 prd-complex-system-20260614.DRAFT.md
# → state.dor_status = "failed"
# → WARN 提示：split stories or upgrade to FULL tier

# 验证
/sop verify prd
# === VERDICT: WARN (score: 75) ===
# Anti-patterns:
#   - dor_status=failed
#   - line_count=312 > LITE budget 200
# 建议：改用 tier=full，或拆分故事
```

### 用例 10：状态生命周期

```
# 正常流程（v6.2.0）
/sop scaffold              # PENDING → IN_PROGRESS → COMPLETED
                           # 自动写 trace_id, biz-graph 自动 sync
/sop verify scaffold       # COMPLETED → VERIFIED (评分≥90)

# 跨 SOP 链路
/sop prd                   # 产出 prd:my-system-20260614
/sop test-design           # 自动 link 到上游 prd（parent_trace）
/sop scaffold              # 同
# → biz-graph trace prd-2026-06-14-xxx 一键看全链路

# 反模式流程
/sop bug-fix               # 跳过 reproduce 步骤
/sop verify bug-fix        # COMPLETED → REJECTED (评分<70)
# 建议：补充 reproduce 步骤后重新验证
```

---

## 十三、参考文档

### 业内对照

- [CodeGraph](https://github.com/colbymchenry/codegraph) — 代码知识图谱（48k stars，MCP 原生），v6.2.0 起替代 Graphify
- [Anthropic MCP](https://modelcontextprotocol.io/) — Model Context Protocol，本项目通过此协议接入 Claude Code/OpenCode/Cursor
- [Test Impact Analysis (TIA)](https://martinfowler.com/articles/rise-test-impact-analysis.html) — Martin Fowler 论 TIA，sop-regression v2.0 实现

### 设计文档

- SOP 设计哲学：`SOP流程设计思想.md`（1459 行）
- 系统数据流与缺陷分析：`docs/sop-data-flow-and-defects.md`（524 行，11 章节）
- 验证结果历史：`.sop/verification/VERIFICATION_RESULTS.md`
- 业务图谱 schema：`.claude/skills/sop-biz-graph/SCHEMA.md`
- 验证 DSL：`.claude/skills/sop-verification/references/DSL.md`
- 验证执行步骤：`.claude/skills/sop-verification/STEPS.md`
- PRD 模板（18 个）：`.claude/skills/sop-prd/references/`

### 技术参考

- dr-jskill：`.claude/skills/dr-jskill/references/`（Spring Boot / MyBatis-Plus / Vue / React / Docker / GraalVM）
- 阿里 P3C 编码规范：`.claude/rules/common/01_naming.md` 至 `10_mysql.md`

### 行业方法论锚点（v6.0.0+ 引入）

| 锚点 | 应用 |
|------|------|
| **Lean / Muda** | LITE 7-section PRD（消除 12-section 浪费） |
| **Kaizen** | 2-way 默认（取代 3-way 选择） |
| **DoD** | sop-prd Step 4 / sop-scaffold Step 9 / sop-code-review Step 3 硬门 |
| **PDCA** | knowledge → prd → scaffold → verify 循环 |
| **DMAIC** | sop-verify-calibrate.ts Pearson correlation Measure 阶段 |
| **RACI** | sop-fullstack-iteration parallel_tasks 角色矩阵 |
| **BPMN-lite** | STEPS.md 作为可执行流程模型（5/28 SOPs） |
| **TIA** | sop-regression v2.0.0 codegraph affected |
| **Knowledge Graph** | sop-biz-graph SQLite 14 节点 + 11 边 |
