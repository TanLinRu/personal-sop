#!/usr/bin/env ts-node
/**
 * sop-biz-graph.ts — Phase E2: Business document graph for SOP artifacts
 *
 * Stores SOP-produced documents (PRD, knowledge, tests, decisions, deploys)
 * + their relationships in SQLite, enabling queries like:
 *   - "Which tests verify US-003?"
 *   - "Show full lineage for trace_id prd-2026-06-10-abc123"
 *   - "Which PRDs reference knowledge-logistics?"
 *
 * Pairs with CodeGraph (code layer) via code_ref nodes.
 *
 * Usage:
 *   sop-biz-graph build              # Full rebuild from .sop/output + .sop/state
 *   sop-biz-graph sync [path]        # Incremental update for changed file
 *   sop-biz-graph status             # Show node/edge counts
 *   sop-biz-graph query <text>       # FTS5 search
 *   sop-biz-graph node <id>          # Show one node + its edges
 *   sop-biz-graph trace <trace_id>   # Full lineage for a SOP run
 *   sop-biz-graph affected <node-id> # Downstream impact (BFS)
 *   sop-biz-graph reset              # Drop and recreate the database
 */

import { existsSync, readFileSync, readdirSync, mkdirSync, statSync } from "fs";
import { resolve, basename, dirname, relative } from "path";
import { DatabaseSync } from "node:sqlite";

// ===== Paths =====

const REPO_ROOT = process.cwd();
const SOP_DIR = resolve(REPO_ROOT, ".sop");
const STATE_DIR = resolve(SOP_DIR, "state");
const OUTPUT_DIR = resolve(SOP_DIR, "output");
const KNOWLEDGE_DIR = resolve(SOP_DIR, "knowledge");
const BIZ_GRAPH_DIR = resolve(SOP_DIR, "biz-graph");
const DB_PATH = resolve(BIZ_GRAPH_DIR, "biz.db");

