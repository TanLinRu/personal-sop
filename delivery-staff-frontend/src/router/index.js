import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/staffs'
  },
  {
    path: '/staffs',
    name: 'StaffList',
    component: () => import('../views/StaffList.vue')
  },
  {
    path: '/stations',
    name: 'StationList',
    component: () => import('../views/StationList.vue')
  },
  {
    path: '/schedules',
    name: 'ScheduleList',
    component: () => import('../views/ScheduleList.vue')
  },
  {
    path: '/performances',
    name: 'PerformanceList',
    component: () => import('../views/PerformanceList.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router