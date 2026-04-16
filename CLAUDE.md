# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **SOP (Standard Operating Procedure) Design Document** project. It contains comprehensive design documents for standardizing software development workflows using Everything Claude Code (ECC) skills and agent orchestration.

The core design document is `SOP流程设计思想.md`, which outlines:
- Why and how to abstract SOP skills
- Design principles and core mechanisms
- Detailed SOP skill definitions (Bug Fix, Code Review, Library Research, Onboarding, Incident Response, Scaffold)
- Collaboration between SOP skills
- Implementation recommendations
- Cross-platform deployment guide (Claude Code + OpenCode)

## No Build/Run Commands

This is a **documentation-only project**. There are no build commands, tests, or runtime requirements. The project consists solely of markdown design documents.

## Architecture

### SOP Skill System

The project designs 6 core SOP skills that can be orchestrated with existing ECC skills:

| SOP Skill | Purpose | Key Steps |
|-----------|---------|-----------|
| Bug Fix | Standard bug fixing workflow | Reproduce → Locate → Fix → Verify → Test |
| Code Review | Standard code review workflow | Understand → Format → Test → Security → Feedback |
| Library Research | Technology research workflow | Search → Verify → Compatible → Risk → Summary |
| Onboarding | Project onboarding workflow | Setup → Clone → Test → Explore → Task |
| Incident Response | Production incident handling | Collect → Reproduce → Locate → Fix → Verify → Report |
| Scaffold | Project scaffolding generation | Analyze → Backend → Frontend → API Doc → Integration → Verify |

### Cross-Platform Support

The SOP skills are designed to work on both Claude Code and OpenCode:

| Platform | Skill Location | Trigger Method |
|----------|---------------|----------------|
| Claude Code | `.claude/skills/` | `/sop <name>` |
| OpenCode | `.opencode/skills/` | `skill({ name: "sop-..." })` |

### Agent Orchestration

Each SOP coordinates with existing ECC skills:

- **Explore Agent**: Search and analyze (read-only)
- **General Agent**: General task execution
- **Plan Agent**: Architecture design and planning

Referenced ECC skills: `search-first`, `code-tour`, `python-review`, `rust-review`, `go-review`, `python-testing`, `rust-testing`, `go-testing`, `security-review`, `documentation-lookup`, `codebase-onboarding`, `api-design`, `backend-patterns`, `tdd-workflow`, `coding-standards`.

## Key Design Principles

1. **Agent Orchestration**: Each SOP delegates to specialized agents (not do everything itself)
2. **Review Mechanism**: Core workflows require cross-agent review
3. **Documentation**: Every step produces status documents in `.sop/output/`
4. **Hybrid Triggering**: Slash commands (`/sop xxx`) + AI auto-recommendation
5. **Extensibility**: SOPs can reference each other and integrate new ECC skills

## Memory System

The design includes a 3-tier memory mechanism:
- **L1**: Cross-session memory (general patterns, common issues) - 30 days TTL
- **L2**: Project-level cache (`.sop/cache/`) - 7 days TTL
- **L3**: Session output (`.sop/output/{session}/`) - permanent

## Cursor/Copilot Rules

None exist in this project.

## Key Files

- `SOP流程设计思想.md` - Main design document (Chinese, ~1200 lines)
- `CLAUDE.md` - This file
- `.claude/skills/sop-*/SKILL.md` - Implemented SOP skills (6 files)

## Implemented SOP Skills

| Skill | Location | Steps |
|-------|----------|-------|
| sop-bug-fix | `.claude/skills/sop-bug-fix/SKILL.md` | 5 steps |
| sop-code-review | `.claude/skills/sop-code-review/SKILL.md` | 5 steps |
| sop-library-research | `.claude/skills/sop-library-research/SKILL.md` | 5 steps |
| sop-onboarding | `.claude/skills/sop-onboarding/SKILL.md` | 5 steps |
| sop-incident-response | `.claude/skills/sop-incident-response/SKILL.md` | 6 steps |
| sop-scaffold | `.claude/skills/sop-scaffold/SKILL.md` | 6 steps |

## Usage Notes

When working on related projects:
- This design can be used as a template for creating new SOP skills
- SOP skills should be deployed to `.claude/skills/sop-*/SKILL.md`
- Status documents output to `.sop/output/` directory
- Review existing ECC skills at `everything-claude-code/.agents/skills/` before implementing new SOPs

## Trigger Commands

```
/sop bug-fix         # 标准 Bug 修复流程
/sop code-review     # 标准代码审查流程
/sop library-research # 标准技术调研流程
/sop onboarding      # 标准项目入职流程
/sop incident-response # 标准线上问题响应流程
/sop scaffold        # 前后端脚手架生成流程
```