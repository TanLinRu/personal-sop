---
knowledge_id: logistics-20260508
domain: 物流配送
type: technical_spec
version: 1.0.0
created_at: 2026-05-08
---

# 物流配送技术规范

## 核心概念

| 概念 | 定义 | 业务价值 |
|------|------|----------|
| 运单 | 配送任务单元 | 核心业务实体 |
| 骑手 | 执行配送人员 | 运力单元 |
| 站点 | 取/配送点 | 空间单元 |
| 调度 | 任务分配算法 | 效率核心 |

## 数据模型

| 实体 | 字段 | 类型 | 说明 |
|------|------|------|------|
| Order | order_id | String | 主键 |
| Order | user_id | String | 下单用户 |
| Order | rider_id | String | 接单骑手 |
| Order | status | Enum | 状态 |
| Order | pickup_addr | String | 取货地址 |
| Order | delivery_addr | String | 送货地址 |
| Order | created_at | DateTime | 创建时间 |
| Rider | rider_id | String | 主键 |
| Rider | name | String | 姓名 |
| Rider | phone | String | 电话 |
| Rider | status | Enum | 在线/配送中/离线 |

## 接口规范

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建订单 | POST | /api/v1/orders | 创建配送任务 |
| 取消订单 | DELETE | /api/v1/orders/{id} | 取消配送 |
| 查询订单 | GET | /api/v1/orders/{id} | 获取订单详情 |
| 骑手接单 | POST | /api/v1/orders/{id}/accept | 骑手接单 |
| 完成配送 | POST | /api/v1/orders/{id}/complete | 确认送达 |

## 调度算法

### 调度流程

1. 创建订单 → 进入调度池
2. 计算匹配度 → 骑手与订单距离、方向、负载
3. 分配订单 → 推单/抢单
4. 骑手取货 → 到达商家
5. 配送中 → 实时轨迹
6. 完成 → 确认签收

### 核心算法

| 算法 | 适用场景 | 说明 |
|------|----------|------|
| 最近骑手 | 紧急单 | 距离优先 |
| 区域派单 | 固定区域 | 区域负责制 |
| 智能匹配 | 综合 | AI推荐最优 |