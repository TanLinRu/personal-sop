# SOP 系统数据流程与缺陷分析

> 版本: 1.0.0 | 更新: 2026-05-21 | 涵盖: SOP 执行框架 + 状态管理 + Graphify 依赖分析 + 反模式验证

---

## 目录

1. [系统架构总览](#1-系统架构总览)
2. [SOP 执行数据流](#2-sop-执行数据流)
3. [状态管理数据流](#3-状态管理数据流)
4. [Graphify 依赖分析数据流](#4-graphify-依赖分析数据流)
5. [验证与反模式检测数据流](#5-验证与反模式检测数据流)
6. [SOP 生命周期状态图](#6-sop-生命周期状态图)
7. [跨 SOP 集成数据流](#7-跨-sop-集成数据流)
8. [数据文件依赖关系](#8-数据文件依赖关系)
9. [反模式检测引擎流程](#9-反模式检测引擎流程)
10. [缺陷与缺口分析](#10-缺陷与缺口分析)
11. [系统完整度评估](#11-系统完整度评估)

---

## 1. 系统架构总览

系统分 6 层: 用户交互层、命令路由层、SOP 执行层、数据持久化层、验证层、依赖分析层。

### 架构分层

```
  用户交互层         /sop scaffold  /sop code-review  /sop verify
       |
  命令路由层         opencode.json (commands/subAgents/agents)
       |
  SOP 执行层         Step 引擎 (Step-Map Driven)
       |
  数据持久化层       .sop/state/ + .sop/output/ + .sop/knowledge/
       |
  验证层             /sop verify -> sop-verify.ts -> subAgents
       |
  依赖分析层         Graphify AST -> 知识图谱 -> 冲突检测
```

### 各层职责

| 层级 | 核心组件 | 关键数据 |
|------|---------|---------|
| 用户交互 | 15 个 /sop 命令 | 用户输入参数 |
| 命令路由 | opencode.json | commands/subAgents/agents 映射 |
| 执行引擎 | Step 引擎 + state 脚本 | SKILL.md, STEPS.md, state JSON |
| 持久化 | 文件系统 | .sop/state/, .sop/output/, .sop/knowledge/ |
| 验证 | sop-verify.ts + 5 subAgents | expected.yml, verify 报告 |
| 依赖分析 | Graphify | graph.json, 冲突报告 |

### 当前缺陷

- 命令层: 8/21 命令未注册 (62% 覆盖率)
- 执行层: 26/27 SOP 无 STEPS.md (96% 缺失)
- 验证层: 22/27 SOP 无 expected.yml (81% 缺失)
- 持久化: 4 个 state 脚本无单元测试 (0% 覆盖)

## 2. SOP 执行数据流

### 2.1 命令触发到 SOP 执行

```
用户输入 /sop scaffold
       |
       v
[opencode.json] 匹配 commands[scaffold] -> agent: build-agent, skill: sop-scaffold
       |
       v
[加载 SKILL.md] 解析步骤结构, 检查 execution.mode
       |
       v
[断点检查] Glob(.sop/state/{sop}-*) -> 断点恢复/从头开始
       |
       v
[Step 循环引擎]
  +--------------------------------------+
  | for each step in step-map[sop]:      |
  |  1. 渲染进度表 [====    ] 3/10      |
  |  2. CONFIRM_REQ -> 等待用户确认     |
  |     AUTO -> 直接执行                 |
  |  3. 生成产出文件 (.sop/output/xxx)  |
  |  4. 保存状态 (sop-state-save.ts)    |
  |  5. auto-advance -> 下一步           |
  +--------------------------------------+
       |
       v
[最后一步完成] status=completed, 记录 completed_at
```

### 2.2 多 Agent 并行数据流

```
场景: /sop fullstack (前后端并行开发)
            |
            v
     [Step 1-2: PRD 生成] (串行)
            |
            v
     [Step 3: Graphify 依赖分析] (串行)
            |
            v
     [Step 4: 分工 - hybrid mode]
       +---------+----------+
       |         |          |
  [Agent A: 后端] [Agent B: 前端] (并行)
       |         |
       +----+----+
            |
     [Step 5: 联调验证 - Agent C]
      后端:8080  |  前端:5173
```

### 2.3 步骤类型与执行模式

| 步骤类型 | 标识 | 行为 |
|---------|------|------|
| CONFIRM_REQUIRED | 需确认 | 暂停,等待用户确认后继续 |
| AUTO | 自动 | 不暂停,直接执行 |
| OPTIONAL | 可选 | 提示用户是否执行 |

| 执行模式 | 说明 | 适用场景 |
|---------|------|---------|
| sequential | 串行 | code-review, bug-fix |
| parallel | 并行 | fullstack-iteration Step 4 |
| hybrid | 串行+并行混合 | fullstack |

## 3. 状态管理数据流

### 3.1 状态文件结构

```json
{
  "task_id": "uuid-string",
  "sop": "sop-code-review",
  "status": "in_progress",
  "current_step": 3,
  "total_steps": 4,
  "steps": [
    { "step": 1, "key": "preparation", "status": "completed", "output": "scope.md" },
    { "step": 2, "key": "setup", "status": "completed", "output": "setup.env" },
    { "step": 3, "key": "execute", "status": "in_progress" },
    { "step": 4, "key": "report", "status": "pending" }
  ],
  "answers": [
    { "key": "scope", "value": "backend", "step": 1 }
  ],
  "created_at": "2026-05-21T10:00:00Z",
  "updated_at": "2026-05-21T10:10:00Z",
  "completed_at": null
}
```

### 3.2 状态流转

```
  NOT_STARTED -> /sop xxx -> IN_PROGRESS -> 步完成循环 -> COMPLETED

  支持断点恢复: 中断后重新执行 /sop, 从 current_step 继续
```

### 3.3 state 脚本

| 脚本 | 路径 | 职责 | 测试覆盖 |
|------|------|------|---------|
| state-save.ts | .claude/scripts/ | 保存状态到 JSON | 无 |
| state-load.ts | .claude/scripts/ | 从 JSON 恢复状态 | 无 |
| state-clean.ts | .claude/scripts/ | 清理状态文件 | 无 |
| resume-check.ts | .claude/scripts/ | 检查可恢复任务 | 无 |

## 4. Graphify 依赖分析数据流

### 4.1 流程

```
  源代码 -> Graphify AST 解析 -> 知识图谱 (graph.json)

  四种查询:
  - API冲突: 相同路径+方法
  - Entity冲突: 相同 @Table 值
  - 路由冲突: Vue Router 重复
  - 依赖链: 变更影响范围评估
```

### 4.2 集成 SOP

| SOP | Graphify 用法 | 执行时机 |
|-----|-------------|---------|
| backend-iteration | API+Entity 冲突 | Step 3 |
| frontend-iteration | 路由冲突 | Step 3 |
| fullstack-iteration | 全量检测 | Step 3 |
| code-review | 依赖链+影响范围 | 审查阶段 |
| api-design | API 去重 | 设计阶段 |

## 5. 验证与反模式检测数据流

### 5.1 端到端验证流程

```
  /sop verify code-review
       |
  [Step 1: collect_context]
    sop-verify.ts 收集: state JSON + 产出文件 + expected.yml
       |
  [Step 2: basic_check]
    四项检查:
    #1 步骤完整性 (status=completed? 全部步骤已执行?)
    #2 产出完整性 (预期产出文件是否存在?)
    #3 状态一致性 (status 与 steps 一致?)
    #4 参数有效性 (answers 符合预期规范?)
       |
  [Step 3: deep_review]
    按产出类型分发 subAgent (当前手动, 目标自动)
       |
  [Step 4: aggregate_report]
    聚合评分 -> Verdict: APPROVED/WARNING/BLOCKED
```

### 5.2 反模式评分公式

```
  total = steps x 30% + outputs x 30% + params x 20%
        + state x 10% + quality x 10%

  Verdict: APPROVED (>=80) / WARNING (>=60) / BLOCKED (<60)
```

### 5.3 Review subAgent

| subAgent | 触发条件 | 职责 |
|----------|---------|------|
| flow-reviewer | 有 scope.md | 检查执行流程 |
| output-reviewer | 有 review.md | 检查产出质量 |
| quality-reviewer | 有 report.md | 检查报告完整度 |
| param-reviewer | 有 answers | 检查参数生效 |
| state-reviewer | 有 state JSON | 检查状态流转 |

### 5.4 expected.yml DSL

```yaml
name: sop-code-review
steps: 4
outputs:
  - path: .sop/output/scope.md
    required: true
  - path: .sop/output/review.md
    required: true
  - path: .sop/output/report.md
    required: true
params:
  scope:
    type: select
    required: true
    values: [full, backend, frontend]
verdict:
  passing_score: 80
  weights:
    steps: 30
    outputs: 30
    params: 20
    state: 10
    quality: 10
```

## 6. SOP 生命周期状态图

### 6.1 完整生命周期

```
  知识准备 -> 需求分析 -> 架构设计 -> 代码实现 -> 审查测试 -> 部署发布

  迭代 SOP 内部循环:
  [PRD] -> [调研] -> [Graphify 冲突检测]
                     |          |
              有冲突回退   无冲突进入实现
```

### 6.2 状态迁移表

| 当前状态 | 触发操作 | 目标状态 | 说明 |
|---------|---------|---------|------|
| NOT_STARTED | /sop xxx | PENDING | 命令识别到 SOP 技能 |
| PENDING | step 1 开始 | IN_PROGRESS | 进入 Step 循环 |
| IN_PROGRESS | step N 完成 | IN_PROGRESS | 自动进入下一步 |
| IN_PROGRESS | 中断/关闭 | IN_PROGRESS | state 持久化,可恢复 |
| IN_PROGRESS | 恢复 /sop xxx | IN_PROGRESS | 从 current_step 继续 |
| IN_PROGRESS | 最后一步完成 | COMPLETED | 终端态 |

## 7. 跨 SOP 集成数据流

### 7.1 SOP 间数据传递

```
  sop-scaffold (完整项目初始化)
    -> 产出: pom.xml, schema.sql, vite.config.js
       |
  sop-backend-iteration (后端迭代)
    -> 读取: 现有代码 + schema.sql
    -> Graphify: 冲突检测
    -> 产出: .java + 测试文件
       |
  sop-code-review (代码审查)
    -> 读取: git diff + .java 文件
    -> Graphify: 依赖链
    -> 产出: scope.md, review.md, report.md
       |
  sop-verify code-review (验证)
    -> 读取: state JSON + 产出 + expected.yml
    -> 产出: verify-report.md
       |
  sop-deployment (部署)
    -> 读取: mvn package 产出
    -> 产出: 部署报告
```

### 7.2 跨 SOP verify

sop-verify 可验证任意已完成 SOP, 通过 state.sop 字段匹配 expected.yml 或 fallback 到 step-map。

## 8. 数据文件依赖关系

### 8.1 文件依赖链

```
  opencode.json (命令路由)
    -> .claude/skills/sop-xxx/ (SKILL.md, STEPS.md, expected.yml, references/)
      -> .claude/scripts/ (state-save.ts, state-load.ts, state-clean.ts, resume-check.ts, sop-verify.ts)
        -> .sop/state/ (运行时状态 JSON)
        -> .sop/output/ (产出文件)
```

### 8.2 产出文件约定

| SOP | 预期产出 | 路径 |
|-----|---------|------|
| scaffold | project files | . (根目录) |
| backend | .java, .xml | src/main/java/ |
| frontend | .vue, .ts | delivery-staff-frontend/src/ |
| code-review | scope.md, review.md, report.md | .sop/output/ |
| bug-fix | analysis.md, fix-report.md | .sop/output/ |
| prd | prd.md, prototype.html | .sop/output/ |
| testing | test-report.md | .sop/output/ |
| deployment | deploy-report.md | .sop/output/ |
| verify | verify-*.md | .sop/output/ |

### 8.3 Git 追踪策略

| 路径 | 追踪 | 原因 |
|------|------|------|
| .sop/state/*.json | 忽略 (.gitignore) | 运行时临时文件 |
| .sop/output/*.md | 追踪 | 项目产出,可回顾 |
| .claude/skills/* | 追踪 | SOP 核心资产 |
| .claude/scripts/* | 追踪 | 自动化脚本 |
| .opencode/* | 追踪 | 关键配置 |

## 9. 反模式检测引擎流程

### 9.1 六类反模式

```
  六类反模式检测引擎:
  +----------+  +----------+  +----------+  +----------+
  | 步骤跳过  |  | 顺序颠倒 |  | 状态不一致|  | 参数未生效|
  |SkipCheck |  |OrderCheck|  |StateCheck|  |ParamCheck|
  +----+-----+  +----+-----+  +----+-----+  +----+-----+
       |             |             |             |
       v             v             v             v
  +----------+  +----------+  +-----------------------+
  | 产出偏差  |  | 空跑     |  |     聚合报告          |
  |OutputCheck|  |EmptyRun  |  | total = steps x 30%  |
  +----+-----+  +----+-----+  | + outputs x 30%       |
       |             |        | + params x 20%        |
       +-------------+--------| + state x 10%         |
                              | + quality x 10%       |
                              |                       |
                              | >=80 APPROVED         |
                              | >=60 WARNING          |
                              | <60  BLOCKED          |
                              +-----------------------+
```

### 9.2 检测逻辑

| ID | 模式 | 检测方法 | 实例 |
|----|------|---------|------|
| #1 | 步骤跳过 | 步骤序列 != expected.yml 定义 | code-review 应 4 步实做 3 步 |
| #2 | 顺序颠倒 | step.completed_at 时间戳与 step_map 不符 | 先 report 再 review |
| #3 | 状态不一致 | status 与 steps 实际完成情况不符 | status=completed 但某步=pending |
| #4 | 参数未生效 | answers 未被步骤引用 | scope=backend 但产出含前端 |
| #5 | 产出偏差 | 实际产出与 expected.yml 不符 | 预期 scope.md 实得 analysis.md |
| #6 | 空跑 | SOP 完成但无变更 | git diff 无差异 |

### 9.3 深度审查分发逻辑

```
  function dispatchDeepReview(verifyContext):
    agents = []
    if hasOutput("scope.md"):  agents.append("flow-reviewer")
    if hasOutput("review.md"): agents.append("output-reviewer")
    if hasOutput("report.md"): agents.append("quality-reviewer")
    if hasState():             agents.append("state-reviewer")
    if hasAnswers():           agents.append("param-reviewer")
    for agent in agents:
        execute_in_new_context(agent, verifyContext)
    return aggregate(agents)
```

## 10. 缺陷与缺口分析

### 10.1 优先级排序

| 优先级 | 缺陷 | 影响 | 涉及文件 | 修复难度 |
|--------|------|------|---------|---------|
| P0 | STEPS.md 缺失 (26/27) | 执行依赖 AI 解读,不稳定 | .claude/skills/*/STEPS.md | 中 |
| P0 | 命令注册缺失 (8/21) | 8 个 SOP 无法 /sop 触发 | opencode.json, CLAUDE.md | 低 |
| P0 | expected.yml 缺失 (22/27) | verify 只能 fallback | .claude/skills/*/expected.yml | 低 |
| P1 | deep_review 分发未自动化 | 手动触发 subAgent | sop-verify.ts | 高 |
| P1 | state 脚本无单元测试 | 回归风险 | .claude/scripts/sop-state-*.ts | 中 |
| P1 | 3 个 skill 未注册 | 功能不可用 | opencode.json | 低 |
| P2 | Graphify 无降级策略 | 外部工具不可用即时 workflow 中断 | 所有迭代 SOP | 低 |
| P2 | 跨 SOP 无契约 | 上游变化下游不感知 | STEPS.md + expected.yml | 高 |
| P2 | 评分权重未校验 | 权重未经实证 | DSL.md | 中 |

### 10.2 详细缺陷表

| ID | 类别 | 缺陷 | 状态 | 影响 | 建议修复 |
|----|------|------|------|------|---------|
| D01 | 步骤定义 | 26/27 无 STEPS.md | 缺失 | 执行稳定性 | 为 Top 5 补充 |
| D02 | 命令路由 | 8 个命令未注册 | 缺失 | 体验一致性 | 补充 8 个注册 |
| D03 | 预期定义 | 22/27 无 expected.yml | 缺失 | 验证准确性 | 为常用 SOP 补充 |
| D04 | 分发自动化 | deep_review 手动 | 半自动 | 验证效率 | sop-verify.ts 集成 |
| D05 | 测试覆盖 | state 脚本无测试 | 无覆盖 | 回归风险 | 添加 vitest 单测 |
| D06 | Skill 注册 | 3 个 skill 未注册 | 缺失 | 功能不可用 | skill + opencode.json |
| D07 | 外部依赖 | Graphify 无降级 | 脆弱 | workflow 韧性 | fallback 策略 |
| D08 | 跨 SOP 契约 | 无接口契约 | 缺失 | 集成风险 | expected.yml 产出格式 |
| D09 | 评分验证 | 权重未验证 | 未验证 | 评分准确性 | 数据驱动调整 |
| D10 | STEPS.md | 仅 1/27 有 | 缺失 | 步骤精度 | 为关键 SOP 补充 |
| D11 | Graphify 集成 | 仅 5/21 | 部分 | 依赖分析覆盖 | 扩展更多 SOP |
| D12 | 产出规范 | 路径不一致 | 不一致 | 可发现性 | 统一规范 |

### 10.3 修复路线图

```
  Phase 1: P0 - 体验一致性 (最快见效)
    + 补充 8 个缺失命令注册
    + 注册 3 个缺失 skill
    + 为 Top 5 SOP 补充 expected.yml

  Phase 2: P1 - 执行可靠性
    + 为关键 SOP 写 STEPS.md (scaffold, bug-fix, code-review, prd)
    + 添加 state 脚本单元测试
    + sop-verify.ts 自动化 deep_review 分发

  Phase 3: P2 - 系统韧性
    + Graphify 降级策略
    + 跨 SOP 产出契约
    + 评分权重实证验证
```

### 10.4 修复收益

| Phase | 修复项 | 预估 | 收益 | ROI |
|-------|--------|------|------|-----|
| P0 | 命令注册+skill | 1-2 请求 | 体验统一 | 五星 |
| P0 | expected.yml x5 | 1-2 请求 | verify 覆盖率+19% | 五星 |
| P1 | STEPS.md x4 | 2-3 请求 | 执行准确度+50% | 四星 |
| P1 | 状态脚本测试 | 1 请求 | 回归安全保障 | 三星 |
| P2 | Graphify 降级 | 1 请求 | 系统韧性 | 二星 |

## 11. 系统完整度评估

### 11.1 总体统计

| 指标 | 数值 | 覆盖率 |
|------|------|--------|
| SOP 技能总数 | 27 | 100% |
| 命令注册数 | 13/21 | 62% |
| SKILL.md 完成 | 27/27 | 100% |
| STEPS.md 完成 | 1/27 | 3.7% |
| expected.yml 完成 | 5/27 | 18.5% |
| state 脚本 | 4/4 | 100% (已编写) |
| state 脚本测试 | 0/4 | 0% |
| Graphify 集成 SOP | 5/21 | 24% |
| review subAgent | 5/5 | 100% |
| 端到端验证通过 | 1 | (code-review) |

### 11.2 分层完整度

| 层级 | 组件 | 完成度 | 状态 |
|------|------|--------|------|
| 命令层 | opencode.json 路由 | 62% | P0 缺陷 |
| 执行层 | Step 引擎 | 约 80% | P0 缺陷 |
| 持久化层 | State 脚本 | 100% 编写 | 但无测试 |
| 验证层 | Verify 引擎 | 约 90% | P1 缺陷 |
| 分析层 | Graphify 集成 | 24% | P2 缺口 |
| 知识层 | Knowledge | 基本就绪 | 正常 |

### 11.3 命令注册缺口

缺失的 8 个命令:
- sop-knowledge : 领域知识管理
- sop-library-research : 技术调研
- sop-incident-response : 线上问题响应
- sop-onboarding : 项目入职
- sop-product-analysis : 业务分析
- sop-api-design : API 设计
- sop-database-design : 数据库设计
- sop-test-design : 测试用例设计

缺失的 3 个 skill:
- sop-regression : 回归测试
- sop-test-design : 测试设计
- sop-status : 状态查看

缺失 expected.yml (22 个):
  prd, knowledge, backend-iteration, frontend-iteration,
  fullstack-iteration, incident-response, onboarding,
  product-analysis, api-design, database-design,
  test-design, regression, status, input,
  brainstorm, verify, framework, library-research,
  dependency-analysis, deployment, bug-fix, testing
