# Common Mistakes 知识索引

> 本目录存储各类框架/技术的常见错误总结，供后续学习时快速查阅。

## 目录结构

```
.sop/output/common-mistakes/
├── INDEX.md                    # 本索引文件
├── LiteFlow_CommonMistakes.md  # LiteFlow 常见错误
└── [框架名]_CommonMistakes.md  # 按需添加
```

## 快速查找

| 框架 | 文件 | 更新日期 |
|------|------|----------|
| LiteFlow | `LiteFlow_CommonMistakes.md` | 2026-04-18 |

## 使用说明

### 1. 学习新框架时
在执行 sop-knowledge 时，自动检查本目录是否有对应框架的常见错误：

```bash
# 检查知识库
ls .sop/output/common-mistakes/
cat .sop/output/common-mistakes/[框架名]_CommonMistakes.md
```

### 2. 记录新错误时
每次技术学习后，将发现的错误记录到本目录：

```markdown
# [框架名] 常见错误总结

## 错误N：错误标题
### ❌ 错误代码
```java
// 错误代码
```

### ✅ 正确代码
```java
// 正确代码
```

### 错误原因
原因说明
```

## 贡献指南

- 每个框架一个文件
- 使用 ❌ / ✅ 格式对比错误和正确代码
- 包含错误原因分析
- 定期更新和补充