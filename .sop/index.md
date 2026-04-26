# SOP 知识索引

> 所有 SOP 产出文档的统一入口，支持快速检索和导航。

## 目录结构

```
.sop/
├── knowledge/              # 领域知识（待创建）
├── state/                # SOP 执行状态文件
├── output/               # 产出文档
└── index.md             # 本索引
```

## 快速导航

| 类别 | 路径 | 说明 |
|------|------|------|
| ⚡ 状态文件 | `.sop/state/*` | SOP 断点恢复状态 |
| 🔗 依赖图谱 | `.sop/dependency-graph/*` | 后端/前端代码图谱 |
| 📋 计划与评估 | `.sop/output/*_Plan.md` | 优化计划、评估报告 |
| 🔧 技术调研 | `.sop/output/*Research*.md` | 技术选型、架构设计 |
| 📚 框架学习 | `.sop/output/*QuickStart*.md` | 快速入门指南 |
| ⚠️ 常见错误 | `.sop/output/common-mistakes/` | 框架常见错误 |
| 🏗️ 脚手架 | `.sop/output/*Scaffold*.md` | 项目初始化报告 |

---

## 文档清单

### 1. 计划与评估
```
.sop/output/
├── SOP_Skills_Evaluation_Report.md    # SOP 评估报告
└── SOP_Skills_Optimization_Plan.md    # 优化计划
```

### 2. 状态文件 ⚡
```
.sop/state/
├── scaffold-20260425-001.json     # scaffold SOP 状态
├── backend-20260425-001.json    # 后端迭代状态
└── frontend-20260425-001.json # 前端迭代状态
```

> 断点恢复：检查 `status=in_progress` 的文件，从 `current_step` 继续

### 状态管理脚本

```bash
# 保存状态（Step 开始/完成）
node .claude/scripts/sop-state-save.ts <sop> <step> <status>
node .claude/scripts/sop-state-save.ts testing 1_confirm in_progress project=chatbot
node .claude/scripts/sop-state-save.ts testing 1_confirm completed

# 加载状态（断点恢复）
node .claude/scripts/sop-state-load.ts <sop>
node .claude/scripts/sop-state-load.ts testing

# 查看所有状态
node .claude/scripts/sop-state-load.ts --list

# 清理完成状态
node .claude/scripts/sop-state-clean.ts           # 清理 completed/failed
node .claude/scripts/sop-state-clean.ts --all   # 清理所有
node .claude/scripts/sop-state-clean.ts testing # 清理 testing 状态
```

| 脚本 | 用途 |
|------|------|
| `sop-state-save.ts` | 保存步骤状态、用户答案 |
| `sop-state-load.ts` | 加载断点、查看进度 |
| `sop-state-clean.ts` | 清理完成/失败状态 |

### 2. 技术调研
```
.sop/output/
├── Library_Research_GameRiskControl.md # 游戏风控技术调研
├── RuleEngine_ML_Research.md           # 规则引擎与ML调研
└── Scaffold_GameRiskControl.md         # 脚手架生成报告
```

### 3. 框架学习
```
.sop/output/
├── LiteFlow_QuickStart.md              # LiteFlow 快速入门
├── LiteFlow_Integration.md             # LiteFlow 集成实施报告
└── LiteFlow_Integration.md             # LiteFlow 集成失败总结
```

### 4. 常见错误（Common Mistakes）
```
.sop/output/common-mistakes/
├── INDEX.md                            # 本索引
└── LiteFlow_CommonMistakes.md          # LiteFlow 常见错误（7个）
```

---

## 检索指南

### 按框架查找
```bash
# 查找某个框架的所有文档
ls .sop/output/ | grep -i "框架名"
ls .sop/output/common-mistakes/ | grep -i "框架名"
```

### 按类型查找
```bash
# 技术调研报告
ls .sop/output/*Research*.md

# 快速入门指南
ls .sop/output/*QuickStart*.md

# 脚手架报告
ls .sop/output/*Scaffold*.md
```

### 按时间查找
```bash
# 查看最近的产出
ls -lt .sop/output/*.md | head -10
```

---

## SOP 联动流程

### 场景一：全新项目
```
sop-product-analysis (业务分析)
    ↓
sop-scaffold (生成脚手架)
    ↓
sop-onboarding (项目入职)
```

### 场景二：技术选型
```
sop-library-research (含业务分析)
    ↓
sop-knowledge (学习框架)
    ↓
sop-bug-fix (修复问题)
```

### 场景三：问题处理
```
sop-incident-response (线上故障)
    ↓
sop-bug-fix (修复Bug)
    ↓
sop-code-review (代码审查)
```

---

## 贡献指南

### 新增文档命名规范
```
{类型}_{项目名}.md

示例：
- Library_Research_GameRiskControl.md
- LiteFlow_QuickStart.md
- Incident_Report_20260101.md
```

### Common Mistakes 命名规范
```
{框架名}_CommonMistakes.md

示例：
- LiteFlow_CommonMistakes.md
- SpringBoot_CommonMistakes.md
- Vue3_CommonMistakes.md
```

---

## 多agent并发支持 ⭐

SOP skill 已支持多agent并行执行，同时兼容 Claude Code 和 OpenCode。

### 支持的SOP

| SOP | 执行模式 | 并行任务 |
|-----|----------|----------|
| sop-code-review | parallel | 格式检查、安全评估、性能分析 |
| sop-incident-response | hybrid | 日志收集、代码分析、监控分析 |
| sop-library-research | parallel | 文档搜索、示例验证、风险评估 |

### 执行模式说明

| 模式 | 说明 |
|------|------|
| `parallel` | 完全并行执行 |
| `hybrid` | 部分并行，部分串行 |
| `sequential` | 串行执行 |

### Agent 映射

```yaml
# Claude Code → OpenCode 映射
code-reviewer: code_review
security-reviewer: security_scan
java-reviewer: java_review
search-first: search_first
architect: architect
```

---

## 常用命令

```bash
# 查看所有状态文件（断点恢复）
ls -la .sop/state/

# 查看进行中的 SOP
ls .sop/state/*-in_progress.json

# 查看所有产出文档
ls -la .sop/output/

# 查看某个类别的文档
ls .sop/output/common-mistakes/

# 搜索特定内容
grep -r "关键词" .sop/output/

# 查看最近的更新
git log --oneline .sop/output/ | head -10
```

---

*最后更新：2026-04-18*
*如需更新本索引，请编辑 `.sop/index.md`*