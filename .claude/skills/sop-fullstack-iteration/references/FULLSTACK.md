# FULLSTACK.md - 全栈迭代规范

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端 | Spring Boot | 3.x |
| 后端 | JDK | 21 |
| 前端 | Vue | 3.5.x |
| 前端 | Vite | 6.x |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7 |

## 全栈约束

### 后端约束

- **无 Lombok** - 使用原生 getter/setter
- **jakarta.*** - Spring Boot 3 要求
- **MyBatis-Plus** - ORM

### 前端约束

- **Composition API** - 非 Options API
- **TypeScript** - 强类型
- **pinia** - 状态管理

## API 约定

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| REST | RESTful | GET /api/users |
| URI | 小写 + 中划线 | /user-profile |
| 版本 | /api/v1/ | /api/v1/users |

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 并行 Agent

| Agent | 用途 |
|-------|------|
| java-reviewer | 后端分析 |
| code-reviewer | 前端分析 |
| security-scan | 安全扫描 |

## 联调测试

```bash
# 后端
cd backend && ./mvnw spring-boot:run

# 前端
cd frontend && npm run dev
```

## 验证清单

- [ ] 后端单元测试通过
- [ ] 前端 ESLint 通过
- [ ] API 联调通过
- [ ] 安全扫描通过