// ===== Schema =====

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS biz_nodes (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  name        TEXT NOT NULL,
  trace_id    TEXT,
  source_file TEXT,
  source_line INTEGER,
  metadata    TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_biz_nodes_type ON biz_nodes(type);
CREATE INDEX IF NOT EXISTS idx_biz_nodes_trace ON biz_nodes(trace_id);
CREATE INDEX IF NOT EXISTS idx_biz_nodes_source ON biz_nodes(source_file);

CREATE TABLE IF NOT EXISTS biz_edges (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id   TEXT NOT NULL,
  to_id     TEXT NOT NULL,
  type      TEXT NOT NULL,
  metadata  TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(from_id, to_id, type)
);
CREATE INDEX IF NOT EXISTS idx_biz_edges_from ON biz_edges(from_id);
CREATE INDEX IF NOT EXISTS idx_biz_edges_to ON biz_edges(to_id);
CREATE INDEX IF NOT EXISTS idx_biz_edges_type ON biz_edges(type);

CREATE VIRTUAL TABLE IF NOT EXISTS biz_fts USING fts5(id UNINDEXED, name, metadata);
`;

// ===== DB =====

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function openDb(): DatabaseSync {
  ensureDir(BIZ_GRAPH_DIR);
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA_SQL);
  return db;
}

function nowIso(): string {
  // Stamp helper.  We use Date here (allowed at script runtime, not at LLM
  // generation time).
  return new Date().toISOString();
}

// ===== Upserts =====

interface NodeInput {
  id: string;
  type: string;
  name: string;
  trace_id?: string | null;
  source_file?: string | null;
  source_line?: number | null;
  metadata?: Record<string, unknown>;
}

function upsertNode(db: DatabaseSync, n: NodeInput): void {
  const now = nowIso();
  const meta = n.metadata ? JSON.stringify(n.metadata) : null;
  const stmt = db.prepare(`
    INSERT INTO biz_nodes (id, type, name, trace_id, source_file, source_line, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      type=excluded.type,
      name=excluded.name,
      trace_id=excluded.trace_id,
      source_file=excluded.source_file,
      source_line=excluded.source_line,
      metadata=excluded.metadata,
      updated_at=excluded.updated_at
  `);
  stmt.run(
    n.id, n.type, n.name,
    n.trace_id ?? null,
    n.source_file ?? null,
    n.source_line ?? null,
    meta,
    now, now,
  );
  // Maintain FTS manually (triggers can deadlock with ON CONFLICT)
  db.prepare("DELETE FROM biz_fts WHERE id = ?").run(n.id);
  db.prepare("INSERT INTO biz_fts (id, name, metadata) VALUES (?, ?, ?)")
    .run(n.id, n.name, meta || "");
}

function upsertEdge(
  db: DatabaseSync,
  fromId: string,
  toId: string,
  type: string,
  metadata?: Record<string, unknown>,
): void {
  const now = nowIso();
  const stmt = db.prepare(`
    INSERT INTO biz_edges (from_id, to_id, type, metadata, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(from_id, to_id, type) DO NOTHING
  `);
  stmt.run(fromId, toId, type, metadata ? JSON.stringify(metadata) : null, now);
}

// ===== Extractors =====

function parseFrontmatter(content: string): { fm: Record<string, string>; body: string } {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: content };
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return { fm, body: m[2] };
}

function extractStateRuns(db: DatabaseSync): number {
  if (!existsSync(STATE_DIR)) return 0;
  let n = 0;
  for (const file of readdirSync(STATE_DIR).filter((f) => f.endsWith(".json"))) {
    try {
      const path = resolve(STATE_DIR, file);
      const raw = readFileSync(path, "utf-8");
      const state = JSON.parse(raw);
      const traceId = state.trace_id || `${state.sop}-${state.task_id}`;
      const id = `run:${traceId}`;
      upsertNode(db, {
        id,
        type: "sop_run",
        name: `${state.sop} (${state.status})`,
        trace_id: traceId,
        source_file: relative(REPO_ROOT, path),
        metadata: {
          sop: state.sop,
          status: state.status,
          started_at: state.started_at,
          completed_at: state.completed_at,
          current_step: state.current_step,
          task_id: state.task_id,
          parent_trace: state.parent_trace,
        },
      });

      // parent → child link
      if (state.parent_trace) {
        upsertEdge(db, id, `run:${state.parent_trace}`, "traces_to");
      }
      n++;
    } catch (err) {
      console.error(`[WARN] state file ${file}: ${(err as Error).message}`);
    }
  }
  return n;
}

function extractKnowledge(db: DatabaseSync): number {
  if (!existsSync(KNOWLEDGE_DIR)) return 0;
  let n = 0;
  for (const file of readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith(".md"))) {
    const path = resolve(KNOWLEDGE_DIR, file);
    const content = readFileSync(path, "utf-8");
    const { fm } = parseFrontmatter(content);
    const baseName = file.replace(/\.md$/, "").replace(/^knowledge-/, "");
    const id = `kn:${baseName}`;
    upsertNode(db, {
      id,
      type: "knowledge",
      name: fm.title || fm.domain || baseName,
      source_file: relative(REPO_ROOT, path),
      metadata: { ...fm, byte_size: content.length },
    });
    n++;
  }
  return n;
}

function extractPrds(db: DatabaseSync): { prds: number; stories: number; features: number; risks: number; decisions: number } {
  if (!existsSync(OUTPUT_DIR)) return { prds: 0, stories: 0, features: 0, risks: 0, decisions: 0 };
  let prds = 0, stories = 0, features = 0, risks = 0, decisions = 0;

  for (const file of readdirSync(OUTPUT_DIR).filter((f) => /^prd-.*\.md$/.test(f) && !f.includes(".DRAFT.") && !f.includes(".summary."))) {
    const path = resolve(OUTPUT_DIR, file);
    const content = readFileSync(path, "utf-8");
    const { fm, body } = parseFrontmatter(content);
    const baseName = file.replace(/\.md$/, "");
    const prdId = `prd:${baseName.replace(/^prd-/, "")}`;

    upsertNode(db, {
      id: prdId,
      type: "prd",
      name: fm.title || baseName,
      trace_id: fm.trace_id || null,
      source_file: relative(REPO_ROOT, path),
      metadata: {
        tier: fm.tier,
        version: fm.version,
        line_count: content.split("\n").length,
        dor_status: fm.dor_status,
      },
    });
    prds++;

    // Link sop_run → prd
    if (fm.trace_id) {
      upsertEdge(db, `run:${fm.trace_id}`, prdId, "produces");
    }

    // Knowledge references in §7 附录 / 参考文档
    const knMatches = body.match(/knowledge-([\w-]+)/g) || [];
    for (const m of [...new Set(knMatches)]) {
      const knBase = m.replace(/^knowledge-/, "");
      upsertEdge(db, prdId, `kn:${knBase}`, "references");
    }

    // §3 (LITE) or §5 (FULL) 用户故事表格
    // | ID | 角色 | 故事 | 验收标准 | 优先级 | INVEST |
    const storySectionMatch = body.match(/##\s+(?:3|5)\.\s*用户故事[\s\S]*?(?=\n##\s+\d|$)/);
    if (storySectionMatch) {
      const storyRows = storySectionMatch[0].match(/^\|\s*US-\d+[^\n]*$/gm) || [];
      for (const row of storyRows) {
        const cells = row.split("|").map((s) => s.trim()).filter((c) => c.length > 0);
        if (cells.length < 3) continue;
        const usId = cells[0]; // e.g. "US-001"
        const role = cells[1] || "";
        const story = cells[2] || "";
        const ac = cells[3] || "";
        const priority = cells[4] || "";
        const invest = cells[5] || "";
        const fullId = `us:${prdId}:${usId}`;

        upsertNode(db, {
          id: fullId,
          type: "user_story",
          name: `${usId}: ${story}`.slice(0, 200),
          trace_id: fm.trace_id || null,
          source_file: relative(REPO_ROOT, path),
          metadata: { us_id: usId, role, priority, invest, ac },
        });
        upsertEdge(db, prdId, fullId, "produces");
        stories++;

        // AC node (one per US for now; TODO: split on AC-1/AC-2)
        if (ac && ac.length > 5) {
          const acId = `ac:${fullId}`;
          upsertNode(db, {
            id: acId,
            type: "acceptance_criterion",
            name: ac.slice(0, 120),
            trace_id: fm.trace_id || null,
            source_file: relative(REPO_ROOT, path),
            metadata: { format: ac.includes("Given") && ac.includes("When") && ac.includes("Then") ? "GWT" : "freeform" },
          });
          upsertEdge(db, acId, fullId, "validates");
        }
      }
    }

    // §4 (LITE) or §6 (FULL) 功能规划表格
    const featSectionMatch = body.match(/##\s+(?:4|6)\.\s*功能规划[\s\S]*?(?=\n##\s+\d|$)/);
    if (featSectionMatch) {
      const featRows = featSectionMatch[0].match(/^\|\s*F-\d+[^\n]*$/gm) || [];
      for (const row of featRows) {
        const cells = row.split("|").map((s) => s.trim()).filter((c) => c.length > 0);
        if (cells.length < 2) continue;
        const featId = cells[0]; // "F-01"
        const priority = cells[1] || "";
        const desc = cells[2] || "";
        const usRefs = (cells[3] || cells.join(" ")).match(/US-\d+/g) || [];
        const fullId = `feat:${prdId}:${featId}`;

        upsertNode(db, {
          id: fullId,
          type: "feature",
          name: `${featId}: ${desc}`.slice(0, 200),
          trace_id: fm.trace_id || null,
          source_file: relative(REPO_ROOT, path),
          metadata: { feat_id: featId, priority, description: desc },
        });
        upsertEdge(db, prdId, fullId, "produces");
        for (const usId of usRefs) {
          upsertEdge(db, fullId, `us:${prdId}:${usId}`, "implements");
        }
        features++;
      }
    }

    // §6 (LITE) or §9 (FULL) 风险 + 决策（合并表 in LITE; 独立 in FULL）
    const riskSectionMatch = body.match(/##\s+(?:6\.\s*风险|9\.\s*风险)[\s\S]*?(?=\n##\s+\d|$)/);
    if (riskSectionMatch) {
      const rows = riskSectionMatch[0].match(/^\|[^\n]+\|\s*(高|中|低|High|Medium|Low|H|M|L)\s*\|[^\n]*$/gim) || [];
      let idx = 0;
      for (const row of rows) {
        const cells = row.split("|").map((s) => s.trim()).filter((c) => c.length > 0);
        if (cells.length < 4) continue;
        idx++;
        const riskId = `risk:${prdId}:${idx}`;
        upsertNode(db, {
          id: riskId,
          type: "risk",
          name: `${cells[0]}: ${cells[1]}`.slice(0, 150),
          trace_id: fm.trace_id || null,
          source_file: relative(REPO_ROOT, path),
          metadata: { kind: cells[0], description: cells[1], impact: cells[2], mitigation: cells[3], decision: cells[4] || "" },
        });
        upsertEdge(db, prdId, riskId, "produces");
        risks++;

        // Linked decision
        if (cells[4] && cells[4].length > 0) {
          const decId = `dec:${prdId}:${idx}`;
          upsertNode(db, {
            id: decId,
            type: "decision",
            name: `Decision for ${cells[1]}`.slice(0, 150),
            trace_id: fm.trace_id || null,
            source_file: relative(REPO_ROOT, path),
            metadata: { decision: cells[4] },
          });
          upsertEdge(db, decId, riskId, "mitigates");
          decisions++;
        }
      }
    }
  }
  return { prds, stories, features, risks, decisions };
}

function extractDeployments(db: DatabaseSync): number {
  if (!existsSync(OUTPUT_DIR)) return 0;
  let n = 0;
  // Pattern: deploy-{id}/ subdirs OR deploy-*.md
  for (const entry of readdirSync(OUTPUT_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("deploy-")) {
      const id = `deploy:${entry.name.replace(/^deploy-/, "")}`;
      upsertNode(db, {
        id,
        type: "deployment",
        name: entry.name,
        source_file: relative(REPO_ROOT, resolve(OUTPUT_DIR, entry.name)),
        metadata: {},
      });
      n++;
    }
  }
  return n;
}

function extractVerifyReports(db: DatabaseSync): number {
  if (!existsSync(OUTPUT_DIR)) return 0;
  let n = 0;
  for (const file of readdirSync(OUTPUT_DIR).filter((f) => /^verify-.*\.md$/.test(f))) {
    const path = resolve(OUTPUT_DIR, file);
    const baseName = file.replace(/\.md$/, "");
    const id = `verify:${baseName.replace(/^verify-/, "")}`;
    upsertNode(db, {
      id,
      type: "verify_report",
      name: baseName,
      source_file: relative(REPO_ROOT, path),
      metadata: { byte_size: statSync(path).size },
    });
    n++;
  }
  return n;
}

// ===== Commands =====

function build(): void {
  const db = openDb();
  console.log(`[INFO] Building biz graph at ${DB_PATH}`);

  // Reset for clean rebuild — preserves WAL but resets data
  db.exec("DELETE FROM biz_edges; DELETE FROM biz_fts; DELETE FROM biz_nodes;");

  const runs = extractStateRuns(db);
  const kn = extractKnowledge(db);
  const prdStats = extractPrds(db);
  const deploys = extractDeployments(db);
  const verifies = extractVerifyReports(db);

  const totalNodes = (db.prepare("SELECT COUNT(*) as n FROM biz_nodes").get() as { n: number }).n;
  const totalEdges = (db.prepare("SELECT COUNT(*) as n FROM biz_edges").get() as { n: number }).n;

  console.log(`[OK] Build complete:`);
  console.log(`  sop_runs:    ${runs}`);
  console.log(`  knowledge:   ${kn}`);
  console.log(`  prds:        ${prdStats.prds}`);
  console.log(`  user_stories: ${prdStats.stories}`);
  console.log(`  features:    ${prdStats.features}`);
  console.log(`  risks:       ${prdStats.risks}`);
  console.log(`  decisions:   ${prdStats.decisions}`);
  console.log(`  deployments: ${deploys}`);
  console.log(`  verifies:    ${verifies}`);
  console.log(`  --- TOTAL ---`);
  console.log(`  nodes: ${totalNodes}`);
  console.log(`  edges: ${totalEdges}`);

  db.close();
}

function status(): void {
  if (!existsSync(DB_PATH)) {
    console.log("[INFO] No biz graph found. Run `sop-biz-graph build` first.");
    return;
  }
  const db = openDb();
  const counts = db.prepare(`
    SELECT type, COUNT(*) as count FROM biz_nodes GROUP BY type ORDER BY count DESC
  `).all() as Array<{ type: string; count: number }>;
  const edgeCounts = db.prepare(`
    SELECT type, COUNT(*) as count FROM biz_edges GROUP BY type ORDER BY count DESC
  `).all() as Array<{ type: string; count: number }>;

  console.log(`# biz-graph status\n`);
  console.log(`Path: ${DB_PATH}\n`);
  console.log(`## Nodes\n`);
  console.log(`| Type | Count |`);
  console.log(`|------|-------|`);
  for (const r of counts) console.log(`| ${r.type} | ${r.count} |`);

  console.log(`\n## Edges\n`);
  console.log(`| Type | Count |`);
  console.log(`|------|-------|`);
  for (const r of edgeCounts) console.log(`| ${r.type} | ${r.count} |`);
  db.close();
}

function query(text: string, limit = 20): void {
  if (!existsSync(DB_PATH)) {
    console.log("[INFO] No biz graph found. Run `sop-biz-graph build` first.");
    return;
  }
  const db = openDb();

  // Try FTS5 first (good for ASCII / English).  CJK chars without a tokenizer
  // produce 0 hits, so fall back to LIKE on name + metadata.
  let rows: Array<{ id: string; type: string; name: string; trace_id: string | null }> = [];
  const ftsSafe = text.replace(/['"]/g, " ").trim();
  if (ftsSafe.length > 0) {
    try {
      rows = db.prepare(`
        SELECT n.id, n.type, n.name, n.trace_id
        FROM biz_fts f JOIN biz_nodes n ON f.id = n.id
        WHERE biz_fts MATCH ?
        LIMIT ?
      `).all(ftsSafe, limit) as typeof rows;
    } catch {
      // FTS5 syntax error — ignore, fall through to LIKE
    }
  }

  if (rows.length === 0) {
    // LIKE fallback (handles CJK, partial matches, etc.)
    const pattern = `%${text}%`;
    rows = db.prepare(`
      SELECT id, type, name, trace_id
      FROM biz_nodes
      WHERE name LIKE ? OR metadata LIKE ? OR id LIKE ?
      LIMIT ?
    `).all(pattern, pattern, pattern, limit) as typeof rows;
  }

  console.log(`# Search: "${text}" (${rows.length} results)\n`);
  if (rows.length === 0) {
    console.log("(no matches)");
  } else {
    console.log(`| Type | ID | Name | Trace |`);
    console.log(`|------|-----|------|-------|`);
    for (const r of rows) {
      console.log(`| ${r.type} | \`${r.id}\` | ${r.name.slice(0, 80)} | ${r.trace_id || "-"} |`);
    }
  }
  db.close();
}

function showNode(id: string): void {
  if (!existsSync(DB_PATH)) {
    console.log("[INFO] No biz graph found.");
    return;
  }
  const db = openDb();
  const node = db.prepare("SELECT * FROM biz_nodes WHERE id = ?").get(id) as any;
  if (!node) {
    console.error(`[ERROR] Node not found: ${id}`);
    db.close();
    process.exit(1);
  }

  console.log(`# Node: ${node.id}\n`);
  console.log(`- **Type**: ${node.type}`);
  console.log(`- **Name**: ${node.name}`);
  console.log(`- **Trace**: ${node.trace_id || "-"}`);
  console.log(`- **Source**: ${node.source_file || "-"}`);
  if (node.metadata) {
    console.log(`\n## Metadata\n\`\`\`json\n${node.metadata}\n\`\`\``);
  }

  const outgoing = db.prepare("SELECT * FROM biz_edges WHERE from_id = ?").all(id) as Array<{ to_id: string; type: string }>;
  const incoming = db.prepare("SELECT * FROM biz_edges WHERE to_id = ?").all(id) as Array<{ from_id: string; type: string }>;

  console.log(`\n## Outgoing edges (${outgoing.length})\n`);
  for (const e of outgoing) console.log(`- \`${id}\` -[${e.type}]-> \`${e.to_id}\``);
  console.log(`\n## Incoming edges (${incoming.length})\n`);
  for (const e of incoming) console.log(`- \`${e.from_id}\` -[${e.type}]-> \`${id}\``);
  db.close();
}

function trace(traceId: string): void {
  if (!existsSync(DB_PATH)) {
    console.log("[INFO] No biz graph found.");
    return;
  }
  const db = openDb();
  const rows = db.prepare(`
    SELECT id, type, name, source_file FROM biz_nodes WHERE trace_id = ? ORDER BY type, id
  `).all(traceId) as Array<{ id: string; type: string; name: string; source_file: string | null }>;

  console.log(`# Trace lineage: ${traceId}\n`);
  if (rows.length === 0) {
    console.log("(no nodes for this trace)");
    db.close();
    return;
  }

  // Group by type
  const byType: Record<string, typeof rows> = {};
  for (const r of rows) {
    (byType[r.type] = byType[r.type] || []).push(r);
  }
  for (const [type, items] of Object.entries(byType)) {
    console.log(`## ${type} (${items.length})\n`);
    for (const item of items) {
      console.log(`- \`${item.id}\` — ${item.name.slice(0, 80)}`);
    }
    console.log();
  }
  db.close();
}

function affected(nodeId: string, depth = 3): void {
  if (!existsSync(DB_PATH)) {
    console.log("[INFO] No biz graph found.");
    return;
  }
  const db = openDb();
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number; path: string[] }> = [{ id: nodeId, depth: 0, path: [nodeId] }];
  const results: Array<{ id: string; type: string; name: string; depth: number; path: string[] }> = [];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (visited.has(cur.id) || cur.depth > depth) continue;
    visited.add(cur.id);

    if (cur.depth > 0) {
      const node = db.prepare("SELECT type, name FROM biz_nodes WHERE id = ?").get(cur.id) as { type: string; name: string } | undefined;
      if (node) {
        results.push({ id: cur.id, type: node.type, name: node.name, depth: cur.depth, path: cur.path });
      }
    }

    const outgoing = db.prepare("SELECT to_id FROM biz_edges WHERE from_id = ?").all(cur.id) as Array<{ to_id: string }>;
    for (const e of outgoing) {
      if (!visited.has(e.to_id)) {
        queue.push({ id: e.to_id, depth: cur.depth + 1, path: [...cur.path, e.to_id] });
      }
    }
  }

  console.log(`# Affected (downstream BFS) from ${nodeId}\n`);
  console.log(`Total: ${results.length} nodes within depth ${depth}\n`);
  console.log(`| Depth | Type | ID | Name |`);
  console.log(`|-------|------|-----|------|`);
  for (const r of results.sort((a, b) => a.depth - b.depth)) {
    console.log(`| ${r.depth} | ${r.type} | \`${r.id}\` | ${r.name.slice(0, 60)} |`);
  }
  db.close();
}

function reset(): void {
  const db = openDb();
  db.exec("DROP TABLE IF EXISTS biz_edges; DROP TABLE IF EXISTS biz_nodes; DROP TABLE IF EXISTS biz_fts;");
  db.exec(SCHEMA_SQL);
  console.log("[OK] biz graph reset.");
  db.close();
}

// ===== CLI =====

const args = process.argv.slice(2);
const cmd = args[0];

switch (cmd) {
  case "build":
    build();
    break;
  case "sync":
    // For now, sync = full rebuild. Incremental later.
    build();
    break;
  case "status":
    status();
    break;
  case "query": {
    const text = args.slice(1).join(" ");
    if (!text) {
      console.error("Usage: sop-biz-graph query <text>");
      process.exit(1);
    }
    query(text);
    break;
  }
  case "node": {
    const id = args[1];
    if (!id) {
      console.error("Usage: sop-biz-graph node <id>");
      process.exit(1);
    }
    showNode(id);
    break;
  }
  case "trace": {
    const id = args[1];
    if (!id) {
      console.error("Usage: sop-biz-graph trace <trace_id>");
      process.exit(1);
    }
    trace(id);
    break;
  }
  case "affected": {
    const id = args[1];
    const depth = args[2] ? parseInt(args[2], 10) : 3;
    if (!id) {
      console.error("Usage: sop-biz-graph affected <node_id> [depth]");
      process.exit(1);
    }
    affected(id, depth);
    break;
  }
  case "reset":
    reset();
    break;
  default:
    console.log(`Usage: sop-biz-graph <command>

Commands:
  build                   Full rebuild from .sop/output + .sop/state
  sync                    Incremental update (currently same as build)
  status                  Show node/edge counts by type
  query <text>            FTS5 search across node names and metadata
  node <id>               Show one node + its edges
  trace <trace_id>        Full lineage for a SOP run
  affected <id> [depth]   Downstream impact (BFS, default depth=3)
  reset                   Drop and recreate the database

Examples:
  sop-biz-graph build
  sop-biz-graph query "用户登录"
  sop-biz-graph node prd:logistics-20260508
  sop-biz-graph trace prd-2026-06-10-abc123
  sop-biz-graph affected us:prd:logistics-20260508:US-001
`);
    if (!cmd) process.exit(0);
    process.exit(1);
}
