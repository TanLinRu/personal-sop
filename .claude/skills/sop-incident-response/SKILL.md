---
name: sop-incident-response
description: 标准线上问题响应流程 - 收集→复现→定位→修复→验证→报告
version: 1.1.0
triggers:
  - "线上问题"
  - "故障"
  - "告警"
  - "紧急"
  - "P0"
  - "P1"
  - "/sop incident-response"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow

# 多agent并发配置 ⭐
execution:
  mode: hybrid  # sequential | parallel | hybrid (收集+复现可并行,修复需串行)
  timeout: 600000 # 单任务超时(毫秒)
  checkpoint_dir: .sop/state
  state_file: .sop/state/incident-{id}.json

# 并行任务定义
parallel_tasks:
  - name: 日志收集
    description: 收集告警和错误日志
    agent: everything-claude-code:search-first
    opencode_agent: search_first
    depends_on: []

  - name: 代码分析
    description: 分析相关代码定位问题
    agent: everything-claude-code:java-reviewer
    opencode_agent: java_review
    depends_on: []

  - name: 监控分析
    description: 分析监控指标和趋势
    agent: everything-claude-code:search-first
    opencode_agent: search_first
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge
  output_format: markdown

# Claude Code / OpenCode Agent 映射表
agent_mapping:
  search-first: search_first
  java-reviewer: java_review
  security-reviewer: security_scan
  build-error-resolver: build_check
---

# SOP Incident Response - 标准线上问题响应流程

## 概述

本 SOP 提供标准化的线上问题响应流程，确保故障处理的每个关键步骤都被执行，同时产出完整的事后分析报告。当发生线上故障、收到告警通知、或用户报告系统异常时，使用此 SOP 进行系统化处理。

## 使用场景

- 生产环境故障
- 告警触发
- 用户报告问题
- 重大事件响应
- 故障演练

## 多agent并行执行 ⭐

### 执行模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `hybrid` | 收集+复现并行，修复串行 | 故障响应（推荐） |
| `parallel` | 所有任务并行 | 多团队协作 |
| `sequential` | 按顺序执行 | 简单问题 |

### 并行任务执行

```bash
# 并行执行信息收集和初步分析
Agent(
  subagent_type="everything-claude-code:search-first",
  prompt="搜索最近30分钟的错误日志和告警信息..."
)

Agent(
  subagent_type="everything-claude-code:java-reviewer",
  prompt="分析相关代码，识别潜在问题..."
)

Agent(
  subagent_type="everything-claude-code:search-first",
  prompt="查询监控指标，分析性能趋势..."
)
```

### 执行流程

```
1. 收集信息 (Collect)
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  日志收集   │  │  代码分析   │  │  监控分析   │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          └────────────────┼────────────────┘
                           ↓
2. 复现问题 (Reproduce) - 串行
3. 定位根因 (Locate) - 串行
4. 制定修复 (Fix) - 串行
5. 验证修复 (Verify) - 串行
6. 编写报告 (Report) - 串行
```

## 流程步骤

### 步骤一：收集信息（Collect）⭐含告警阈值

**目标**：收集告警和错误信息，初步了解问题

**执行内容**：
1. 搜索相关日志和告警信息
2. 收集告警详情、错误堆栈、影响范围
3. **根据告警阈值判断是否需要升级**
4. 确定问题优先级和影响程度

**告警分级标准**：
| 级别 | 定义 | 响应时间 | 示例 |
|------|------|----------|------|
| P0 | 核心服务不可用 | 5分钟 | 数据库宕机、服务完全不可用 |
| P1 | 主要功能受损 | 15分钟 | 支付失败、登录异常 |
| P2 | 次要功能异常 | 1小时 | 页面加载慢、某些功能超时 |
| P3 | 轻微问题 | 4小时 | 日志告警、非核心功能异常 |

