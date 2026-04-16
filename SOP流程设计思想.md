## 一、设计背景与思考

### 1.1 为什么要抽象 SOP Skill

在日常软件开发工作中，程序员会反复遇到一些标准化的流程场景。这些场景包括但不限于：修复一个 bug、审查一段代码、学习新的技术库、加入新项目、处理线上故障等。虽然每次具体情况不同，但处理问题的思路和步骤具有高度的一致性。

传统的方式是依靠程序员的个人经验来处理这些流程。经验丰富的老员工可能已经形成了自己的套路，但新人往往需要漫长的摸索过程。更关键的是，即使是有经验的开发者，在高压或疲劳状态下也可能遗漏某些关键步骤，比如忘记运行测试、忽略安全检查等。

基于 Everything Claude Code 的 Agent 编排能力，我们有机会将这些标准化流程固化为可执行的 Skill。当用户触发相应的场景时，AI 能够引导其完成完整的流程，确保每个关键步骤都被执行，并留下可追溯的文档记录。

### 1.2 设计的核心原则

在设计这些 SOP Skill 时，我们遵循了以下核心原则：

首先是** Agent 编排原则**。每个 SOP 不是简单地将任务交给 AI 处理，而是通过启动子 Agent 来完成特定子任务。这种方式的优势在于：专业的事情交给专业的 Agent 处理，比如代码审查交给 python-review 或 rust-review，安全审查交给 security-review，搜索分析交给 search-first。这样既能保证处理质量，又能让主流程保持清晰。

其次是**审核机制原则**。核心处理流程必须经过其他 Agent 的审核，而不仅仅是 AI 自己的判断。这模拟了现实工作中的代码审查机制——有人提交代码，需要有人来审查。通过让不同的 Agent 交叉审核，我们能够降低错误风险，确保修复方案、审查结论等都经过验证。

第三是**文档化原则**。每个步骤都必须产出状态文档，记录当前的处理状态、发现的问题、做出决策的依据等。这些文档不仅便于后续回顾和追溯，也为审计和知识沉淀提供了基础。在实际工作中，这些文档可以输出到项目目录下的 `.sop/` 文件夹中。

第四是**混合触发原则**。SOP Skill 支持两种触发方式：slash 命令触发（如 `/sop bug-fix`）和 AI 自动推荐。当 AI 检测到用户描述的场景符合某个 SOP 的条件时，会主动推荐用户使用该 SOP。这降低了使用门槛，让用户即使不知道具体命令也能受益于标准化流程。

第五是**可扩展原则**。每个 SOP 的设计都预留了扩展空间，可以根据具体项目需求添加新的步骤或调整现有流程。同时，SOP 之间也存在引用关系，比如 bug-fix 可以引用 code-review 的某些步骤，形成灵活的编排组合。

### 1.3 与现有 Skill 的关系

Everything Claude Code 已经提供了丰富的 Skill 库，包括构建测试类、代码审查类、架构设计类等多种类型。我们的 SOP Skill 设计遵循「优先编排现有 Skill，必要时自己实现」的原则。这意味着每个 SOP 会尽可能调用已有的 Skill 来完成子任务，只有在现有 Skill 无法满足需求时才编写自定义逻辑。

以 bug-fix SOP 为例，它会调用 search-first 来搜索相关代码，调用 code-tour 来了解相关模块，调用 python-review 或 rust-review 来进行代码审查，调用 python-testing 或 rust-testing 来执行测试。这种编排方式既复用了已有能力，又形成了端到端的完整流程。

#### 1.3.1 引用资源优先级

| 优先级 | 来源                                   | 用途            |
| ------ | -------------------------------------- | --------------- |
| **P0** | everything-claude-code/.agents/skills/ | 核心技能规范    |
| **P1** | forrestchang/andrej-karpathy-skills    | 编码原则        |
| **P2** | VoltAgent/awesome-design-md            | 设计规范        |
| **P3** | gstack                                 | 多 Agent 工作流 |

#### 1.3.2 必须引用的 ECC Skills

| Skill                  | 来源                            | 用途         |
| ---------------------- | ------------------------------- | ------------ |
| `api-design`           | `api-design/SKILL.md`           | API 设计规范 |
| `backend-patterns`     | `backend-patterns/SKILL.md`     | 后端分层架构 |
| `tdd-workflow`         | `tdd-workflow/SKILL.md`         | TDD 开发流程 |
| `coding-standards`     | `coding-standards/SKILL.md`     | 代码规范     |
| `security-review`      | `security-review/SKILL.md`      | 安全审查     |
| `documentation-lookup` | `documentation-lookup/SKILL.md` | 文档查询     |

#### 1.3.3 Multi-Agent 编排标准

```
主 Agent (SOP)
    │
    ├─► Explore Agent    → 搜索，分析（只读）
    ├─► General Agent   → 通用任务执行
    └─► Plan Agent      → 架构设计、规划
```

| Agent   | 用途     | 适用场景             |
| ------- | -------- | -------------------- |
| Explore | 只读搜索 | 复现、定位、收集信息 |
| General | 通用执行 | 代码审查、安全评估   |
| Plan    | 架构规划 | 修复方案审核、设计   |

#### 1.3.4 Memory 机制标准

```
┌─────────────────────────────────────────────┐
│           Memory 三层缓存                    │
├─────────────────────────────────────────────┤
│ L1: 跨会话记忆   │ 通用模式、常见问题           │
│ L2: 项目级缓存  │ 项目模板、特定配置           │
│ L3: 会话级输出  │ 状态文档、操作历史           │
└─────────────────────────────────────────────┘
```

| 层级 | 存储位置                 | TTL   |
| ---- | ------------------------ | ----- |
| L1   | Memory / 跨会话          | 30 天 |
| L2   | `.sop/cache/`            | 7 天  |
| L3   | `.sop/output/{session}/` | 永久  |

#### 1.3.5 Karpathy 编码原则（必须嵌入）

每个 SOP 必须嵌入以下原则：

1. **Think Before Coding** - 不假设，先clarify
2. **Simplicity First** - 最小化实现
3. **Surgical Changes** - 精准修改
4. **Goal-Driven** - 目标驱动而非任务罗列

#### 1.3.6 gstack 工作流集成

| gstack 命令        | 用途     | SOP 集成点   |
| ------------------ | -------- | ------------ |
| `/plan-ceo-review` | 产品审查 | 需求分析阶段 |
| `/plan-eng-review` | 工程审查 | 架构设计阶段 |
| `/qa`              | 测试验证 | 验证阶段     |
| `/ship`            | 发布上线 | 完成阶段     |
| `/investigate`     | 根因调试 | Bug 定位阶段 |

#### 1.3.7 跨平台兼容性

SOP Skill 设计支持 **Claude Code** 和 **OpenCode** 双平台运行。两者在 Agent 系统上高度相似，可以通过以下方式实现兼容：

| 特性        | Claude Code                  | OpenCode               | 兼容方案           |
| ----------- | ---------------------------- | ---------------------- | ------------------ |
| 内置 Agents | Explore, Plan, General, Bash | Explore, General, Plan | 使用相同名称       |
| Task 工具   | ✅ 支持                       | ✅ 支持                 | 参数名称一致       |
| Skills 格式 | SKILL.md + frontmatter       | 兼容 SKILL.md          | 使用兼容格式       |
| Skills 2.0  | ✅ 支持（context: fork）      | ❌ 不支持               | 使用 Task 工具模拟 |
| Slash 命令  | `/xxx` 格式                  | `/xxx` 格式            | 完全兼容           |

**OpenCode 替代映射**：
- `search-first` → 使用 `Task(Explore)` 调用内置 Explore Agent
- `code-tour` → 手动创建代码导览 + Explore Agent
- `python-review/rust-review/go-review` → `Task(General)` 并指定审查任务
- `python-testing/rust-testing/go-testing` → 直接使用 Bash 调用具体命令（`mvn test` / `pytest` / `cargo test`）
- `security-review` → `Task(General)` 并指定安全审查任务
- `documentation-lookup` → WebSearch + WebFetch
- `architect` → 使用内置 Plan Agent

### 1.4 目标用户与价值

这些 SOP Skill 主要面向以下几类用户：

