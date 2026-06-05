<template>
  <div class="control-panel">
    <div class="panel-header">
      <span class="panel-title">仿真控制</span>
      <span class="status-badge" :class="statusClass">
        {{ statusText }}
      </span>
    </div>

    <div class="button-group">
      <button 
        class="control-btn play-btn" 
        :class="{ active: simulation.isRunning && !simulation.isPaused }"
        @click="handlePlay"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>播放</span>
      </button>
      <button 
        class="control-btn pause-btn" 
        :class="{ active: simulation.isPaused }"
        @click="handlePause"
      >
        <el-icon><VideoPause /></el-icon>
        <span>暂停</span>
      </button>
      <button 
        class="control-btn reset-btn"
        @click="handleReset"
      >
        <el-icon><RefreshRight /></el-icon>
        <span>重置</span>
      </button>
    </div>

    <div class="speed-control">
      <div class="speed-label">
        <span>速度调节</span>
        <span class="speed-value">{{ simulation.speed }}x</span>
      </div>
      <el-slider 
        v-model="speedValue"
        :min="0.5" 
        :max="5" 
        :step="0.5"
        :marks="speedMarks"
        @change="handleSpeedChange"
      />
    </div>

    <div class="status-display">
      <div class="status-item">
        <span class="status-label">当前时间</span>
        <span class="status-value">{{ formatTime(simulation.currentTime) }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">当前工位</span>
        <span class="status-value">{{ currentStation }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">运行状态</span>
        <span class="status-value" :class="statusClass">{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'
import { useSimulationStore } from '../store/simulation'

const simulation = useSimulationStore()

const speedValue = ref(simulation.speed)

const speedMarks = {
  0.5: '0.5x',
  1: '1x',
  2: '2x',
  3: '3x',
  4: '4x',
  5: '5x'
}

const statusClass = computed(() => {
  if (simulation.isPaused) return 'paused'
  if (simulation.isRunning) return 'running'
  return 'idle'
})

const statusText = computed(() => {
  if (simulation.isPaused) return '已暂停'
  if (simulation.isRunning) return '运行中'
  return '待机'
})

const currentStation = computed(() => {
  const runningStation = simulation.stations.find(s => s.status === 'running')
  if (runningStation) return runningStation.name
  return '无'
})

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const handlePlay = () => {
  simulation.start()
}

const handlePause = () => {
  simulation.pause()
}

const handleReset = () => {
  simulation.reset()
  speedValue.value = 1
}

const handleSpeedChange = (val) => {
  simulation.setSpeed(val)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.control-panel {
  background: rgba(15, 28, 51, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid $border-color-primary;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(24, 144, 255, 0.2);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-color-primary;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &.idle {
    background: rgba(92, 107, 128, 0.3);
    color: $text-color-tertiary;
  }

  &.running {
    background: rgba(82, 196, 26, 0.2);
    color: $success-color;
  }

  &.paused {
    background: rgba(255, 140, 0, 0.2);
    color: $warning-color;
  }
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.control-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 8px;
  background: rgba(19, 34, 56, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 8px;
  color: $text-color-secondary;
  cursor: pointer;
  transition: all 0.3s ease;

  .el-icon {
    font-size: 24px;
  }

  span {
    font-size: 13px;
  }

  &:hover {
    background: rgba(24, 144, 255, 0.1);
    border-color: $primary-color;
    color: $text-color-primary;
    transform: translateY(-2px);
  }

  &.play-btn.active {
    background: rgba(82, 196, 26, 0.2);
    border-color: $success-color;
    color: $success-color;
  }

  &.pause-btn.active {
    background: rgba(255, 140, 0, 0.2);
    border-color: $warning-color;
    color: $warning-color;
  }

  &.reset-btn:hover {
    background: rgba(245, 34, 45, 0.1);
    border-color: $error-color;
    color: $error-color;
  }
}

.speed-control {
  margin-bottom: 24px;
}

.speed-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: $text-color-secondary;
  font-size: 14px;

  .speed-value {
    color: $primary-color;
    font-weight: 600;
    font-size: 16px;
  }
}

.status-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(10, 22, 40, 0.5);
  border-radius: 6px;
  border-left: 3px solid $primary-color;
}

.status-label {
  color: $text-color-tertiary;
  font-size: 13px;
}

.status-value {
  color: $text-color-primary;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Monaco', 'Consolas', monospace;

  &.running {
    color: $success-color;
  }

  &.paused {
    color: $warning-color;
  }

  &.idle {
    color: $text-color-tertiary;
  }
}

:deep(.el-slider__marks-text) {
  color: $text-color-tertiary;
  font-size: 11px;
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, $primary-color, $primary-color-light);
}

:deep(.el-slider__button) {
  border-color: $primary-color;
  background: $bg-color-secondary;
}

:deep(.el-slider__runway) {
  background: rgba(92, 107, 128, 0.3);
}
</style>
