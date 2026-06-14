# sop-prd Golden Test Set

> 用于回归测试和权重校准的固定输入/期望输出集合。每次修改 `SKILL.md` 自动跑 `npm run eval`。

## 目录

```
golden/
├── README.md                  # 本文件
├── eval.config.yaml           # 评估配置
├── inputs/                    # 标准化输入（DYNAMIC_INPUT 答案）
│   ├── delivery-staff.json
│   ├── logistics.json
│   └── e-commerce.json
└── expected/                  # 期望产出（人工标注的"good"标杆）
    ├── delivery-staff.expected.md
    ├── logistics.expected.md
    └── e-commerce.expected.md
```

## 评估维度

| 维度 | 权重 | 计算方式 |
|------|------|----------|
| **结构相似度** | 30% | 章节数、章节标题集合 Jaccard 相似度 |
| **长度预算** | 30% | 实际行数 vs LITE/FULL 预算（≤180/≤325）|
| **DoR 通过率** | 25% | 故事数≤8、AC格式、INVEST、无孤章 |
| **内容覆盖** | 15% | 期望关键词在产出中出现率 |

## 阈值

- **PASS**: 总分 ≥ 0.85
- **WARN**: 0.70 ≤ 总分 < 0.85
- **FAIL**: 总分 < 0.70

## 使用

```bash
# 运行所有黄金测试
cd .opencode && npm run eval

# 运行单个 fixture
npx ts-node --transpile-only .claude/scripts/sop-eval.ts prd delivery-staff

# 校准 sop-verify 权重（DMAIC Measure）
npx ts-node --transpile-only .claude/scripts/sop-verify-calibrate.ts prd
```

## 添加新 fixture

1. 在 `inputs/<name>.json` 写 DYNAMIC_INPUT 答案
2. 手动跑一次 `/sop prd`，把满意的产出复制到 `expected/<name>.expected.md`
3. 提交时附带说明为什么这个产出是"good"