第一类是**开发团队新人**。他们刚加入项目，对项目的开发流程、代码规范还不够熟悉。通过使用 SOP，可以帮助他们快速上手，按照业界最佳实践来处理任务，避免因为不熟悉流程而遗漏关键步骤。

第二类是**全栈开发者**。现代开发中，很多开发者需要前后端通吃，处理不熟悉的语言或框架。SOP 提供了结构化的处理框架，即使面对不熟悉的技术栈，也能按照标准流程来解决问题。

第三类是**技术团队管理者**。通过 SOP 的文档化输出，管理者可以了解团队成员的问题处理方式、知识盲点等，从而有针对性地进行培训和改进。同时，SOP 的存在也有助于团队知识的标准化传递。

第四类是**AI 助手使用者**。对于使用 Claude Code 等 AI 编程助手的开发者来说，SOP 让 AI 的帮助更加结构化和可预期。用户不再需要逐个询问「帮我搜索这段代码」「帮我审查这段代码」，而是可以一键启动完整流程，AI 会自动推进各个步骤并产出结果。

## 二、SOP Skill 详细设计

### 2.1 SOP Bug Fix（标准 Bug 修复流程）

#### 设计含义

SOP Bug Fix 是针对软件缺陷修复的标准操作流程。当用户报告了一个 bug，或者在开发过程中发现了一个缺陷，可以使用这个 SOP 来系统化地处理整个修复过程。

这个 SOP 的核心理念是「先复现、后定位、再修复、验证后上线」。很多开发者在遇到 bug 时急于修复，容易跳过复现和定位环节，直接根据表象猜测原因进行修改。这种方式往往治标不治本，甚至可能引入新的问题。Bug Fix SOP 通过强制性的步骤划分，确保每个环节都被认真对待。

#### 业务场景

这个 SOP 适用于以下具体场景：

**生产环境问题修复**：当用户报告线上系统出现异常，比如页面无法加载、订单无法提交、数据计算错误等。运维人员或开发人员需要系统化地排查问题，而不是盲目猜测。此时可以使用 SOP Bug Fix，按照复现、定位、修复、验证、测试的完整流程来处理。

**测试环境问题排查**：在测试过程中发现的缺陷，虽然不会直接影响用户，但如果不及时修复可能会影响后续开发和上线节奏。SOP Bug Fix 可以帮助测试人员和开发人员建立统一的问题处理规范。

**代码审查中发现的缺陷**：在代码审查过程中，审查者可能会发现一些潜在的 bug 或者逻辑问题。这些问题可以通过 SOP Bug Fix 来系统化地修复和处理。

**回归问题**：当新功能上线后，之前正常工作的功能出现了问题。这种回归问题往往更难定位，因为需要确定是哪个变更引入的问题。SOP Bug Fix 的复现和定位步骤特别适合处理这类情况。

#### 流程步骤

Bug Fix SOP 包含五个核心步骤：

**步骤一：复现（Reproduce）**。目标是收集复现步骤和环境信息，确认 bug 可复现。首先使用 search-first Agent 搜索相关代码和历史提交，了解问题上下文。然后根据用户描述的复现步骤，在本地环境尝试复现。输出状态文档包括：环境信息（OS、语言版本、依赖版本）、复现步骤、预期结果、实际结果、复现状态（无法复现/可复现/部分复现）。

**步骤二：定位（Locate）**。目标是搜索相关代码和测试，定位问题根因。使用 search-first Agent 进行深度搜索，追踪调用链，定位问题根因。使用对应语言的 review Agent（如 python-review、rust-review）分析代码逻辑，找出问题的根本原因。输出状态文档包括：根因分析、相关代码（文件路径、行号、问题代码）、调用链。

**步骤三：修复（Fix）**。目标是实现修复方案。根据定位结果，编写修复代码。使用 review Agent 审核修复方案，确保修复符合代码规范，没有引入新问题。输出状态文档包括：修复方案、修改文件列表、审核状态。

**步骤四：验证（Verify）**。目标是运行测试验证修复有效。运行单元测试和集成测试，手动验证修复效果。确保修复没有破坏现有功能。输出状态文档包括：测试结果（单元测试、集成测试、手动验证）、验证状态。

**步骤五：测试（Test）**。目标是编写或更新测试用例，防止回归。编写新的测试用例覆盖修复场景，更新现有测试用例。输出状态文档包括：新增测试、修改测试、测试覆盖、提交信息模板。

#### 可编排的现有 Skills

| **步骤** | **可调用的 Skill**                     | **OpenCode 替代**             | **用途**           |
| -------- | -------------------------------------- | ----------------------------- | ------------------ |
| 复现     | search-first                           | Task(Explore)                 | 搜索相关代码和日志 |
| 复现     | code-tour                              | 手动 + Explore                | 了解相关模块的结构 |
| 定位     | search-first                           | Task(Explore)                 | 深度搜索和分析     |
| 定位     | python-review/rust-review/go-review    | Task(General)                 | 代码分析           |
| 修复     | python-review/rust-review/go-review    | Task(General)                 | 审核修复方案       |
| 验证     | python-testing/rust-testing/go-testing | Bash(mvn test / pytest / ...) | 执行测试           |
| 测试     | python-testing/rust-testing/go-testing | Bash(mvn test / pytest / ...) | 编写新测试         |
| 安全     | security-review                        | Task(General) + 安全检查项    | 必要时进行安全审查 |

### 2.2 SOP Code Review（标准代码审查流程）

#### 设计含义

SOP Code Review 是针对代码审查的标准操作流程。当需要审查一段代码变更，无论是自己提交的代码还是他人提交的 PR，都可以使用这个 SOP 来进行系统化的审查。

代码审查是保证代码质量的重要手段，但在实际工作中，代码审查往往流于形式——审查者可能因为时间紧张而忽略某些检查项，或者审查标准不一致导致不同人审查同一段代码给出不同的意见。SOP Code Review 通过标准化的检查清单和流程，确保每次审查都覆盖关键维度：理解变更、格式检查、测试验证、安全评估、反馈输出。

#### 业务场景

这个 SOP 适用于以下具体场景：

**PR 审查**：当团队成员提交了 Pull Request，需要其他成员进行审查。这是代码审查最常见的场景。SOP Code Review 可以帮助审查者系统化地检查代码的各个方面，给出建设性的反馈。

**代码合并前的自检**：在将代码合并到主分支之前，开发者可以先使用 SOP Code Review 进行自我审查，发现并修复问题，减少被他人审查出问题的尴尬和返工。

**技术债清理**：在进行技术债清理时，需要审查大量的历史代码。SOP Code Review 提供了结构化的审查框架，帮助审查者保持一致的审查标准。

**重构代码审查**：当进行代码重构时，需要确保重构不改变原有功能，同时代码质量得到提升。SOP Code Review 的测试验证步骤可以确保功能不被破坏。

**新人代码审查**：对于新加入团队的成员，通过 SOP Code Review 进行代码审查，可以帮助他们更快地理解团队的代码规范和质量标准。

#### 流程步骤

Code Review SOP 包含五个核心步骤：

**步骤一：理解变更（Understand）**。目标是理解变更意图和内容。使用 code-tour Agent 了解代码结构，阅读 PR description 和变更内容，理解变更的业务逻辑和影响范围。输出状态文档包括：变更概述（PR 标题、变更类型、影响模块）、业务逻辑说明、影响范围评估、理解状态。

**步骤二：格式检查（Format）**。目标是检查代码格式和风格。运行格式化工具（fmt、prettier、black 等），运行 Linter 检查代码问题，检查命名规范是否符合项目约定。输出状态文档包括：格式工具检查结果、Linter 检查结果、命名规范检查、格式状态评估。

**步骤三：运行测试（Test）**。目标是验证测试通过，确认变更不会破坏现有功能。运行单元测试和集成测试，检查测试覆盖率的变化。输出状态文档包括：测试执行结果、新增测试情况、测试覆盖率变化、测试状态评估。

**步骤四：安全评估（Security）**。目标是评估代码安全性。使用 security-review Agent 检查常见安全漏洞，评估权限和数据安全问题。输出状态文档包括：安全检查项（SQL 注入、XSS、权限问题、敏感数据、依赖安全）、发现的漏洞列表、安全建议、安全状态评估。

