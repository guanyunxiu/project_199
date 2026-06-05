<template>
  <div class="data-panel">
    <div class="panel-header">
      <span class="panel-title">数据统计</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon production">
          <el-icon><Goods /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span class="number">{{ animatedProduction }}</span>
            <span class="unit">件</span>
          </div>
          <div class="stat-label">今日产量</div>
          <div class="stat-trend">
            <el-icon :class="trendClass"><Top /></el-icon>
            <span>12.5%</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon station">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span class="number">{{ animatedStations }}</span>
            <span class="unit">个</span>
          </div>
          <div class="stat-label">工位数量</div>
          <div class="stat-trend">
            <el-icon :class="trendClass"><Top /></el-icon>
            <span>0%</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon device">
          <el-icon><Cpu /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span class="number">{{ animatedDevices }}</span>
            <span class="unit">台</span>
          </div>
          <div class="stat-label">设备数量</div>
          <div class="stat-trend">
            <el-icon :class="trendClass"><Top /></el-icon>
            <span>0%</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon runtime">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            <span class="number">{{ animatedRuntime }}</span>
            <span class="unit">h</span>
          </div>
          <div class="stat-label">运行时长</div>
          <div class="stat-trend">
            <el-icon :class="trendClass"><Top /></el-icon>
            <span>8.3%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="station-status">
      <div class="section-header">
        <span class="section-title">工位状态</span>
        <div class="legend">
          <span class="legend-item">
            <span class="dot idle"></span>
            <span>空闲</span>
          </span>
          <span class="legend-item">
            <span class="dot running"></span>
            <span>运行</span>
          </span>
          <span class="legend-item">
            <span class="dot error"></span>
            <span>停机</span>
          </span>
        </div>
      </div>
      <div class="station-grid">
        <div 
          v-for="station in allStations" 
          :key="station.id"
          class="station-item"
          :class="station.status"
        >
          <div class="station-indicator"></div>
          <span class="station-name">{{ station.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Goods, OfficeBuilding, Cpu, Timer, Top } from '@element-plus/icons-vue'
import { useSimulationStore } from '../store/simulation'

const simulation = useSimulationStore()

const animatedProduction = ref(0)
const animatedStations = ref(0)
const animatedDevices = ref(0)
const animatedRuntime = ref(0)

const trendClass = 'up'

const production = computed(() => {
  return simulation.productionData?.actualOutput || 0
})

const runtime = computed(() => {
  return simulation.productionData?.runningTime || 0
})

const allStations = computed(() => {
  const baseStations = simulation.stations.map(s => ({
    id: s.id,
    name: s.name,
    status: s.status === 'idle' ? 'idle' : 
            s.status === 'running' ? 'running' : 
            s.status === 'paused' ? 'idle' : 'error'
  }))
  
  const extraStations = []
  for (let i = simulation.stations.length + 1; i <= 12; i++) {
    const statuses = ['idle', 'running', 'idle', 'running', 'idle', 'error', 'idle']
    extraStations.push({
      id: i,
      name: `工位${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][i - 1]}`,
      status: statuses[(i - simulation.stations.length - 1) % statuses.length]
    })
  }
  
  return [...baseStations, ...extraStations]
})

const animateNumber = (target, current, duration = 1000) => {
  const start = parseFloat(current.value) || 0
  const end = parseFloat(target) || 0
  const startTime = performance.now()
  const decimals = target % 1 === 0 ? 0 : 1
  
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1)
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    const value = start + (end - start) * easeProgress
    current.value = value.toFixed(decimals)
    
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  
  requestAnimationFrame(step)
}

watch(production, (newVal) => {
  animateNumber(newVal, animatedProduction)
})

watch(runtime, (newVal) => {
  animateNumber(newVal, animatedRuntime)
})

onMounted(() => {
  animateNumber(production.value, animatedProduction)
  animateNumber(simulation.stationCount, animatedStations)
  animateNumber(simulation.deviceCount, animatedDevices)
  animateNumber(runtime.value, animatedRuntime)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.data-panel {
  background: rgba(15, 28, 51, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid $border-color-primary;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(24, 144, 255, 0.2);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-color-primary;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(19, 34, 56, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(24, 144, 255, 0.1);
    border-color: rgba(24, 144, 255, 0.4);
    transform: translateY(-2px);
  }
}

.stat-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 22px;

  &.production {
    background: rgba(24, 144, 255, 0.2);
    color: $primary-color;
  }

  &.station {
    background: rgba(82, 196, 26, 0.2);
    color: $success-color;
  }

  &.device {
    background: rgba(255, 140, 0, 0.2);
    color: $warning-color;
  }

  &.runtime {
    background: rgba(114, 46, 209, 0.2);
    color: #722ED1;
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;

  .number {
    font-size: 24px;
    font-weight: 700;
    color: $text-color-primary;
    font-family: 'Monaco', 'Consolas', monospace;
    line-height: 1;
  }

  .unit {
    font-size: 12px;
    color: $text-color-tertiary;
  }
}

.stat-label {
  font-size: 12px;
  color: $text-color-tertiary;
  margin-bottom: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: $success-color;

  .up {
    color: $success-color;
  }

  .down {
    color: $error-color;
  }

  .el-icon {
    font-size: 12px;
  }
}

.station-status {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: $text-color-primary;
  }

  .legend {
    display: flex;
    gap: 16px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: $text-color-tertiary;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.idle {
          background: $text-color-tertiary;
        }

        &.running {
          background: $success-color;
          box-shadow: 0 0 8px $success-color;
        }

        &.error {
          background: $error-color;
          box-shadow: 0 0 8px $error-color;
        }
      }
    }
  }
}

.station-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.station-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: rgba(10, 22, 40, 0.5);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(24, 144, 255, 0.1);
    border-color: rgba(24, 144, 255, 0.3);
  }

  &.idle {
    .station-indicator {
      background: $text-color-tertiary;
    }
  }

  &.running {
    .station-indicator {
      background: $success-color;
      box-shadow: 0 0 10px $success-color;
      animation: pulse 2s infinite;
    }
  }

  &.error {
    .station-indicator {
      background: $error-color;
      box-shadow: 0 0 10px $error-color;
      animation: blink 1s infinite;
    }
  }
}

.station-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.station-name {
  font-size: 11px;
  color: $text-color-secondary;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
