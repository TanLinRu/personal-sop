# 脑暴报告：SOP 反模式验证

## 基本信息
- **日期**: 2026-05-21
- **方法**: 六顶思考帽
- **目标**: 可行的实现方案列表（3-5 方案）
- **约束**: 优先全面覆盖

## 发散阶段
总想法数: 8 个方案 ／ 6 类反模式 ／ 8 个审查 Agent

### 六顶思考帽记录

#### ⬜ 白帽 — 事实与数据
- 当前 SOP 共 13 个，覆盖全流程（scaffold → code-review → testing → deployment）
- 现有框架：step-map 定义步骤、state 管理状态、断点恢复
- **核心痛点：执行后缺乏自动化审查，优化全靠人肉**

#### 🔴 红帽 — 直觉与感受
- 担心：Agent 跳过步骤、状态丢失、顺序错乱、参数篡改
- **最大风险：执行流程及产出可能存在偏差**

#### ⬛ 黑帽 — 风险与问题（6 类反模式）
| # | 反模式 | 描述 |
|---|--------|------|
| 1 | 步骤跳过 | 执行的步骤与 step-map 定义不符 |
| 2 | 顺序颠倒 | 步骤执行顺序与定义顺序不一致 |
| 3 | 状态与执行不一致 | state 标记 completed 但实际没产出 |
| 4 | 参数未生效 | 用户填的参数在执行中丢失或没用 |
| 5 | 产出偏差 | 产出文档/代码与预期目标不符 |
| 6 | 空跑/无实际输出 | SOP 跑完了但什么都没产生 |

#### 🟡 黄帽 — 价值与收益
- **最大价值：审计合规** — 每次 SOP 执行都有完整验证记录

#### 🟩 绿帽 — 创意方案（5 个方案）
| # | 方案 | 描述 | 优先级 |
|---|------|------|--------|
| A | 执行后验证报告 | 跑完后自动对比 step-map/state/产出 | P0 |
| B | 实时校验引擎 | 每一步执行时实时校验 | P2 |
| C | SOP 预检 | 执行前检查上下文完整性 | P1 |
| D | 反模式规则 DSL | 声明式 YAML 定义正确执行标准 | P0 |
| E | 执行录像回放 | 记录关键事件日志，事后回放分析 | P3 |

#### 🟦 蓝帽 — 收敛确认
- **补充方向**：构建反模式审查 Agent 群体，站在不同视角审核
- **最终方案 = 方案 A + 方案 D + Agent 群体**

## 收敛阶段

### 方案决策

```
综合方案: SOP Execution Verification (SEV)
├── DSL 层: 每个 SOP 定义 expected.yml（预期产出/步骤/参数）
├── 引擎层: 执行后自动运行基础验证（步骤/产出/状态/参数）
├── Agent 层: 分发 8 个 subAgent 深度审查
│   ├── flow-reviewer      → 流程合规
│   ├── output-reviewer    → 产出完整性
│   ├── param-reviewer     → 参数一致性
│   ├── state-reviewer     → 状态一致性
│   ├── security-reviewer  → 安全审查
│   ├── quality-reviewer   → 质量审查
│   ├── code-reviewer      → 代码审查
│   └── arch-reviewer      → 架构审查
└── 报告层: 聚合生成总报告
```

### 推荐优先实施（P0）

| 方案 | 可行性 | 创新性 | 影响度 | 说明 |
|------|--------|--------|--------|------|
| DSL 定义 expected.yml | 高 | 中 | 高 | 基础，不做好别的没法做 |
| 基础验证引擎 | 高 | 低 | 高 | 4 项自动检查，快速出价值 |
| flow-reviewer Agent | 高 | 中 | 高 | 步骤顺序检查，直接解决核心痛点 |
| output-reviewer Agent | 高 | 中 | 高 | 产出完整性，审计刚需 |

### 可考虑（P1-P2）

| 方案 | 备注 |
|------|------|
| param-reviewer + state-reviewer | 参数和状态一致性，执行过程可信 |
| security-reviewer（复用现有） | 复用现有 security-reviewer agent |
| quality-reviewer | 需要定义更细化的质量标准 |

### 暂缓/淘汰

| 方案 | 原因 |
|------|------|
| 实时校验引擎（方案 B） | 侵入性大，需要改造所有 SOP 执行流程 |
| 执行录像回放（方案 E） | 存储和实现成本高，价值不如前置验证 |

## 已完成的交付物

基于脑暴结果，已经创建：

| 文件 | 说明 |
|------|------|
| `.claude/skills/sop-verification/SKILL.md` | 反模式验证主技能框架 |
| `.claude/skills/sop-verification/references/DSL.md` | expected.yml YAML Schema + 3 个 SOP 示例 |
| `.claude/skills/sop-verification/references/REVIEWER-AGENTS.md` | 8 个审查 Agent 定义 + 分发策略 |
| `.opencode/opencode.json` | 注册了 5 个新 subAgent + `/sop verify` 命令 |
| `.claude/scripts/sop-step-map.json` | 注册 `verify` 5 步骤流程 |
| `CLAUDE.md` + `AGENTS.md` | 文档同步注册 |

## 下一步行动

- [ ] 为现有 13 个 SOP 编写 `expected.yml`（从 DSL 示例开始）
- [ ] 实现验证引擎脚本 `.claude/scripts/sop-verify.ts`
- [ ] 实现 `/sop verify` 命令的 SOP 步骤 SKILL.md
- [ ] 试点 SOP: code-review（已有完整 step-map + 产出）
