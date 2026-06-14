# Personal SOP - AI 驱动的工作流控制系统

> **v6.1.0 (2026-06-14)**：黄金测试集 + Trace ID 追溯 + Eval 自动化 + 权重校准（Phase D 度量与回归）
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
| Graphify | 否 | 代码依赖分析（v2.0.0 起支持 Grep 软降级），`pip install graphify` |

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

## 五、v6.1.0 进展（2026-06-14） — Phase D 度量与回归

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

## 六、v6.0.0 进展（2026-06-10）

| 缺陷 | 状态 | 落地 |
|------|------|------|
| sop-prd 12 章节过长 (325 行 avg) | ✅ | LITE 7 章节默认，≤180 行 |
| 步骤数 10 / 确认点 5 过多 | ✅ | 7 步骤 / 2 确认点 |
| DoD 装饰未落地 | ✅ | 3 SOP 硬门（prd/scaffold/code-review）|
| Graphify 中止执行 | ✅ | Grep 软降级（sop-dependency-analysis）|
| 验证浅 (1/6 SOPs) | ✅ | 6/6 SOPs verify-ready |
| state 脚本 0 测试 | ✅ | Vitest 20/20 通过 |
| RACI 缺位 | ✅ | sop-fullstack-iteration RACI 表 |

## 七、未来强化方向

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

## 八、快速开始

```bash
# 生成项目脚手架（受控流程）
/sop scaffold

# 需求迭代（规约控制）
/sop fullstack

# 代码审查（三 Agent 并行）
/sop code-review

# 依赖分析（Graphify）
/sop dependency-analysis

# SOP 执行验证（反模式检测）
/sop verify              # 自动检测最近完成的 SOP
/sop verify code-review  # 指定验证 code-review
/sop verify all          # 验证所有已完成的 SOP
```

---

## 九、SOP 执行状态

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

## 十、目录结构

```
.claude/
├── skills/                           # SOP Skills（Harness 控制层）
│   ├── SOP.md                       # Skill 规范
│   ├── sop-prd/                    # PRD 生成
│   ├── sop-scaffold/               # 脚手架生成
│   │   └── expected.yml           # 预期产出 DSL
│   ├── sop-backend-iteration/      # 后端迭代
│   ├── sop-frontend-iteration/     # 前端迭代
│   ├── sop-fullstack-iteration/   # 全栈迭代
│   ├── sop-testing/               # 测试执行
│   │   └── expected.yml           # 预期产出 DSL
│   ├── sop-code-review/           # 代码审查
│   │   └── expected.yml           # 预期产出 DSL
│   ├── sop-bug-fix/               # Bug 修复
│   │   └── expected.yml           # 预期产出 DSL
│   ├── sop-deployment/            # 部署发布
│   │   └── expected.yml           # 预期产出 DSL
│   ├── sop-dependency-analysis/    # 依赖分析
│   ├── sop-onboarding/            # 项目入职
│   ├── sop-knowledge/             # 领域知识
│   ├── sop-library-research/      # 技术调研
│   ├── sop-verification/          # SOP 验证（反模式检测）
│   │   ├── SKILL.md               # 验证技能
│   │   ├── STEPS.md               # 5 步验证流程
│   │   └── references/
│   │       ├── DSL.md             # expected.yml 完整 Schema
│   │       └── REVIEWER-AGENTS.md # 8 个审查 Agent 定义
│   ├── dr-jskill/                # Java 项目工具
│   └── frontend-design/           # 前端设计工具
├── rules/                          # 编码规范
│   └── common/
│       ├── coding-style.md        # Java/Spring 规范
│       └── testing.md             # 测试规范
├── scripts/                       # 工具脚本
│   ├── sop-state-save.ts         # 状态保存
│   ├── sop-state-load.ts         # 状态恢复
│   └── sop-verify.ts             # 验证上下文收集
└── agents/                        # 审查 Agent 定义
    ├── flow-reviewer.md           # 流程合规审查
    ├── output-reviewer.md         # 产出完整性审查
    ├── param-reviewer.md          # 参数一致性审查
    ├── state-reviewer.md          # 状态一致性审查
    ├── security-reviewer.md       # 安全审查
    ├── quality-reviewer.md        # 质量审查
    └── arch-reviewer.md           # 架构审查
```

