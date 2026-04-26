# AGENTS.md - Personal SOP Project

## Project Structure
```
personal-sop/
├── delivery-staff/           # Spring Boot backend (Java 21)
├── delivery-staff-frontend/  # Vue 3 + Vite frontend
├── .opencode/              # OpenCode config (merged)
└── .claude/skills/        # SOP Skills
```

## Verified Working Commands

### Build & Test
```bash
# Backend
cd delivery-staff && mvn compile

# Frontend (in directory)
cd delivery-staff-frontend && npm run build
```

### Service Startup (scripts fixed)
```bash
# Use node scripts (now work)
node .claude/scripts/start-backend.js delivery-staff 8080
node .claude/scripts/start-frontend.js delivery-staff-frontend 5173
```

### Manual Start (alternative)
```powershell
# Backend - use PowerShell directly
Start-Process -FilePath 'delivery-staff\mvnw.cmd' -ArgumentList 'spring-boot:run' -WorkingDirectory 'delivery-staff' -WindowStyle Hidden
```

### Kill Services (by port)
```powershell
# Kill by port (safe - doesn't kill OpenCode)
Get-NetTCPConnection -LocalPort 8080 | Stop-Process -Force
Get-NetTCPConnection -LocalPort 5173 | Stop-Process -Force
```

## Backend Stack
- Spring Boot 3.5.14
- MyBatis-Plus 3.5.7 (NOT JPA/Hibernate)
- H2 in-memory database
- Java 21

## Database
- H2 auto-initializes from `delivery-staff/src/main/resources/schema.sql`
- Column mapping: underscore_format in DB → camelCase in Java

## Frontend Stack
- Vue 3 + Vite
- Port 5173, proxies `/api/*` to backend:8080

## SOP Commands
```bash
/sop fullstack    # Full iteration (backend + frontend)
/sop backend     # Backend only
/sop frontend    # Frontend only
/sop prd         # PRD generation
/sop testing    # Test workflow
```

## Key References
- MyBatis-Plus: see `dr-jskill-main/references/MYBATIS-PLUS.md`
- Vue setup: see `dr-jskill-main/references/VUE.md`
- Full SOP list in opencode.json commands section

## Future Optimization

### 1. Token Optimization (Complex Projects)
- **Problem**: Long conversations burn token too fast with workflow + skill
- **Solution**: Skill layering - core vs extended vs on-demand
- **Reference**: See README.md future section for details

### 2. Vue UI Optimization
- **Problem**: AI-generated UI styles are inconsistent
- **Solution**: Build `ui-styles/` template library with:
  - Component templates (list, form, detail, dashboard)
  - Color themes (enterprise, logistics, medical)
  - Design patterns (table, form, chart)
- **Reference**: See README.md for implementation plan