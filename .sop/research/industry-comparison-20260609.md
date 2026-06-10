# Industry Product Comparison: AI-Agent SOP Automation Patterns

> Research Date: 2026-06-09
> Scope: 8 products compared against our SOP system architecture

---

## Executive Summary

Our SOP system is a **markdown-driven, agent-native workflow framework** that runs inside Claude/OpenCode. Compared to industry products, we have unique strengths in human-in-the-loop design and zero-infrastructure execution, but lack structured workflow definitions, formal error recovery, and composability patterns that these products have proven essential.

**Top 5 actionable insights:**
1. Adopt YAML/JSON structured workflow definitions (from CrewAI/Dify) alongside SKILL.md
2. Implement formal checkpoint/restore with replay capability (from Temporal/CrewAI)
3. Add task-level guardrails and retry policies (from CrewAI/Prefect)
4. Support sub-SOP composition and delegation (from n8n/CrewAI)
5. Add workflow validation/linting before execution (from Dify/n8n)

---

## 1. Dify.ai — Visual LLM Workflow Platform

### What It Does Well
- **Node-based DAG execution**: Each step is a node (LLM, Tool, Code, IF/ELSE, Variable Aggregator) connected by edges
- **Visual workflow builder**: Drag-and-drop canvas for non-technical users
- **Built-in variable system**: Each node outputs typed variables that downstream nodes consume
- **Iteration nodes**: Loop over arrays with sub-workflows
- **Parallel branching**: Fan-out/fan-in with automatic aggregation

### Workflow Definition Schema
```json
{
  "graph": {
    "nodes": [
      {"id": "start", "type": "start", "data": {"variables": [...]}},
      {"id": "llm_1", "type": "llm", "data": {"model": "gpt-4", "prompt": "..."}},
      {"id": "if_1", "type": "if-else", "data": {"conditions": [...]}}
    ],
    "edges": [
      {"source": "start", "target": "llm_1"},
      {"source": "llm_1", "target": "if_1", "sourceHandle": "true"}
    ]
  }
}
```

### State/Checkpointing
- Each node's output is cached independently
- Workflow can be re-run from any node (partial execution)
- Variable snapshots at each node boundary

### Error Handling
- Try/catch wrapping per node
- Default fallback values for failed nodes
- Error branch routing (IF/ELSE on error state)

### Human-in-the-Loop
- **Form nodes**: Collect user input mid-workflow
- **Approval nodes**: Pause execution for human review
- **Manual trigger nodes**: Human-initiated steps

### Validation
- Pre-execution graph validation (cycle detection, type checking)
- Variable type mismatch warnings
- Missing connection detection

### Reusability
- Sub-workflow nodes (call other workflows)
- Workflow templates with parameterization
- Shared tool/provider configurations

### Comparison with Our System

| Dimension | Dify | Our System | Gap |
|-----------|------|-----------|-----|
| Workflow DSL | JSON graph (nodes+edges) | Markdown (SKILL.md) | **We need structured schema** |
| Variable typing | Typed per-node | `answers` dict (untyped) | **Add typed params** |
| Conditional branching | IF/ELSE nodes | Step markers only | **Add conditional routing** |
| Parallel execution | Built-in fan-out/fan-in | `parallel_tasks` in YAML | Similar, but less formal |
| Validation | Pre-execution graph check | None | **Add workflow linting** |
| Human input | Form/Approval nodes | `[CONFIRM_REQUIRED]` marker | Similar concept |

### Actionable Insights
1. **Define a formal node graph schema** for SOP steps (beyond markdown markers)
2. **Add pre-execution validation**: cycle detection, missing dependencies, type checking
3. **Support conditional branching**: IF/ELSE between steps based on outputs

---

## 2. CrewAI — Multi-Agent Orchestration Framework

### What It Does Well
- **Role-based agents**: Each agent has role, goal, backstory, tools
- **Task delegation**: Agents can delegate to other agents
- **Process types**: Sequential, Hierarchical (manager agent assigns)
- **Task guardrails**: Validate output before passing to next task (function or LLM-based)
- **Checkpointing**: Auto-save after task completion, resume from checkpoint
- **YAML-driven config**: agents.yaml + tasks.yaml separation

