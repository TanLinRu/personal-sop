<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Station Management</h1>
      <n-space>
        <n-button type="primary" @click="loadData">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          Refresh
        </n-button>
      </n-space>
    </div>

    <n-grid :cols="3" :x-gap="16" :y-gap="16" style="margin-bottom: 24px;">
      <n-gi>
        <div class="stat-card">
          <div class="stat-value">{{ data.length }}</div>
          <div class="stat-label">Total Stations</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #18a058;">{{ activeCount }}</div>
          <div class="stat-label">Active</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #8c8c8c;">{{ data.length - activeCount }}</div>
          <div class="stat-label">Inactive</div>
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

const activeCount = computed(() => data.value.filter(d => d.status === 'ACTIVE').length)

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: 'Station Code', key: 'stationCode', width: 140 },
  { title: 'Station Name', key: 'stationName', width: 180 },
  { title: 'Address', key: 'address' },
  { title: 'Capacity', key: 'capacity', width: 100 },
  {
    title: 'Status', key: 'status', width: 100,
    render: (row) => h(NTag, { type: row.status === 'ACTIVE' ? 'success' : 'default', size: 'small' },
      { default: () => row.status === 'ACTIVE' ? 'Active' : 'Inactive' })
  },
  {
    title: 'Actions', key: 'actions', width: 120,
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        h(NButton, { size: 'small', onClick: () => {} }, { default: () => 'Edit' }),
        h(NButton, { size: 'small', type: 'error', ghost: true, onClick: () => {} }, { default: () => 'Delete' })
      ]
    })
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/stations')
    data.value = res.data
  } catch (err) {
    console.error('Failed to load:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>