# Personal SOP

AI Agent 工作流标准操作程序设计文档。

## 项目概述

本项目设计了一套基于 AI Agent 的 SOP（标准操作程序）系统，用于标准化软件开发常见工作流程。通过编排现有 ECC Skills，实现端到端的自动化处理。

## 核心 SOP

| SOP | 用途 |
|-----|------|
| Bug Fix | 标准 Bug 修复流程 |
| Code Review | 代码审查流程 |
| Library Research | 技术调研流程 |
| Onboarding | 项目入职流程 |
| Incident Response | 线上故障处理 |
| Scaffold | 项目脚手架生成 |

## 关键文件

- `SOP流程设计思想.md` — 核心设计文档
- `CLAUDE.md` — Claude Code 使用指南
- `AGENTS.md` — OpenCode 使用指南

## 架构

```
SOP → 编排现有 ECC Skills → 产出状态文档
```

每个 SOP 会调用专门的 Agent 完成子任务：
- Explore Agent → 搜索分析
- General Agent → 通用执行
- Plan Agent → 架构设计

状态文档输出至 `.sop/output/`

## 使用方式

Claude Code: `/sop <name>`

## 平台支持

- Claude Code (`.claude/skills/sop-*/`)
- OpenCode (`.opencode/skills/sop-*/`)