# 17. 可编辑 HTML 原型生成指南

> 从 PRD 文档生成单文件可交互原型，浏览器直接打开，零依赖

---

## 概述

PRD 生成后，自动产出可编辑 HTML 原型文件。该原型用于：
- 快速验证产品设计方案
- 与团队对齐页面结构和交互流程
- 作为 UI 设计的输入参考
- 可直接用于早期用户测试

### 技术选型

| 技术 | 选择 | 理由 |
|------|------|------|
| 样式 | Tailwind CDN | 零配置，浏览器直接运行 |
| 交互 | 原生 JS | 无构建依赖，单文件即可 |
| 编辑 | contenteditable | 文本直接可编辑 |
| 导出 | @media print | 浏览器打印 → PDF |
| 布局 | 响应式 | sm/md/lg 断点适配 |

---

## 从 PRD 提取内容的映射关系

| PRD 章节 | → 原型元素 | 提取内容 |
|----------|-----------|----------|
| 4.1 信息架构 | 顶部导航栏 / 侧边菜单 | 页面列表、层级关系 |
| 4.2 核心页面设计 | `<section data-page="...">` | 每个页面的布局和组件 |
| 4.2 关键组件列 | 页面内的表单/表格/卡片 | 组件类型和字段 |
| 4.3 交互流程 | 页面间点击跳转 | data-page 切换关系 |
| 5.1 用户角色 | 角色切换下拉框 | 角色名称和权限范围 |
| 5.2 用户故事 | 操作按钮和表单字段 | 验收标准对应的交互 |

---

## HTML 骨架模板