### Workflow Definition Schema
```yaml
# agents.yaml
researcher:
  role: "Senior Data Researcher"
  goal: "Uncover cutting-edge developments"
  backstory: "You're a seasoned researcher..."
  max_retry_limit: 2

# tasks.yaml
research_task:
  description: "Conduct thorough research about {topic}"
  expected_output: "A list with 10 bullet points"
  agent: researcher
  guardrail: "Must be under 200 words and contain no jargon"
  guardrail_max_retries: 3
```

### State/Checkpointing
- `checkpoint=True` saves after every task completion
- `CheckpointConfig(location, on_events, max_checkpoints)`
- `Crew.from_checkpoint(".checkpoints/latest.json")` to resume
- JSON or SQLite storage backends

### Error Handling
- **Task guardrails**: Function-based or LLM-based validation
- `guardrail_max_retries`: Auto-retry with agent feedback
- **Step callbacks**: Monitor each agent step
- **Max iterations**: Agent iteration limits

### Human-in-the-Loop
- `human_input=True` on tasks: Pause for human review
- `before_kickoff` / `after_kickoff` callbacks
- CLI `crewai replay -t <task_id>` for re-running from specific task

### Validation
- Pydantic model validation for structured outputs
- `output_json` / `output_pydantic` for type-safe task outputs
- Guardrail functions validate before proceeding

### Reusability
- `@CrewBase` decorator pattern for reusable crew definitions
- YAML config separation from code
- Sub-crews via task context dependencies

### Comparison with Our System

| Dimension | CrewAI | Our System | Gap |
|-----------|--------|-----------|-----|
| Agent definition | YAML + Python class | SKILL.md frontmatter | Similar richness |
| Task guardrails | Function/LLM-based | `expected.yml` validate rules | **We're close, need function guardrails** |
| Checkpointing | Auto + resume API | `.sop/state/*.json` manual | **Need auto-checkpoint + resume API** |
| Output validation | Pydantic models | `not_empty`, `contains:` rules | **Need structured output schemas** |
| Process types | Sequential/Hierarchical | sequential/parallel/hybrid | Similar |
| Replay | CLI `crewai replay -t` | Resume from `current_step` | Similar, but no task-level replay |

### Actionable Insights
1. **Add function-based guardrails**: Let SOP steps define validation functions, not just string rules
2. **Implement auto-checkpoint after each step** (not just manual state saves)
3. **Support task-level replay**: `sop replay --step=3` to re-run from a specific step
4. **Add Pydantic-like output schemas** for step outputs (typed, validated)

---

## 3. LangGraph — Stateful Agent Workflows

### What It Does Well
- **Graph-based execution**: Nodes are functions, edges are conditional routing
- **Persistent state**: Typed state object flows through the graph
- **Checkpointing**: Built-in checkpointers (SQLite, PostgreSQL)
- **Human-in-the-loop**: `interrupt_before` / `interrupt_after` on any node
- **Streaming**: Real-time output as nodes execute
- **Sub-graphs**: Compose graphs within graphs

### Workflow Definition Schema
```python
from langgraph.graph import StateGraph

class WorkflowState(TypedDict):
    messages: list
    current_step: str
    findings: dict

graph = StateGraph(WorkflowState)
graph.add_node("research", research_fn)
graph.add_node("analyze", analyze_fn)
graph.add_edge("research", "analyze")
graph.add_conditional_edges("analyze", route_fn, {"pass": "end", "fail": "research"})

graph = graph.compile(
    checkpointer=SqliteSaver.from_conn_string(":memory:"),
    interrupt_before=["human_review"]
)
```

### State/Checkpointing
- **Typed state object**: Every node reads/writes typed state
- **Automatic checkpointing**: After every node execution
- **Time-travel**: Jump to any checkpoint and re-execute from there
- **Forking**: Create branches from any checkpoint

### Error Handling
- **Conditional edges**: Route based on state (error → retry node)
- **Retry policies**: Per-node retry with exponential backoff
- **Error nodes**: Dedicated error handling nodes in graph

### Human-in-the-Loop
- `interrupt_before=["node_name"]`: Pause before specific nodes
- `interrupt_after=["node_name"]`: Pause after specific nodes
- **State modification**: Human can modify state before resuming
- `Command(resume=value)`: Resume with human input

### Validation
- Typed state enforces schema at compile time
- Node input/output type checking
- Graph structure validation (no orphan nodes, etc.)

### Reusability
- **Sub-graphs**: Embed graphs within graphs
- **Compiled graph**: Shareable, serializable workflow definitions
- **Template patterns**: Common graph structures as reusable components

### Comparison with Our System