**告警阈值参考**：
| 指标 | P0 阈值 | P1 阈值 | P2 阈值 |
|------|---------|---------|---------|
| 错误率 | >10% | >5% | >1% |
| 响应时间(P99) | >5000ms | >2000ms | >1000ms |
| CPU使用率 | >90% | >80% | >70% |
| 内存使用率 | >90% | >80% | >70% |
| QPS降级 | >50% | >30% | >10% |

**输出**：
```markdown
---
sop: incident-response
step: 1_collect
status: in_progress
---

## 告警信息收集

### 告警详情
| 项目 | 内容 |
|------|------|
| 告警时间 | |
| 告警类型 | |
| 告警来源 | |
| 告警级别 | P0/P1/P2/P3 |

### 影响范围
| 维度 | 范围 |
|------|------|
| 服务 | |
| 用户 | |
| 地域 | |
| 持续时间 | |

### 初步信息
- **错误类型**:
- **错误消息**:
- **相关指标**:

### 相关人员
- 报告人:
- 值班人员:
- 需要通知:

### 信息状态
- [ ] 告警信息已收集
- [ ] 初步分析已完成
- [ ] 影响范围已确定
```

### 风险自检清单 ⭐

> 在开始深入分析前，快速检查以下风险点：

| 检查项 | 问题 | 建议操作 |
|--------|------|----------|
| **当前步骤是否超过预计时间 50%？** | 可能有隐藏阻塞 | 立即评估是否需要升级 |
| **是否有未解决的依赖阻塞？** | 依赖方不响应会延迟修复 | 提前拉通依赖方 |
| **最近 3 个步骤是否有重复失败？** | 可能存在系统性问题 | 记录模式，寻求专家支持 |
| **是否涉及核心服务/数据？** | 修复风险高 | 先与业务确认影响 |
| **是否需要回滚或配置变更？** | 变更可能引发二次故障 | 准备回滚方案 |

**快速评估**：
- [ ] 无风险 - 可正常处理
- [ ] 有风险 - 需要额外关注
- [ ] 高风险 - 需要升级或专家支持

```

**命令参考**：
```bash
# 查看应用日志
tail -f /var/log/application.log

# 搜索错误日志
grep -i "error" /var/log/application.log | tail -100

# 查看 Docker 容器日志
docker logs -f container_name

# 查看 Kubernetes Pod 日志
kubectl logs -f pod_name

# 查看系统资源
top
free -h
df -h
```

---

### 步骤二：复现问题（Reproduce）⭐ [CONFIRM_REQUIRED]
> **auto_default**: 自动尝试复现

**目标**：尝试在测试环境复现问题

**执行内容**：
1. 搜索相关代码
2. 在测试环境尝试复现
3. 记录复现步骤和结果

**输出**：
```markdown
---
sop: incident-response
step: 2_reproduce
status: in_progress
---

## 复现分析

### 复现环境
| 项目 | 配置 |
|------|------|
| 环境 | test/staging |
| 版本 | |
| 配置 | |

### 复现步骤
1.
2.
3.

### 复现结果
- [ ] 成功复现
- [ ] 部分复现
- [ ] 无法复现

### 复现日志
```
[日志内容]
```

### 复现状态
- [ ] 环境已准备
- [ ] 复现步骤已执行
- [ ] 结果已记录
```

**命令参考**：
```bash
# 切换环境
export SPRING_PROFILES_ACTIVE=test

# 启动测试服务
mvn spring-boot:run -Dspring-boot.run.profiles=test

# 模拟请求复现
curl -X POST http://localhost:8080/api/xxx
```

---

### 步骤三：定位根因（Locate） [AUTO]

**目标**：定位问题根因

**执行内容**：
1. 分析相关代码
2. 追踪调用链
3. 定位根因

**输出**：
```markdown
---
sop: incident-response
step: 3_locate
status: in_progress
---

## 根因定位

### 根因分析
-

### 相关代码
| 文件 | 行号 | 问题代码 |
|------|------|----------|
| | | |

### 调用链
```
入口 → Controller → Service → Mapper → Database
                        ↓
                    [异常点]
```

### 时间线
| 时间 | 事件 |
|------|------|
| T0 | 告警触发 |
| T1 | 开始排查 |
| T2 | 发现问题点 |
| T3 | 定位根因 |