> **安全检查清单（Java 项目）**：
> | 检查项 | 风险等级 | 检查方法 | 修复建议 |
> |--------|----------|----------|----------|
> | SQL 注入 | 高 | 使用 PreparedStatement 或 MyBatis `#{}` | 禁止使用 `${}` 拼接 SQL |
> | XSS 跨站脚本 | 中 | 检查 Controller 输出是否转义 | 使用 Spring Security XSS 过滤器 |
> | 敏感数据暴露 | 高 | 检查日志、响应是否泄露敏感信息 | 敏感字段使用 `@JsonIgnore` 或加密 |
> | 权限校验缺失 | 高 | 检查接口是否有 `@PreAuthorize` | 添加角色或权限注解 |
> | 硬编码密码 | 严重 | 搜索 hardcode、password、secret | 使用环境变量或配置中心 |
> | 依赖漏洞 | 中 | 运行 `mvn audit` 或 OWASP 插件 | 升级或替换有漏洞的依赖 |
> | 文件上传风险 | 高 | 检查文件上传是否验证类型大小 | 限制文件类型和大小，存储到 OSS |
> | API 接口暴露 | 中 | 检查是否对敏感接口做鉴权 | 添加 IP 白名单或频率限制 |

**步骤五：反馈（Feedback）**。目标是给出具体、可操作的反馈。汇总所有审查结果，按严重程度分类反馈（必须修复、建议修复、可以改进、询问作者），提供具体的改进建议。输出状态文档包括：必须修复项、建议修复项、可以改进项、询问作者项、总结评价、审查结论。

#### 可编排的现有 Skills

| **步骤** | **可调用的 Skill**                     | **OpenCode 替代**             | **用途**     |
| -------- | -------------------------------------- | ----------------------------- | ------------ |
| 理解     | code-tour                              | Task(Explore)                 | 了解代码结构 |
| 格式     | python-build/rust-build/go-build       | Bash(mvn / gradle / cargo)    | 构建验证     |
| 测试     | python-testing/rust-testing/go-testing | Bash(mvn test / pytest / ...) | 执行测试     |
| 安全     | security-review                        | Task(General) + 安全检查项    | 安全审查     |
| 反馈     | python-review/rust-review/go-review    | Task(General)                 | 生成审查意见 |

### 2.3 SOP Library Research（标准技术调研流程）

#### 设计含义

SOP Library Research 是针对技术调研的标准操作流程。当需要评估或学习一个新的库、框架或技术时，可以使用这个 SOP 来系统化地进行调研并做出决策。

技术选型是软件开发中的重要决策，一个不合适的技术选择可能导致后续大量的重构成本。然而，技术调研往往存在以下问题：调研不全面，仅了解表面功能而忽略兼容性、安全性等维度；验证不充分，没有实际运行代码就做出决策；记录不规范，调研结果难以传承给其他人。SOP Library Research 通过结构化的流程，确保调研的全面性和结果的可复用性。

#### 业务场景

这个 SOP 适用于以下具体场景：

**新技术评估**：当需要引入一项新技术到项目中时，比如是否使用 React Query 来管理服务端状态、是否使用 pydantic 替代原有的数据验证方案等。需要全面评估新技术的优缺点、兼容性、维护状态等。

**替代方案对比**：当现有技术面临维护困难或功能不足等问题，需要寻找替代方案时。比如 ORM 库的选择、缓存方案的选择等。SOP Library Research 可以帮助系统化地对比多个方案。

**技术预研**：在进行技术预研时，需要了解某个技术的最新发展动态、最佳实践、社区支持等。比如调研 Serverless 是否适合当前的业务场景。

**框架升级**：当需要将项目从旧框架升级到新版本，或者迁移到新框架时。比如 Django 2.x 升级到 Django 4.x，或者从 Vue 2 迁移到 Vue 3。

**学习新技术**：当个人想要学习新技术时，也可以使用 SOP Library Research 来系统化地了解一个技术的各个方面，而不仅仅是停留在「会用」的层面。

#### 流程步骤

Library Research SOP 包含五个核心步骤：

**步骤一：搜索文档（Search）**。目标是搜索官方文档和示例，了解库的基本信息。使用 documentation-lookup Agent 搜索相关文档，使用 Context7 MCP 工具获取最新文档，使用 exa-search 或 WebSearch 进行社区调研。输出状态文档包括：调研目标（库名称、调研目的、替代方案）、官方信息（网站、版本、Stars、更新日期）、核心功能列表、文档质量评估、搜索状态。

**步骤二：示例验证（Verify）**。目标是编写最小可行性代码验证库的功能。创建测试项目，编写最小示例代码，验证核心功能可用，评估学习曲线。输出状态文档包括：测试环境、最小示例代码、验证结果列表、学习曲线评估（入门难度、概念数量、文档清晰度）、验证状态。

**步骤三：评估兼容性（Compatible）**。目标是评估与现有架构的兼容性。检查与现有技术栈的兼容性，评估迁移成本，检查依赖冲突，评估性能影响。输出状态文档包括：与现有技术栈兼容性表、依赖分析（直接依赖、间接依赖、潜在冲突）、性能影响（启动时间、运行时开销、打包体积）、迁移成本评估、兼容性状态。

**步骤四：风险评估（Risk）**。目标是评估使用该库的风险。检查维护状态和社区活跃度，评估安全风险，评估长期维护性。输出状态文档包括：维护状态（最近发布、PR 响应时间、Issue 积压、核心维护者）、社区活跃度（月下载量、贡献者数量、讨论热度）、安全风险（已知漏洞、依赖漏洞、安全政策）、长期风险评估、风险等级。

**步骤五：总结（Summary）**。目标是汇总调研结果，给出决策建议。汇总所有评估结果，给出明确的决策建议（推荐使用/谨慎使用/不推荐使用），记录决策依据。输出状态文档包括：调研结论（推荐程度）、优缺点分析、使用建议、后续行动、调研人和时间。

#### 可编排的现有 Skills

| **步骤** | **可调用的 Skill**                     | **OpenCode 替代**          | **用途**       |
| -------- | -------------------------------------- | -------------------------- | -------------- |
| 搜索     | documentation-lookup                   | WebSearch + WebFetch       | 搜索官方文档   |
| 搜索     | docs-lookup (Context7 MCP)             | Context7 MCP / WebSearch   | 获取最新文档   |
| 搜索     | exa-search/WebSearch                   | WebSearch                  | 社区调研       |
| 验证     | python-testing/rust-testing/go-testing | Bash(mvn / gradle / cargo) | 示例验证       |
| 兼容     | architecture-decision-records          | Task(General)              | 架构兼容性评估 |
| 风险     | security-review                        | Task(General) + 安全检查项 | 安全风险评估   |

### 2.4 SOP Onboarding（标准项目入职流程）

#### 设计含义

SOP Onboarding 是针对项目入职的标准操作流程。当新成员加入项目，或者开发者需要接手一个新的代码库时，可以使用这个 SOP 来系统化地了解项目并上手开发。

项目入职是每个开发者都会经历的阶段，但入职体验往往参差不齐。有的人能够快速上手并进入工作状态，而有的人可能需要数周甚至数月才能熟悉项目的各个方面。造成这种差异的原因很大程度上在于入职流程的规范性。SOP Onboarding 提供了标准化的入职路径：从环境配置开始，经过代码拉取、运行测试、理解架构，到完成第一个小任务，形成完整的上手闭环。

#### 业务场景

这个 SOP 适用于以下具体场景：

**新成员入职**：当新开发者加入团队时，需要快速了解项目的技术栈、开发环境、代码结构、核心模块等。SOP Onboarding 可以帮助他们系统化地完成这些准备工作。

**项目交接**：当项目负责人变更，或者某个模块的维护者更换时，接手者需要了解整个项目或模块的情况。SOP Onboarding 可以确保交接的全面性，不遗漏重要信息。

**跨项目支援**：当开发者需要支援其他项目时，需要快速了解新项目的代码结构和开发规范。SOP Onboarding 提供了快速上手的路径。

**长期休假回归**：当开发者休假或长期不参与项目后回归时，项目的技术栈、代码规范可能已经发生了变化。SOP Onboarding 可以帮助他们快速重新熟悉项目。

**外包团队接入**：当外包团队开始参与项目开发时，需要让他们了解项目的开发规范和代码结构。SOP Onboarding 可以作为外包团队入职的标准化流程。

#### 流程步骤

Onboarding SOP 包含五个核心步骤：

