# BACKEND.md - 后端架构规范 (v2.0)

## 流程图

```
需求确认 → 依赖查询 → 调研(3) → 架构设计 → 架构审核 → PRD → 后端实现 → 验证 → 知识更新
```

## 多 Agent 配置

| Agent | 用途 | 调用次数 |
|-------|------|---------|
| sop-library-research | 调研 | 3次 |
| dr-jskill | 后端生成 | 1次 |
| java-reviewer | 代码审查 | 1次 |

## 调研内容

| 领域 | 内容 |
|------|------|
| API设计 | RESTful、分页、过滤 |
| 技术选型 | 缓存、消息队列、事务 |
| 安全合规 | 认证、授权、审计 |

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

## 后端结构

```
com.example.app/
├── controller/
├── service/impl/
├── repository/
├── entity/
├── dto/request/
├── dto/response/
└── config/
```

## 知识库文档

| 文档 | 位置 |
|------|------|
| 实体依赖图 | .sop/knowledge/{project}-entities.md |
| API映射 | .sop/knowledge/{project}-api-map.md |

## 检查点

- [ ] 需求已确认
- [ ] 依赖已查询
- [ ] 调研已完成 (3次)
- [ ] 架构已审核
- [ ] PRD 已生成
- [ ] 代码已生成
- [ ] 验证通过
- [ ] 知识已更新