> 以下为原型文件的最小骨架，生成时替换 `{{占位符}}` 为实际内容

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{产品名称}} - 原型</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '{{主色调, 默认 #3b82f6}}',
          }
        }
      }
    }
  </script>
  <style>
    /* 打印样式 */
    @media print {
      .no-print { display: none !important; }
      .page-section { page-break-after: always; }
      [contenteditable] { outline: none; }
    }
    /* 可编辑元素悬停提示 */
    [contenteditable]:hover {
      outline: 2px dashed #3b82f6;
      outline-offset: 2px;
      cursor: text;
    }
    [contenteditable]:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    /* 隐藏非当前页面 */
    .page-section { display: none; }
    .page-section.active { display: block; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">

  <!-- 顶部工具栏 -->
  <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between no-print sticky top-0 z-50">
    <div class="flex items-center gap-4">
      <h1 class="text-lg font-bold text-gray-800" contenteditable="true">{{产品名称}}</h1>
      <span class="text-xs text-gray-400">原型 v0.1 — 可直接编辑文本</span>
    </div>
    <div class="flex items-center gap-3">
      <!-- 角色切换 -->
      <select id="role-switch" class="text-sm border border-gray-300 rounded px-2 py-1">
        <option value="">切换角色...</option>
        {{#each 用户角色}}
        <option value="{{this}}">{{this}}</option>
        {{/each}}
      </select>
      <!-- 视口切换 -->
      <div class="flex border border-gray-300 rounded overflow-hidden">
        <button onclick="setViewport(375)" class="px-2 py-1 text-xs hover:bg-gray-100" title="手机">📱</button>
        <button onclick="setViewport(768)" class="px-2 py-1 text-xs hover:bg-gray-100 border-l border-gray-300" title="平板">📋</button>
        <button onclick="setViewport(1280)" class="px-2 py-1 text-xs hover:bg-gray-100 border-l border-gray-300" title="桌面">🖥️</button>
      </div>
      <!-- 打印 -->
      <button onclick="window.print()" class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">
        打印 / 导出 PDF
      </button>
    </div>
  </header>

  <div class="flex">
    <!-- 侧边导航 -->
    <nav class="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] p-3 no-print sticky top-[57px]">
      <p class="text-xs text-gray-400 mb-2 uppercase tracking-wider">页面导航</p>
      <ul class="space-y-1" id="nav-list">
        {{#each 页面列表}}
        <li>
          <a href="#" data-page="{{this.id}}"
             class="nav-link block px-3 py-2 text-sm rounded text-gray-700 hover:bg-blue-50 hover:text-blue-600"
             onclick="switchPage('{{this.id}}')">
            {{this.label}}
          </a>
        </li>
        {{/each}}
      </ul>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-1 p-6" id="main-content">
      <div class="max-w-5xl mx-auto" id="viewport-wrapper">

        <!-- ====== 页面区域 ====== -->
        {{#each 页面}}
        <section data-page="{{this.id}}" class="page-section">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2" contenteditable="true">{{this.title}}</h2>
            <p class="text-sm text-gray-500" contenteditable="true">{{this.description}}</p>
          </div>

          <!-- 页面内容由组件填充 -->
          {{this.components}}
        </section>
        {{/each}}

      </div>
    </main>
  </div>

  <script>
    // 页面切换
    function switchPage(pageId) {
      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('bg-blue-50', 'text-blue-600'));

      const target = document.querySelector(`[data-page="${pageId}"]`);
      if (target) target.classList.add('active');

      const link = document.querySelector(`.nav-link[data-page="${pageId}"]`);
      if (link) link.classList.add('bg-blue-50', 'text-blue-600');
    }

    // 视口切换
    function setViewport(width) {
      const wrapper = document.getElementById('viewport-wrapper');
      wrapper.style.maxWidth = width + 'px';
      wrapper.style.margin = width < 1280 ? '0 auto' : '';
    }

    // 默认显示第一个页面
    document.addEventListener('DOMContentLoaded', () => {
      const first = document.querySelector('.nav-link');
      if (first) first.click();
    });
  </script>

</body>
</html>
```

---

## 组件模式库

> 生成原型时，根据 PRD 中的功能描述选择合适的组件模式

### 1. 数据表格

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <h3 class="font-semibold text-gray-800" contenteditable="true">数据列表</h3>
    <div class="flex gap-2">
      <input type="text" placeholder="搜索..." class="text-sm border border-gray-300 rounded px-3 py-1.5 w-48">
      <button class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">+ 新增</button>
    </div>
  </div>
  <table class="w-full text-sm">
    <thead class="bg-gray-50 text-gray-600">
      <tr>
        <th class="px-4 py-2.5 text-left font-medium">
          <input type="checkbox" class="rounded">
        </th>
        <th class="px-4 py-2.5 text-left font-medium" contenteditable="true">列名1</th>
        <th class="px-4 py-2.5 text-left font-medium" contenteditable="true">列名2</th>
        <th class="px-4 py-2.5 text-left font-medium" contenteditable="true">列名3</th>
        <th class="px-4 py-2.5 text-left font-medium">操作</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3"><input type="checkbox" class="rounded"></td>
        <td class="px-4 py-3 text-gray-800" contenteditable="true">示例数据</td>
        <td class="px-4 py-3 text-gray-600" contenteditable="true">描述内容</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">正常</span></td>
        <td class="px-4 py-3">
          <button class="text-blue-500 hover:underline text-sm">编辑</button>
          <button class="text-red-500 hover:underline text-sm ml-2">删除</button>
        </td>
      </tr>
      <!-- 复制行以展示更多数据 -->
    </tbody>
  </table>
  <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
    <span>共 42 条</span>
    <div class="flex gap-1">
      <button class="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
      <button class="px-2 py-1 rounded bg-blue-500 text-white">1</button>
      <button class="px-2 py-1 rounded hover:bg-gray-100">2</button>
      <button class="px-2 py-1 rounded hover:bg-gray-100">3</button>
      <button class="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
    </div>
  </div>
</div>
```

### 2. 表单

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
  <h3 class="text-lg font-semibold text-gray-800 mb-6" contenteditable="true">表单标题</h3>
  <form class="space-y-5">
    <!-- 文本输入 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1" contenteditable="true">字段名称</label>
      <input type="text" placeholder="请输入..." class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      <p class="mt-1 text-xs text-gray-400" contenteditable="true">帮助提示文本</p>
    </div>
    <!-- 下拉选择 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1" contenteditable="true">选择字段</label>
      <select class="w-full border border-gray-300 rounded px-3 py-2 text-sm">
        <option>请选择...</option>
        <option>选项一</option>
        <option>选项二</option>
      </select>
    </div>
    <!-- 多行文本 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1" contenteditable="true">描述</label>
      <textarea rows="3" placeholder="请输入..." class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
    </div>
    <!-- 开关 -->
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-gray-700" contenteditable="true">启用状态</label>
      <button type="button" class="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
        <span class="inline-block h-4 w-4 translate-x-6 rounded-full bg-white shadow"></span>
      </button>
    </div>
    <!-- 按钮组 -->
    <div class="flex gap-3 pt-4 border-t border-gray-200">
      <button type="submit" class="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">保存</button>
      <button type="button" class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200">取消</button>
    </div>
  </form>
</div>
```

### 3. 卡片网格

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 单张卡片 -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-lg">📊</div>
      <span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">正常</span>
    </div>
    <h4 class="font-semibold text-gray-800 mb-1" contenteditable="true">卡片标题</h4>
    <p class="text-sm text-gray-500 mb-3" contenteditable="true">卡片描述文字，简要说明该项内容。</p>
    <div class="flex items-center justify-between text-xs text-gray-400">
      <span contenteditable="true">更新于 2026-05-05</span>
      <button class="text-blue-500 hover:underline">详情 →</button>
    </div>
  </div>
  <!-- 复制卡片以展示更多 -->
</div>
```

### 4. 仪表盘统计

```html
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <!-- 统计卡片 -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <p class="text-sm text-gray-500 mb-1" contenteditable="true">总用户数</p>
    <p class="text-2xl font-bold text-gray-800" contenteditable="true">12,345</p>
    <p class="text-xs text-green-600 mt-1">↑ 12.5% 较上周</p>
  </div>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <p class="text-sm text-gray-500 mb-1" contenteditable="true">活跃用户</p>
    <p class="text-2xl font-bold text-gray-800" contenteditable="true">8,901</p>
    <p class="text-xs text-green-600 mt-1">↑ 5.2% 较上周</p>
  </div>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <p class="text-sm text-gray-500 mb-1" contenteditable="true">转化率</p>
    <p class="text-2xl font-bold text-gray-800" contenteditable="true">3.2%</p>
    <p class="text-xs text-red-600 mt-1">↓ 0.3% 较上周</p>
  </div>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <p class="text-sm text-gray-500 mb-1" contenteditable="true">总收入</p>
    <p class="text-2xl font-bold text-gray-800" contenteditable="true">¥56,789</p>
    <p class="text-xs text-green-600 mt-1">↑ 8.1% 较上周</p>
  </div>
</div>
```

### 5. 详情面板

```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200">
  <!-- 头部 -->
  <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold text-gray-800" contenteditable="true">详情标题</h3>
      <p class="text-sm text-gray-500" contenteditable="true">ID: #001</p>
    </div>
    <div class="flex gap-2">
      <button class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">编辑</button>
      <button class="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">删除</button>
    </div>
  </div>
  <!-- 内容 -->
  <div class="p-6">
    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      <div>
        <dt class="text-sm text-gray-500">字段名</dt>
        <dd class="mt-1 text-sm text-gray-800" contenteditable="true">字段值</dd>
      </div>
      <div>
        <dt class="text-sm text-gray-500">字段名</dt>
        <dd class="mt-1 text-sm text-gray-800" contenteditable="true">字段值</dd>
      </div>
      <div>
        <dt class="text-sm text-gray-500">状态</dt>
        <dd class="mt-1"><span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">正常</span></dd>
      </div>
      <div>
        <dt class="text-sm text-gray-500">创建时间</dt>
        <dd class="mt-1 text-sm text-gray-800">2026-05-05 10:30:00</dd>
      </div>
    </dl>
  </div>
</div>
```

### 6. 侧边栏设置

```html
<div class="flex gap-6">
  <!-- 设置导航 -->
  <nav class="w-48 shrink-0">
    <ul class="space-y-0.5">
      <li><a href="#" class="block px-3 py-2 text-sm rounded bg-blue-50 text-blue-600 font-medium">基本设置</a></li>
      <li><a href="#" class="block px-3 py-2 text-sm rounded text-gray-700 hover:bg-gray-100">安全设置</a></li>
      <li><a href="#" class="block px-3 py-2 text-sm rounded text-gray-700 hover:bg-gray-100">通知设置</a></li>
      <li><a href="#" class="block px-3 py-2 text-sm rounded text-gray-700 hover:bg-gray-100">高级选项</a></li>
    </ul>
  </nav>
  <!-- 设置内容 -->
  <div class="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4" contenteditable="true">基本设置</h3>
    <div class="space-y-4">
      <!-- 设置项 -->
      <div class="flex items-center justify-between py-3 border-b border-gray-100">
        <div>
          <p class="text-sm font-medium text-gray-800" contenteditable="true">设置项名称</p>
          <p class="text-xs text-gray-500" contenteditable="true">设置项描述说明</p>
        </div>
        <button class="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
          <span class="inline-block h-4 w-4 translate-x-6 rounded-full bg-white shadow"></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 生成规则

### 页面组织

1. 每个核心页面对应一个 `<section data-page="...">`
2. 页面 ID 使用 kebab-case（如 `user-list`, `order-detail`）
3. 第一个页面默认激活

### 内容填充

1. 表格列名从 PRD 功能描述中提取
2. 表单字段从用户故事的验收标准中提取
3. 统计卡片从成功指标中提取
4. 按钮文案使用用户故事中的动词（创建、编辑、删除、提交）

### 可编辑区域

- 标题、描述、标签等文本使用 `contenteditable="true"`
- 表单使用原生 `<input>` / `<select>` / `<textarea>`
- 表格数据行使用 `contenteditable` 便于修改示例数据

### 交互跳转

- 导航栏链接通过 `onclick="switchPage('page-id')"` 实现页面切换
- 页面内的"详情"按钮可跳转到详情页面
- "返回"按钮可跳回列表页面

---

## 输出规范

| 项目 | 规范 |
|------|------|
| 文件名 | `prototype-{kebab-case-name}-{YYYYMMDD}.html` |
| 路径 | `.sop/output/prototype-{name}-{date}.html` |
| 编码 | UTF-8 |
| 依赖 | 零（Tailwind CDN 在线加载） |
| 浏览器 | Chrome / Firefox / Safari 最新版 |

---

## 使用方式

1. 浏览器打开 HTML 文件
2. 点击侧边栏切换页面
3. 直接点击文本即可编辑
4. 工具栏切换视口宽度（手机/平板/桌面）
5. 打印按钮导出 PDF
