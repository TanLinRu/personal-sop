# INDEX - 后端迭代参考文档

## 文档

| 文档 | 说明 |
|------|------|
| BACKEND.md | 后端架构规范与审核检查点 |

---

## 快速查询

**后端迭代流程**:
1. 需求确认 → 2. 依赖查询 → 3. 技术调研 → 4. 架构设计 → 5. 架构审核 → 6. PRD → 7. 后端实现 → 8. 验证 → 9. 知识更新

**并行任务**:
- sop-library-research (3次)
- 后端生成 (dr-jskill)
- 代码审查 (java-reviewer)

**输出目录**: `backend/`

## 多 Agent 配置

```yaml
parallel_tasks:
  - name: API设计调研
    agent: sop-library-research
    count: 1
  - name: 技术选型调研
    agent: sop-library-research
    count: 1
  - name: 安全合规调研
    agent: sop-library-research
    count: 1
```

## 架构审核检查点

### P0 (阻塞级)
- API 设计符合 RESTful 规范
- 数据模型关系清晰
- 包结构按功能模块划分

### P1 (重要级)
- 事务边界清晰
- 安全设计符合基线
- 异常处理统一

### P2 (优化级)
- 性能设计合理
- 可测试性