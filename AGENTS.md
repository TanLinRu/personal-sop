# AGENTS.md - Personal SOP Project

## Project Structure
```
personal-sop/
├── delivery-staff/              # Spring Boot backend (Java 21)
├── delivery-staff-frontend/   # Vue 3 + Vite frontend (Naive UI)
├── .opencode/                 # OpenCode config
├── .claude/skills/            # SOP Skills (workflow automation)
└── .sop/                    # SOP execution state
```

## Verified Commands

### Backend (Spring Boot)
```bash
cd delivery-staff && mvn compile           # Compile only
cd delivery-staff && mvn spring-boot:run  # Run dev server on :8080
```

### Frontend (Vue 3)
```bash
cd delivery-staff-frontend && npm run dev      # Dev server on :5173
cd delivery-staff-frontend && npm run build  # Production build
```

### Kill Services (Windows)
```powershell
Get-NetTCPConnection -LocalPort 8080 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5173 | Stop-Process -Force
```

## Stack Details
- **Backend**: Spring Boot 3.5.14, MyBatis-Plus 3.5.7, Java 21, H2 in-memory DB
- **Frontend**: Vue 3.4 + Vite 5 + Naive UI 2.39 + Pinia + Vue Router 4
- **DB**: H2 auto-initializes from `delivery-staff/src/main/resources/schema.sql`
- **Column mapping**: `underscore_format` (DB) → `camelCase` (Java)

## SOP Commands (via /sop)
| Command | Purpose |
|---------|---------|
| `/sop fullstack` | Backend + frontend iteration |
| `/sop backend` | Backend only iteration |
| `/sop frontend` | Frontend only iteration |
| `/sop prd` | PRD generation |
| `/sop testing` | Test workflow |
| `/sop code-review` | Code review (parallel agents) |
| `/sop bug-fix` | Bug fix workflow |
| `/sop deployment` | Deployment workflow |
| `/sop dependency-analysis` | Code dependency analysis (Graphify) |

## SOP 状态恢复 (Compact 后)
- **状态文件**：`.sop/state/{sop}-{date}.json`
- **检测命令**：`npx ts-node --transpile-only .claude/scripts/sop-state-load.ts --all`
- **规则**：自动恢复到 `current_step` 继续执行，无需重复输入已确认的配置

## Key References
- Java/Backend rules: `.claude/rules/common/01-10_*.md`
- MyBatis-Plus: `.claude/skills/dr-jskill/references/MYBATIS-PLUS.md`
- Vue setup: `.claude/skills/dr-jskill/references/VUE.md`
- Spring Boot ref: `.claude/skills/dr-jskill/references/SPRING-BOOT-3.md`

## Architecture Notes
- **JDTLS**: Requires JAVA_HOME environment variable (configured in opencode.json)
- **Frontend proxy**: `/api/*` proxied to backend:8080 (vite.config.js)
- **Multi-Agent SOPs**: code-review, bug-fix run agents in parallel
- **SOP State**: Saved to `.sop/state/` for session recovery

## Code Patterns
- **Backend**: Entity/Mapper/Service/Controller layering
- **Transactions**: `@Transactional(readOnly = true)` for queries, `@Transactional(rollbackFor = Exception.class)` for writes
- **SQL**: MyBatis-Plus `QueryWrapper` for dynamic queries (NOT raw SQL)
- **Frontend**: Vue Composition API with `<script setup>`
- **State**: Pinia stores in frontend

## Startup Banner
The project includes `StartupInfoListener` that prints access URLs at startup:
- Local: http://localhost:8080/
- API: http://localhost:8080/api
- Frontend: http://localhost:5173 (if running)

## Critical Files
- `delivery-staff/pom.xml` - Maven dependencies
- `delivery-staff-frontend/package.json` - npm dependencies
- `delivery-staff-frontend/vite.config.js` - Vite + proxy config
- `delivery-staff/src/main/resources/application.properties` - Spring config
- `.opencode/opencode.json` - OpenCode configuration, SOP commands, agent mapping