**步骤一：环境配置（Setup）**。目标是搭建开发环境，安装依赖。使用对应语言的 build Agent 检查项目技术栈，安装必要依赖，配置环境变量。输出状态文档包括：项目技术栈（主要语言、框架、数据库、其他服务）、环境要求表、已安装依赖、环境变量表、配置状态评估。

**步骤二：代码拉取（Clone）**。目标是拉取代码，了解项目结构。克隆代码仓库，检查目录结构，阅读 README 和文档。输出状态文档包括：仓库信息（地址、分支策略、代码规模）、目录结构、关键文件（README、CONTRIBUTING 等）、拉取状态评估。

**步骤三：运行测试（Test）**。目标是确保项目可正常运行。使用 test Agent 运行测试套件，验证开发服务器和应用可启动。输出状态文档包括：测试执行结果（单元测试、集成测试、E2E 测试）、服务启动状态、热重载状态、测试覆盖率、测试状态评估。

**步骤四：理解架构（Explore）**。目标是理解项目架构和核心模块。使用 codebase-onboarding Agent 了解项目架构，使用 code-tour Agent 导览核心模块，绘制架构图和数据流。输出状态文档包括：系统架构描述、核心模块表（模块、职责、关键文件）、数据流说明、入口点（前端入口、后端入口、API 路由）、配置文件表、理解状态评估。

**步骤五：小任务（Task）**。目标是通过小任务上手项目。选取合适的入门任务，实现并提交，获得代码审查反馈。输出状态文档包括：建议任务表（任务、难度、涉及模块）、选择的任务（描述、预期结果）、实施记录、遇到的问题及解决方式、收获总结、上手状态评估。

#### 可编排的现有 Skills

| **步骤** | **可调用的 Skill**                     | **OpenCode 替代**             | **用途**     |
| -------- | -------------------------------------- | ----------------------------- | ------------ |
| 配置     | python-build/rust-build/go-build       | Bash(mvn / gradle / npm)      | 构建配置     |
| 拉取     | git 操作                               | Bash(git clone/pull)          | 代码拉取     |
| 测试     | python-testing/rust-testing/go-testing | Bash(mvn test / pytest / ...) | 执行测试     |
| 探索     | codebase-onboarding                    | Task(Explore)                 | 项目入职导览 |
| 探索     | code-tour                              | Task(Explore)                 | 代码导览     |
| 任务     | python-review/rust-review/go-review    | Task(General)                 | 代码审查反馈 |

### 2.5 SOP Incident Response（标准线上问题响应流程）

#### 设计含义

SOP Incident Response 是针对线上问题响应的标准操作流程。当发生线上故障、收到告警通知、或者用户报告系统异常时，可以使用这个 SOP 来系统化地进行问题处理。

线上故障处理是软件运维中最关键的能力之一。故障处理的质量直接影响用户体验和公司业务。然而，在高压的故障场景下，开发者容易出现慌乱，遗漏必要的处理步骤，比如忘记记录时间线、没有保存现场证据、匆忙修复而没有制定回滚计划等。SOP Incident Response 通过标准化的流程，确保故障处理的每个关键步骤都被执行，同时产出完整的事后分析报告。

#### 业务场景

这个 SOP 适用于以下具体场景：

**生产环境故障**：当生产环境出现服务不可用、性能下降、数据异常等问题时，需要快速响应和处理。SOP Incident Response 提供了从收集信息到编写报告的完整处理流程。

**告警触发**：当监控系统触发告警（如错误率升高、响应时间增加、资源使用率过高等）时，需要进行排查和处理。即使最终确认为误报，按照 SOP 处理也能留下完整的排查记录。

**用户报告问题**：当用户报告系统异常时，需要收集问题信息、排查根因、制定修复方案。SOP Incident Response 确保问题处理的专业性和规范性。

**重大事件响应**：当发生安全事件、数据泄露等重大问题时，需要按照标准流程进行处理和上报。SOP Incident Response 可以作为事件响应的基础框架。

**故障演练**：除了实际故障处理，SOP Incident Response 还可以用于故障演练，帮助团队熟悉故障处理流程，检验应急预案的有效性。

#### 流程步骤

Incident Response SOP 包含六个核心步骤：

**步骤一：收集信息（Collect）**。目标是收集告警和错误信息，初步了解问题。使用 search-first Agent 搜索相关日志，收集告警详情、错误堆栈、影响范围，确定问题优先级和影响程度。输出状态文档包括：告警详情（时间、类型、来源、级别）、影响范围（服务、用户、地域、持续时间）、初步信息（错误类型、消息、相关指标）、相关人员（报告人、值班人员、需通知）、信息状态评估。

**步骤二：复现问题（Reproduce）**。目标是尝试在测试环境复现问题。使用 search-first Agent 搜索相关代码，在测试环境尝试复现，记录复现步骤和结果。输出状态文档包括：复现环境（环境、版本、配置）、复现步骤、复现结果（成功/部分/无法）、复现日志。

**步骤三：定位根因（Locate）**。目标是定位问题根因。使用 search-first Agent 分析代码，使用对应语言的 review Agent 分析问题，追踪调用链，定位根因。输出状态文档包括：根因分析、相关代码（文件、行号、问题代码）、调用链、时间线表、定位状态评估。

**步骤四：制定修复（Fix）**。目标是制定临时修复和永久方案。评估快速修复方案（临时方案），制定长期修复方案，评估修复风险和回滚计划。输出状态文档包括：临时修复方案（方案、实施时间、风险）、永久修复方案（方案、实施时间、风险）、回滚计划（条件、步骤、验证方式）、修复审批状态。

**步骤五：验证修复（Verify）**。目标是验证修复有效，系统恢复正常。在测试环境验证修复，灰度发布验证，全量发布验证，监控确认问题解决。输出状态文档包括：验证过程表（阶段、结果、说明）、监控指标（错误率、响应时间、系统可用性）、验证状态评估。

**步骤六：编写报告（Report）**。目标是编写事故报告，总结经验教训。整理完整的时间线，分析根因和教训，提出改进建议。输出状态文档包括：基本信息（编号、时间、恢复时长、影响范围）、时间线表、根因分析、处理过程、经验教训、改进措施表（措施、负责人、截止时间、状态）、附件（日志、监控截图、文档）、报告人和审核人。

#### 可编排的现有 Skills

| **步骤** | **可调用的 Skill**                     | **OpenCode 替代**             | **用途**           |
| -------- | -------------------------------------- | ----------------------------- | ------------------ |
| 收集     | search-first                           | Task(Explore)                 | 搜索日志和告警信息 |
| 复现     | search-first                           | Task(Explore)                 | 搜索相关代码       |
| 定位     | search-first                           | Task(Explore)                 | 分析代码           |
| 定位     | python-review/rust-review/go-review    | Task(General)                 | 代码分析           |
| 修复     | architect agent                        | Task(Plan)                    | 审核修复方案       |
| 验证     | python-testing/rust-testing/go-testing | Bash(mvn test / pytest / ...) | 测试验证           |
| 报告     | council                                | Task(General)                 | 最终审核确认       |

### 2.6 SOP Scaffold（前后端脚手架生成流程）

#### 设计含义

SOP Scaffold 是针对项目脚手架生成的标准操作流程。当需要快速初始化一个完整的项目骨架时，可以使用这个 SOP 来系统化地生成前后端脚手架代码。

脚手架是项目开发的基础框架，一个好的脚手架能够显著提升开发效率。然而，手动创建项目结构往往耗时且容易遗漏关键配置。SOP Scaffold 通过标准化的流程，确保生成的脚手架包含完整的项目结构、必要的依赖配置、基础代码示例，并支持多种架构模式（单体应用和 DDD 微服务）。

#### 业务场景

这个 SOP 适用于以下具体场景：

**新项目初始化**：当开始一个新的项目时，需要快速搭建项目骨架。SOP Scaffold 可以生成包含完整目录结构、依赖配置、基础代码的脚手架，让开发团队可以直接在脚手架基础上进行业务开发，节省大量初始化时间。

**技术栈升级**：当现有项目需要升级技术栈时，比如从 Spring Boot 2.x 升级到 3.x，或者从 Vue 2 迁移到 Vue 3。SOP Scaffold 可以生成基于新技术栈的脚手架，并提供迁移指南。

