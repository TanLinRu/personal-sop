---
name: sop-regression
description: 回归测试流程 - 变更分析→影响评估（CodeGraph affected）→用例筛选→执行→报告
version: 2.0.0
triggers:
  - "回归测试"
  - "变更测试"
  - "影响分析"
  - "回归验证"
  - "/sop regression"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: sequential
  timeout: 300000
  checkpoint_dir: .sop/state
  state_file: .sop/state/regression-{id}.json
---

# SOP Regression - 回归测试流程

> **v2.0.0 (2026-06-14)**：用 `codegraph affected` 替代手工 grep 影响分析。CodeGraph 通过 import 链追溯，把"改动文件 → 受影响测试"做成 1 条命令。

## 概述

本 SOP 提供高效的回归测试流程，适用于迭代开发中的持续质量保障。通过 **CodeGraph 知识图谱**分析代码变更、评估影响范围、选择最小测试子集，实现**精准回归**（业内成熟方案：测试影响分析 / Test Impact Analysis）。

## 使用场景

- 功能迭代后的回归验证
- Bug 修复后的回归确认
- 重构后的功能完整性验证
- 发布前的回归测试

## Agent 委托

| Agent | 用途 | 触发时机 |
|-------|------|----------|
| `code-reviewer` | 分析代码变更影响 | 步骤二（影响评估） |
| `tdd-guide` | 执行测试用例 | 步骤四（执行） |
| `security-reviewer` | 安全回归检查 | 步骤四（执行） |

## 前置条件

- 项目有测试用例（来自 sop-test-design 或已有测试）
- 有代码变更（git diff 可用）

## 状态持久化

```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 1_change_analysis in_progress
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 5_report completed
```

---

## Step 1: 变更分析 [AUTO]

**执行内容**：
1. 分析 git diff 识别变更文件
2. 将文件映射到模块/功能
3. 识别变更类型（新功能/Bug修复/重构/配置）

**变更分析命令**：
```bash
# 获取变更文件列表
git diff --name-only HEAD~1

# 获取变更详情
git diff HEAD~1 --stat

# 按目录分组
git diff --name-only HEAD~1 | sed 's|/[^/]*$||' | sort | uniq -c
```

**变更分类**：
| 变更类型 | 影响范围 | 回归策略 |
|----------|----------|----------|
| 新功能 | 新模块 + 依赖模块 | 全量回归新模块 + 依赖模块回归 |
| Bug修复 | 修复模块 + 相关模块 | 修复验证 + 相关功能回归 |
| 重构 | 重构模块 + 调用方 | 功能不变性验证 |
| 配置 | 配置相关功能 | 配置生效验证 |

**输出模板**：
```markdown
## 变更分析摘要

### 变更文件
| 文件 | 模块 | 变更类型 | 影响范围 |
|------|------|----------|----------|
| src/user/UserService.java | 用户模块 | Bug修复 | 登录、注册 |
| src/order/OrderController.java | 订单模块 | 新功能 | 订单创建 |

### 变更统计
- 变更文件数: 5
- 影响模块数: 2
- 变更类型: Bug修复(1), 新功能(1)
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 1_change_analysis completed
```

---

## Step 2: 影响评估 (CodeGraph Affected) [CONFIRM_REQUIRED]
> **auto_default**: precise

> **v2.0.0**：直接用 `codegraph affected` 自动得出受影响测试集。Test Impact Analysis (TIA) 业界最佳实践。

**执行内容**：
1. 用 CodeGraph 追溯 import 链，自动得出受影响测试文件
2. 评估风险等级（高/中/低）
3. 展示影响摘要供用户确认

**核心命令**：

```bash
# CodeGraph (一等公民) — 这是 v2.0.0 的核心升级
git diff --name-only HEAD~1 | codegraph affected --stdin --json > .sop/state/affected.json

# 默认按文件名约定识别测试文件 (*.test.ts / *Test.java / *_test.go / test_*.py)
# 自定义测试文件 glob：
git diff --name-only HEAD~1 | codegraph affected --stdin --filter "**/*IntegrationTest.java" --json

# 限制依赖深度（默认 5）：
git diff --name-only HEAD~1 | codegraph affected --stdin --depth 3 --json
```

