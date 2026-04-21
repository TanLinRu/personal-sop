# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Game Risk Control System** (游戏风控系统) - a complete solution for game security and fraud prevention built with Spring Boot + Vue 3.

The system provides risk control services including:
- Registration risk control: batch registration, virtual number detection
- Login risk control:异地 login detection, brute force prevention
- Payment risk control: recharge fraud, money laundering detection
- Anti-cheat:外挂, scripts, resource farming detection
- Content moderation: abuse filtering, advertisement detection

## Development Commands

### Backend (Spring Boot)

```bash
cd backend

# Build project
mvn clean compile

# Run development server
mvn spring-boot:run

# Run tests
mvn test

# Package (skip tests)
mvn package -DskipTests
```

### Frontend (Vue 3)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database

```bash
# Initialize MySQL database
mysql -u root -p < sql/init.sql
```

## Access URLs

- Backend API: http://localhost:8080
- API Documentation (Knife4j): http://localhost:8080/doc.html
- Frontend: http://localhost:5173

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Backend Framework | Spring Boot 3.2.5 |
| ORM | MyBatis-Plus 3.5.5 |
| API Docs | Knife4j 4.4.0 |
| Frontend Framework | Vue 3.4.21 |
| UI Components | Element Plus 2.5.6 |
| Build Tool (Frontend) | Vite 5.1.6 |
| Database | MySQL 8.0 |

### Project Structure

```
game-risk-control/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/gamerisk/
│   │   ├── Application.java
│   │   ├── config/         # Configuration classes
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── mapper/         # Data access layer
│   │   ├── entity/         # Entity classes
│   │   └── dto/            # Data transfer objects
│   └── src/main/resources/
│       └── application.yml
├── frontend/                # Vue 3 frontend
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── views/         # Page components
│   │   ├── router/        # Router config
│   │   └── main.js        # Entry point
│   └── package.json
└── sql/
    └── init.sql           # Database initialization
```

### SOP Skills

This project includes custom SOP (Standard Operating Procedure) skills for standardized workflows. Each SOP supports two execution modes: **confirm** (default) and **auto**.

| Skill | Command | Purpose | Confirmation Points |
|-------|---------|---------|---------------------|
| sop-framework | - | SOP automation framework definition | - |
| sop-scaffold | `/sop scaffold` | Project scaffolding generation ⭐ | Step 1 (项目配置) |
| sop-bug-fix | `/sop bug-fix` | Standard bug fixing workflow | Steps 1,3 |
| sop-code-review | `/sop code-review` | Standard code review workflow | Steps 1,5 |
| sop-library-research | `/sop library-research` | Technology research with business analysis | Steps 0,5 |
| sop-onboarding | `/sop onboarding` | Project onboarding workflow | Steps 1,5 |
| sop-incident-response | `/sop incident-response` | Production incident handling | Step 2 |
| sop-product-analysis | `/sop product-analysis` | Business analysis & architecture design | Step 1 |
| sop-knowledge | `/sop knowledge` | Framework learning with error documentation | Steps 1,7 |
| sop-testing | `/sop testing` | Testing workflow | All AUTO |
| sop-deployment | `/sop deployment` | Deployment workflow | All AUTO |
| sop-api-design | `/sop api-design` | API design workflow | - |
| sop-database-design | `/sop database-design` | Database design workflow | - |

**Execution Modes**:
- **Confirm mode** (default): User confirms at ⭐ marked steps before proceeding
- **Auto mode**: Use `/sop xxx --auto` to run without confirmation (after trust is established)

**Step Types**:
- `⭐ [CONFIRM_REQUIRED]` - Core decision points requiring user confirmation
- `[AUTO]` - Automatic execution steps
- `[INFO]` - Informational content
- `[VERIFY]` - Verification/checkpoint steps

### Integrated Skills

This project also integrates the following external skills for enhanced capabilities:

| Skill | Purpose |
|-------|---------|
| dr-jskill | Spring Boot project generation with JDTLS, Docker, GraalVM support |
| frontend-design | Production-grade frontend interfaces with distinctive aesthetics |
| tailwind-design-system | Tailwind CSS v4 design system patterns |

### JDTLS Code Navigation (Java Projects)

For Java projects, use JDTLS for intelligent code navigation instead of grep:

| Task | Command |
|------|---------|
| Find definition | `lsp goToDefinition` |
| Find references | `lsp findReferences` |
| Hover info | `lsp hover` |
| List symbols | `lsp documentSymbol` |
| Workspace search | `lsp workspaceSymbol` |
| Safe rename | `lsp rename` |

**Install once**: `brew install jdtls` (macOS) or see `.claude/skills/dr-jskill/references/JDTLS.md`

## SOP Usage Guide

| Scenario | Recommended SOP |
|----------|-----------------|
| New project initiation | sop-product-analysis → sop-scaffold |
| Technology selection | sop-library-research (includes business analysis) |
| Framework learning | sop-knowledge |
| Bug fixing | sop-bug-fix |
| Code review | sop-code-review |
| Project onboarding | sop-onboarding |
| Production incident | sop-incident-response |

## SOP Automation Framework

This project implements a standardized SOP automation framework (`.claude/skills/sop-framework/SKILL.md`) that defines execution patterns for all SOP skills.

### Core Design Principles
- **Confirmation Points**: Core decision steps (marked ⭐ [CONFIRM_REQUIRED]) require user approval
- **Automatic Execution**: Routine steps (marked [AUTO]) execute without interruption
- **Mode Switching**: Use `/sop xxx --auto` to enable fully automated execution

### SOP Workflow Pattern
```
[CONFIRM_REQUIRED] → [AUTO] → [AUTO] → [VERIFY] → [CONFIRM_REQUIRED]
     ↑                    ↑                    ↑
   关键决策点            自动执行             验证checkpoint
```

### Multi-Agent Execution
Some SOPs support parallel task execution:
- `sop-incident-response`: Hybrid mode (collect + reproduce parallel, fix sequential)
- `sop-library-research`: Parallel mode (search, verify, risk assessment simultaneously)

## Environment Requirements

- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Node.js 18+
- npm 9+