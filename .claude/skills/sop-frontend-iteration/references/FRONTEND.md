# FRONTEND.md - 前端迭代规范

## 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| Vue | 3.5.x | Composition API |
| Vite | 6.x | 构建工具 |
| Element Plus | 2.9.x | UI 组件库 |
| Pinia | 3.x | 状态管理 |
| Vue Router | 5.x | 路由 |

## 关键约束

### 必须遵守

- **Composition API** - 非 Options API
- **TypeScript** - 强类型
- **pinia** - 非 Vuex
- **scoped styles** - 组件样式隔离

### 检查点

- [ ] 使用 `<script setup>`
- [ ] 类型定义完整
- [ ] 组件按需导入
- [ ] 环境变量 .env

## 项目结构

```
src/
├── views/           # 页面
├── components/      # 组件
├── stores/          # Pinia 状态
├── router/          # 路由
├── api/             # API 请求
├── utils/           # 工具函数
└── assets/         # 静态资源
```

## 并行 Agent

| Agent | 用途 |
|-------|------|
| code-reviewer | 代码分析 |

## 命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 验证清单

- [ ] ESLint 通过
- [ ] 类型检查通过
- [ ] 组件按需导入