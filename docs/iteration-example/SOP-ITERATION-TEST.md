# SOP 迭代流程测试用例

本文档展示完整的 SOP 迭代流程，包含 ContextGraph 业务依赖追踪。

## 测试场景

**Bug: 支付风控 - 高风险国家未检测**

- **Bug ID**: BUG-PAYMENT-001
- **严重程度**: HIGH
- **描述**: `PaymentRiskService.java` 中 `calculateRiskScoreLocal()` 方法没有调用 `isHighRiskCountry()`，导致高风险国家(KP/IR/SY)的交易被错误放行
- **影响**: 高风险国家交易绕过风控

---

## Phase 1: ContextGraph 初始化

### MCP 调用

```python
contextgraph.call(
  tool="initialize",
  parameters={
    "session_id": "bug-investigation-2026-0421-001",
    "iteration_type": "bug-fix",
    "initial_entities": [
      {
        "entity_type": "bug_report",
        "entity_id": "BUG-PAYMENT-001",
        "description": "Payment risk scoring ignores high-risk countries (KP/IR/SY)",
        "severity": "high",
        "reported_by": "operations_team"
      },
      {
        "entity_type": "business_module",
        "entity_id": "payment_risk_service",
        "description": "PaymentRiskService - payment transaction risk evaluation",
        "status": "active",
        "integrations": ["liteflow", "kafka", "redis"]
      }
    ]
  }
)
```

### 预期输出

```json
{
  "session_id": "bug-investigation-2026-0421-001",
  "graph_initialized": true,
  "entities": {
    "count": 2,
    "bug_reports": {
      "BUG-PAYMENT-001": {
        "severity": "high",
        "status": "investigating"
      }
    }
  }
}
```

---

## Phase 2: sop-bug-fix - 复现

### 测试请求

**文件**: `test/payment-high-risk-country.json`

```json
{
  "userId": "user_12345",
  "userIp": "192.168.1.100",
  "deviceId": "device_abc123",
  "amount": 1000,
  "cardBin": "4532123456789012",
  "cardCountry": "KP"
}
```

### curl 命令

```powershell
curl -X POST http://localhost:8080/api/risk/payment/check `
  -H "Content-Type: application/json" `
  --data-binary @test/payment-high-risk-country.json
```

### 预期响应

| 字段 | 预期值 | 实际值 | 结果 |
|------|--------|--------|------|
| riskScore | >= 75 | 25 | ❌ FAIL |
| decision | BLOCK | ALLOW | ❌ FAIL |

### SOP 输出

```markdown
---
sop: bug-fix
step: 1_reproduce
status: completed
---

## Bug Reproduce Report

### Test Result
| Field | Expected | Actual |
|-------|----------|--------|
| riskScore | >= 75 | 25 |
| decision | BLOCK | ALLOW |

### Status: [x] Bug Reproduced
```

---

## Phase 3: sop-bug-fix - 定位（并行 ECC Agents）

### ECC Agent 并行调用

```python
# 并行执行搜索和分析
search_task = task(
  subagent_type="code-reviewer",
  prompt="搜索 payment risk scoring 相关代码，找出 HIGH_RISK_COUNTRIES 定义"
)

analysis_task = task(
  subagent_type="java-reviewer",
  prompt="分析 PaymentRiskService.java:82-112 calculateRiskScoreLocal 方法，找出根因"
)

# 同时执行
results = await gather(search_task, analysis_task)
```

### ContextGraph 记录依赖

```python
contextgraph.call(
  tool="add_entities",
  parameters={
    "session_id": "bug-investigation-2026-0421-001",
    "entities": [
      {
        "entity_type": "source_file",
        "entity_id": "PaymentRiskService.java",
        "path": "backend/src/main/java/com/gamerisk/risk/service/PaymentRiskService.java",
        "functions": ["checkPayment", "calculateRiskScoreLocal", "isHighRiskCountry"]
      }
    ],
    "relationships": [
      {
        "from": "BUG-PAYMENT-001",
        "to": "PaymentRiskService.java",
        "relationship_type": "located_in"
      }
    ]
  }
)
```

### 根因分析输出

```markdown
---
sop: bug-fix
step: 2_locate
status: completed
---

## Root Cause Analysis

### Bug Location
File: PaymentRiskService.java, Lines 103-105

### Problem Code
```java
if (isHighRiskCardBin(cardBin)) {
    score += 25;
}
// BUG: Missing isHighRiskCountry() call!
if (isNewUser(userId)) {
    score += 15;
}
```

### Call Chain
checkPayment() 
  → calculateRiskScoreLocal()
  → isHighRiskCardBin() ✓
  → isHighRiskCountry() ✗ NOT CALLED
```

---

## Phase 4: sop-bug-fix - 修复

### 修复方案