### 定位状态
- [ ] 根因已定位
- [ ] 代码已分析
- [ ] 修复方案已确定
```

**命令参考**：
```bash
# 搜索相关代码
grep -rn "keyword" src/

# 查看调用链
mvn dependency:tree

# Debug 模式启动
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"

# 查看线程 dump
jstack pid
```

---

### 步骤四：制定修复（Fix） [CONFIRM_REQUIRED]
> **auto_default**: BLOCK — P0 事件修复必须人确认

**目标**：制定临时修复和永久方案

**执行内容**：
1. 评估快速修复方案（临时方案）
2. 制定长期修复方案
3. 评估修复风险和回滚计划

**输出**：
```markdown
---
sop: incident-response
step: 4_fix
status: pending
---

## 修复方案

### 临时修复方案
- **方案**:
- **实施时间**:
- **风险**:
- **回滚方式**:

### 永久修复方案
- **方案**:
- **实施时间**:
- **风险**:

### 回滚计划
- **触发条件**:
- **回滚步骤**:
  1.
  2.
- **验证方式**:

### 修复审批状态
- [ ] 待审批
- [ ] 已批准
- [ ] 已实施

### 修复影响评估
| 维度 | 影响 |
|------|------|
| 功能 | |
| 性能 | |
| 数据 | |
```

**命令参考**：
```bash
# 紧急回滚
git revert HEAD
git push origin main

# 部署修复版本
mvn clean package -DskipTests
docker build -t app:fix .
docker push registry/app:fix
kubectl rollout restart deployment/app
```

---

### 步骤五：验证修复（Verify） [AUTO] [VERIFY]

**目标**：验证修复有效，系统恢复正常

**执行内容**：
1. 在测试环境验证修复
2. 灰度发布验证
3. 全量发布验证
4. 监控确认问题解决

**输出**：
```markdown
---
sop: incident-response
step: 5_verify
status: pending
---

## 验证结果

### 验证过程
| 阶段 | 结果 | 说明 |
|------|------|------|
| 测试环境 | 通过/失败 | |
| 灰度发布 | 通过/失败 | |
| 全量发布 | 通过/失败 | |

### 监控指标
| 指标 | 修复前 | 修复后 | 状态 |
|------|--------|--------|------|
| 错误率 | xx% | xx% | 正常/异常 |
| 响应时间 | xx ms | xx ms | 正常/异常 |
| 系统可用性 | xx% | xx% | 正常/异常 |

### 验证状态
- [ ] 测试环境验证通过
- [ ] 灰度验证通过
- [ ] 全量发布完成
- [ ] 监控确认正常
```

**命令参考**：
```bash
# 运行回归测试
mvn test

# 灰度发布
kubectl set image deployment/app app=registry/app:fix
kubectl rollout status deployment/app

# 查看监控指标
curl http://prometheus:9090/api/v1/query?query=error_rate

# 检查健康状态
curl http://localhost:8080/actuator/health
```

---

### 步骤六：编写报告（Report）⭐含复盘模板

**目标**：编写事故报告，总结经验教训

**执行内容**：
1. 整理完整的时间线
2. 分析根因和教训
3. 提出改进建议
4. **产出结构化复盘文档**

**复盘模板（必须输出）**：
```markdown
---
sop: incident-response
step: 6_report
status: completed
---

# 事故复盘报告

## 1. 基本信息

| 字段 | 内容 |
|------|------|
| 事故编号 | INC-YYYYMMDD-NNN |
| 事故级别 | P0/P1/P2/P3 |
| 开始时间 | YYYY-MM-DD HH:mm:ss |
| 恢复时间 | YYYY-MM-DD HH:mm:ss |
| 影响时长 | XX分钟 |
| 影响范围 | 服务/用户/金额 |
| 报告人 | |
| 审核人 | |

## 2. 时间线

