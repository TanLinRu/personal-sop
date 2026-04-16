---
name: sop-library-research
description: 标准技术调研流程 - 搜索→验证→兼容→风险→总结
version: 1.0.0
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

## 流程步骤

### 步骤一：搜索文档（Search）

**目标**：搜索官方文档和示例，了解库的基本信息

**执行内容**：
1. 使用 documentation-lookup 或 Context7 MCP 搜索相关文档
2. 使用 WebSearch 进行社区调研
3. 收集官方信息（网站、版本、Stars、更新日期）

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

### 步骤五：总结（Summary）

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

### 决策建议
- [ ] 推荐使用
- [ ] 谨慎使用
- [ ] 不推荐使用

### 优缺点分析
**优点**:
1.

**缺点**:
1.

### 使用建议
- 适用场景:
- 不适用场景:
- 注意事项:

### 后续行动
- [ ] 进行 PoC 验证
- [ ] 制定迁移计划
- [ ] 安排技术分享
- [ ] 观望后续发展

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

## 触发命令

```
/sop library-research
```
或描述场景：
- "评估是否使用 Redis 做缓存"
- "调研 MyBatis-Plus 替代 JPA"
- "看看这个库能不能用在生产环境"