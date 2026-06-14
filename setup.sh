#!/usr/bin/env bash
set -euo pipefail

echo "=== Personal SOP Skill Library Setup ==="
echo ""

# 1. Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "[WARN] $1 not found. $2"
    return 1
  fi
  echo "[OK] $1 found: $(command -v "$1")"
}

check_command "node" "Install Node.js 18+ from https://nodejs.org"
check_command "git" "Install Git from https://git-scm.com"

echo ""

# 2. Create SOP directories
mkdir -p .sop/state .sop/output .sop/knowledge .sop/dependency-graph .sop/biz-graph
echo "[OK] SOP directories created (.sop/state, .sop/output, .sop/knowledge, .sop/dependency-graph, .sop/biz-graph)"

# 3. Install frontend dependencies (if delivery-staff-frontend exists)
if [ -d "delivery-staff-frontend" ] && [ -f "delivery-staff-frontend/package.json" ]; then
  echo "[INFO] Installing frontend dependencies..."
  (cd delivery-staff-frontend && npm install)
  echo "[OK] Frontend dependencies installed"
else
  echo "[SKIP] No delivery-staff-frontend/package.json found"
fi

# 4. Verify state scripts
if command -v node &> /dev/null; then
  echo "[OK] State scripts available via node"
else
  echo "[WARN] Node.js not found - state scripts will not work"
fi

# 5. Check for CodeGraph (recommended) / Graphify (legacy)
if command -v codegraph &> /dev/null; then
  echo "[OK] CodeGraph found: $(command -v codegraph)"
  echo "      Run 'codegraph init' in each project to build the index."
elif command -v graphify &> /dev/null; then
  echo "[OK] Graphify (legacy) found: $(command -v graphify)"
  echo "      Recommended upgrade: install CodeGraph"
  echo "        macOS/Linux: curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh"
  echo "        Windows:     irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex"
  echo "        Or via npm:  npm i -g @colbymchenry/codegraph"
else
  echo "[SKIP] No graph engine found (optional). Recommended:"
  echo "        macOS/Linux: curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh"
  echo "        Windows:     irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex"
  echo "        Or via npm:  npm i -g @colbymchenry/codegraph"
  echo "      After install: codegraph install   # wires CodeGraph into Claude Code/OpenCode/Cursor"
fi

# 6. Check JAVA_HOME (optional, for Java projects)
if [ -n "${JAVA_HOME:-}" ]; then
  echo "[OK] JAVA_HOME set: $JAVA_HOME"
else
  echo "[SKIP] JAVA_HOME not set (needed only for Java/Spring Boot projects)"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Quick Start (Claude Code):"
echo "  /sop scaffold        - Generate a new project"
echo "  /sop code-review     - Review code"
echo "  /sop bug-fix         - Fix a bug"
echo "  /sop status          - Check SOP task status"
echo ""
echo "Quick Start (OpenCode):"
echo "  sop scaffold         - Generate a new project"
echo "  sop code-review      - Review code"
echo "  sop bug-fix          - Fix a bug"
echo ""
echo "See README.md for full documentation."
