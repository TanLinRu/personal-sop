<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Schedule Management</h1>
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
          <div class="stat-label">Total Schedules</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #18a058;">{{ scheduledCount }}</div>
          <div class="stat-label">Scheduled</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #1890ff;">{{ completedCount }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #ff4d4f;">{{ cancelledCount }}</div>
          <div class="stat-label">Cancelled</div>
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
import { NButton, NIcon, NSpace, NTag, NCard, NDataTable, NGrid, NGi } from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import axios from 'axios'

const loading = ref(false)
const data = ref([])
const pagination = { pageSize: 10 }

const scheduledCount = computed(() => data.value.filter(d => d.status === 'SCHEDULED').length)
const completedCount = computed(() => data.value.filter(d => d.status === 'COMPLETED').length)
const cancelledCount = computed(() => data.value.filter(d => d.status === 'CANCELLED').length)

const columns = [
  { title: 'ID', key: 'id', width: 70 },
  { title: 'Staff ID', key: 'staffId', width: 90 },
  { title: 'Station ID', key: 'stationId', width: 100 },
  { title: 'Date', key: 'scheduleDate', width: 120 },
  { title: 'Shift', key: 'shift', width: 100 },
  {
    title: 'Status', key: 'status', width: 110,
    render: (row) => {
      const map = { 'SCHEDULED': 'info', 'COMPLETED': 'success', 'CANCELLED': 'error', 'IN_PROGRESS': 'warning' }
      const text = { 'SCHEDULED': 'Scheduled', 'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled', 'IN_PROGRESS': 'In Progress' }
      return h(NTag, { type: map[row.status] || 'default', size: 'small' }, { default: () => text[row.status] || row.status })
    }
  },
  { title: 'Start Time', key: 'startTime', width: 100 },
  { title: 'End Time', key: 'endTime', width: 100 },
  {
    title: 'Actions', key: 'actions', width: 120,
    render: () => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { size: 'small' }, { default: () => 'Edit' }),
        h(NButton, { size: 'small', type: 'error', ghost: true }, { default: () => 'Delete' })
      ]
    })
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/schedules')
    data.value = res.data
  } catch (err) {
    console.error('Failed to load:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>