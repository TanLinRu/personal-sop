# AGENTS.md - Personal SOP Project

## Project Structure
```
personal-sop/
├── delivery-staff/              # Spring Boot backend (Java 21)
├── delivery-staff-frontend/   # Vue 3 + Vite frontend (Naive UI)
├── .opencode/                  # OpenCode config
├── .claude/skills/            # SOP Skills
└── .sop/                     # SOP execution state
```

## Verified Commands

### Backend (Spring Boot)
```bash
cd delivery-staff && mvn compile           # Compile only
cd delivery-staff && mvn spring-boot:run  # Dev server on :8080
```

### Frontend (Vue 3)
```bash
cd delivery-staff-frontend && npm run dev      # Dev server on :5173
cd delivery-staff-frontend && npm run build    # Production build
```

### Kill Services (Windows)
```powershell
Get-NetTCPConnection -LocalPort 8080 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5173 | Stop-Process -Force
```

## Stack
| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.5.14, MyBatis-Plus 3.5.7, Java 21 |
| DB | H2 in-memory (auto-init from `schema.sql`) |
| Frontend | Vue 3.4, Vite 5, Naive UI 2.39, Pinia, Vue Router 4 |
| Proxy | `/api/*` → backend:8080 (vite.config.js) |

## SOP Commands (via /sop)
| Command | Purpose |
|---------|---------|
| `/sop api-design` | REST API design (resource modeling, versioning) |
| `/sop backend` | Backend only iteration |
| `/sop brainstrom` | Structured brainstorming |
| `/sop bug-fix` | Bug fix workflow |
| `/sop code-review` | Code review (parallel agents) |
| `/sop database-design` | Database schema design (ER → DDL) |
| `/sop deployment` | Deployment workflow |
| `/sop dependency-analysis` | Code dependency analysis |
| `/sop frontend` | Frontend only iteration |
| `/sop fullstack` | Backend + frontend iteration |
| `/sop incident-response` | Incident response workflow |
| `/sop input` | Dynamic user parameter input |
| `/sop knowledge` | Domain knowledge learning |
| `/sop library-research` | Technology evaluation |
| `/sop onboarding` | Project onboarding |
| `/sop prd` | PRD generation |
| `/sop product-analysis` | Product/business analysis |
| `/sop regression` | Regression test selection |
| `/sop scaffold` | Generate new project scaffold |
| `/sop status` | Show status of all SOP tasks |
| `/sop test-design` | Test case design from PRD user stories |
| `/sop testing` | Test workflow |
| `/sop verify` | SOP execution verification & anti-pattern detection |

## SOP State Recovery
- **检测命令**: `npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all`
- **状态文件**: `.sop/state/{sop}-{date}.json`
- 自动恢复到 `current_step` 继续执行

## Code Patterns
- **Backend**: Entity → Mapper → Service → Controller
- **Transactions**: `@Transactional(readOnly = true)` for queries; `@Transactional(rollbackFor = Exception.class)` for writes
- **SQL**: MyBatis-Plus `QueryWrapper` (NOT raw SQL)
- **Frontend**: Vue Composition API with `<script setup>`, Pinia stores
- **Column mapping**: `underscore_format` (DB) → `camelCase` (Java)

## Key References
- Java rules: `.claude/rules/common/01-10_*.md`
- MyBatis-Plus: `.claude/skills/dr-jskill/references/MYBATIS-PLUS.md`
- Vue setup: `.claude/skills/dr-jskill/references/VUE.md`
- Spring Boot: `.claude/skills/dr-jskill/references/SPRING-BOOT-4.md`
- Dynamic Input: `.claude/skills/sop-dynamic-input/SKILL.md`
- Brainstorming: `.claude/skills/sop-brainstorming/SKILL.md`
- Verification: `.claude/skills/sop-verification/SKILL.md`

## Critical Files
| File | Purpose |
|------|---------|
| `delivery-staff/pom.xml` | Maven dependencies |
| `delivery-staff/src/main/resources/application.properties` | Spring config |
| `delivery-staff/src/main/resources/schema.sql` | DB init |
| `delivery-staff-frontend/package.json` | npm dependencies |
| `delivery-staff-frontend/vite.config.js` | Vite + proxy config |
| `.opencode/opencode.json` | OpenCode config, SOP commands, agent mapping |
| `.claude/agents/*.md` | Agent definitions |