| 时间点 | 操作 | 操作人 |
|--------|------|--------|
| HH:mm | 告警触发 | 系统 |
| HH:mm | 值班响应 | XXX |
| HH:mm | 开始排查 | XXX |
| HH:mm | 定位根因 | XXX |
| HH:mm | 实施修复 | XXX |
| HH:mm | 验证通过 | XXX |
| HH:mm | 恢复服务 | XXX |

## 3. 根因分析（5Why分析法）

**问题描述**：

**Why 1**: 为什么会发生？
**Why 2**: 为什么会这样？
**Why 3**: 为什么会到这步？
**Why 4**: 为什么会忽略？
**Why 5**: 根本原因是什么？

**根本原因**：

## 4. 处理过程

### 4.1 应急处理
- 临时方案：
- 实施过程：

### 4.2 彻底修复
- 修复方案：
- 实施过程：

## 5. 经验教训

### 5.1 做得好（Keep）
1.

### 5.2 需要改进（Improve）
1.

### 5.3 行动计划（Action Items）

| 序号 | 问题 | 改进措施 | 负责人 | 截止日期 | 状态 |
|------|------|----------|--------|----------|------|
| 1 | 监控告警延迟 | 优化告警阈值和通道 | | | 待处理 |
| 2 | 缺少熔断机制 | 添加Sentinel熔断 | | | 待处理 |
| 3 | 回滚预案不熟悉 | 完善回滚手册并演练 | | | 待处理 |

## 6. 附件

- [ ] 相关日志
- [ ] 监控截图
- [ ] 代码变更
- [ ] 沟通记录

## 7. 结论签名

| 角色 | 签名 | 日期 |
|------|------|------|
| 报告人 | | |
| 审核人 | | |
| 技术负责人 | | |
```

**输出**：
```markdown
---
sop: incident-response
step: 6_report
status: pending
---

## 事故报告

### 基本信息
| 项目 | 内容 |
|------|------|
| 事故编号 | INC-xxxx |
| 发生时间 | |
| 恢复时间 | |
| 影响时长 | |
| 影响范围 | |

### 时间线
| 时间 | 事件 |
|------|------|
| T0 | 告警触发 |
| T1 | 开始响应 |
| T2 | 定位根因 |
| T3 | 实施修复 |
| T4 | 验证通过 |
| T5 | 恢复完成 |

### 根因分析
-

### 处理过程
1.
2.
3.

### 经验教训
1.
2.

### 改进措施
| 措施 | 负责人 | 截止时间 | 状态 |
|------|--------|----------|------|
| | | | 待处理/进行中/已完成 |

### 附件
- 日志文件
- 监控截图
- 相关文档

### 报告人:
### 审核人:
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 无法复现问题 | 检查日志是否完整，尝试从生产环境拉取数据 |
| 定位不到根因 | 请求更多资源协助，扩大搜索范围 |
| 修复验证失败 | 立即回滚，检查修复方案是否正确 |
| 监控不可用 | 使用手动检查方式验证服务状态 |

## 可调用的 Skills

| 技能 | 用途 |
|------|------|
| search-first | 搜索日志和告警信息 |
| java-review | 代码分析 |
| java-testing | 测试验证 |
| security-review | 安全事件审查 |

## 多agent执行参考

### 并行执行示例

```python
# 并行执行信息收集和代码分析
tasks = [
    Agent(subagent_type="everything-claude-code:search-first",
          prompt="搜索最近30分钟关于[错误关键词]的错误日志..."),
    Agent(subagent_type="everything-claude-code:java-reviewer",
          prompt="分析相关代码，找出潜在问题..."),
    Agent(subagent_type="everything-claude-code:search-first",
          prompt="查询Prometheus监控指标，分析性能趋势..."),
]

# 等待所有任务完成

```

### OpenCode 适配



### 结果聚合

| 策略 | 说明 |
|------|------|
| `merge` | 合并所有分析结果到一个报告 |
| `first` | 返回第一个成功的结果 |
| `all` | 返回所有结果数组 |

## 触发命令

```
/sop incident-response
```
或描述场景：
- "线上报错了，错误率突然升高"
- "服务不可用了"
- "P0 告警：数据库连接失败"