**降级路径**（CodeGraph 不可用时）：

```bash
# Graphify 兼容
graphify query "影响测试集" --files $(git diff --name-only HEAD~1)

# Grep 兜底（精度低）
for f in $(git diff --name-only HEAD~1); do
  base=$(basename "$f" | sed 's/\.[^.]*$//')
  grep -rl "import.*$base\|require.*$base" --include='*Test.*' --include='*.test.*' --include='*.spec.*' .
done | sort -u
```

**输出 JSON 结构**（codegraph affected --json）：

```json
{
  "changed_files": ["src/main/java/.../OrderService.java"],
  "affected_tests": [
    "src/test/java/.../OrderServiceTest.java",
    "src/test/java/.../OrderControllerIntegrationTest.java"
  ],
  "depth_max": 3,
  "test_count": 2
}
```

**影响评估矩阵**：
```markdown
## 影响评估（codegraph affected）

### 直接影响
| 变更模块 | 影响模块 | 影响类型 | 风险等级 |
|----------|----------|----------|----------|
| UserService | AuthService | 接口调用 | 高 |
| UserService | UserController | 数据流 | 中 |

### 间接影响（CodeGraph 自动追溯）
| 影响链 | depth | 风险等级 | 说明 |
|--------|-------|----------|------|
| UserService → AuthService → SecurityFilter | 2 | 高 | 认证链路 |

### 受影响测试集（精确）
- src/test/.../UserServiceTest.java (depth=1)
- src/test/.../AuthServiceTest.java (depth=2)
- src/test/.../SecurityFilterTest.java (depth=3)

### 风险等级定义
| 等级 | 条件 | 回归范围 |
|------|------|----------|
| 高 | 核心模块/认证/支付/数据流 | 全量回归 |
| 中 | 一般业务模块 | codegraph affected 输出 |
| 低 | 工具类/配置/文档 | 变更验证 |
```

**AskUserQuestion**：
```javascript
AskUserQuestion({
  question: "影响评估完成，回归范围如何？",
  header: "回归范围",
  options: [
    { label: "精准回归（推荐）", description: "执行 codegraph affected 输出的测试集" },
    { label: "全量回归", description: "执行所有测试用例（高风险变更建议）" },
    { label: "最小回归", description: "仅执行直接变更的测试" }
  ],
  multiSelect: false
})
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 2_impact_assessment completed \
  affected_count={N} engine={codegraph|graphify|grep}
```

---

## Step 3: 测试用例筛选 [AUTO]

**执行内容**：
1. 加载 Step 2 输出的 `affected.json`
2. 与已有测试用例库存合并去重
3. 应用风险优先级排序

**测试用例来源**：
```bash
# Step 2 已输出受影响测试集
cat .sop/state/affected.json | jq -r '.affected_tests[]'

# 补充：sop-test-design 输出
Glob(pattern=".sop/output/test-cases-*.md")

# 项目已有测试（与 affected.json 取交集）
Glob(pattern="**/*Test.java")
Glob(pattern="**/*.test.ts")
Glob(pattern="**/*.spec.ts")
```

**筛选策略**：
| 回归范围 | 筛选规则 |
|----------|----------|
| 精准回归（默认）| `codegraph affected` 输出 + Step 2 高风险标记的额外用例 |
| 全量回归 | 所有测试用例 |
| 最小回归 | 直接变更模块的测试用例（depth=1） |

**筛选结果模板**：
```markdown
## 测试用例筛选结果

### 选中用例
| 用例ID | 模块 | 优先级 | 选中原因 |
|--------|------|--------|----------|
| TC-001 | 用户模块 | P0 | 直接影响 |
| TC-002 | 用户模块 | P1 | 直接影响 |
| TC-010 | 订单模块 | P0 | 间接影响 |

### 统计
- 总用例数: 50
- 选中用例: 15
- 覆盖率: 30%
- 预计执行时间: 5分钟
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 3_test_selection completed
```

