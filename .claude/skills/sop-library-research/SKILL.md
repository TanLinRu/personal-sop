---
name: sop-library-research
description: 标准技术调研流程 - 搜索→验证→兼容→风险→总结
version: 1.1.0
triggers:
  - "技术调研"
  - "技术选型"
  - "库评估"
  - "框架对比"
  - "/sop library-research"
permissions:
  task: allow
  read: allow
  write: allow
  bash: allow
  web: allow

# 多agent并发配置 ⭐
execution:
  mode: parallel  # sequential | parallel | hybrid
  timeout: 300000 # 单任务超时(毫秒)

# 并行任务定义
parallel_tasks:
  - name: 文档搜索
    description: 搜索官方文档和技术文章
    agent: everything-claude-code:search-first
    opencode_agent: search_first
    depends_on: []

  - name: 示例验证
    description: 创建最小示例验证功能
    agent: everything-claude-code:architect
    opencode_agent: architect
    depends_on: []

  - name: 风险评估
    description: 评估安全风险和维护状态
    agent: everything-claude-code:security-reviewer
    opencode_agent: security_scan
    depends_on: []

# 结果聚合规则
aggregation:
  strategy: merge
  output_format: markdown

# Claude Code / OpenCode Agent 映射表
agent_mapping:
  search-first: search_first
  architect: architect
  security-reviewer: security_scan
  docs-lookup: docs_lookup
---

# SOP Library Research - 标准技术调研流程

## 概述

本 SOP 提供标准化的技术调研流程，确保调研的全面性和结果的可复用性。当需要评估或学习新的库、框架、技术时，使用此 SOP 进行系统化调研并做出决策。

## 使用场景

- 新技术评估（是否引入 React Query、pydantic 等）
- 替代方案对比（ORM 库选择、缓存方案选择）
- 技术预研（Serverless 是否适合当前业务）
- 框架升级（Django 2.x→4.x、Vue 2→3）
- 学习新技术

## 多agent并行执行 ⭐

### 执行模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `parallel` | 文档搜索、示例验证、风险评估并行 | 技术调研（推荐） |
| `sequential` | 按顺序执行 | 需要前置依赖 |

### 并行任务执行

```bash
# 并行执行技术调研的三个任务
Agent(
  subagent_type="everything-claude-code:search-first",
  prompt="搜索[技术名称]的官方文档和最佳实践..."
)

Agent(
  subagent_type="everything-claude-code:architect",
  prompt="分析[技术名称]的架构设计，评估与现有系统兼容性..."
)

Agent(
  subagent_type="everything-claude-code:security-reviewer",
  prompt="评估[技术名称]的安全风险和维护状态..."
)
```

### 执行流程

```
1. 业务分析 (Business Analysis)
       ↓
2. 并行执行三个调研任务:
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  文档搜索   │  │  示例验证   │  │  风险评估   │
   │(search-first)│ │ (architect) │  │(security)   │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          └────────────────┼────────────────┘
                           ↓
3. 聚合结果 → 总结 (Summary)
```

## 流程步骤

### 步骤零：业务分析 ⭐ [CONFIRM_REQUIRED]

**目标**：理解业务背景，确保技术选型服务于业务目标

**执行内容**：
1. 明确业务目标和核心需求
2. 分析竞品功能差异（了解业内最佳实践）
3. 梳理用户旅程和关键用例
4. 确保技术选型支撑业务场景

**为什么需要业务分析**：
- 避免技术导向而非业务导向的选型
- 通过竞品分析了解行业标准功能
- 确保技术方案能覆盖核心业务场景

**输出**：
```markdown
---
sop: library-research
step: 0_business
status: in_progress
---

## 业务分析

### 业务背景
- **业务场景**：例如游戏风控、电商支付、内容审核
- **目标用户**：B端商家/C端用户/内部运营
- **核心价值**：解决什么问题，带来什么价值

### 竞品分析（了解行业标准）
| 竞品 | 核心功能 | 优势 | 不足 | 定价模式 |
|------|----------|------|------|----------|
| 竞品A | 功能1、功能2 | 优势1 | 不足1 | 按量/包年 |
| 竞品B | 功能1、功能3 | 优势2 | 不足2 | 按量/包年 |
| 自建 | 定制化 | 灵活 | 需要投入 | 人力成本 |

**调研竞品**：
- 行业头部产品（网易易盾、腾讯ACE、数美科技等）
- 开源方案（Apache Flink CEP、Drools、LiteFlow等）
- 自建方案（定制化程度）

### 用户旅程
```
用户入口 → 核心流程 → 风控检测 → 决策 → 结果 → 反馈
```

### 关键业务用例
| 用例 | 描述 | 核心指标 |
|------|------|----------|
| 用例1 | 注册风控：批量注册、虚拟号检测 | TPR>95%, FPR<1% |
| 用例2 | 登录风控：异地登录、暴力破解 | 延迟<50ms |
| 用例3 | 支付风控：充值欺诈、洗钱检测 | 召回率>95% |

### 技术选型约束
- 业务指标要求：
- 延迟要求：
- 成本约束：
- 团队技术栈：

### 业务分析结论
- [ ] 已明确核心业务场景
- [ ] 已了解竞品功能差异
- [ ] 已梳理关键用例
- [ ] 技术选型需支撑以上需求
```

