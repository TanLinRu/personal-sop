<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-dialog-provider>
        <n-layout has-sider position="absolute">
          <!-- Sidebar -->
          <n-layout-sider
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            :width="240"
            show-trigger
            :native-scrollbar="false"
            content-style="padding: 16px;"
          >
            <div class="logo">
              <n-icon size="24" color="#18a058">
                <GridOutline />
              </n-icon>
              <span v-if="!collapsed" class="logo-text">Admin</span>
            </div>
            <n-menu
              :collapsed="collapsed"
              :collapsed-width="64"
              :collapsed-icon-size="22"
              :options="menuOptions"
              :value="activeKey"
              @update:value="handleMenuUpdate"
            />
          </n-layout-sider>

          <!-- Main Content -->
          <n-layout content-style="padding: 0;">
            <!-- Header -->
            <n-layout-header bordered position="absolute" style="z-index: 100;">
              <div class="header">
                <div class="header-left">
                  <n-breadcrumb>
                    <n-breadcrumb-item>Home</n-breadcrumb-item>
                    <n-breadcrumb-item>{{ activeMenu }}</n-breadcrumb-item>
                  </n-breadcrumb>
                </div>
                <div class="header-right">
                  <n-button quaternary circle>
                    <template #icon>
                      <n-icon><NotificationsOutline /></n-icon>
                    </template>
                  </n-button>
                  <n-dropdown :options="userOptions" @select="handleUserSelect">
                    <n-button quaternary>
                      <n-avatar round size="small">A</n-avatar>
                      <span style="margin-left: 8px;">Admin</span>
                    </n-button>
                  </n-dropdown>
                </div>
              </div>
            </n-layout-header>

            <!-- Page Content -->
            <n-layout-content content-style="padding: 24px; margin-top: 60px;">
              <router-view />
            </n-layout-content>
          </n-layout>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NConfigProvider, NLayout, NLayoutSider, NLayoutHeader, NLayoutContent,
  NMenu, NIcon, NButton, NAvatar, NBreadcrumb, NBreadcrumbItem,
  NMessageProvider, NDialogProvider, NDropdown
} from 'naive-ui'
import { GridOutline, NotificationsOutline, PersonOutline, SettingsOutline, LogOutOutline } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const activeKey = ref('staffs')

const themeOverrides = {
  common: {
    primaryColor: '#18a058',
    primaryColorHover: '#36ad6a',
    primaryColorPressed: '#0c7a43',
    borderRadius: '8px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  },
  Menu: {
    itemTextColor: '#1f1f1f',
    itemIconColor: '#8c8c8c',
    itemIconColorHover: '#18a058',
    itemTextColorHover: '#18a058',
    itemColorActive: '#e8f5e9',
    itemTextColorActive: '#18a058'
  }
}

const menuOptions = [
  {
    label: 'Staffs',
    key: 'staffs',
    icon: () => h(NIcon, null, { default: () => h(PersonOutline) })
  },
  {
    label: 'Stations',
    key: 'stations',
    icon: () => h(NIcon, null, { default: () => h(GridOutline) })
  },
  {
    label: 'Schedules',
    key: 'schedules',
    icon: () => h(NIcon, null, { default: () => h(GridOutline) })
  },
  {
    label: 'Performance',
    key: 'performances',
    icon: () => h(NIcon, null, { default: () => h(GridOutline) })
  }
]

const activeMenu = {
  staffs: 'Staff Management',
  stations: 'Station Management',
  schedules: 'Schedule Management',
  performances: 'Performance'
}[activeKey.value] || 'Dashboard'

const userOptions = [
  { label: 'Profile', key: 'profile', icon: () => h(NIcon, null, { default: () => h(PersonOutline) }) },
  { label: 'Settings', key: 'settings', icon: () => h(NIcon, null, { default: () => h(SettingsOutline) }) },
  { type: 'divider', key: 'd1' },
  { label: 'Logout', key: 'logout', icon: () => h(NIcon, null, { default: () => h(LogOutOutline) }) }
]

const handleMenuUpdate = (key) => {
  activeKey.value = key
  router.push(`/${key}`)
}

const handleUserSelect = (key) => {
  if (key === 'logout') {
    console.log('Logout')
  }
}
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background: white;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>