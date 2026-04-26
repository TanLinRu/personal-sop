<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Staff Management</h1>
      <n-space>
        <n-button type="primary" @click="loadData">
          <template #icon><n-icon><RefreshOutline /></n-icon></template>
          Refresh
        </n-button>
      </n-space>
    </div>

    <!-- Stats Cards -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16" style="margin-bottom: 24px;">
      <n-gi>
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Staff</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #18a058;">{{ stats.active }}</div>
          <div class="stat-label">Active</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #faad14;">{{ stats.inactive }}</div>
          <div class="stat-label">On Leave</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="stat-card">
          <div class="stat-value" style="color: #ff4d4f;">{{ stats.inactive }}</div>
          <div class="stat-label">Inactive</div>
        </div>
      </n-gi>
    </n-grid>

    <!-- Data Table -->
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
import { ref, onMounted, computed } from 'vue'
import { NButton, NIcon, NSpace, NTag, NCard, NDataTable, NGrid, NGi } from 'naive-ui'
import { RefreshOutline } from '@vicons/ionicons5'
import axios from 'axios'

const loading = ref(false)
const data = ref([])

const pagination = {
  pageSize: 10
}

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: 'Staff Code',
    key: 'staffCode',
    width: 120
  },
  {
    title: 'Name',
    key: 'staffName',
    width: 150
  },
  {
    title: 'Phone',
    key: 'phone',
    width: 140
  },
  {
    title: 'ID Card',
    key: 'idCard',
    width: 180
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) => {
      const statusMap = {
        'ACTIVE': { type: 'success', text: 'Active' },
        'INACTIVE': { type: 'default', text: 'Inactive' },
        'ON_LEAVE': { type: 'warning', text: 'On Leave' }
      }
      const status = statusMap[row.status] || { type: 'default', text: row.status }
      return h(NTag, { type: status.type, size: 'small' }, { default: () => status.text })
    }
  },
  {
    title: 'Hire Date',
    key: 'hireDate',
    width: 120
  },
  {
    title: 'Station ID',
    key: 'stationId',
    width: 100
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => 'Edit' }),
          h(NButton, { size: 'small', type: 'error', ghost: true, onClick: () => handleDelete(row) }, { default: () => 'Delete' })
        ]
      })
    }
  }
]

const stats = computed(() => {
  const total = data.value.length
  const active = data.value.filter(d => d.status === 'ACTIVE').length
  const inactive = data.value.filter(d => d.status === 'INACTIVE').length
  const onLeave = data.value.filter(d => d.status === 'ON_LEAVE').length
  return { total, active, inactive, onLeave }
})

import { h } from 'vue'

const loadData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/staffs')
    data.value = res.data
  } catch (err) {
    console.error('Failed to load:', err)
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  console.log('Edit:', row)
}

const handleDelete = (row) => {
  console.log('Delete:', row)
}

onMounted(loadData)
</script>