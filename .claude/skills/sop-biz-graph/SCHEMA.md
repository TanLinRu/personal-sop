# sop-biz-graph — Business Document Graph Schema

> **目标**：把 SOP 产生的所有业务文档（PRD / 知识 / 测试用例 / 决策 / 部署 / 故障）汇成一张**可查询的图**，做到：
> - "改了 PRD 里的 US-003，影响哪些测试和代码？"
> - "这个 trace_id 的全链路 lineage？"
> - "knowledge-logistics 被哪些 PRD 引用？"
>
> **不是替代 CodeGraph**：CodeGraph = 代码层，sop-biz-graph = 业务文档层；二者通过 `code_ref` 边连接。

## 设计原则

1. **SQLite + WAL** — 与 CodeGraph 同款技术栈，支持并发读、单写
2. **不重复造轮子** — node 字段最小化，详细内容仍在 markdown 文件
3. **trace_id 作为一等公民** — 沿用 Phase D2 的 traceability 模型
4. **增量更新** — 文件变化只更新对应节点

## 节点类型（nodes）

| 类型 | 来源 | 说明 |
|------|------|------|
| `sop_run` | `.sop/state/*.json` | 一次 SOP 执行，含 trace_id |
| `prd` | `.sop/output/prd-*.md` | PRD 文档 |
| `user_story` | PRD §3 表格行 | 用户故事 (US-001 等) |
| `acceptance_criterion` | PRD AC 列 | Given/When/Then 断言 |
| `feature` | PRD §4 表格行 | 功能项 (F-01 等) |
| `test_case` | `.sop/output/test-cases-*.md` 或 `*Test.java` | 测试用例 |
| `knowledge` | `.sop/knowledge/*.md` | 领域知识文档 |
| `decision` | PRD §6 决策日志 | 重大决策 |
| `risk` | PRD §6 风险表 | 已识别风险 |
| `deployment` | `.sop/output/deploy-*/*.md` | 部署记录 |
| `incident` | sop-incident-response 产出 | 线上事件 |
| `verify_report` | `.sop/output/verify-*.md` | 验证报告 |
| `prototype` | `.sop/output/prototype-*.html` | HTML 原型 |
| `code_ref` | CodeGraph 符号 | 桥接代码层（仅存符号 ID + 文件路径）|

## 边类型（edges）

| 边 | from → to | 含义 |
|---|----------|------|
| `produces` | sop_run → 任意产出 | SOP 产生了什么 |
| `consumes` | sop_run → 输入产物 | SOP 引用了什么 |
| `traces_to` | child → parent | 跨 SOP 父子关系（Phase D2）|
| `references` | doc → doc | 文档间引用（PRD → knowledge） |
| `implements` | feature → user_story | 功能实现哪个故事 |
| `verifies` | test_case → user_story\|feature | 测试验证哪个需求 |
| `validates` | acceptance_criterion → user_story | AC 属于哪个故事 |
| `mitigates` | decision → risk | 决策缓解风险 |
| `deploys` | deployment → feature | 部署哪些功能 |
| `caused_by` | incident → deployment\|feature | 故障归因 |
| `code_ref` | feature\|user_story → code_ref | 业务 → 代码桥接 |

## SQLite Schema

```sql
-- biz_nodes：通用节点表
CREATE TABLE biz_nodes (
  id          TEXT PRIMARY KEY,           -- 形如 "prd:logistics-2026-06-10" 或 "us:US-001"
  type        TEXT NOT NULL,              -- prd / user_story / test_case / ...
  name        TEXT NOT NULL,              -- 人可读名（如 "用户登录"）
  trace_id    TEXT,                       -- 对应的 SOP trace_id（继承自 sop_run）
  source_file TEXT,                       -- 文档物理路径
  source_line INTEGER,                    -- 在源文档中的行号（如 PRD §3 第 5 行）
  metadata    TEXT,                       -- JSON：tier, priority, invest_score, etc.
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX idx_biz_nodes_type ON biz_nodes(type);
CREATE INDEX idx_biz_nodes_trace ON biz_nodes(trace_id);
CREATE INDEX idx_biz_nodes_source ON biz_nodes(source_file);

-- biz_edges：通用边表
CREATE TABLE biz_edges (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  from_id   TEXT NOT NULL,
  to_id     TEXT NOT NULL,
  type      TEXT NOT NULL,                -- produces / verifies / ...
  metadata  TEXT,                         -- JSON：confidence, depth, etc.
  created_at TEXT NOT NULL,
  UNIQUE(from_id, to_id, type),
  FOREIGN KEY (from_id) REFERENCES biz_nodes(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id)   REFERENCES biz_nodes(id) ON DELETE CASCADE
);
CREATE INDEX idx_biz_edges_from ON biz_edges(from_id);
CREATE INDEX idx_biz_edges_to ON biz_edges(to_id);
CREATE INDEX idx_biz_edges_type ON biz_edges(type);

-- biz_fts：FTS5 全文搜索（节点 name + metadata）
CREATE VIRTUAL TABLE biz_fts USING fts5(id UNINDEXED, name, metadata);

-- 触发器：保持 FTS 同步
CREATE TRIGGER biz_nodes_fts_insert AFTER INSERT ON biz_nodes BEGIN
  INSERT INTO biz_fts(id, name, metadata) VALUES (NEW.id, NEW.name, NEW.metadata);
END;
CREATE TRIGGER biz_nodes_fts_update AFTER UPDATE ON biz_nodes BEGIN
  UPDATE biz_fts SET name=NEW.name, metadata=NEW.metadata WHERE id=NEW.id;
END;
CREATE TRIGGER biz_nodes_fts_delete AFTER DELETE ON biz_nodes BEGIN
  DELETE FROM biz_fts WHERE id=OLD.id;
END;
```