**微服务架构转型**：当单体应用需要拆分为微服务架构时，SOP Scaffold 可以生成符合 DDD 分层结构的微服务脚手架，包括 API 模块、业务模块、基础设施层等。

**团队标准化**：当团队需要统一项目结构和代码规范时，SOP Scaffold 可以作为团队的标准模板，确保所有项目保持一致的架构风格和代码组织方式。

#### 流程步骤

Scaffold SOP 包含六个核心步骤：

**步骤一：分析需求（Analyze）**。目标是确定技术栈、模块结构、分层类型。使用 Plan Agent 进行技术选型决策，确认是单体应用还是 DDD 微服务架构，确认前端技术栈和 UI 组件库。输出状态文档包括：技术栈确认（后端框架、ORM、数据库、前端框架、UI 库）、项目类型（单体/DDD）、输出目录。

**步骤二：后端脚手架（Backend）**。目标是生成后端项目结构。使用 dr-jskill 生成 Spring Boot 项目，根据选择的架构类型（单体或 DDD）生成对应的分层结构，配置 pom.xml 依赖（Spring Boot、MyBatis-Plus、Knife4j 等）。输出状态文档包括：生成的项目结构、pom.xml 配置、启动类配置。

**步骤三：前端脚手架（Frontend）**。目标是生成前端项目结构。使用 tdd-workflow 生成 Vue 3 项目，集成 Element Plus UI 组件库，配置 Vite 构建工具和路由。输出状态文档包括：生成的目录结构、package.json 配置、main.js 配置。

**步骤四：API 文档（API Doc）**。目标是配置 Knife4j API 文档。使用 documentation-lookup 学习 Knife4j 文档，集成 Knife4j 依赖和配置，添加 Swagger 注解到示例 Controller。输出状态文档包括：Knife4j 配置信息、访问地址（默认 /doc.html）、示例 Controller 注解。

**步骤五：配置联调（Integration）**。目标是配置数据库连接和前后端联调。配置 MySQL 数据库连接，配置 CORS 和代理，实现前后端接口对接。输出状态文档包括：数据库配置、前后端联调配置、环境变量配置。

**步骤六：验证运行（Verify）**。目标是确保脚手架可正常启动和运行。参考 dr-jskill 验证流程：

| #    | What              | Command                        |
| ---- | ----------------- | ------------------------------ |
| 1    | Build backend     | `./mvnw clean install`         |
| 2    | Unit tests        | `./mvnw test`                  |
| 3    | Integration tests | `./mvnw verify`（需要 Docker） |
| 4    | Frontend dev      | `cd frontend && npm run dev`   |

运行后端构建（`./mvnw clean compile`），运行单元测试（`./mvnw test`），运行前端构建（`npm run build`），验证服务可启动。输出状态文档包括：构建结果、服务启动状态、验证结果。

#### 可编排的现有 Skills

| **步骤**   | **可调用的 Skill**                     | **OpenCode 替代**           | **用途**              |
| ---------- | -------------------------------------- | --------------------------- | --------------------- |
| 分析需求   | dr-jskill                              | Task(General)               | 项目初始化            |
| 分析需求   | api-design                             | Task(Plan)                  | API 设计规范          |
| 后端脚手架 | dr-jskill                              | Task(General)               | 生成 Spring Boot 项目 |
| 后端脚手架 | tdd-workflow                           | Bash(mvn)                   | 构建配置              |
| 后端脚手架 | backend-patterns                       | Task(General)               | 后端分层架构          |
| 后端脚手架 | security-review                        | Task(General)               | 安全配置审查          |
| 前端脚手架 | tdd-workflow                           | Bash(npm create vue@latest) | 生成 Vue 项目         |
| 前端脚手架 | code-tour                              | Task(Explore)               | 代码结构检查          |
| API 文档   | documentation-lookup                   | WebSearch + WebFetch        | 学习 Knife4j 文档     |
| 配置联调   | backend-patterns                       | Task(General)               | 数据库配置            |
| 配置联调   | api-design                             | Task(Plan)                  | 接口对接              |
| 验证运行   | python-testing/rust-testing/go-testing | Bash(./mvnw test)           | 后端单元测试          |
| 验证运行   | python-testing/rust-testing/go-testing | Bash(npm run build)         | 前端构建              |
| 验证运行   | code-review                            | Task(General)               | 代码审查              |

#### 技术栈规范

| 层级     | 技术选择            | 说明                                    |
| -------- | ------------------- | --------------------------------------- |
| 后端框架 | Spring Boot 3.x     | 支持 JDK 17+（推荐 JDK 21）             |
| ORM      | MyBatis-Plus        | 国产优秀 ORM 框架                       |
| 数据库   | MySQL 8.0           | 关系型数据库                            |
| 构建工具 | Maven               | 多模块项目                              |
| 前端框架 | Vue 3               | Composition API                         |
| UI 组件  | Element Plus        | 更轻量、下载量是 Ant Design Vue 的 2 倍 |
| 构建工具 | Vite                | 快速开发服务器和构建                    |
| API 文档 | Knife4j（OpenAPI3） | 访问地址：/doc.html                     |

#### 后端分层类型

| 类型       | 分层结构                                          | 适用场景           |
| ---------- | ------------------------------------------------- | ------------------ |
| 单体应用   | Controller → Service → Mapper → Model             | 快速开发中小型项目 |
| DDD 微服务 | Interface → Application → Domain → Infrastructure | 大型企业级项目     |

#### 输出目录结构

```
{output-dir}/
├── backend/
│   ├── backend单体/              # 单体应用
│   │   ├── module-api/          # 接口定义
│   │   ├── module-service/      # 服务实现
│   │   ├── module-web/          # Web 层
│   │   └── module-dao/          # 数据访问
│   └── backend-ddd/             # DDD 微服务
│       ├── {service}-api/      # API 模块
│       └── {service}-biz/      # 业务模块
├── frontend/
│   └── vue-admin/               # Vue 3 + Element Plus
└── sql/
    └── init.sql                 # 数据库初始化脚本
```

#### CRUD 示例

脚手架包含完整的用户管理 CRUD 示例：

- 后端：UserController + UserService + UserMapper + UserEntity
- 前端：用户列表、新增、编辑、删除页面
- 数据库：user 表 + 初始化数据

#### 技能调用优先级

根据 1.3 节的设计原则，脚手架生成优先使用 dr-jskill，其次使用 ECC Skills：

| 优先级 | 技能       | 说明                                         |
| ------ | ---------- | -------------------------------------------- |
| P0     | dr-jskill  | Java/Spring Boot 项目生成（优先使用）        |
| P1     | ECC Skills | api-design, security-review, tdd-workflow 等 |

#### Multi-Agent 编排

| Agent   | 用途           | 适用场景                   |
| ------- | -------------- | -------------------------- |
| Explore | 只读搜索       | 代码结构检查、组件分析     |
| General | 通用任务执行   | 代码生成、配置修改         |
| Plan    | 架构设计、规划 | 技术选型决策、项目结构规划 |

#### 常见错误处理

| 错误                                   | 修复方案                                                     |
| -------------------------------------- | ------------------------------------------------------------ |
| java.lang.UnsupportedClassVersionError | 确认 JDK 21 已安装                                           |
| maven wrapper 无法执行                 | 使用 `mvn` 代替 `./mvnw`                                     |
| npm install 失败                       | 配置国内镜像源（`npm config set registry https://registry.npmmirror.com`） |
| 端口被占用（8080/5173）                | 修改 application.properties 或 vite.config.js 端口           |

## 三、SOP Skill 之间的协同关系

### 3.1 独立性与关联性

这五个 SOP 虽然各自解决不同的问题场景，但它们之间存在一定的关联性，理解这种关联有助于更好地使用它们。

Bug Fix 和 Incident Response 是最相似的两个流程，都涉及问题处理。区别在于 Bug Fix 侧重于开发过程中的缺陷修复，而 Incident Response 侧重于生产环境的紧急故障处理。从严重程度来看，Incident Response 通常处理更紧急、影响更大的问题，而 Bug Fix 可以处理相对不那么紧急的问题。

Code Review 可以独立使用，也可以与其他 SOP 配合使用。当完成 Bug Fix 的修复步骤后，可以使用 Code Review 来审查修复代码；当完成 Incident Response 的修复后，也可以进行代码审查。Code Review 是质量保障的重要关口，可以在多个环节嵌入。

