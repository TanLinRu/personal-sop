#!/usr/bin/env ts-node

/**
 * sop-chain.ts — SOP 链触发器
 *
 * 一个 SOP 完成后自动触发下游 SOP。
 *
 * Usage:
 *   npx ts-node --transpile-only .claude/scripts/sop-chain.ts <trigger-sop> <status> [verification-status]
 *
 * Examples:
 *   npx ts-node --transpile-only .claude/scripts/sop-chain.ts bug-fix completed
 *   npx ts-node --transpile-only .claude/scripts/sop-chain.ts prd completed passed
 */

import { existsSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { spawnSync } from "child_process";

interface ChainRule {
  trigger_sop: string;
  trigger_status: string[];
  target_sop: string;
  condition?: string;
}

const CHAIN_RULES: ChainRule[] = [
  { trigger_sop: "bug-fix", trigger_status: ["completed"], target_sop: "code-review", condition: "verification_passed" },
  { trigger_sop: "code-review", trigger_status: ["completed"], target_sop: "deployment", condition: "verification_passed" },
  { trigger_sop: "regression", trigger_status: ["completed"], target_sop: "bug-fix", condition: "has_failures" },
  { trigger_sop: "prd", trigger_status: ["completed"], target_sop: "test-design" },
  { trigger_sop: "test-design", trigger_status: ["completed"], target_sop: "testing" },
  { trigger_sop: "testing", trigger_status: ["completed"], target_sop: "regression", condition: "verification_passed" },
];

function loadSopState(sop: string): { status: string; verification?: { status: string } } | null {
  const stateDir = resolve(process.cwd(), ".sop", "state");
  if (!existsSync(stateDir)) return null;

  const files = readdirSync(stateDir)
    .filter((f) => f.startsWith(sop) && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  try {
    return JSON.parse(readFileSync(resolve(stateDir, files[0]), "utf-8"));
  } catch {
    return null;
  }
}

function checkAndTriggerChain(triggerSop: string, status: string, verificationStatus?: string): void {
  const state = loadSopState(triggerSop);
  if (!state) {
    console.log(`[CHAIN] No state for ${triggerSop}, skipping chain check`);
    return;
  }

  for (const rule of CHAIN_RULES) {
    if (rule.trigger_sop !== triggerSop) continue;
    if (!rule.trigger_status.includes(status)) continue;

    if (rule.condition === "verification_passed" && verificationStatus !== "passed") {
      console.log(`[CHAIN] Rule ${rule.trigger_sop}->${rule.target_sop} skipped: verification not passed (${verificationStatus})`);
      continue;
    }

    if (rule.condition === "has_failures") {
      if (state.verification?.status === "passed") {
        console.log(`[CHAIN] Rule ${rule.trigger_sop}->${rule.target_sop} skipped: no failures detected`);
        continue;
      }
    }

    console.log(`[CHAIN] Triggering ${rule.target_sop} after ${triggerSop} (status=${status})`);
    const result = spawnSync(
      "npx",
      ["ts-node", "--transpile-only", resolve(__dirname, "sop-state-save.ts"), rule.target_sop, "chain_trigger", "in_progress"],
      {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
        timeout: 60000,
      },
    );

    if (result.status === 0) {
      console.log(`[CHAIN] ${rule.target_sop} chain-triggered successfully`);
    } else {
      console.warn(`[CHAIN] ${rule.target_sop} chain-trigger failed:`, result.stderr?.toString().split("\n")[0]);
    }
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log("Usage: ts-node sop-chain.ts <trigger-sop> <status> [verification-status]");
  console.log("");
  console.log("Examples:");
  console.log("  ts-node sop-chain.ts bug-fix completed passed");
  console.log("  ts-node sop-chain.ts regression completed failed");
  process.exit(1);
}

const triggerSop = args[0];
const status = args[1];
const verificationStatus = args[2];

checkAndTriggerChain(triggerSop, status, verificationStatus);