## 节点 ID 命名规范

| 类型 | ID 格式 | 例 |
|------|---------|-----|
| sop_run | `run:{trace_id}` | `run:prd-2026-06-10-abc123` |
| prd | `prd:{kebab-name}-{date}` | `prd:logistics-20260508` |
| user_story | `us:{prd_id}:{story_id}` | `us:prd:logistics-20260508:US-001` |
| feature | `feat:{prd_id}:{feat_id}` | `feat:prd:logistics-20260508:F-01` |
| acceptance_criterion | `ac:{us_id}:{n}` | `ac:us:...US-001:1` |
| knowledge | `kn:{kebab-name}-{date}` | `kn:logistics-20260508` |
| decision | `dec:{prd_id}:{n}` | `dec:prd:...:1` |
| risk | `risk:{prd_id}:{n}` | `risk:prd:...:1` |
| test_case | `tc:{TC-ID}` 或 `tc:{file}::{method}` | `tc:OrderServiceTest::testCreate` |
| deployment | `deploy:{date}-{version}` | `deploy:20260601-v1.2.0` |
| incident | `inc:{date}-{n}` | `inc:20260601-1` |
| verify_report | `verify:{sop}-{date}` | `verify:prd-20260610` |
| prototype | `proto:{prd_id}` | `proto:prd:logistics-20260508` |
| code_ref | `code:{file_path}::{symbol}` | `code:src/.../OrderService.java::createOrder` |

## 提取规则

### 从 .sop/state/*.json → sop_run

每个 JSON：
- 创建 `sop_run` 节点，id = `run:{trace_id}`
- name = `{sop} ({status})`
- metadata = `{trace_id, started_at, completed_at, current_step, sop, status}`

### 从 .sop/output/prd-*.md → prd + user_story + ...

解析 frontmatter（trace_id, tier, version）+ 章节正文：
- 创建 `prd` 节点
- §3 表格每行 → `user_story` 节点 + `(prd) -[produces]-> (us)`
- §4 表格每行 → `feature` 节点 + `(prd) -[produces]-> (feat)`
- 故事 AC 列拆分 → `acceptance_criterion` 节点 + `(us) -[validates]- (ac)`（反向）
- §6 决策表 → `decision` 节点
- §6 风险表 → `risk` 节点
- §7 引用 knowledge → `(prd) -[references]-> (kn)`
- frontmatter trace_id 关联 → `(run) -[produces]-> (prd)`

### 从 .sop/knowledge/*.md → knowledge

简单：1 文件 = 1 knowledge 节点

### 从 .sop/output/test-cases-*.md → test_case + verifies

每个 TC 行 + 关联的 US-id → `(tc) -[verifies]-> (us)`

### 从 git log → traces_to / deployment

后续可扩展，scan commit messages for `[trace: xxx]` and `Deploy v...`.

## 索引存储位置

```
.sop/biz-graph/
├── biz.db           # SQLite (with WAL)
├── biz.db-wal
├── biz.db-shm
└── stats.json       # 上次 build 统计：node count, edge count, last_run
```

## 与 CodeGraph 的协作

| 关系 | 方向 |
|------|------|
| sop-biz-graph "改了 US-003 影响哪些代码？" | biz: us → feat → code_ref → CodeGraph: callers/impact |
| sop-biz-graph "这个 PRD 涉及多少代码？" | biz: prd → feats → code_refs → 计数 |
| CodeGraph "改了 OrderService 影响哪些 PRD？" | CodeGraph: callers → code_ref（biz）→ feats → prds |

桥接规则：`code_ref` 节点的 ID 与 CodeGraph 的 fully-qualified symbol 一致，便于 join。

## 版本

- v0.1.0 (2026-06-14, Phase E2.1)：schema 定稿
- 后续：增加 OTel trace 集成、跨项目 graph 合并、可视化 web UI