| Dimension | LangGraph | Our System | Gap |
|-----------|-----------|-----------|-----|
| State model | Typed TypedDict | JSON `answers` dict | **Need typed state** |
| Checkpointing | Auto + time-travel + fork | Manual JSON save | **Major gap: need time-travel** |
| Conditional routing | `add_conditional_edges` | Step markers only | **Need conditional routing** |
| Human interrupt | `interrupt_before/after` | `[CONFIRM_REQUIRED]` | Similar concept, less formal |
| Sub-workflows | Sub-graphs | Agent delegation | **Need SOP composition** |
| Streaming | Built-in node streaming | Progress display | We have progress, no streaming |

### Actionable Insights
1. **Implement typed state model**: Replace free-form `answers` with schema-validated state
2. **Add time-travel capability**: Jump to any checkpoint, fork execution
3. **Support conditional edges**: Route between steps based on state values
4. **Add sub-SOP composition**: One SOP can invoke another as a sub-graph

---

## 4. n8n — Workflow Automation Platform

### What It Does Well
- **Visual node editor**: 400+ integration nodes with drag-and-drop
- **Error handling**: Per-node error workflows, retry on fail, continue-on-fail
- **Sub-workflows**: Call other workflows as nodes
- **Webhook triggers**: External event-driven execution
- **Expression language**: Dynamic data transformation between nodes
- **Execution history**: Full execution log with per-node data inspection

### Workflow Definition Schema
```json
{
  "nodes": [
    {
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [250, 300]
    },
    {
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {"url": "={{$json.apiUrl}}", "method": "GET"},
      "onError": "continueRegularOutput"
    }
  ],
  "connections": {
    "Start": {"main": [[{"node": "HTTP Request", "type": "main", "index": 0}]]}
  }
}
```

### State/Checkpointing
- Per-node execution data saved
- Can re-run from any node with "dirty node" concept
- Execution history with full data snapshots

### Error Handling
- **On Error settings**: Stop workflow, continue with error output, retry
- **Retry on fail**: Configurable retry count and wait time
- **Error trigger nodes**: Dedicated error handling workflows
- **Continue on fail**: Skip failed nodes, pass empty data

### Human-in-the-loop
- **Wait nodes**: Pause for webhook callback or form submission
- **Form trigger nodes**: Collect user input via web forms
- **Approval workflows**: Manual intervention points

### Validation
- Node parameter validation on save
- Connection type checking
- Expression syntax validation
- Workflow test execution mode

### Reusability
- **Sub-workflows**: `Execute Workflow` node calls other workflows
- **Workflow templates**: Community-shared templates
- **Credential sharing**: Shared auth across workflows
- **Custom nodes**: Extensible node types

### Comparison with Our System

| Dimension | n8n | Our System | Gap |
|-----------|-----|-----------|-----|
| Error handling | Per-node retry + error workflows | Table in SKILL.md | **Need formal retry policies** |
| Sub-workflows | Execute Workflow node | Agent delegation | **Need SOP-to-SOP calls** |
| Execution history | Full per-node data | `.sop/state/*.json` only | **Need richer execution logs** |
| Conditional routing | IF/Switch nodes | Step markers | **Need conditional nodes** |
| Reusability | Templates + custom nodes | Skill loading | Similar, but no marketplace |
| Retry logic | Count + wait time per node | None formal | **Add retry to framework** |

### Actionable Insights
1. **Add per-step retry policy**: `retry: {count: 3, delay: 5000, backoff: exponential}`
2. **Implement error workflows**: If step fails, route to error-handling SOP
3. **Add execution data inspection**: Full data snapshot at each step for debugging
4. **Support SOP-to-SOP calls**: One SOP can invoke another as a sub-workflow

---

## 5. Temporal.io — Durable Workflow Execution

### What It Does Well
- **Code-as-workflow**: Workflow definitions are regular code (Go/Java/TS/Python)
- **Durable execution**: Survives process crashes, server restarts
- **Event sourcing**: Complete event history for replay
- **Activity retries**: Configurable retry policies per activity
- **Saga patterns**: Compensating transactions for distributed workflows
- **Workflow versioning**: Safe deployment of workflow changes