Library Research 和 Onboarding 都涉及对新事物的了解。Library Research 侧重于技术本身的学习和评估，而 Onboarding 侧重于项目的整体了解。在项目入职时，可能需要先使用 Library Research 来了解项目使用的关键技术，然后再使用 Onboarding 来整体熟悉项目。

### 3.2 组合使用示例

以下是一些组合使用这些 SOP 的示例场景：

**场景一：线上 bug 修复**。首先使用 Incident Response 收集信息并处理紧急故障，故障恢复后使用 Bug Fix 来进行根因修复，最后使用 Code Review 审查修复代码。

**场景二：新项目技术预研**。首先使用 Library Research 评估要使用的技术，然后使用 Onboarding 熟悉项目，在开发过程中使用 Bug Fix 处理问题，使用 Code Review 保证代码质量。

**场景三：代码重构**。在重构前使用 Code Review 了解现有代码，重构过程中使用 Bug Fix 的定位和修复流程，重构完成后使用 Code Review 审查新代码。

## 四、实施建议

### 4.1 部署方式

这些 SOP Skill 可以直接部署到 Claude Code 的 skills 目录中。每个 SOP 放在独立的子目录下，包含一个 skill.md 文件。skill.md 中定义了 SOP 的元数据（名称、描述、触发条件、版本）和完整的流程规范。

部署后，用户可以通过 slash 命令（如 `/sop bug-fix`）来触发相应的 SOP。AI 也会根据上下文自动推荐合适的 SOP。

#### 4.1.1 环境依赖要求

**Java/Maven 项目必需环境**：

| 依赖 | 最低版本 | 推荐版本 | 验证命令 |
|------|----------|----------|----------|
| JDK | 17 | 21 | `java -version` |
| Maven | 3.8+ | 3.9+ | `mvn -version` |
| Git | 2.30+ | 最新 | `git --version` |
| Docker | 20.10+ | 最新 | `docker --version` |
| MySQL | 8.0 | 8.0.33+ | `mysql --version` |

**Node.js 项目（前端）可选依赖**：

| 依赖 | 最低版本 | 推荐版本 | 验证命令 |
|------|----------|----------|----------|
| Node.js | 18 | 20 LTS | `node -v` |
| npm | 9 | 10 | `npm -v` |
| pnpm | 8 | 9 | `pnpm -v` |

**Claude Code 配置要求**：
- Claude Code 版本 1.0.39+
- 网络访问权限（用于搜索文档、执行 MCP 工具）

#### 4.1.2 快速入门指南（Java/Maven 项目）

**Step 1：环境检查**
```bash
# 检查 Java 环境
java -version
# 预期输出：openjdk version "21.0.x"

# 检查 Maven 环境
mvn -version
# 预期输出：Apache Maven 3.9.x
```

**Step 2：克隆项目**
```bash
git clone <your-project-url>
cd <project-name>
```

**Step 3：验证项目可构建**
```bash
mvn clean compile -q
# 预期：BUILD SUCCESS
```

**Step 4：运行测试**
```bash
mvn test
# 预期：BUILD SUCCESS, Tests run: xx, Failures: 0
```

**Step 5：触发 SOP（示例：Bug Fix）**
```bash
# 在 Claude Code 中输入
/sop bug-fix
# 或描述问题："修复用户登录失败的问题"
```

**SOP 触发后预期流程**：
1. AI 询问问题详情和复现步骤
2. AI 搜索相关代码并分析根因
3. AI 生成修复方案并等待确认
4. AI 执行修复并运行测试验证
5. AI 输出状态文档到 `.sop/output/`

### 4.2 定制化建议

虽然这些 SOP 提供了标准化的流程，但在实际使用中可以根据团队具体情况进行定制：

**调整步骤顺序**：某些团队可能有特殊的流程要求，可以调整步骤的顺序。比如有的团队要求先进行代码审查再进行测试，可以相应调整。

**增减步骤**：可以根据项目实际情况增删步骤。比如安全要求较高的项目可以在 Code Review 中增加专门的安全审核步骤。

**修改模板**：状态文档的模板可以根据团队需要进行调整，添加或删除某些字段。

**调整 Agent 配置**：可以调整调用的 Agent 类型，比如项目使用 Go 语言则使用 go-review 而非 python-review。

### 4.3 持续改进

SOP 不是一成不变的，应该随着团队实践的深入而持续改进。建议定期回顾 SOP 的使用效果，收集用户的反馈，识别流程中的痛点和改进点。同时，随着 Everything Claude Code 引入新的 Skill，SOP 也可以整合这些新能力，提供更好的支持。

#### 4.3.1 SOP 效果评估指标

为衡量 SOP 实施效果，建议跟踪以下指标：

| 指标类别 | 指标名称 | 计算方式 | 目标值 |
|----------|----------|----------|--------|
| **效率指标** | 平均处理时间 | 从触发 SOP 到完成的总时长 | 较未使用 SOP 减少 30% |
| **效率指标** | 步骤完成率 | 完成的步骤数 / 总步骤数 | ≥ 95% |
| **效率指标** | 中断恢复率 | 成功恢复的中断数 / 总中断数 | ≥ 90% |
| **质量指标** | 缺陷遗漏率 | 上线后发现的问题数 / 修复总数 | ≤ 5% |
| **质量指标** | 审查通过率 | 首次通过审查的修复占比 | ≥ 80% |
| **质量指标** | 文档完整率 | 包含完整状态文档的占比 | 100% |
| **用户指标** | 用户满意度 | 用户反馈评分 (1-5 分) | ≥ 4 分 |
| **用户指标** | 再次使用率 | 重复使用同一 SOP 的比例 | ≥ 70% |

**数据收集方式**：
- 状态文档自动记录时间戳和步骤状态
- 用户完成 SOP 后弹出简短的满意度调查
- 在 `.sop/metrics/` 目录下存储月度统计数据

**改进反馈循环**：
```
月度回顾 → 识别痛点 → 制定改进计划 → 更新 SOP → 验证效果
```

#### 4.3.2 团队协作规范

当多个开发者协作使用 SOP 时，遵循以下规范：

| 场景 | 处理方式 |
|------|----------|
| 多人同时处理同一问题 | 按提交时间先后顺序，后提交者自动成为 Reviewer |
| SOP 执行中需要交接 | 输出完整状态文档，接手者从断点继续 |
| 并行多 SOP 执行 | 每个 SOP 使用独立 session_id，避免状态混淆 |
| 跨团队代码审查 | 使用 SOP Code Review，并在反馈中标注团队规范差异 |

### 4.4 错误处理策略

在 SOP 执行过程中，可能会遇到各种错误情况，需要建立统一的错误处理机制：

**Agent 调用失败**：
- 重试策略：首次失败后等待 5 秒重试，最多重试 2 次
- 人工介入条件：连续 3 次失败或关键步骤失败
- 降级方案：使用更简单的内置 Agent 替代

**步骤执行超时**：
- 单步骤超时限制：5 分钟
- 超出限制的处理：暂停执行，询问用户是继续等待还是跳过

**用户中断处理**：
- 用户可随时通过输入"中断"终止 SOP
- 中断时保存当前状态到 `.sop/sessions/{session_id}.json`
- 支持恢复功能：从上次中断的步骤继续

**环境异常处理**：
- 依赖缺失：提示具体缺失内容，提供安装命令
- 权限不足：说明需要的权限级别，建议解决方案
- 网络问题：提供离线模式选项（部分 SOP）

#### 4.4.1 常见错误场景与处理示例

以下是基于 Java/Maven 项目的常见错误场景及处理方式：

| 错误场景 | 错误信息示例 | 处理方式 |
|----------|--------------|----------|
| **Agent 调用失败** | "Task exploration failed after 3 retries" | 切换到通用 Agent，使用 Grep 工具手动搜索代码 |
| **Maven 构建失败** | "BUILD FAILURE - Compilation error" | 检查 pom.xml 依赖版本，尝试 `./mvnw clean compile` |
| **测试超时** | "Test execution exceeded 5 minutes" | 单独运行失败的测试类：`mvn test -Dtest=ClassName` |
| **端口被占用** | "Port 8080 is already in use" | 查找占用进程：`netstat -ano \| findstr 8080`，或修改 application.properties 端口 |
| **依赖下载失败** | "Could not resolve dependencies" | 配置阿里云镜像：`mvn -s settings.xml` 使用国内镜像 |
| **数据库连接失败** | "Connection refused to localhost:3306" | 检查 MySQL 服务是否启动，验证 application.properties 配置 |
| **Git 权限问题** | "Permission denied (publickey)" | 检查 SSH 密钥配置，或使用 HTTPS 方式 clone |

