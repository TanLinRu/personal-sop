<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Performance Management</h1>
      <n-space>
        <n-button type="primary" @click="loadData">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          Refresh
        </n-button>
      </n-space>
    </div>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom: 24px;">
      <n-gi>
        <div class="stat-card">
          <div class="stat-value">{{ data.length }}</div>
          <div class="stat-label">Total Records</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value">{{ avgRating }}</div>
          <div class="stat-label">Avg Rating</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #18a058;">{{ completedOrders }}</div>
          <div class="stat-label">Completed Orders</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value">{{ totalRevenue }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
      </n-gi>
    </n-grid>

    <n-card>
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
      />
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue'
import { NButton, NIcon, NSpace, NTag, NCard, NDataTable, NGrid, NGi, NRate } from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import axios from 'axios'

const loading = ref(false)
const data = ref([])
const pagination = { pageSize: 10 }

const avgRating = computed(() => {
  if (!data.value.length) return '0.0'
  const sum = data.value.reduce((acc, d) => acc + (d.rating || 0), 0)
  return (sum / data.value.length).toFixed(1)
})

const completedOrders = computed(() => {
  return data.value.reduce((acc, d) => acc + (d.completedOrders || 0), 0)
})

const totalRevenue = computed(() => {
  return data.value.reduce((acc, d) => acc + (d.totalRevenue || 0), 0).toLocaleString()
})

const columns = [
  { title: 'ID', key: 'id', width: 70 },
  { title: 'Staff ID', key: 'staffId', width: 90 },
  { title: 'Period', key: 'period', width: 100 },
  {
    title: 'Rating', key: 'rating', width: 150,
    render: (row) => h(NRate, { value: row.rating || 0, readonly: true, allowHalf: true, size: 'small' })
  },
  { title: 'Completed', key: 'completedOrders', width: 110 },
  { title: 'Cancelled', key: 'cancelledOrders', width: 100 },
  { title: 'Revenue', key: 'totalRevenue', width: 120, render: (row) => `$${(row.totalRevenue || 0).toLocaleString()}` },
  { title: 'Eval Date', key: 'evaluationDate', width: 120 },
  {
    title: 'Actions', key: 'actions', width: 120,
    render: () => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { size: 'small' }, { default: () => 'View' }),
        h(NButton, { size: 'small', type: 'error', ghost: true }, { default: () => 'Delete' })
      ]
    })
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/performances')
    data.value = res.data
  } catch (err) {
    console.error('Failed to load:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>