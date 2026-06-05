<template>
  <div class="scene3d-container" ref="containerRef">
    <div class="scene-toolbar">
      <el-button-group>
        <el-button @click="resetView" title="重置视角">
          <el-icon><Refresh /></el-icon>
        </el-button>
        <el-button @click="toggleFullscreen" title="全屏">
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </el-button-group>
    </div>
    <div v-if="loading" class="scene-loading">
      <Loading />
    </div>
    <div v-if="hoveredDevice" class="device-tooltip" :style="tooltipStyle">
      <div class="tooltip-title">{{ hoveredDevice.name }}</div>
      <div class="tooltip-status" :class="hoveredDevice.status">
        <span class="status-dot"></span>
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, FullScreen } from '@element-plus/icons-vue'
import { useSimulationStore } from '@/store/simulation'
import { Scene3D } from '@/three/Scene3D'
import Loading from './Loading.vue'

const containerRef = ref(null)
const loading = ref(true)
const scene3D = shallowRef(null)
const hoveredDevice = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const simulationStore = useSimulationStore()

const statusText = computed(() => {
  const map = { running: '运行中', idle: '空闲', stopped: '停机' }
  return map[hoveredDevice.value?.status] || '未知'
})

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x + 15}px`,
  top: `${tooltipPosition.value.y + 15}px`
}))

const resetView = () => {
  scene3D.value?.controls?.resetView()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    containerRef.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleDeviceClick = (device) => {
  simulationStore.setSelectedDevice(device)
  ElMessage.success(`已选中设备: ${device.name}`)
}

const handleDeviceHover = (device, event) => {
  if (device) {
    hoveredDevice.value = device
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
  } else {
    hoveredDevice.value = null
  }
}

onMounted(async () => {
  await nextTick()
  
  try {
    console.log('Step 1: Creating Scene3D instance')
    scene3D.value = new Scene3D()
    console.log('Step 2: Scene3D instance created')
    scene3D.value.onDeviceClick = handleDeviceClick
    scene3D.value.onDeviceHover = handleDeviceHover
    
    console.log('Step 3: Calling init()')
    await scene3D.value.init(containerRef.value)
    console.log('Step 4: init() completed')
    
    simulationStore.setScene3D(scene3D.value)
    console.log('Step 5: Scene3D stored')
    
    setTimeout(() => {
      loading.value = false
      console.log('Step 6: Loading complete')
    }, 1500)
  } catch (error) {
    console.error('3D场景初始化失败:', error)
    console.error('Error stack:', error.stack)
    ElMessage.error('3D场景初始化失败')
    loading.value = false
  }
})

onUnmounted(() => {
  scene3D.value?.dispose()
})
</script>

<style lang="scss" scoped>
.scene3d-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0A1628 0%, #0F1C33 100%);
  overflow: hidden;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .scene-toolbar {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    gap: 10px;

    :deep(.el-button) {
      background: rgba(15, 28, 51, 0.8);
      border-color: rgba(24, 144, 255, 0.3);
      color: #E6F0FF;
      backdrop-filter: blur(10px);

      &:hover {
        background: rgba(24, 144, 255, 0.2);
        border-color: #1890FF;
        color: #40A9FF;
      }
    }
  }

  .scene-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    background: rgba(10, 22, 40, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .device-tooltip {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    background: rgba(15, 28, 51, 0.95);
    border: 1px solid rgba(24, 144, 255, 0.5);
    border-radius: 6px;
    padding: 10px 15px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);

    .tooltip-title {
      font-size: 14px;
      font-weight: 600;
      color: #E6F0FF;
      margin-bottom: 5px;
    }

    .tooltip-status {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 6px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #8C9BB3;
      }

      &.running .status-dot {
        background: #52C41A;
        box-shadow: 0 0 8px #52C41A;
      }

      &.stopped .status-dot {
        background: #F5222D;
        box-shadow: 0 0 8px #F5222D;
      }

      &.running { color: #52C41A; }
      &.stopped { color: #F5222D; }
      &.idle { color: #8C9BB3; }
    }
  }
}
</style>
