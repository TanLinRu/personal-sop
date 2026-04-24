# AGENTS.md

## 这是什么项目

**Personal SOP（标准操作流程）技能库**，为 OpenCode/Claude Code 提供工作流自动化技能，用于常见开发场景。

## 关键命令

```bash
# SOP 工作流（来自 opencode.json）
sop prd           # 生成 PRD
sop testing       # 测试流程
sop bug-fix       # Bug 修复（含并行 Agent）
sop code-review   # 代码审查（3 Agent 并行）
sop deployment   # 部署流程
sop scaffold    # 新项目脚手架
sop backend      # 后端迭代
sop frontend    # 前端迭代
sop fullstack    # 全栈迭代（后端+前端）

# 知识库操作
ctx index <source>  # 索引到知识库
ctx query <query>    # 查询知识库
```

## 重要流程顺序

**关键**：任何迭代 SOP 的流程为：

```
需求确认 → 需求调研 → PRD → 架构设计 → 架构审核 → 依赖查询 → 代码生成 → 验证 → 知识更新
```

- PRD 先于架构设计（作为设计锚点）
- 依赖查询在架构审核之后（更精准）

## 技能位置

| 类别 | 技能 | 位置 |
|------|------|------|
| 工作流 | sop-* | `.claude/skills/sop-*/SKILL.md` |
| Java 生成 | dr-jskill | `.claude/skills/dr-jskill/` |
| 前端设计 | frontend-design | `.claude/skills/frontend-design/` |
| 编码规范 | coding-style, testing | `.claude/rules/common/` |

## Context-Mode MCP

已在 opencode.json 配置。知识存储在 `.context-mode/`。生成代码后使用 `ctx index` 更新知识库。

## 子代理

```python
# 来自 opencode.json agents
task(subagent_type="code-reviewer")     # 代码质量
task(subagent_type="java-reviewer")     # Java/Spring 模式
task(subagent_type="security-reviewer") # 安全问题
task(subagent_type="search-first")      # 研究
```

## 前端设计技能

使用 `skill({ name: "frontend-design" })` 生成 UI。需要详细提示词 - 包含组件规格、用户流程和设计约束。

## dr-jskill（Java 项目）

生成 Spring Boot 项目。需要的关键输入：
- 项目名称
- Group ID（com.company）
- Java 版本（11, 17, 21）
- 项目类型（web, api, lib）

## 需要排除的内容

- 通用 Java/Spring 建议 → 见 `.claude/rules/common/coding-style.md`
- 测试模式 → 见 `.claude/rules/common/testing.md`
- 完整技能文档 → 见 CLAUDE.md 引用的各个 SKILL.md
- 设计系统模式 → 见 `.claude/skills/tailwind-design-system/`

## 提交前验证

生成的代码：
1. 编译：`mvn compile`（后端）
2. 测试：`npm run dev`（前端）
3. Bug 修复：验证复现步骤