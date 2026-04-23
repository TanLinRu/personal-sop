# INDEX - 前端迭代参考文档

## 文档

| 文档 | 说明 |
|------|------|
| FRONTEND.md | 前端设计规范与审核检查点 |

---

## 快速查询

**前端迭代流程**:
1. 需求确认 → 2. 依赖查询 → 3. UI/UX调研 → 4. 组件设计 → 5. 设计审核 → 6. 前端实现 → 7. 验证 → 8. 知识更新

**并行任务**:
- sop-library-research (2次)
- 前端生成 (frontend-design)
- 代码审查 (code-reviewer)

**输出目录**: `frontend/`

## 多 Agent 配置

```yaml
parallel_tasks:
  - name: UI设计调研
    agent: sop-library-research
    count: 1
  - name: 组件库调研
    agent: sop-library-research
    count: 1
```

## 设计审核检查点

### P0 (阻塞级)
- 组件结构合理可复用
- 路由设计 RESTful 风格
- 包结构按页面/组件划分

### P1 (重要级)
- 状态管理集中
- TypeScript 类型安全
- 性能优化