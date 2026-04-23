# INDEX - 全栈迭代参考文档

## 文档

| 文档 | 说明 |
|------|------|
| FULLSTACK.md | 全栈架构规范与审核检查点 |

---

## 快速查询

**全栈迭代流程**:
1. 需求确认 → 2. 依赖查询 → 3. 全栈调研(5) → 4. 架构设计 → 5. 架构审核 → 6. PRD → 7. 并行生成 → 8. 联调测试 → 9. 知识更新

**并行任务**:
- sop-library-research (5次)
- 后端生成 (dr-jskill)
- 前端生成 (frontend-design)

**输出目录**: `backend/` + `frontend/`

## 多 Agent 配置

```yaml
parallel_tasks:
  - name: 业务分析
    agent: sop-library-research
    count: 1
  - name: 技术调研
    agent: sop-library-research
    count: 1
  - name: 安全评估
    agent: sop-library-research
    count: 1
  - name: UI设计调研
    agent: sop-library-research
    count: 1
  - name: 性能评估
    agent: sop-library-research
    count: 1
```

## 架构审核检查点

### P0 (阻塞级)
- 前后端接口契约一致
- 数据流清晰
- 前后端模块分离

### P1 (重要级)
- 部署架构合理
- 运维设计完整
- 安全设计符合基线

### P2 (优化级)
- 性能符合 SLA
- 可独立扩展