### Workflow Definition Schema
```typescript
// Workflow definition (TypeScript)
export async function orderWorkflow(orderId: string): Promise<OrderResult> {
  const order = await getOrder(orderId);           // Activity
  await processPayment(order);                      // Activity
  
  try {
    await shipOrder(order);                         // Activity
  } catch (err) {
    await refundPayment(order);                     // Compensating action
    throw err;
  }
  
  return { status: 'completed', orderId };
}

// Activity retry policy
const activityOptions = {
  startToCloseTimeout: '30s',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '30s',
    maximumAttempts: 3,
  },
};
```

### State/Checkpointing
- **Event History**: Complete ordered log of everything that happened
- **Replay**: Re-execute workflow from event history (deterministic)
- **Workflow state**: Reconstructed from event history
- **No snapshots needed**: State rebuilt by replaying events

### Error Handling
- **Activity retry policies**: initial interval, backoff coefficient, max attempts
- **Compensating transactions**: Saga pattern for rollback
- **Workflow timeouts**: Start-to-close, schedule-to-start
- **Heartbeat timeouts**: Long-running activity monitoring

### Human-in-the-Loop
- **Signals**: External events sent to running workflows
- **Queries**: Read workflow state without modifying
- **Update handlers**: Modify workflow behavior mid-execution
- **Workflow pause/resume**: Via API

### Validation
- Deterministic execution constraints (no random, no time calls in workflow)
- Replay consistency checking
- Workflow type registration and versioning

### Reusability
- **Activity libraries**: Shared activity definitions
- **Workflow child workflows**: Compose workflows
- **Worker pools**: Shared execution infrastructure
- **Namespace isolation**: Multi-tenant workflow separation

### Comparison with Our System

| Dimension | Temporal | Our System | Gap |
|-----------|----------|-----------|-----|
| Durability | Event-sourced, survives crashes | JSON file on disk | **Major gap: no durability** |
| Replay | Full deterministic replay | Resume from step number | **Need event-sourced replay** |
| Retry policies | Rich (interval, backoff, max) | None | **Add retry to framework** |
| Compensating actions | Saga pattern built-in | None | **Add rollback capability** |
| Versioning | Workflow versioning | SKILL.md version field | **Need migration support** |
| Signals | External events to workflow | None | **Add signal/event support** |

### Actionable Insights
1. **Implement event sourcing**: Log every step execution as an event (not just status)
2. **Add rich retry policies**: Exponential backoff, max attempts, dead-letter
3. **Support compensating actions**: Define rollback steps for each SOP step
4. **Add workflow versioning**: Safe migration when SOP definitions change

---

## 6. Prefect — Data Pipeline Orchestration

### What It Does Well
- **Decorator-based definition**: `@flow` and `@task` decorators on Python functions
- **Task caching**: Cache results based on input keys
- **Retry with delay**: `retries=3, retry_delay_seconds=10`
- **Task runners**: ThreadPool, ProcessPool, concurrent execution
- **Parameterization**: Typed flow parameters with Pydantic validation
- **Scheduling**: Cron-based and interval-based scheduling

### Workflow Definition Schema
```python
from prefect import flow, task
from pydantic import BaseModel

class FlowParams(BaseModel):
    topic: str
    max_results: int = 10

@task(retries=3, retry_delay_seconds=10, 
      cache_key_fn=lambda ctx, params: f"research-{params[0]}",
      cache_expiration=timedelta(hours=1))
def research(topic: str) -> list:
    return search_web(topic)

@task(timeout_seconds=30)
def analyze(findings: list) -> dict:
    return {"summary": summarize(findings)}

@flow(name="Research Flow", validate_parameters=True)
def research_flow(params: FlowParams):
    findings = research(params.topic)
    result = analyze(findings)
    return result
```

### State/Checkpointing
- **Task-level caching**: Cache results by key, reuse on re-run
- **Flow run state**: Pending → Running → Completed/Failed
- **Task run states**: Independent per-task state tracking
- **Result persistence**: Store task results for later retrieval

### Error Handling
- **Task retries**: Count + delay + backoff
- **Timeout enforcement**: Per-task and per-flow timeouts
- **State transitions**: Failed → Retry → Completed
- **Flow-level retry**: Retry entire flow on failure

### Human-in-the-Loop
- **Pause/Resume**: `pause_flow_run()` and `resume_flow_run()`
- **Input collection**: `wait_for_input()` during flow execution
- **Approval gates**: Manual approval before continuing

### Validation
- Pydantic parameter validation
- Type hints enforcement
- `validate_parameters=True` on flow decorator

### Reusability
- **Task library**: Reusable tasks across flows
- **Flow composition**: Call flows from flows
- **Deployment templates**: Reusable flow configurations
- **Tags and labels**: Organize and filter flows