---

### 步骤一：搜索文档（Search）

**目标**：搜索官方文档和示例，了解库的基本信息

**执行内容**：
1. **确认业务需求**（基于步骤零的业务分析）
2. 使用 documentation-lookup 或 Context7 MCP 搜索相关文档
3. 使用 WebSearch 进行社区调研
4. 收集官方信息（网站、版本、Stars、更新日期）

**输出**：
```markdown
---
sop: library-research
step: 1_search
status: in_progress
---

## 调研目标

### 调研对象
- **库/框架名称**:
- **调研目的**:
- **替代方案**（如有）:

### 官方信息
| 项目 | 内容 |
|------|------|
| 官方网站 | |
| 最新版本 | |
| GitHub Stars | |
| 最后更新时间 | |
| 开源协议 | |

### 核心功能列表
1.
2.
3.

### 文档质量评估
- [ ] 文档完整
- [ ] 文档一般
- [ ] 文档较少
```

**命令参考**：
```bash
# 使用 Context7 查询文档
mcp__plugin_everything-claude-code_context7__query-docs

# Web 搜索
WebSearch(query="library-name documentation")

# 查看 Maven 中央仓库
curl https://search.maven.org/solrsearch/select?q=g:groupId+AND+a:artifactId
```

---

### 步骤二：示例验证（Verify）

**目标**：编写最小可行性代码验证库的功能

**执行内容**：
1. 创建测试项目或模块
2. 编写最小示例代码
3. 验证核心功能可用
4. 评估学习曲线

**输出**：
```markdown
---
sop: library-research
step: 2_verify
status: in_progress
---

## 示例验证结果

### 测试环境
- JDK 版本:
- 构建工具:
- 操作系统:

### 最小示例代码
```java
// 核心功能示例
```

### 验证结果
| 功能 | 状态 | 说明 |
|------|------|------|
| 基础功能 | 通过/失败 | |
| 配置方式 | 通过/失败 | |
| 集成方式 | 通过/失败 | |

### 学习曲线评估
- **入门难度**: 简单/中等/困难
- **概念数量**: 
- **文档清晰度**: 
```

**命令参考**：
```bash
# 创建测试项目
mvn archetype:generate -DgroupId=com.test -DartifactId=library-test

# 验证依赖可用
mvn dependency:get -Dartifact=com.example:library:version

# 运行示例
mvn spring-boot:run
```

---

### 步骤三：评估兼容性（Compatible）

**目标**：评估与现有架构的兼容性

**执行内容**：
1. 检查与现有技术栈的兼容性
2. 评估迁移成本
3. 检查依赖冲突
4. 评估性能影响

**输出**：
```markdown
---
sop: library-research
step: 3_compatible
status: in_progress
---

## 兼容性评估

### 与现有技术栈兼容性
| 组件 | 兼容性 | 说明 |
|------|--------|------|
| Spring Boot | 兼容/不兼容/待测 | |
| MyBatis | 兼容/不兼容/待测 | |
| MySQL | 兼容/不兼容/待测 | |
| Redis | 兼容/不兼容/待测 | |

### 依赖分析
- **直接依赖**:
- **间接依赖**:
- **潜在冲突**:

### 性能影响
| 指标 | 影响 |
|------|------|
| 启动时间 | |
| 运行时开销 | |
| 打包体积 | |

### 迁移成本评估
- [ ] 低（可平滑迁移）
- [ ] 中（需要一定改造）
- [ ] 高（需要较大改动）
```

**命令参考**：
```bash
# 依赖树分析
mvn dependency:tree

# 冲突检测
mvn dependency:analyze

# 打包大小分析
mvn package -DskipTests && du -sh target/
```

---

### 步骤四：风险评估（Risk）