**Java 项目常用验证命令**：
```bash
# 清理并编译
mvn clean compile

# 运行单测
mvn test -Dtest=UserServiceTest

# 运行集成测试（需要 Docker）
mvn verify

# 打包（跳过测试）
mvn package -DskipTests

# 查看依赖树（排查冲突）
mvn dependency:tree

# 分析依赖冲突
mvn dependency:analyze
```

### 4.5 版本管理与兼容性

为保证 SOP 的长期可维护性，需要建立版本管理机制：

**版本号规则**：采用语义化版本（SemVer），格式为 `主版本.次版本.修订号`
- 主版本：重大流程变更，不向后兼容
- 次版本：新增步骤或功能，向后兼容
- 修订号：文档修正、错误修复，向后兼容

**版本兼容性矩阵**：

| SOP 版本 | Claude Code 版本 | 最低要求        |
| -------- | ---------------- | --------------- |
| 1.x      | 1.0+             | -               |
| 1.2+     | 1.5+             | Skills 2.0      |
| 2.0+     | 2.0+             | 新的 Agent 系统 |

**升级策略**：
- 每次 SOP 更新需在 CHANGELOG.md 中记录
- 主版本升级需用户提供明确确认
- 跨版本升级提供迁移指南

### 4.6 状态文档模板规范

为保证 SOP 输出的状态文档一致性，定义以下模板规范：

**通用头部**（所有状态文档）：
```markdown
---
sop: {sop_name}
step: {step_number}
session_id: {session_id}
created_at: {timestamp}
status: {pending/in_progress/completed}
---

## {步骤名称}

### 步骤状态
- [ ] 待开始
- [ ] 进行中
- [ ] 已完成
- [ ] 被跳过
```

**必填字段标记**：
- 标记为 **【必填】** 的字段必须填写，否则无法进入下一步
- 标记为 **【可选】** 的字段可以根据实际情况决定是否填写
- 标记为 **【条件必填】** 的字段在特定条件下必须填写

**完成条件**：
每个步骤需要明确"完成条件"，格式如下：
```markdown
### 完成条件
- [ ] 条件1：{描述}
- [ ] 条件2：{描述}

完成条件满足后，系统会提示："步骤 {N} 完成，继续下一步？"
```

### 4.7 触发机制细化

为提高 SOP 的触发准确性，需要细化触发条件：

**基础触发关键词**：
| SOP               | 核心关键词             | 场景关键词                   |
| ----------------- | ---------------------- | ---------------------------- |
| Bug Fix           | bug、错误、异常、修复  | 报错、崩溃、闪退、功能异常   |
| Code Review       | review、审查、PR       | 代码审查、合并请求、代码变更 |
| Library Research  | 调研、评估、技术选型   | 库评估、框架对比、技术方案   |
| Onboarding        | 入职、上手、熟悉       | 新项目、环境配置、快速开始   |
| Incident Response | 线上、故障、告警、紧急 | 宕机、服务不可用、P0/P1      |

**语义触发规则**：
```yaml
# 触发条件示例
triggers:
  bug_fix:
    # 精确匹配
    exact: ["修复 bug", "代码报错"]
    # 包含匹配（任一关键词）
    contains: ["错误", "异常", "崩溃"]
    # 正则匹配
    pattern: ".*(error|exception|bug).*"
    # 上下文匹配
    context:
      - "运行.*报错"
      - "页面.*崩溃"

  incident_response:
    # 紧急程度匹配
    severity: ["P0", "P1", "P2"]
    # 关键词组合（必须同时满足）
    combined:
      - ["线上", "故障"]
      - ["生产", "告警"]
```

**触发优先级**：
1. 精确匹配 > 组合匹配 > 包含匹配 > 正则匹配
2. 多个 SOP 匹配时，提示用户选择
3. 置信度低于 0.5 时不主动推荐

---

### 4.8 P0 核心流程补充

基于深度审查报告，补充以下 P0 级别的核心流程：

#### P0-1：初始化引导流程（Onboarding for SOP）

**场景**：用户首次使用 SOP（如 `/sop bug-fix`）

**目的**：降低首次使用门槛，避免「配置地狱」

**流程设计**：
```yaml
# 首次使用触发
when: 用户首次使用任一 SOP
action:
  1. 环境检测：
     - 检测 JDK/Node/Maven 等依赖是否满足
     - 检测项目技术栈
  2. 权限申请：
     - 明确告知需要读取代码/执行命令/网络访问
     - 请求用户授权
  3. 配置引导：
     - 交互式选择默认技术栈
     - 配置输出目录
  4. 快速演示：
     - 30 秒展示「这个 SOP 能帮你做什么」
     - 展示标准工作流程
```

**实现方式**：在 config.yaml 中添加 `first_run_guide` 配置

---

#### P0-2：回滚/撤销流程（Rollback Mechanism）

**场景**：SOP 执行到步骤 3（修复代码）时发现方案错误

**目的**：避免「越修越错」，提升用户安全感

**流程设计**：
```yaml
# 回滚机制
when: 用户对当前修复方案不确定，或修复后验证失败
action:
  1. 快照机制：
     - 每步执行前自动备份修改的文件
     - 保存到 .sop/snapshots/{step}/
  2. 回退命令：
     - 用户输入"回滚"或"撤销"
     - 回退到上一步或指定步骤
  3. 差异对比：
     - 展示回滚前后的代码变化
     - 使用 diff 格式展示
  4. 人工确认：
     - 涉及生产环境变更时需二次确认
     - 回滚前展示影响范围
```

**适用范围**：SOP Bug Fix、SOP Incident Response

---

#### P0-3：人工介入与接管流程（Human-in-the-Loop）

**场景**：AI 置信度低 / 遇到复杂业务逻辑 / 用户想自定义

**目的**：平衡自动化与人工控制，避免「黑盒焦虑」

**流程设计**：
```yaml
# 人工介入机制
when: 置信度<0.6 或 用户输入"我来处理"或"人工"
action:
  1. 介入触发：
     - AI 置信度低于阈值时主动提示
     - 用户随时可输入介入
  2. 交接协议：
     - AI 输出当前状态 + 待决策点 + 建议选项
     - 生成状态文档供用户参考
  3. 接管方式：
     - 用户可直接编辑状态文档
     - 用户可直接执行命令
  4. 重新接管：
     - 用户输入"/sop continue"后
     - AI 基于最新状态继续执行
```

**介入点定义**：
| SOP               | 建议介入点                 |
| ----------------- | -------------------------- |
| Bug Fix           | 定位根因后、制定修复方案后 |
| Code Review       | 理解变更后、安全评估后     |
| Library Research  | 搜索文档后、风险评估后     |
| Onboarding        | 环境检测后、架构理解后     |
| Incident Response | 收集信息后、制定修复方案后 |

---

## 附录：文件清单

本文档描述的 SOP Skill 对应的文件如下：

| **SOP 名称**      | **文件路径**                                    | **描述**             |
| ----------------- | ----------------------------------------------- | -------------------- |
| Bug Fix           | `.claude/skills/sop-bug-fix/SKILL.md`            | 标准 Bug 修复流程    |
| Code Review       | `.claude/skills/sop-code-review/SKILL.md`        | 标准代码审查流程     |
| Library Research  | `.claude/skills/sop-library-research/SKILL.md`   | 标准技术调研流程     |
| Onboarding        | `.claude/skills/sop-onboarding/SKILL.md`         | 标准项目入职流程     |
| Incident Response | `.claude/skills/sop-incident-response/SKILL.md`  | 标准线上问题响应流程 |
| Scaffold          | `.claude/skills/sop-scaffold/SKILL.md`           | 前后端脚手架生成流程 |

每个 skill.md 文件都包含完整的流程定义、状态文档模板、与现有 Skills 的关联关系，以及 Claude Code 适配说明。

## 五、跨平台部署指南

### 5.1 部署目录结构