### Comparison with Our System

| Dimension | Prefect | Our System | Gap |
|-----------|---------|-----------|-----|
| Definition | Python decorators | Markdown + YAML | Different paradigm |
| Caching | Task-level cache by key | None | **Add step result caching** |
| Retries | Count + delay + backoff | None | **Add retry to framework** |
| Parameters | Pydantic models | `expected_params` in YAML | **Need Pydantic validation** |
| Timeouts | Per-task + per-flow | `timeout: 300000` (execution-level) | **Need per-step timeouts** |
| Scheduling | Cron + interval | None | **Add scheduling** |

### Actionable Insights
1. **Add step result caching**: Cache expensive step outputs (e.g., research results)
2. **Implement per-step timeouts**: Not just execution-level timeout
3. **Add scheduling**: Run SOPs on schedule (e.g., daily code review)
4. **Support parameterized SOPs**: Typed parameter validation before execution

---

## 7. GitHub Actions — CI/CD Workflows

### What It Does Well
- **YAML workflow definitions**: Declarative, version-controlled
- **Reusable workflows**: `workflow_call` for composition
- **Composite actions**: Bundle multiple steps into reusable action
- **Matrix builds**: Parameterized parallel execution
- **Concurrency groups**: Prevent duplicate runs
- **Environment protection**: Required reviewers for deployments

### Workflow Definition Schema
```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [dev, staging, prod]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
    timeout-minutes: 10
    
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - run: ./deploy.sh
```

### State/Checkpointing
- **Job-level state**: Each job is independent
- **Artifact passing**: Upload/download between jobs
- **Cache**: Dependency caching across runs
- **No mid-workflow checkpoint**: Jobs run to completion

### Error Handling
- **`continue-on-error`**: Step-level error tolerance
- **`if: failure()`**: Run steps only on failure
- **Timeout per job**: `timeout-minutes`
- **Retry via re-run**: Manual or automatic re-run of failed jobs

### Human-in-the-Loop
- **Environment protection rules**: Required reviewers
- **Manual dispatch**: `workflow_dispatch` with input parameters
- **Approval gates**: Wait for approval before deployment

### Validation
- YAML schema validation on push
- Action input/output type checking
- Workflow syntax validation

### Reusability
- **Reusable workflows**: `workflow_call` trigger
- **Composite actions**: Multi-step actions as single unit
- **Shared workflows**: Organization-level workflow sharing
- **Matrix strategy**: Parameterized parallel jobs

### Comparison with Our System

| Dimension | GitHub Actions | Our System | Gap |
|-----------|---------------|-----------|-----|
| Definition | YAML (version controlled) | Markdown + YAML (version controlled) | Similar |
| Reusability | Reusable workflows + composite actions | Skill loading + Agent delegation | **Need composite SOPs** |
| Matrix builds | Parameterized parallel | `parallel_tasks` | Similar, but no matrix |
| Protection rules | Environment reviewers | `[CONFIRM_REQUIRED]` | Similar concept |
| Scheduling | Cron triggers | None | **Add scheduling** |
| Caching | Dependency cache | None | **Add caching** |

### Actionable Insights
1. **Support composite SOPs**: Bundle multiple SOPs into a reusable unit
2. **Add matrix execution**: Run same SOP with different parameters in parallel
3. **Implement dependency caching**: Cache step outputs across SOP runs

---

## 8. Make.com — Visual Automation Platform

### What It Does Well
- **Visual scenario builder**: Drag-and-drop module connections
- **Error handling routes**: Dedicated error handler branches
- **Data transformation**: Built-in JSON/formula transformation
- **Scheduling**: Interval-based and cron-based triggers
- **Webhook triggers**: External event-driven execution
- **Scenario templates**: Community-shared templates

### Workflow Definition (Internal)
- Modules connected by routes
- Each module has: type, parameters, error handler, retry settings
- Routes have: filter conditions, error handling
- Scenarios have: scheduling, data store, connections

### Error Handling
- **Error handler routes**: Dedicated branch on error
- **Resume from failed module**: Re-run from specific point
- **Break/ignore/commit**: Three error handling strategies
- **Max errors before stop**: Configurable threshold

### Human-in-the-Loop
- **Webhook response nodes**: Wait for external input
- **Approval emails**: Send approval request, wait for response
- **Form triggers**: Collect user input to start scenario