**目标**：评估使用该库的风险

**执行内容**：
1. 检查维护状态和社区活跃度
2. 评估安全风险
3. 评估长期维护性

**输出**：
```markdown
---
sop: library-research
step: 4_risk
status: in_progress
---

## 风险评估

### 维护状态
| 指标 | 数值 | 评估 |
|------|------|------|
| 最近发布版本 | | |
| 近一年版本发布次数 | | |
| Issue 响应时间 | | |
| Issue 积压数量 | | |
| 核心维护者数量 | | |

### 社区活跃度
| 指标 | 数值 | 评估 |
|------|------|------|
| 月下载量 | | |
| 贡献者数量 | | |
| GitHub 讨论热度 | | |
| Stack Overflow 问题数 | | |

### 安全风险
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 已知漏洞 | 有/无 | |
| 依赖漏洞 | 有/无 | |
| 安全政策 | 有/无 | |

### 长期风险评估
- [ ] 低风险（社区活跃，维护良好）
- [ ] 中风险（社区一般，需要关注）
- [ ] 高风险（维护较少，慎重考虑）
```

**命令参考**：
```bash
# 安全审计
mvn dependency:analyze

# 查看 GitHub 活跃度
gh api repos/{owner}/{repo}/stats/contributors

# CVE 检查
mvn org.owasp:dependency-check-maven:check
```

---

### 步骤五：总结（Summary）⭐ [CONFIRM_REQUIRED]

**目标**：汇总调研结果，给出决策建议

**执行内容**：
1. 汇总所有评估结果
2. 给出明确的决策建议
3. 记录决策依据

**输出**：
```markdown
---
sop: library-research
step: 5_summary
status: pending
---

## 调研结论

### 决策建议（强制输出）
- [ ] 推荐使用
- [ ] 谨慎使用
- [ ] 不推荐使用

### 决策理由（必须3条以内）
1.
2.
3.

### 风险评估
- 维护风险: 低/中/高
- 学习成本: 低/中/高
- 集成复杂度: 低/中/高

### 优缺点分析
**优点**:
1.

**缺点**:
1.

### 使用建议（强制输出）
- 适用场景:
- 不适用场景:
- 注意事项:
- **替代方案**:

### 后续行动（强制输出）
- [ ] 进行 PoC 验证
- [ ] 制定迁移计划
- [ ] 安排技术分享
- [ ] 观望后续发展
- **立即执行**:（如需立即行动则填写）

### 调研信息
- 调研人:
- 调研日期:
- 参考链接:
```

---

## 错误处理

| 错误场景 | 处理方式 |
|----------|----------|
| 文档无法访问 | 使用 WebSearch 替代，查找社区博客 |
| 示例运行失败 | 检查环境配置，查看错误日志 |
| 依赖冲突 | 尝试排除冲突依赖或升级版本 |
| 网络问题 | 使用国内镜像源或离线文档 |

## 可调用的 Skills

| 技能 | 用途 |
|------|------|
| documentation-lookup | 搜索官方文档 |
| context7 | 获取最新文档 |
| web-search | 社区调研 |
| java-testing | 示例验证 |
| security-review | 安全风险评估 |
| architecture-decision-records | 架构兼容性评估 |

## 多agent执行参考

### 并行执行示例

```python
# 并行执行技术调研任务
tasks = [
    Agent(subagent_type="everything-claude-code:search-first",
          prompt="搜索[技术名称]的官方文档和最佳实践..."),
    Agent(subagent_type="everything-claude-code:architect",
          prompt="分析[技术名称]的架构设计，评估与现有系统兼容性..."),
    Agent(subagent_type="everything-claude-code:security-reviewer",
          prompt="评估[技术名称]的安全风险和维护状态..."),
]

# 等待所有任务完成
results = await asyncio.gather(*tasks)
```

### OpenCode 适配

```python
opencode_tasks = [
    Agent(subagent_type="search_first", prompt="搜索文档..."),
    Agent(subagent_type="architect", prompt="分析架构..."),
    Agent(subagent_type="security_scan", prompt="评估风险..."),
]
```

### 结果聚合

| 策略 | 说明 |
|------|------|
| `merge` | 合并所有调研结果到一个报告 |
| `first` | 返回第一个成功的结果 |
| `all` | 返回所有结果数组 |

## 触发命令

```
/sop library-research
```
或描述场景：
- "评估是否使用 Redis 做缓存"
- "调研 MyBatis-Plus 替代 JPA"
- "看看这个库能不能用在生产环境"