# SOP Skill - 标准操作流程

## 概述

通用 SOP Skill，定义标准工作流程。

## 通用原则

### 1. 原子化
- 每个 step 独立完成一件事
- 可单独执行、可复用

### 2. 知识驱动
- 先收集知识，再执行任务
- 引用已有文档，不重复造轮子

### 3. 最小阻塞
- 非核心步骤自动执行
- 核心步骤需确认
- 提供"默认继续"选项

### 4. 状态持久化
- 每个步骤完成后保存状态
- 支持断点续传
- 状态文件：`.sop/state/*.json`

## 触发格式

```
/sop [name]
```

## 输出目录

```
.sop/
├── knowledge/     # 领域知识
├── output/        # 输出文档
└── state/         # 状态文件
```

## 通用工作流

```
用户输入
    ↓
Step 0: 依赖检查
    ↓
Step 1: 理解需求
    ↓
Step 2: 执行任务
    ↓
Step 3: 验证结果
    ↓
Step 4: 输出文档
```

## Skill 规范

### 文件结构

```
.claude/skills/[sop-name]/
├── SKILL.md              # 主文件（必需）
├── references/
│   ├── INDEX.md          # 索引
│   └── *.md              # 规范文档
└── output/               # 可选输出模板
```

### SKILL.md 元数据

```yaml
---
name: [sop-name]
description: [描述]
version: [版本]
triggers:
  - "[触发词]"
  - "/sop [name]"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
execution:
  mode: [sequential|parallel]
  timeout: [毫秒]
---
```

### Step 注释规则

| 标记 | 含义 | 行为 |
|------|------|------|
| `[AUTO]` | 自动执行 | 无需确认 |
| `[CONFIRM_REQUIRED]` | 需确认 | 阻塞等待 |
| `[OPTIONAL]` | 可选 | 用户决定 |

## 状态文件格式

```json
{
  "sop": "[name]",
  "task_id": "[id]",
  "status": "in_progress|completed",
  "current_step": 1,
  "steps": {
    "1_step": {"status": "completed", "timestamp": "..."}
  },
  "data": {}
}
```

## Compact 上下文压缩与恢复

| 场景 | 处理方式 |
|------|----------|
| OpenCode 自动执行 `/compact` | SOP 状态保存在 `.sop/state/` |
| 压缩后首次对话 | 检测进行中的 SOP 任务 |
| 存在恢复点 | 自动恢复到上一步继续执行 |

### 状态恢复检测

每个 SOP 执行前自动检测状态：

```bash
# 检测进行中的任务
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all

# 恢复特定 SOP
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts [sop-name]
```

### 恢复流程

```
新会话开始 / SOP 命令触发
    ↓
检测 .sop/state/ 状态
    ↓
存在 in_progress 任务?
    ↓
┌─ 是 → 自动恢复到 current_step 继续执行
└─ 否 → 从 Step 1 开始执行
```

### 恢复点记录
- `current_step`: 当前步骤序号
- `answers`: 用户确认过的配置（复用）
- `resume_from`: 恢复点标识

## 错误处理

| 错误 | 处理 |
|------|------|
| Agent 失败 | 降级到手动搜索 |
| 构建失败 | 使用 build-error-resolver |
| 测试失败 | 使用 tdd-workflow |

## 完整技能链

```
sop-knowledge (领域知识收集)
       |
       v
sop-prd (生成 PRD：用户故事、验收标准、DoR/DoD)
       |
       v
sop-test-design (需求→测试用例、追溯矩阵)
       |
       v
sop-testing (执行测试：单元→集成→E2E→API→安全→性能)
       |
       v
[代码上线]
       |
       v
sop-regression (持续：变更分析→影响评估→选择性测试→报告)
       |                                   |
       v                                   v
[通过: 发布]                      sop-bug-fix (发现失败时)
```

## 相关

- [sop-knowledge](./sop-knowledge/SKILL.md) - 领域知识收集
- [sop-prd](./sop-prd/SKILL.md) - PRD 生成 (v4.1.0)
- [sop-test-design](./sop-test-design/SKILL.md) - 测试用例设计 (NEW)
- [sop-testing](./sop-testing/SKILL.md) - 测试执行 (v2.0.0)
- [sop-regression](./sop-regression/SKILL.md) - 回归测试 (NEW)
- [sop-bug-fix](./sop-bug-fix/SKILL.md) - Bug 修复
- [sop-code-review](./sop-code-review/SKILL.md) - 代码审查
- [sop-deployment](./sop-deployment/SKILL.md) - 部署发布
- [sop-product-analysis](./sop-product-analysis/SKILL.md) - 产品分析 (v1.3.0)