SOP Skill 可以同时部署到 Claude Code 和 OpenCode 支持的目录，确保双平台均可使用：

```
project/
├── .claude/skills/           # Claude Code 原生目录
│   └── sop-bug-fix/
│       └── skill.md          # Claude Code 使用小写
├── .opencode/skills/         # OpenCode 原生目录
│   └── sop-bug-fix/
│       └── SKILL.md          # OpenCode 使用大写
└── .sop/                     # SOP 状态文档输出目录
    └── output/
```

**目录优先级说明**：

| 平台        | 优先级顺序                                                   |
| ----------- | ------------------------------------------------------------ |
| Claude Code | 1. `.claude/skills/` 2. `~/.claude/skills/`                  |
| OpenCode    | 1. `.opencode/skills/` 2. `.claude/skills/` 3. `~/.config/opencode/skills/` |

### 5.2 跨平台验证

**Claude Code 验证**：
```bash
# 触发 SOP
/sop bug-fix

# 列出可用 Skills
What Skills are available?
```

**OpenCode 验证**：
```bash
# 使用 skill 工具
skill({ name: "sop-bug-fix" })

# 或使用 @ 引用
@sop-bug-fix help
```

### 5.3 已知差异与解决方案

| 特性                 | Claude Code            | OpenCode   | 解决方案                   |
| -------------------- | ---------------------- | ---------- | -------------------------- |
| Skills 2.0           | ✅ 支持 `context: fork` | ❌ 不支持   | 使用 Task 工具调用子 Agent |
| Subagent 嵌套        | ✅ 支持多层级           | ⚠️ 有限支持 | 配置 `task_budget`         |
| 动态上下文注入       | ✅ 支持 `!{var}` 语法   | ❌ 不支持   | 手动注入变量               |
| 工具权限 Frontmatter | ✅ 支持                 | ⚠️ 部分支持 | 使用 `opencode.json` 配置  |

### 5.4 推荐的 Agent 配置

**OpenCode opencode.json 配置示例**：

```json
{
  "agent": {
    "sop-bug-fix": {
      "mode": "primary",
      "description": "标准 Bug 修复流程",
      "permission": {
        "task": {
          "explore": "allow",
          "general": "allow"
        },
        "skill": {
          "*": "allow"
        }
      }
    },
    "explore": {
      "mode": "subagent",
      "description": "代码搜索专用"
    },
    "general": {
      "mode": "subagent",
      "description": "通用任务处理"
    },
    "plan": {
      "mode": "subagent",
      "description": "架构设计与规划"
    }
  }
}
```

### 5.5 References

**Claude Code 官方文档**：
- [Skills 官方文档](https://docs.claude.com/en/docs/skills)
- [内置 Agents](https://docs.claude.com/en/docs/sub-agents)
- [Slash 命令](https://docs.claude.com/en/docs/slash-commands)

**OpenCode 官方文档**：
- [Agents 文档](https://open-code.ai/docs/en/agents)
- [Skills 文档](https://dev.opencode.ai/docs/skills/)
- [Task 工具](https://dev.opencode.ai/docs/tools/task)

**推荐的外部 Skills 仓库**：
- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) - 11k+ stars
- [anthropics/claude-code/plugins/code-review](https://github.com/anthropics/claude-code/tree/main/plugins/code-review)
- [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) - 知识图谱搜索

**跨平台工具**：
- [Context7 MCP](https://context7.com/) - 文档查询
- [ast-grep](https://github.com/ast-grep/ast-grep) - 结构化代码搜索

### 5.6 测试示例

以下是每个 SOP 在实际使用场景中的测试示例，帮助验证 SOP 是否正常工作：

#### 5.6.1 Bug Fix 测试示例

**测试场景**: 修复用户登录失败的问题

```
用户输入: "用户登录一直失败，输入正确密码也说密码错误"

预期流程:
1. 复现 → 收集环境信息，尝试复现
2. 定位 → 搜索登录相关代码，定位根因
3. 修复 → 生成 diff，等待用户确认
4. 验证 → 运行测试，确认修复有效
5. 测试 → 编写回归测试用例
```

**OpenCode 调用验证**:
```python
# 步骤 1: 使用 Explore Agent 搜索
Task(description="搜索用户登录认证相关代码", subagent_type="explore")

# 步骤 4: 运行测试
Bash(command="mvn test -Dtest=LoginServiceTest")
```

#### 5.6.2 Code Review 测试示例

**测试场景**: 审查一个新的 Pull Request

```
用户输入: "请审查 PR #123: 添加用户注册功能"

预期流程:
1. 理解变更 → 了解变更内容和影响范围
2. 格式检查 → 运行格式化工具和 Linter
3. 运行测试 → 执行测试确认变更不破坏功能
4. 安全评估 → 检查安全漏洞
5. 反馈 → 给出分类审查意见
```

**OpenCode 调用验证**:
```python
# 步骤 2: 运行 Linter
Bash(command="mvn checkstyle:check")

# 步骤 3: 运行测试
Bash(command="mvn test")

# 步骤 4: 安全审查
Task(description="审查用户注册代码的安全性", subagent_type="general")
```

#### 5.6.3 Library Research 测试示例

**测试场景**: 评估是否引入新的 ORM 框架

```
用户输入: "我们想评估是否使用 MyBatis-Plus 替换现在的 JPA，请调研"

预期流程:
1. 搜索文档 → 搜索官方文档和社区评价
2. 示例验证 → 创建测试项目验证功能
3. 评估兼容性 → 检查与现有技术栈的兼容性
4. 风险评估 → 评估维护状态和安全风险
5. 总结 → 给出决策建议
```

**OpenCode 调用验证**:
```python
# 步骤 1: 搜索文档
WebSearch(query="MyBatis-Plus official documentation features")
WebFetch(url="https://baomidou.com/")

# 步骤 2: 创建测试项目验证
Bash(command="mvn spring-boot:run -Dspring-boot.run.profiles=test")
```

#### 5.6.4 Onboarding 测试示例

**测试场景**: 新成员加入项目

```
用户输入: "我是新来的，请帮我熟悉项目"

预期流程:
1. 环境配置 → 检查开发环境要求
2. 代码拉取 → 克隆仓库，了解结构
3. 运行测试 → 确保项目可正常构建
4. 理解架构 → 了解核心模块和数据流
5. 小任务 → 完成第一个入门任务
```

**OpenCode 调用验证**:
```python
# 步骤 1: 检查技术栈
Glob(pattern="pom.xml")
Glob(pattern="package.json")

# 步骤 3: 运行构建
Bash(command="mvn clean compile")

# 步骤 4: 探索架构
Task(description="探索项目核心模块和架构", subagent_type="explore")
```

#### 5.6.5 Incident Response 测试示例

**测试场景**: 线上服务告警

```
用户输入: "线上报错了，错误率突然升高到 20%"

预期流程:
1. 收集信息 → 收集告警详情和错误信息
2. 复现问题 → 在测试环境尝试复现
3. 定位根因 → 定位问题根因和影响范围
4. 制定修复 → 制定临时和永久修复方案
5. 验证修复 → 验证修复有效
6. 编写报告 → 编写事故报告
```

**OpenCode 调用验证**:
```python
# 步骤 1: 搜索日志
Task(description="搜索最近一小时的错误日志", subagent_type="explore")

# 步骤 3: 定位代码
Task(description="分析订单服务报错相关代码", subagent_type="explore")

# 步骤 5: 验证
Bash(command="mvn test -Dtest=OrderServiceTest")
```

---

#### 验收测试检查表

| SOP               | 触发关键词           | 验证点                         |
| ----------------- | -------------------- | ------------------------------ |
| Bug Fix           | "修复 bug"、"报错"   | 5 步骤完整执行，用户确认点生效 |
| Code Review       | "审查代码"、"review" | 5 维度审查，反馈分类清晰       |
| Library Research  | "调研"、"技术选型"   | 5 维度评估，结论明确           |
| Onboarding        | "入职"、"熟悉项目"   | 5 步骤上手闭环完成             |
| Incident Response | "线上问题"、"告警"   | 6 步骤完整，报告格式规范       |

---

#### 测试执行命令

```bash
# Claude Code 测试
/sop bug-fix

# OpenCode 测试
skill({ name: "sop-bug-fix" })

# 查看输出
ls -la .sop/output/
```