---

## Step 4: 执行 [AUTO]

**执行内容**：
1. 自动检测项目测试框架
2. 执行选中的测试用例
3. 捕获结果、耗时、失败信息

**测试框架检测**：
| 项目文件 | 测试框架 | 执行命令 |
|----------|----------|----------|
| pom.xml | JUnit 5 | `mvn test` |
| build.gradle | JUnit 5 | `gradle test` |
| package.json (jest) | Jest | `npm test` |
| package.json (vitest) | Vitest | `npx vitest run` |
| requirements.txt | pytest | `pytest` |
| playwright.config.ts | Playwright | `npx playwright test` |

**执行结果捕获**：
```markdown
## 执行结果

### 测试结果
| 用例ID | 名称 | 结果 | 耗时 | 错误信息 |
|--------|------|------|------|----------|
| TC-001 | 用户登录 | ✅ PASS | 0.5s | - |
| TC-002 | 用户注册 | ❌ FAIL | 1.2s | AssertionFailed |
| TC-003 | 密码重置 | ✅ PASS | 0.8s | - |

### 统计
- 执行用例: 15
- 通过: 13
- 失败: 2
- 跳过: 0
- 总耗时: 12.5s
- 通过率: 86.7%
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 4_execution completed
```

---

## Step 5: 报告 [AUTO] [VERIFY]

**执行内容**：
1. 生成回归测试报告
2. 分析失败原因
3. 提供修复建议
4. 保存状态

**报告模板**：
```markdown
# 回归测试报告

## 概述
- **项目**: {项目名称}
- **执行时间**: {时间}
- **变更范围**: {模块列表}
- **回归范围**: {全量/选择性/最小}

## 执行摘要
| 指标 | 值 |
|------|-----|
| 执行用例 | 15 |
| 通过 | 13 |
| 失败 | 2 |
| 通过率 | 86.7% |
| 总耗时 | 12.5s |

## 失败用例分析
| 用例 | 失败原因 | 影响范围 | 修复建议 |
|------|----------|----------|----------|
| TC-002 | 断言失败: 期望状态ACTIVE但获取INACTIVE | 用户注册流程 | 检查UserService状态设置逻辑 |
| TC-008 | 超时: 响应超过3秒 | 订单查询 | 优化数据库查询 |

## 影响分析
- **高风险**: 用户注册流程受影响
- **中风险**: 订单查询性能下降
- **建议**: 修复失败用例后重新回归

## 建议
1. 修复 TC-002 和 TC-008
2. 运行 `/sop bug-fix` 处理失败用例
3. 修复后重新运行 `/sop regression` 验证
```

**交接到 sop-bug-fix**：
```
发现 2 个失败用例，运行 `/sop bug-fix` 修复。
失败用例: TC-002, TC-008
```

**状态更新**：
```bash
npx ts-node --transpile-only .claude/scripts/sop-state-save.ts regression 5_report completed
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| **CodeGraph 未安装** | 降级到 Graphify → Grep（详见 sop-dependency-analysis v3.0.0 双层降级）|
| **`.codegraph/` 未初始化** | 自动 `codegraph init`（首次需要 ~30s） |
| 无测试用例 | 提示先运行 `/sop test-design` 或 `/sop testing` |
| 测试框架未安装 | 提示安装命令 |
| 测试执行超时 | 增加超时限制，记录超时用例 |
| 全部通过 | 输出通过报告，建议发布 |
| 失败率 > 50% | 建议暂停发布，全面检查 |

---

## 相关技能

| 技能 | 关系 | 说明 |
|------|------|------|
| sop-test-design | 上游 | 提供测试用例库存 |
| sop-testing | 上游 | 提供测试基础设施 |
| sop-bug-fix | 下游 | 失败时触发 |
| sop-backend-iteration | 联动 | 后端迭代回归 |
| sop-frontend-iteration | 联动 | 前端迭代回归 |
