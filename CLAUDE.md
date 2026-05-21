# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal SOP Skill Library — a collection of standardized workflow skills for Claude Code. It provides structured automation for common development scenarios: bug fixing, code review, technical research, project scaffolding, and incident response.

The project has two main deliverables:
1. **SOP Skills** — workflow automation definitions under `.claude/skills/`
2. **delivery-staff** — a reference Spring Boot + Vue 3 application used as a scaffold target

## Quick Reference Commands

### delivery-staff Backend (Spring Boot 3.5.14, Java 21)
```bash
cd delivery-staff && mvn compile              # Compile
cd delivery-staff && mvn spring-boot:run      # Dev server on :8080
# Kill: Get-NetTCPConnection -LocalPort 8080 | Stop-Process -Force
```

### delivery-staff Frontend (Vue 3 + Vite + Naive UI)
```bash
cd delivery-staff-frontend && npm run dev     # Dev server on :5173
cd delivery-staff-frontend && npm run build   # Production build
# Kill: Get-NetTCPConnection -LocalPort 5173 | Stop-Process -Force
```

### SOP State Management
```bash
# Check for resumable SOP tasks
npx ts-node --transpile-only .claude/scripts/sop-resume-check.ts <sop-name>

# View all in-progress tasks
npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all

# Clean completed/failed states
npx ts-node --transpile-only .claude/scripts/sop-state-clean.ts
```

## Architecture

### Three-Layer Design

```
Harness Layer:   SOP Workflows (business process control)
Spec Layer:      Skills (capability composition)
Tool Layer:      Claude Code / OpenCode (executor)
```

Each SOP is a **harness** — it controls AI execution flow with confirmation points, agent delegation, and state persistence. SOPs delegate to specialized agents (code-reviewer, security-reviewer, java-reviewer, etc.) rather than doing everything inline.

### SOP Skill Structure

Each skill lives in `.claude/skills/<name>/`:
- `SKILL.md` — skill definition with YAML frontmatter and workflow steps
- `references/` — supporting docs (optional)

The core framework is in `.claude/skills/sop-framework/SKILL.md` which provides resume detection, progress display, and confirm/auto mode switching.

### Execution Modes

| Marker | Behavior |
|--------|----------|
| `⭐ [CONFIRM_REQUIRED]` | Blocks for user decision |
| `[AUTO]` | Runs without confirmation |
| `[INFO]` | Informational, no action needed |

Use `/sop <name> --auto` to skip all confirmation points.

### Multi-Agent Parallel Execution

SOPs that support parallel task execution:

| SOP | Parallel Agents |
|-----|----------------|
| sop-code-review | code-reviewer, security-reviewer, java-reviewer |
| sop-incident-response | collect, reproduce, analyze |
| sop-bug-fix | search, analyze |
| sop-library-research | search, verify, risk |

### SOP State Persistence

State files: `.sop/state/{sop}-{YYYYMMDD}.json`

Each state tracks `current_step`, per-step status, and user `answers`. On resume, the SOP picks up from `current_step` using saved answers — no need to re-enter configuration.

Step mappings are defined in `.claude/scripts/sop-step-map.json`.

### Output Structure

```
.sop/
├── state/              # Execution state files
├── output/             # SOP output documents (PRD, prototypes, test cases)
├── knowledge/          # Domain knowledge docs
└── dependency-graph/   # Graphify code analysis
```

### SOP Pipeline: Knowledge → PRD → Prototype → Tests

Key SOPs form a pipeline:
1. `/sop knowledge` — collect domain knowledge → `.sop/knowledge/`
2. `/sop prd` — generate PRD (references knowledge) + editable HTML prototype → `.sop/output/`
3. `/sop test-design` — generate test cases from PRD user stories → `.sop/output/`
4. `/sop regression` — select regression tests from code changes

## delivery-staff Application

### Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.5.14, MyBatis-Plus 3.5.7, Java 21 |
| Database | H2 in-memory, auto-init from `schema.sql` |
| Frontend | Vue 3.4, Vite 5, Naive UI 2.39, Pinia, Vue Router 4 |
| Proxy | `/api/*` → backend:8080 (configured in vite.config.js) |

### Backend Code Patterns