### Reusability
- **Scenario templates**: Pre-built automation templates
- **Custom apps**: Build reusable module bundles
- **Shared connections**: OAuth/API key sharing across scenarios

### Comparison with Our System

| Dimension | Make.com | Our System | Gap |
|-----------|----------|-----------|-----|
| Error handling | Dedicated error routes + resume | Table in SKILL.md | **Need error routes** |
| Data transformation | Built-in formula engine | Agent-driven | Different approach |
| Scheduling | Cron + interval triggers | None | **Add scheduling** |
| Templates | Community marketplace | Skill loading | **Need template sharing** |
| Resume | From failed module | From `current_step` | Similar |

### Actionable Insights
1. **Add error handler routes**: Dedicated error-handling steps in SOPs
2. **Support SOP templates**: Shareable, parameterized SOP templates
3. **Add scheduling**: Run SOPs on cron schedule

---

## Consolidated Gap Analysis

### Our Current System Strengths
| Strength | Evidence |
|----------|----------|
| Zero infrastructure | Runs inside Claude/OpenCode, no server needed |
| Natural language workflow | Markdown SKILL.md is human-readable |
| Multi-perspective review | 8 subAgents for verification |
| Human-in-the-loop | `[CONFIRM_REQUIRED]` step markers |
| Platform flexibility | Works on OpenCode and Claude CLI |
| Verification DSL | `expected.yml` with validation rules |

### Critical Gaps (Priority Order)

| # | Gap | Impact | Products That Solve It |
|---|-----|--------|----------------------|
| 1 | **No formal retry/recovery** | Failed steps require manual restart | Temporal, CrewAI, Prefect |
| 2 | **No conditional routing** | Can't branch based on step output | Dify, LangGraph, n8n |
| 3 | **No typed state model** | Free-form JSON, no validation | LangGraph, Prefect, CrewAI |
| 4 | **No pre-execution validation** | Errors discovered at runtime | Dify, n8n, GitHub Actions |
| 5 | **No SOP composition** | Can't call one SOP from another | n8n, CrewAI, GitHub Actions |
| 6 | **No step result caching** | Re-executes expensive steps | Prefect, Dify |
| 7 | **No scheduling** | Manual trigger only | Prefect, Make.com, GitHub Actions |
| 8 | **No time-travel replay** | Can't fork from checkpoint | LangGraph, Temporal |
| 9 | **No compensating actions** | No automatic rollback | Temporal (Saga pattern) |
| 10 | **No execution streaming** | Can't observe step outputs live | LangGraph, CrewAI |

---

## Recommended Implementation Roadmap

### Phase 1: Foundation (v2.0)
1. **Structured workflow schema**: YAML/JSON alongside SKILL.md
2. **Auto-checkpoint after every step**: Not just on user action
3. **Retry policies per step**: `retry: {count: 3, delay: 5000, backoff: exponential}`
4. **Pre-execution validation**: Check dependencies, types, cycles before running

### Phase 2: Control Flow (v2.1)
5. **Conditional routing**: `if/else` between steps based on state
6. **Step result caching**: Cache expensive step outputs
7. **Per-step timeouts**: Not just execution-level timeout
8. **Error handler routes**: Dedicated error-handling steps

### Phase 3: Composition (v2.2)
9. **Sub-SOP invocation**: One SOP calls another as sub-workflow
10. **Composite SOPs**: Bundle multiple SOPs into reusable unit
11. **Matrix execution**: Same SOP with different params in parallel
12. **SOP templates**: Shareable, parameterized SOP definitions

### Phase 4: Advanced (v3.0)
13. **Typed state model**: Schema-validated state object
14. **Time-travel replay**: Fork from any checkpoint
15. **Event sourcing**: Complete execution event log
16. **Scheduling**: Cron-based SOP execution
17. **Compensating actions**: Automatic rollback on failure

---

## Appendix: Product-Specific Reference Links

| Product | Key Docs |
|---------|----------|
| Dify | https://docs.dify.ai/guides/workflow |
| CrewAI | https://docs.crewai.com/concepts/agents, /tasks, /crews |
| LangGraph | https://langchain-ai.github.io/langgraph/concepts/low_level/ |
| n8n | https://docs.n8n.io/workflows/ |
| Temporal | https://docs.temporal.io/workflows |
| Prefect | https://docs.prefect.io/latest/concepts/flows/ |
| GitHub Actions | https://docs.github.com/en/actions |
| Make.com | https://www.make.com/en/help |
