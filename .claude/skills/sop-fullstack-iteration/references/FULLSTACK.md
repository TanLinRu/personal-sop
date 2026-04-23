# FULLSTACK.md - 全栈架构规范 (v2.0)

## 流程图

```
需求确认 → 依赖查询 → 全栈调研(5) → 架构设计 → 架构审核 → PRD → 并行生成 → 联调测试 → 知识更新
```

## 多 Agent 配置

| Agent | 用途 | 调用次数 |
|-------|------|---------|
| sop-library-research | 调研 | 5次 |
| dr-jskill | 后端生成 | 1次 |
| frontend-design | 前端生成 | 1次 |

## 调研内容

| 领域 | 内容 |
|------|------|
| 业务分析 | 业务建模、实体关系 |
| 技术选型 | 框架、中间件 |
| 安全评估 | 认证、授权 |
| UI设计 | 设计系统、组件 |
| 性能评估 | 缓存、优化 |

## 架构审核检查点

### P0 (阻塞级)
- 前后端接口契约一致
- 数据流清晰
- 前后端分离

### P1 (重要级)
- 部署架构合理
- 运维设计完整
- 安全设计符合基线

### P2 (优化级)
- 性能符合 SLA
- 可独立扩展

## 全栈结构

### 后端
```
com.example.app/
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

### 前端
```
src/
├── views/
├── components/
├── stores/
└── api/
```

## 知识库文档

| 文档 | 位置 |
|------|------|
| 实体依赖图 | .sop/knowledge/{project}-entities.md |
| API映射 | .sop/knowledge/{project}-api-map.md |
| 组件树 | .sop/knowledge/{project}-components.md |
| 模块矩阵 | .sop/knowledge/{project}-modules.md |

## 检查点

- [ ] 需求已确认
- [ ] 依赖已查询
- [ ] 调研已完成 (5次)
- [ ] 架构已审核
- [ ] PRD 已生成
- [ ] 代码已生成
- [ ] 联调测试通过
- [ ] 知识已更新