- **Layering**: Entity → Mapper → Service → Controller
- **Column mapping**: `underscore_format` (DB) → `camelCase` (Java) via MyBatis-Plus config
- **Transactions**: `@Transactional(readOnly = true)` for queries, `@Transactional(rollbackFor = Exception.class)` for writes
- **SQL**: MyBatis-Plus `QueryWrapper` for dynamic queries — no raw SQL
- **Exceptions**: Custom exceptions + `@RestControllerAdvice` (RFC 7807)

### Frontend Code Patterns

- Vue Composition API with `<script setup>`
- Pinia for state management
- Naive UI component library

### Critical Files

- `delivery-staff/pom.xml` — Maven dependencies
- `delivery-staff/src/main/resources/application.properties` — Spring config
- `delivery-staff/src/main/resources/schema.sql` — DB initialization
- `delivery-staff-frontend/package.json` — npm dependencies
- `delivery-staff-frontend/vite.config.js` — Vite + proxy config
- `.opencode/opencode.json` — OpenCode configuration and agent mapping

## SOP Commands

| Command | Purpose |
|---------|---------|
| `/sop scaffold` | Generate new project scaffold |
| `/sop fullstack-iteration` | Full-stack iteration |
| `/sop backend-iteration` | Backend-only iteration |
| `/sop frontend-iteration` | Frontend-only iteration |
| `/sop code-review` | Code review (parallel agents) |
| `/sop bug-fix` | Bug fix workflow |
| `/sop prd` | PRD generation + editable HTML prototype |
| `/sop test-design` | Test case design from PRD user stories |
| `/sop regression` | Regression test selection |
| `/sop testing` | Test workflow |
| `/sop deployment` | Deployment workflow |
| `/sop dependency-analysis` | Code dependency analysis (Graphify) |
| `/sop onboarding` | Project onboarding |
| `/sop knowledge` | Domain knowledge learning |
| `/sop library-research` | Technology evaluation |
| `/sop api-design` | API design (REST resource/method/response) |
| `/sop database-design` | Database schema design (ER → DDL) |
| `/sop product-analysis` | Product/business analysis |
| `/sop input` | Dynamic user parameter input (interactive dialogs) |
| `/sop brainstrom` | Structured brainstorming (SCAMPER / Six Hats / etc.) |
| `/sop verify` | SOP execution verification & anti-pattern detection |

## Cross-Platform Support

| Platform | Skill Location | Trigger | Input Method |
|----------|---------------|---------|-------------|
| Claude Code | `.claude/skills/` | `/sop <name>` | Natural language question |
| OpenCode | `.opencode/skills/` | `skill({ name: "sop-xxx" })` | `question` tool popup |

For `sop-dynamic-input`: Claude asks naturally, OpenCode pops a dialog — both collect the same data.

Agent mapping for OpenCode compatibility:
```yaml
code-reviewer: code_review
security-reviewer: security_scan
java-reviewer: java_review
search-first: Task(Explore)
architect: Task(Plan)
```

## Integrated Skills

| Skill | Location | Purpose |
|-------|----------|---------|
| dr-jskill | `.claude/skills/dr-jskill/` | Spring Boot generation, JDTLS navigation, Docker |
| frontend-design | `.claude/skills/frontend-design/` | Production-grade frontend interfaces |
| tailwind-design-system | `.claude/skills/tailwind-design-system/` | Tailwind CSS v4 patterns |
| sop-prd (v5.0) | `.claude/skills/sop-prd/` | PRD + editable HTML prototype generation |
| sop-test-design | `.claude/skills/sop-test-design/` | Test case design from PRD user stories |
| sop-regression | `.claude/skills/sop-regression/` | Regression test selection from change analysis |
| sop-dynamic-input | `.claude/skills/sop-dynamic-input/` | Dynamic user parameter input (interactive dialogs) |
| sop-brainstorming | `.claude/skills/sop-brainstorming/` | Structured brainstorming (SCAMPER / Six Hats / Brainwriting) |
| sop-verification | `.claude/skills/sop-verification/` | Post-execution verification & anti-pattern detection |

## References

- Skill definitions: `.claude/skills/*/SKILL.md`
- dr-jskill references: `.claude/skills/dr-jskill/references/`
- Java coding rules: `.claude/rules/common/01_naming.md` through `10_mysql.md`
- SOP design philosophy: `SOP流程设计思想.md`
- SOP state spec: `.sop/state-spec.md`
- SOP output index: `.sop/index.md`
