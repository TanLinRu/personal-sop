#!/usr/bin/env ts-node

const fs = require("fs");
const path = require("path");

function getStateDir(): string {
  return path.resolve(process.cwd(), ".sop", "state");
}

function getStateFilePath(sop: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const dir = getStateDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.resolve(dir, `${sop}-${date}.json`);
}

function loadStepMap(): Record<string, string[]> {
  const mapPath = path.resolve(__dirname, "sop-step-map.json");
  if (!fs.existsSync(mapPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(mapPath, "utf-8"));
}

function loadState(sop: string): any {
  const filePath = getStateFilePath(sop);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function saveState(sop: string, step: string, status: string, answers?: Record<string, unknown>): void {
  const filePath = getStateFilePath(sop);
  const stepMap = loadStepMap();

  let state: any;
  if (fs.existsSync(filePath)) {
    try {
      state = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      state = createInitialState(sop);
    }
  } else {
    state = createInitialState(sop);
  }

  state.steps = state.steps || {};

  if (step) {
    state.steps[step] = {
      status,
      timestamp: new Date().toISOString(),
    };
  }

  // v1.1.0 新增：约束验证
  if (answers && Object.keys(answers).length > 0) {
    state.answers = state.answers || {};
    state.answers[step] = answers;

    // 获取当前 SOP 的约束规则
    const constraints = SOP_CONSTRAINTS[sop]?.[step] || {};
    const validationResults: Record<string, any> = {};

    // 验证每个答案字段
    for (const [key, value] of Object.entries(answers)) {
      const constraint = constraints[key];
      const result = validateConstraint(key, value, constraint);
      validationResults[key] = result;
    }

    // 保存验证结果
    state.validation = state.validation || {};
    state.validation[step] = validationResults;

    // 输出验证结果
    const hasErrors = Object.values(validationResults).some((r: any) => !r.valid);
    if (hasErrors) {
      console.warn("[WARN] Constraint validation failed:");
      for (const [key, result] of Object.entries(validationResults)) {
        if (!result.valid) {
          console.warn(`  - ${key}: ${result.error}`);
        }
      }
    } else {
      console.log("[OK] All constraints validated");
    }
  }

  // Advance current_step when a step completes
  if (status === "completed") {
    const steps = stepMap[sop];
    if (steps) {
      const idx = steps.indexOf(step);
      if (idx >= 0 && idx < steps.length - 1) {
        // More steps remain - advance to next
        state.current_step = idx + 2; // 1-based, next step
        state.status = "in_progress";
      } else if (idx === steps.length - 1) {
        // Last step completed - mark entire SOP as done
        state.status = "completed";
        state.completed_at = new Date().toISOString();
        state.current_step = steps.length;
      }
    } else {
      // No step map found - just mark step done, keep in_progress
      state.status = "in_progress";
    }
  } else if (status === "in_progress") {
    state.status = "in_progress";
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  console.log(`[OK] State saved: ${filePath}`);
  console.log(`[OK] Step: ${step} -> ${status}`);
  console.log(`[OK] current_step: ${state.current_step}`);
}

function createInitialState(sop: string): any {
  // Phase D2: trace_id format = {sop}-{YYYYMMDD}-{shortHash}
  // Allows linking PRD → tests → code → deploy across SOPs.
  const date = new Date().toISOString().slice(0, 10);
  const shortHash = Math.random().toString(36).slice(2, 8);
  const traceId = `${sop}-${date}-${shortHash}`;

  return {
    task_id: `${sop}-${Date.now()}`,
    trace_id: traceId,
    sop,
    status: "in_progress",
    started_at: new Date().toISOString(),
    current_step: 1,
    steps: {},
    answers: {},
    constraints: {}, // v1.1.0 新增：约束验证
    validation: {}, // v1.1.0 新增：验证结果
    parent_trace: null, // Phase D2: 上游 SOP 的 trace_id（如 prd → scaffold 时）
    children: [], // Phase D2: 下游 SOP 的 trace_id 列表
  };
}

// v1.1.0 新增：约束验证函数
function validateConstraint(field: string, value: any, constraint: any): { valid: boolean; error?: string } {
  if (!constraint) return { valid: true };

  // required 验证
  if (constraint.required && (value === undefined || value === null || value === "")) {
    return { valid: false, error: `${field} is required` };
  }

  // pattern 验证（正则）
  if (constraint.pattern && value) {
    const regex = new RegExp(constraint.pattern);
    if (!regex.test(value)) {
      return { valid: false, error: `${field} does not match pattern: ${constraint.pattern}` };
    }
  }

  // enum 验证
  if (constraint.enum && value) {
    if (!constraint.enum.includes(value)) {
      return { valid: false, error: `${field} must be one of: ${constraint.enum.join(", ")}` };
    }
  }

  // min/max 验证（数值）
  if (constraint.min !== undefined && value !== undefined) {
    if (Number(value) < constraint.min) {
      return { valid: false, error: `${field} must be >= ${constraint.min}` };
    }
  }
  if (constraint.max !== undefined && value !== undefined) {
    if (Number(value) > constraint.max) {
      return { valid: false, error: `${field} must be <= ${constraint.max}` };
    }
  }

  return { valid: true };
}

// 预定义的 SOP 约束规则
const SOP_CONSTRAINTS: Record<string, Record<string, any>> = {
  "sop-prd": {
    "1_confirm": {
      "project_name": { required: true, pattern: "^[a-z][a-z0-9-]*$" },
      "business_type": { required: true, enum: ["电商平台", "管理系统", "物流配送", "金融科技", "小程序", "移动App", "自定义"] },
      "doc_type": { required: true, enum: ["精简版", "标准版", "完整版"] }
    },
    "1_key_confirm": {
      "direction": { required: true, enum: ["效率提升", "用户体验", "智能自动化", "扩展性", "数据可视化", "自定义"] }
    }
  },
  "sop-scaffold": {
    "1_confirm": {
      "project_name": { required: true, pattern: "^[a-z][a-z0-9-]*$" },
      "tech_stack": { required: true, enum: ["spring-boot", "express", "fastapi", "nextjs", "react", "vue"] }
    }
  }
};

// CLI entry point
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node sop-state-save.ts <sop-name> <step> <status> [key=value...]");
  console.error("Example: node sop-state-save.ts scaffold 1_confirm in_progress");
  console.error("Example: node sop-state-save.ts scaffold 1_confirm completed project_name=myapp");
  process.exit(1);
}

const sop = args[0];
const step = args[1];
const status = args[2] || "in_progress";
const answers: Record<string, unknown> = {};

for (const arg of args.slice(3)) {
  const [key, value] = arg.split("=");
  if (key && value) {
    answers[key] = value;
  }
}

saveState(sop, step, status, Object.keys(answers).length > 0 ? answers : undefined);
process.exit(0);
