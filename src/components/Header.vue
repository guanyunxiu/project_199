<template>
  <div class="header-container">
    <div class="header-left">
      <h2 class="system-title">智能车间3D监控系统</h2>
      <div class="time-display">
        <el-icon :size="16" class="time-icon">
          <Timer />
        </el-icon>
        <span class="current-time">{{ currentTime }}</span>
      </div>
    </div>
    
    <div class="header-center">
      <div class="status-indicator">
        <span class="status-light"></span>
        <span class="status-text">系统运行中</span>
      </div>
    </div>
    
    <div class="header-right">
      <el-badge :value="5" :hidden="!hasNotification" class="notification-badge">
        <el-button circle class="icon-btn" @click="handleNotification">
          <el-icon :size="20">
            <Bell />
          </el-icon>
        </el-button>
      </el-badge>
      
      <el-button circle class="icon-btn" @click="toggleFullscreen">
        <el-icon :size="20">
          <component :is="isFullscreen ? 'Aim' : 'FullScreen'" />
        </el-icon>
      </el-button>
      
      <el-dropdown @command="handleCommand" trigger="click">
        <div class="user-info">
          <el-avatar :size="36" class="user-avatar">
            {{ username.charAt(0).toUpperCase() }}
          </el-avatar>
          <span class="username">{{ username }}</span>
          <el-icon :size="14" class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon class="menu-icon"><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon class="menu-icon"><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Bell, 
  FullScreen, 
  Aim,
  User, 
  SwitchButton, 
  ArrowDown, 
  Timer 
} from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()

const currentTime = ref('')
const isFullscreen = ref(false)
const hasNotification = ref(true)
const username = ref(userStore.username || 'admin')

let timer = null

const formatTime = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const updateTime = () => {
  currentTime.value = formatTime(new Date())
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const handleNotification = () => {
  hasNotification.value = false
  ElMessage.info('暂无新消息')
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      }).catch(() => {})
      break
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style lang="scss" scoped>
.header-container {
  height: 60px;
  background: linear-gradient(90deg, #0F1C33 0%, #132238 100%);
  border-bottom: 1px solid rgba(24, 144, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  color: #E6F0FF;
  margin: 0;
  letter-spacing: 1px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 6px;
}

.time-icon {
  color: #1890FF;
}

.current-time {
  font-size: 14px;
  color: #8C9BB3;
  font-family: 'Monaco', 'Consolas', monospace;
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(82, 196, 26, 0.1);
  border: 1px solid rgba(82, 196, 26, 0.3);
  border-radius: 20px;
}

.status-light {
  width: 8px;
  height: 8px;
  background: #52C41A;
  border-radius: 50%;
  animation: blink 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px #52C41A;
}

@keyframes blink {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 8px #52C41A;
  }
  50% { 
    opacity: 0.4; 
    box-shadow: 0 0 4px rgba(82, 196, 26, 0.4);
  }
}

.status-text {
  font-size: 14px;
  color: #52C41A;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-badge {
  :deep(.el-badge__content) {
    background: #F5222D;
    border: 1px solid #F5222D;
  }
}

.icon-btn {
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
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(24, 144, 255, 0.1);
    border-color: #1890FF;
  }
}

.user-avatar {
  background: linear-gradient(135deg, #1890FF 0%, #40A9FF 100%);
  color: #fff;
  font-weight: 600;
}

.username {
  font-size: 14px;
  color: #E6F0FF;
}

.dropdown-icon {
  color: #5C6B80;
  transition: transform 0.3s ease;
}

.user-info:hover .dropdown-icon {
  color: #1890FF;
  transform: translateY(2px);
}

.menu-icon {
  margin-right: 8px;
}
</style>
