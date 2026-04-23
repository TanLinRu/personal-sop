# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Personal SOP (Standard Operating Procedure) Skill Library** - a collection of standardized workflow skills for Claude Code. It provides structured automation for common development scenarios including bug fixing, code review, technical research, project scaffolding, and incident response.

## Available Skills

### SOP Workflow Skills

Trigger via `/sop <skill-name>`:

| Skill | Command | Purpose | Confirmation Points |
|-------|---------|---------|---------------------|
| sop-framework | - | Core execution framework | - |
| sop-bug-fix | `/sop bug-fix` | Standard bug fixing workflow | Steps 1, 3 |
| sop-code-review | `/sop code-review` | Code review with parallel checks | Steps 1, 5 |
| sop-library-research | `/sop library-research` | Technology evaluation | Steps 0, 5 |
| sop-onboarding | `/sop onboarding` | Project onboarding | Steps 1, 5 |
| sop-incident-response | `/sop incident-response` | Production incident handling | Step 2 |
| sop-scaffold | `/sop scaffold` | Project scaffolding | Step 1 |
| sop-product-analysis | `/sop product-analysis` | Business analysis | Step 1 |
| sop-knowledge | `/sop knowledge` | Framework learning | Steps 1, 7 |
| sop-testing | `/sop testing` | Testing workflow | All AUTO |
| sop-deployment | `/sop deployment` | Deployment workflow | All AUTO |
| sop-api-design | `/sop api-design` | API design | - |
| sop-database-design | `/sop database-design` | Database design | - |
| sop-backend-iteration | `/sop backend-iteration` | Backend development iteration | - |
| sop-frontend-iteration | `/sop frontend-iteration` | Frontend development iteration | - |
| sop-fullstack-iteration | `/sop fullstack-iteration` | Fullstack development iteration | - |

### Integrated External Skills

| Skill | Location | Purpose |
|-------|----------|---------|
| dr-jskill | `.claude/skills/dr-jskill/` | Spring Boot project generation, JDTLS navigation, Docker support |
| frontend-design | `.claude/skills/frontend-design/` | Production-grade frontend interfaces |
| tailwind-design-system | `.claude/skills/tailwind-design-system/` | Tailwind CSS v4 patterns |

## Execution Modes

**Confirm mode (default)**: User confirms at marked steps before proceeding.
**Auto mode**: Use `/sop xxx --auto` to run without confirmation.

Step markers:
- `⭐ [CONFIRM_REQUIRED]` - Core decision points requiring user confirmation
- `[AUTO]` - Automatic execution steps
- `[INFO]` - Informational content
- `[VERIFY]` - Verification/checkpoint steps

## Architecture

### Skill Structure

Each SOP skill is a directory under `.claude/skills/` containing:
- `SKILL.md` - Skill definition with frontmatter and workflow
- `references/` - Supporting documentation (optional)

### SOP Framework

The `sop-framework` skill provides unified execution patterns:
- Core steps pause for user confirmation
- Non-core steps execute automatically
- Supports mode switching between confirm/auto

### Multi-Agent Execution

Some SOPs support parallel task execution:

| SOP | Mode | Parallel Tasks |
|-----|------|----------------|
| sop-code-review | parallel | Format, Security, Performance |
| sop-incident-response | hybrid | Collect, Reproduce, Analyze |
| sop-bug-fix | parallel | Search, Analyze |
| sop-library-research | parallel | Search, Verify, Risk |

### Output Structure

SOP execution outputs go to `.sop/output/`:
```
.sop/output/
├── {SOP_Name}_{Project}.md    # Main output
├── common-mistakes/           # Error documentation
└── index.md                   # Output index
```

## Cross-Platform Support

This project supports both **Claude Code** and **OpenCode**:

| Platform | Skill Location | Command |
|----------|----------------|---------|
| Claude Code | `.claude/skills/` | `/sop <name>` |
| OpenCode | `.opencode/skills/` | `skill({ name: "sop-xxx" })` |

## Usage Guide

| Scenario | Recommended SOP |
|----------|-----------------|
| New project | sop-product-analysis → sop-scaffold |
| Bug fixing | sop-bug-fix |
| Code review | sop-code-review |
| Technology evaluation | sop-library-research |
| Project onboarding | sop-onboarding |
| Production incident | sop-incident-response |
| Framework learning | sop-knowledge |
| Testing | sop-testing |
| Deployment | sop-deployment |

## Key Design Principles

1. **Confirmation Points**: Critical decisions require user approval
2. **Agent Orchestration**: Each SOP delegates to specialized agents (code-reviewer, security-reviewer, etc.)
3. **Documentation**: Every step produces state documents for traceability
4. **Parallel Execution**: Independent tasks run concurrently when possible
5. **Mode Switching**: Toggle between confirm and auto modes

## Agent Mapping (for OpenCode compatibility)

```yaml
code-reviewer: code_review
security-reviewer: security_scan
java-reviewer: java_review
search-first: Task(Explore)
architect: Task(Plan)
```

## Karpathy Coding Principles

Each SOP embeds these principles:
1. **Think Before Coding** - Clarify before assuming
2. **Simplicity First** - Minimum viable implementation
3. **Surgical Changes** - Precise, targeted modifications
4. **Goal-Driven** - Outcome-focused not task-listing

## References

- Skill definitions: `.claude/skills/*/SKILL.md`
- dr-jskill references: `.claude/skills/dr-jskill/references/`
- SOP design philosophy: `SOP流程设计思想.md`
- SOP output index: `.sop/index.md`
