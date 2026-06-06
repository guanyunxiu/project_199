<template>
  <div class="sidebar-container" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <div class="logo-section" v-show="!isCollapsed">
        <el-icon :size="32" color="#1890FF" class="logo-icon">
          <Monitor />
        </el-icon>
        <span class="logo-text">3D监控系统</span>
      </div>
      <div class="logo-section collapsed-logo" v-show="isCollapsed">
        <el-icon :size="28" color="#1890FF">
          <Monitor />
        </el-icon>
      </div>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="transparent"
      text-color="#8C9BB3"
      active-text-color="#1890FF"
      router
    >
      <el-menu-item 
        v-for="item in menuItems" 
        :key="item.path" 
        :index="item.path"
        class="menu-item"
      >
        <el-icon :size="20" class="menu-icon">
          <component :is="item.icon" />
        </el-icon>
        <template #title>{{ item.name }}</template>
      </el-menu-item>
    </el-menu>
    
    <div class="sidebar-footer">
      <el-button 
        circle 
        class="collapse-btn"
        @click="toggleCollapse"
      >
        <el-icon :size="18" :class="{ rotated: isCollapsed }">
          <DArrowLeft />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Monitor, 
  Box, 
  DataLine, 
  Setting, 
  DArrowLeft,
  EditPen,
  Cpu
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapsed = ref(false)

const menuItems = [
  {
    path: '/main/monitor',
    name: '3D监控',
    icon: Monitor
  },
  {
    path: '/main/devices',
    name: '设备管理',
    icon: Box
  },
  {
    path: '/main/production',
    name: '生产统计',
    icon: DataLine
  },
  {
    path: '/main/settings',
    name: '系统设置',
    icon: Setting
  },
  {
    path: '/main/config-editor',
    name: '组态编辑器',
    icon: EditPen
  },
  {
    path: '/main/advanced-simulation',
    name: '高阶仿真',
    icon: Cpu
  }
]

const activeMenu = computed(() => {
  return route.path || '/main/monitor'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  width: 220px;
  height: calc(100vh - 60px);
  background: linear-gradient(180deg, #0F1C33 0%, #0A1628 100%);
  border-right: 1px solid rgba(24, 144, 255, 0.2);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  
  &.collapsed {
    width: 64px;
  }
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(24, 144, 255, 0.1);
  padding: 0 16px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  
  &.collapsed-logo {
    justify-content: center;
  }
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #E6F0FF;
  white-space: nowrap;
  letter-spacing: 1px;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  padding: 12px 8px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(24, 144, 255, 0.2);
    border-radius: 2px;
  }
}

.menu-item {
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    border-radius: 8px;
    margin: 0;
    color: #8C9BB3;
    
    &:hover {
      background: rgba(24, 144, 255, 0.1);
      color: #1890FF;
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0.05) 100%);
      color: #1890FF;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 24px;
        background: #1890FF;
        border-radius: 0 2px 2px 0;
        box-shadow: 0 0 8px #1890FF;
      }
    }
  }
  
  .menu-icon {
    flex-shrink: 0;
  }
}

.sidebar-footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid rgba(24, 144, 255, 0.1);
  padding: 0 12px;
}

.collapse-btn {
  width: 40px;
  height: 40px;
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.2);
  color: #8C9BB3;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(24, 144, 255, 0.1);
    border-color: #1890FF;
    color: #1890FF;
  }
  
  :deep(.el-icon) {
    transition: transform 0.3s ease;
    
    &.rotated {
      transform: rotate(180deg);
    }
  }
}
</style>
