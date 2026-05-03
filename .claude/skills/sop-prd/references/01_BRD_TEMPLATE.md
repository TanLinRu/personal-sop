# BRD 商业需求文档模板

> Business Requirement Document - 商业需求文档

## 文档信息

| 字段 | 内容 |
|------|------|
| 项目名称 | {{project_name}} |
| 版本 | V1.0 |
| 创建日期 | {{date}} |
| 作者 | {{author}} |
| 状态 | DRAFT / REVIEW / APPROVED |

---

## 1. 执行摘要

### 1.1 商业目标

| # | 目标 | 量化指标 | 时间框架 |
|---|------|----------|----------|
| 1 | {{goal_1}} | {{metric_1}} | {{timeline_1}} |
| 2 | {{goal_2}} | {{metric_2}} | {{timeline_2}} |

### 1.2 价值主张

> 一句话描述产品为目标用户解决什么问题

**用户痛点**：
{{pain_point}}

**解决方案**：
{{solution}}

**价值差异**：
{{differentiation}}

### 1.3 盈利模式

| 模式 | 说明 | 定价示例 |
|------|------|----------|
| 订阅制 | 按月/年收费 | ¥{{price}}/月 |
| 一次性 | 买断制 | ¥{{price}}/次 |
| 免费增值 | 免费版 + 付费版 | 免费 / ¥{{price}} |
| 交易抽佣 | 按交易额收费 | {{commission_rate}}% |

---

## 2. 市场需求分析

### 2.1 市场规模

| 指标 | 数值 | 数据来源 |
|------|------|----------|
| TAM（总体市场） | ¥{{tam}} | {{source}} |
| SAM（可服务市场） | ¥{{sam}} | {{source}} |
| SOM（可获得市场） | ¥{{som}} | {{source}} |

### 2.2 市场趋势

| 趋势 | 描述 | 影响 |
|------|------|------|
| {{trend_1}} | {{desc}} | {{impact}} |
| {{trend_2}} | {{desc}} | {{impact}} |

### 2.3 竞争格局

```mermaid
graph TD
  A[{{project_name}}] -->|替代| B[竞品A]
  A -->|替代| C[竞品B]
  A -->|互补| D[互补品]
```

---

## 3. 商业模式画布

| 维度 | 内容 |
|------|------|
| **价值主张** | {{value_proposition}} |
| **客户细分** | {{customer_segments}} |
| **渠道通路** | {{channels}} |
| **客户关系** | {{customer_relationships}} |
| **收入来源** | {{revenue_streams}} |
| **核心资源** | {{key_resources}} |
| **关键业务** | {{key_activities}} |
| **重要合作** | {{key_partnerships}} |
| **成本结构** | {{cost_structure}} |

---

## 4. 战略对齐

### 4.1 公司战略对齐

| 公司战略 | 产品对齐 | 贡献度 |
|----------|----------|--------|
| {{strategy_1}} | {{alignment_1}} | {{contribution}}% |
| {{strategy_2}} | {{alignment_2}} | {{contribution}}% |

### 4.2 OKR 映射

| Objective | Key Result | PRD 对应 |
|-----------|------------|---------|
| {{okr_obj}} | {{okr_kr}} | {{prd_feature}} |

---

## 5. 商业风险

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| {{risk_1}} | {{impact}} | {{mitigation}} |
| {{risk_2}} | {{impact}} | {{mitigation}} |

---

## 6. 成功指标

| 指标 | 目标 | 衡量方式 | 责任人 |
|------|------|----------|----------|
| 首年收入 | ¥{{revenue_target}} | 财务系统 | {{owner}} |
| 用户数 | {{users_target}} | 注册数 | {{owner}} |
| NPS | {{nps_target}} | 调研问卷 | {{owner}} |

---

## 7. 附录

### 7.1 术语表

| 术语 | 定义 |
|------|------|
| {{term}} | {{definition}} |

### 7.2 参考文档

| 文档 | 链接 |
|------|------|
| {{doc}} | {{link}} |

---

**审批记录**

| 角色 | 签字 | 日期 |
|------|------|------|
| 产品负责人 | | |
| 业务负责人 | | |
| 技术负责人 | |