---

## 十一、使用用例

### 用例 1：SOP 执行后自动验证

```bash
# 执行 code-review SOP
/sop code-review

# 执行后验证（自动检测最近完成的 SOP）
/sop verify

# 输出示例：
# === SOP Verify: code-review ===
# State: code-review | status=done | steps=4/4
# Expected outputs:
#   ✓ code-review-2026-05-21-scope.md
#   ✓ code-review-2026-05-21-review.md
#   ✓ code-review-2026-05-21-report.md
# Anti-pattern checks:
#   ✓ status=done
#   ✓ all 4 steps completed
#   ✓ all outputs present
#   ✓ report contains required fields
# === VERDICT: PASS ===
```

### 用例 2：检测反模式（故意跳过步骤）

```bash
# 执行 Bug Fix SOP 但跳过 reproduce 步骤
/sop bug-fix

# 验证发现反模式
/sop verify bug-fix

# 输出示例：
# === SOP Verify: bug-fix ===
# Anti-pattern checks:
#   ✗ step 1_reproduce skipped (required)
#   ✗ reproduce-*.md output missing
#   ✗ state inconsistency: step 3_fix marked completed but step 1 skipped
# === VERDICT: FAIL ===
# Detected: 1 CRITICAL (空跑风险), 2 HIGH (步骤跳过)
```

### 用例 3：指定预期产出（expected.yml）

```yaml
# .claude/skills/sop-scaffold/expected.yml
sop: scaffold
expected_steps:
  - id: 1_confirm
    name: 需求确认
    type: confirm
    required: true
  - id: 2_generate
    name: 代码生成
    type: auto
    required: true
    produces: [".sop/output/scaffold-*-generated.md"]
  - id: 3_verify
    name: 启动验证
    type: auto
    required: true

expected_outputs:
  - path: ".sop/output/scaffold-*-generated.md"
    description: 生成的项目结构
    type: markdown
    required: true
    validate: [not_empty, contains: "项目结构"]
  - path: "delivery-staff/pom.xml"
    description: 后端项目配置
    type: code
    required: true
    validate: [not_empty]

constraints:
  strict_order: true
  allow_skip: false
```

### 用例 4：多 Agent 深度审查

```bash
# 验证完成，发现产出完整性警告
/sop verify code-review

# 基础验证完成后，自动分发 subAgent：
#   flow-reviewer    → 检查步骤顺序
#   output-reviewer  → 检查缺失的文件
#   security-reviewer → 扫描敏感信息
#   quality-reviewer  → 评估产出质量

# 最终生成总报告：
# .sop/output/verify-code-review-2026-05-21.md
#
# 反模式汇总：
# | # | 类型 | 严重度 | 描述 |
# |---|------|--------|------|
# | 1 | 产出缺失 | LOW | api-docs.md 未生成 |
# | 2 | 参数未生效 | LOW | db_url 参数未被使用 |
```

### 用例 5：验证状态生命周期

```
# 正常流程
/sop scaffold           # PENDING → IN_PROGRESS → COMPLETED
/sop verify scaffold    # COMPLETED → VERIFIED (评分≥90)

# 反模式流程
/sop bug-fix            # 执行中跳过了 reproduce 步骤
/sop verify bug-fix     # COMPLETED → REJECTED (评分<70)
# 建议修复：补充 reproduce 步骤后重新验证
```

---

## 十二、参考文档

- dr-jskill: `.claude/skills/dr-jskill/references/`
- ECC Agents: `everything-claude-code-main/agents/`
- ECC Commands: `everything-claude-code-main/commands/`
- SOP 验证 DSL: `.claude/skills/sop-verification/references/DSL.md`
- 审查 Agent 定义: `.claude/skills/sop-verification/references/REVIEWER-AGENTS.md`
- 验证执行步骤: `.claude/skills/sop-verification/STEPS.md`