```java
// 修改 PaymentRiskService.java:103-105
if (isHighRiskCardBin(cardBin)) {
    score += 25;
}

// ADDED: Check for high-risk countries
if (isHighRiskCountry(cardCountry)) {
    score += 30;
}

if (isNewUser(userId)) {
    score += 15;
}
```

### SOP 输出

```markdown
---
sop: bug-fix
step: 3_fix
status: pending
---

## Fix Applied

### Modified Files
| File | Operation |
|------|-----------|
| PaymentRiskService.java | Add 3 lines |

### Review Status
- [ ] Pending Review
- [x] Ready for Review
```

---

## Phase 5: sop-code-review（并行 ECC Agents）

### 并行审查调用

```python
# 三个并行审查任务
format_task = task(
  subagent_type="code-reviewer",
  prompt="检查代码格式: 缩进、命名、导入排序"
)

security_task = task(
  subagent_type="security-scan",
  prompt="扫描安全: SQL注入、XSS、空值处理"
)

performance_task = task(
  subagent_type="java-reviewer",
  prompt="分析性能: 时间复杂度、内存泄漏"
)

# 并行执行
results = await gather(format_task, security_task, performance_task)
```

### 审查结果输出

```markdown
---
sop: code-review
step: 2_format
status: completed
---

## Parallel Review Results

| Task | Agent | Status | Notes |
|------|-------|--------|-------|
| Format Check | code-reviewer | ✅ PASS | Consistent |
| Security Scan | security-scan | ✅ PASS | No vulnerabilities |
| Performance | java-reviewer | ✅ PASS | O(1) complexity |

---
sop: code-review
step: 5_feedback
status: completed
---

## Review Conclusion

- [x] Approved for Merge
```

---

## Phase 6: sop-testing

### 单元测试

```bash
# 运行支付风控测试
mvn test -Dtest=PaymentRiskServiceTest
```

### 测试用例

| 测试方法 | 输入 | 预期 | 结果 |
|---------|------|------|------|
| testHighRiskCountry_KP | country=KP | score >= 75 | ✅ |
| testHighRiskCountry_IR | country=IR | score >= 75 | ✅ |
| testHighRiskCountry_SY | country=SY | score >= 75 | ✅ |
| testNormalCountry_US | country=US | score < 30 | ✅ |

### 测试输出

```markdown
---
sop: testing
step: 1_unit
status: completed
---

## Unit Test Results

| Test Class | Tests | Passed | Failed |
|------------|-------|---------|--------|
| PaymentRiskServiceTest | 12 | 12 | 0 |

Coverage: 85%
```

---

## Phase 7: ContextGraph 完成

### 最终调用

```python
contextgraph.call(
  tool="complete",
  parameters={
    "session_id": "bug-investigation-2026-0421-001",
    "iteration_complete": True,
    "final_state": {
      "bug_status": "fixed",
      "sops_executed": ["sop-bug-fix", "sop-code-review", "sop-testing"],
      "fix_applied": {
        "file": "PaymentRiskService.java",
        "lines": "103-105",
        "change": "Added isHighRiskCountry() call with score += 30"
      }
    }
  }
)
```

### 最终状态

```json
{
  "session_id": "bug-investigation-2026-0421-001",
  "iteration_complete": true,
  "final_graph": {
    "bug_reports": {
      "BUG-PAYMENT-001": {
        "status": "fixed",
        "resolution": "Added isHighRiskCountry() call"
      }
    },
    "metadata": {
      "sops_executed": ["sop-bug-fix", "sop-code-review", "sop-testing"],
      "agents_invoked": ["code-reviewer", "java-reviewer", "security-scan"],
      "total_duration_minutes": 75
    }
  }
}
```

---

## 验证清单

| 检查项 | 预期 | 状态 |
|--------|------|------|
| ECC code-reviewer 可调用 | 正常返回搜索结果 | ⬜ |
| ECC java-reviewer 可调用 | 返回根因分析 | ⬜ |
| ECC security-scan 可调用 | 返回安全扫描结果 | ⬜ |
| 并行执行 | 3个agent同时运行 | ⬜ |
| ContextGraph 初始化 | 创建会话成功 | ⬜ |
| ContextGraph 记录依赖 | 添加实体和关系 | ⬜ |
| SOP 自动化 | 减少手动确认 | ⬜ |

---

## 测试数据文件

### payment-high-risk-country.json

```json
{
  "userId": "user_12345",
  "userIp": "192.168.1.100",
  "deviceId": "device_abc123",
  "amount": 1000,
  "cardBin": "4532123456789012",
  "cardCountry": "KP"
}
```

### payment-normal-country.json

```json
{
  "userId": "user_12345",
  "userIp": "192.168.1.100",
  "deviceId": "device_abc123",
  "amount": 100,
  "cardBin": "4532123456789012",
  "cardCountry": "US"
}
```
