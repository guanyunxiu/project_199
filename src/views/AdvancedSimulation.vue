<template>
  <div class="advanced-simulation-page">
    <div class="simulation-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <el-icon><Cpu /></el-icon>
          高阶流水线仿真
        </h2>
        <el-tag :type="advancedSimStore.isRunning ? (advancedSimStore.isPaused ? 'warning' : 'success') : 'info'">
          {{ getSimulationStatusText() }}
        </el-tag>
      </div>
      
      <div class="toolbar-center">
        <el-button-group>
          <el-button 
            v-if="!advancedSimStore.isRunning"
            type="primary" 
            :icon="VideoPlay" 
            @click="startSimulation"
          >
            开始仿真
          </el-button>
          <template v-else>
            <el-button 
              v-if="!advancedSimStore.isPaused"
              type="warning" 
              :icon="VideoPause" 
              @click="pauseSimulation"
            >
              暂停
            </el-button>
            <el-button 
              v-else
              type="success" 
              :icon="VideoPlay" 
              @click="resumeSimulation"
            >
              继续
            </el-button>
          </template>
          <el-button 
            type="danger" 
            :icon="RefreshLeft" 
            @click="resetSimulation"
          >
            重置
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <span class="speed-label">速度:</span>
        <el-slider 
          v-model="advancedSimStore.speed" 
          :min="0.5" 
          :max="10" 
          :step="0.5"
          :marks="{ 0.5: '0.5x', 1: '1x', 2: '2x', 5: '5x', 10: '10x' }"
          style="width: 200px"
          @change="handleSpeedChange"
        />
        
        <el-divider direction="vertical" />
        
        <el-button @click="loadFromConfigEditor" :icon="Connection">
          加载组态配置
        </el-button>
        <el-button @click="initializeDefault" :icon="Refresh">
          默认总装线
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <div class="time-display">
          <el-icon><Timer /></el-icon>
          <span class="time-value">{{ formatTime(advancedSimStore.simulationTime) }}</span>
        </div>
      </div>
    </div>
    
    <div class="simulation-content">
      <div class="left-panel">
        <div class="panel-section">
          <div class="section-header">
            <h3><el-icon><DataAnalysis /></el-icon>生产统计</h3>
          </div>
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ advancedSimStore.productionRate }}</div>
                <div class="stat-label">产量 (辆/小时)</div>
              </div>
            </div>
            <div class="stat-card success">
              <div class="stat-icon"><el-icon><CircleCheck /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ advancedSimStore.totalCarsProduced }}</div>
                <div class="stat-label">已完成 (辆)</div>
              </div>
            </div>
            <div class="stat-card warning">
              <div class="stat-icon"><el-icon><Clock /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ advancedSimStore.averageCycleTime }}s</div>
                <div class="stat-label">平均节拍</div>
              </div>
            </div>
            <div class="stat-card info">
              <div class="stat-icon"><el-icon><Odometer /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ advancedSimStore.overallEquipmentEffectiveness }}%</div>
                <div class="stat-label">设备综合效率</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-section">
          <div class="section-header">
            <h3><el-icon><Grid /></el-icon>工位状态</h3>
            <div class="section-actions">
              <el-tag size="small" type="success">{{ advancedSimStore.runningStations.length }} 运行中</el-tag>
              <el-tag size="small" type="warning">{{ advancedSimStore.blockedStations.length }} 阻塞</el-tag>
              <el-tag size="small" type="danger">{{ advancedSimStore.faultStations.length }} 故障</el-tag>
            </div>
          </div>
          <div class="stations-list">
            <div 
              v-for="station in advancedSimStore.stations" 
              :key="station.id"
              class="station-item"
              :class="[
                `status-${station.status}`,
                { 'selected': advancedSimStore.selectedStationId === station.id }
              ]"
              @click="selectStation(station.id)"
            >
              <div class="station-status" :class="station.status" />
              <div class="station-info">
                <div class="station-name">{{ station.name }}</div>
                <div class="station-type">{{ getStageName(station.type) }}</div>
              </div>
              <div class="station-progress">
                <el-progress 
                  v-if="station.status === 'running'"
                  :percentage="station.progress" 
                  :stroke-width="6"
                  :color="getProgressColor(station.status)"
                />
                <span v-else class="status-text">{{ getStatusText(station.status) }}</span>
              </div>
              <div class="station-actions">
                <el-button 
                  v-if="station.status !== 'fault'"
                  size="small" 
                  type="danger"
                  @click.stop="triggerFault(station.id)"
                >
                  模拟故障
                </el-button>
                <el-button 
                  v-else
                  size="small" 
                  type="success"
                  @click.stop="recoverStation(station.id)"
                >
                  恢复
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel-section">
          <div class="section-header">
            <h3><el-icon><Setting /></el-icon>仿真参数</h3>
          </div>
          <el-form label-position="top" class="params-form">
            <el-form-item label="故障概率">
              <el-slider 
                v-model="advancedSimStore.faultProbability" 
                :min="0" 
                :max="0.1" 
                :step="0.005"
                :format-tooltip="val => `${(val * 100).toFixed(1)}%`"
                show-input
              />
            </el-form-item>
            <el-form-item label="自动恢复">
              <el-switch v-model="advancedSimStore.autoRecovery" />
            </el-form-item>
            <el-form-item label="恢复时间 (秒)" v-if="advancedSimStore.autoRecovery">
              <el-input-number 
                v-model="advancedSimStore.recoveryTime" 
                :min="1" 
                :max="60" 
                :step="1"
              />
            </el-form-item>
            <el-form-item label="最大并行车辆">
              <el-input-number 
                v-model="advancedSimStore.maxConcurrentCars" 
                :min="1" 
                :max="20" 
                :step="1"
              />
            </el-form-item>
            <el-form-item label="车辆生成间隔 (秒)">
              <el-input-number 
                v-model="advancedSimStore.carSpawnInterval" 
                :min="5" 
                :max="120" 
                :step="5"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <div class="center-panel">
        <Scene3D ref="scene3DRef" />
        
        <div class="process-flow-overlay">
          <div class="flow-title">总装工序流程</div>
          <div class="flow-steps">
            <div 
              v-for="(stage, index) in processStages" 
              :key="stage.id"
              class="flow-step"
              :class="{ 'active': stage.active, 'completed': stage.completed }"
            >
              <div class="step-icon">
                <el-icon><component :is="stage.icon" /></el-icon>
              </div>
              <div class="step-name">{{ stage.name }}</div>
              <div class="step-indicator">{{ stage.active ? stage.count : stage.completed ? '✓' : index + 1 }}</div>
              <div v-if="index < processStages.length - 1" class="step-connector" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="right-panel">
        <div class="panel-section">
          <div class="section-header">
            <h3><el-icon><Van /></el-icon>在制车辆 ({{ advancedSimStore.activeCars.length }})</h3>
          </div>
          <div class="cars-list">
            <div 
              v-for="car in advancedSimStore.activeCars.slice(0, 8)" 
              :key="car.id"
              class="car-item"
              :class="[
                `status-${car.status}`,
                { 'selected': advancedSimStore.selectedCarId === car.id }
              ]"
              @click="selectCar(car.id)"
            >
              <div class="car-color" :style="{ background: '#' + car.color.toString(16).padStart(6, '0') }" />
              <div class="car-info">
                <div class="car-id">{{ car.id }}</div>
                <div class="car-status">{{ getCarStatusText(car.status) }}</div>
              </div>
              <div class="car-progress">
                <el-progress 
                  :percentage="getCarProgress(car)" 
                  :stroke-width="4"
                  :color="getCarProgressColor(car.status)"
                />
              </div>
              <div class="car-time">
                {{ formatDuration(car.waitingTime) }}
              </div>
            </div>
          </div>
          <div v-if="advancedSimStore.activeCars.length === 0" class="empty-cars">
            <el-empty description="暂无在制车辆" :image-size="60" />
          </div>
        </div>
        
        <div class="panel-section">
          <div class="section-header">
            <h3><el-icon><List /></el-icon>事件日志</h3>
          </div>
          <div class="events-log">
            <div 
              v-for="event in advancedSimStore.events.slice(0, 30)" 
              :key="event.id"
              class="event-item"
              :class="event.type"
            >
              <div class="event-time">[{{ formatTime(event.time) }}]</div>
              <div class="event-icon">
                <el-icon>
                  <component :is="getEventIcon(event.type)" />
                </el-icon>
              </div>
              <div class="event-message">{{ event.message }}</div>
            </div>
          </div>
        </div>
        
        <div class="panel-section" v-if="selectedCarDetail">
          <div class="section-header">
            <h3><el-icon><InfoFilled /></el-icon>车辆详情 - {{ selectedCarDetail.id }}</h3>
          </div>
          <div class="car-detail">
            <div class="detail-row">
              <span class="detail-label">状态:</span>
              <el-tag :type="getCarStatusType(selectedCarDetail.status)">{{ getCarStatusText(selectedCarDetail.status) }}</el-tag>
            </div>
            <div class="detail-row">
              <span class="detail-label">已开工序:</span>
              <span class="detail-value">{{ selectedCarDetail.processes.length }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">已完成:</span>
              <span class="detail-value">{{ selectedCarDetail.completedProcesses.length }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">等待时间:</span>
              <span class="detail-value">{{ formatDuration(selectedCarDetail.waitingTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">当前工位:</span>
              <span class="detail-value">{{ getCurrentStationName(selectedCarDetail) || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">质量评分:</span>
              <span class="detail-value">{{ selectedCarDetail.qualityScore }}%</span>
            </div>
            
            <div class="process-timeline">
              <div class="timeline-title">工序进度</div>
              <div 
                v-for="(stage, index) in processStages" 
                :key="stage.id"
                class="timeline-item"
                :class="{ 
                  'completed': isProcessCompleted(selectedCarDetail, stage.id),
                  'active': isProcessActive(selectedCarDetail, stage.id)
                }"
              >
                <div class="timeline-dot" />
                <div class="timeline-content">
                  <span class="timeline-name">{{ stage.name }}</span>
                  <span class="timeline-status">
                    {{ isProcessCompleted(selectedCarDetail, stage.id) ? '已完成' : isProcessActive(selectedCarDetail, stage.id) ? '进行中' : '未开始' }}
                  </span>
                </div>
                <div v-if="index < processStages.length - 1" class="timeline-line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Cpu, VideoPlay, VideoPause, RefreshLeft, Refresh, Connection, Timer,
  DataAnalysis, TrendCharts, CircleCheck, Clock, Odometer, Grid,
  Setting, Van, List, InfoFilled,
  Top, Box, Promotion, Cpu as CpuIcon, Lightning, Picture, Suitcase, View, Right,
  Warning, SuccessFilled, CircleClose, WarningFilled
} from '@element-plus/icons-vue'
import { useAdvancedSimulationStore, PROCESS_STAGES, PROCESS_STAGE_CONFIG } from '@/store/advancedSimulation'
import { useConfigEditorStore } from '@/store/configEditor'
import Scene3D from '@/components/Scene3D.vue'

const advancedSimStore = useAdvancedSimulationStore()
const configEditorStore = useConfigEditorStore()

const scene3DRef = ref(null)

const processStages = computed(() => {
  const stages = Object.entries(PROCESS_STAGE_CONFIG).map(([id, config]) => ({
    id,
    name: config.name,
    icon: getStageIcon(id),
    active: advancedSimStore.stations.some(s => s.type === id && s.status === 'running'),
    completed: advancedSimStore.stations.some(s => s.type === id && s.totalProcessed > 0),
    count: advancedSimStore.stations.find(s => s.type === id)?.totalProcessed || 0
  }))
  return stages
})

const selectedCarDetail = computed(() => {
  if (!advancedSimStore.selectedCarId) return null
  return advancedSimStore.carBodies.find(c => c.id === advancedSimStore.selectedCarId)
})

const stageIconMap = {
  [PROCESS_STAGES.HOISTING]: Top,
  [PROCESS_STAGES.INTERIOR]: Box,
  [PROCESS_STAGES.CHASSIS]: Promotion,
  [PROCESS_STAGES.TIRE]: Promotion,
  [PROCESS_STAGES.ENGINE]: CpuIcon,
  [PROCESS_STAGES.ELECTRICAL]: Lightning,
  [PROCESS_STAGES.GLASS]: Picture,
  [PROCESS_STAGES.SEAT]: Suitcase,
  [PROCESS_STAGES.DETECTION]: View,
  [PROCESS_STAGES.OFFLINE]: Right
}

function getStageIcon(type) {
  return stageIconMap[type] || Box
}

function getStageName(type) {
  return PROCESS_STAGE_CONFIG[type]?.name || type
}

function getSimulationStatusText() {
  if (!advancedSimStore.isRunning) return '未启动'
  if (advancedSimStore.isPaused) return '已暂停'
  return '运行中'
}

function getStatusText(status) {
  const texts = {
    'idle': '空闲',
    'running': '运行中',
    'blocked': '阻塞',
    'waiting': '等待',
    'fault': '故障',
    'maintenance': '维护'
  }
  return texts[status] || status
}

function getCarStatusText(status) {
  const texts = {
    'waiting': '等待中',
    'moving': '移动中',
    'processing': '加工中',
    'blocked': '被阻塞',
    'completed': '已完成',
    'fault': '故障'
  }
  return texts[status] || status
}

function getCarStatusType(status) {
  const types = {
    'waiting': 'info',
    'moving': 'primary',
    'processing': 'success',
    'blocked': 'warning',
    'completed': 'success',
    'fault': 'danger'
  }
  return types[status] || 'info'
}

function getProgressColor(status) {
  const colors = {
    'running': '#52C41A',
    'blocked': '#FAAD14',
    'fault': '#F5222D',
    'idle': '#8C9BB3'
  }
  return colors[status] || '#1890FF'
}

function getCarProgressColor(status) {
  const colors = {
    'waiting': '#8C9BB3',
    'moving': '#1890FF',
    'processing': '#52C41A',
    'blocked': '#FAAD14',
    'fault': '#F5222D'
  }
  return colors[status] || '#1890FF'
}

function getCarProgress(car) {
  const totalStations = advancedSimStore.stations.filter(s => s.enabled).length
  if (totalStations === 0) return 0
  return Math.round((car.completedProcesses.length / totalStations) * 100)
}

function getEventIcon(type) {
  const icons = {
    'system': InfoFilled,
    'car_spawn': Van,
    'process_start': CpuIcon,
    'process_complete': SuccessFilled,
    'car_complete': CircleCheck,
    'blocked': Warning,
    'waiting': Clock,
    'fault': WarningFilled,
    'recovery': SuccessFilled
  }
  return icons[type] || InfoFilled
}

function getCurrentStationName(car) {
  if (!car.currentStationId) return null
  const station = advancedSimStore.stations.find(s => s.id === car.currentStationId)
  return station?.name
}

function isProcessCompleted(car, stageId) {
  return car.completedProcesses.some(p => {
    const proc = advancedSimStore.processes.find(pr => pr.id === p)
    return proc && proc.type === stageId
  })
}

function isProcessActive(car, stageId) {
  if (!car.currentProcessId) return false
  const proc = advancedSimStore.processes.find(p => p.id === car.currentProcessId)
  return proc && proc.type === stageId
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

function startSimulation() {
  if (advancedSimStore.stations.length === 0) {
    advancedSimStore.initializeDefaultAssemblyLine()
  }
  advancedSimStore.start()
  ElMessage.success('仿真已启动')
}

function pauseSimulation() {
  advancedSimStore.pause()
  ElMessage.info('仿真已暂停')
}

function resumeSimulation() {
  advancedSimStore.resume()
  ElMessage.success('仿真已继续')
}

function resetSimulation() {
  advancedSimStore.reset()
  ElMessage.success('仿真已重置')
}

function handleSpeedChange() {
  advancedSimStore.setSpeed(advancedSimStore.speed)
}

function selectStation(stationId) {
  advancedSimStore.selectStation(stationId)
}

function selectCar(carId) {
  advancedSimStore.selectCar(carId)
}

function triggerFault(stationId) {
  advancedSimStore.manuallyTriggerFault(stationId)
  ElMessage.warning('已触发设备故障')
}

function recoverStation(stationId) {
  advancedSimStore.manuallyRecoverStation(stationId)
  ElMessage.success('设备已恢复')
}

function loadFromConfigEditor() {
  const config = configEditorStore.getConfig()
  if (config.nodes.length === 0 && config.paths.length === 0) {
    ElMessage.warning('组态编辑器中没有配置数据')
    return
  }
  advancedSimStore.loadConfigFromEditor(config)
  ElMessage.success('已从组态编辑器加载配置')
}

function initializeDefault() {
  advancedSimStore.initializeDefaultAssemblyLine()
  ElMessage.success('已加载默认总装生产线')
}

let updateInterval = null

onMounted(() => {
  updateInterval = setInterval(() => {
    if (advancedSimStore.isRunning && !advancedSimStore.isPaused) {
      advancedSimStore.update(0.1)
    }
  }, 100)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
  advancedSimStore.reset()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.advanced-simulation-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(15, 28, 51, 0.95) 100%);
}

.simulation-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(15, 28, 51, 0.9);
  border-bottom: 1px solid rgba(24, 144, 255, 0.2);
  backdrop-filter: blur(10px);
  gap: 20px;
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
      
      .el-icon {
        color: $primary-color;
      }
    }
  }
  
  .toolbar-center {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .speed-label {
      font-size: 13px;
      color: $text-color-secondary;
    }
  }
  
  .toolbar-right {
    .time-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(10, 22, 40, 0.6);
      border-radius: 8px;
      border: 1px solid rgba(24, 144, 255, 0.2);
      
      .el-icon {
        color: $primary-color;
      }
      
      .time-value {
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: 600;
        color: $text-color-primary;
      }
    }
  }
}

.simulation-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel,
.right-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(15, 28, 51, 0.6);
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

.left-panel {
  border-right: 1px solid rgba(24, 144, 255, 0.2);
}

.right-panel {
  border-left: 1px solid rgba(24, 144, 255, 0.2);
}

.center-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
  
  .process-flow-overlay {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 28, 51, 0.9);
    border: 1px solid rgba(24, 144, 255, 0.3);
    border-radius: 12px;
    padding: 12px 20px;
    backdrop-filter: blur(10px);
    
    .flow-title {
      text-align: center;
      font-size: 12px;
      color: $text-color-secondary;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .flow-steps {
      display: flex;
      align-items: center;
      gap: 4px;
      
      .flow-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        
        .step-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 22, 40, 0.8);
          border: 2px solid rgba(24, 144, 255, 0.3);
          border-radius: 50%;
          color: $text-color-tertiary;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .step-name {
          font-size: 10px;
          color: $text-color-tertiary;
          margin-top: 4px;
          white-space: nowrap;
          max-width: 50px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .step-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background: rgba(24, 144, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: $text-color-secondary;
        }
        
        .step-connector {
          position: absolute;
          top: 18px;
          left: 100%;
          width: 8px;
          height: 2px;
          background: rgba(24, 144, 255, 0.3);
          margin-left: 2px;
        }
        
        &.active {
          .step-icon {
            border-color: #52C41A;
            background: rgba(82, 196, 26, 0.2);
            color: #52C41A;
            box-shadow: 0 0 12px rgba(82, 196, 26, 0.4);
          }
          
          .step-name {
            color: #52C41A;
          }
          
          .step-indicator {
            background: #52C41A;
            color: #fff;
          }
        }
        
        &.completed {
          .step-icon {
            border-color: #52C41A;
            background: rgba(82, 196, 26, 0.1);
            color: #52C41A;
          }
          
          .step-indicator {
            background: #52C41A;
            color: #fff;
          }
        }
      }
    }
  }
}

.panel-section {
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid rgba(24, 144, 255, 0.1);
    
    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
      
      .el-icon {
        color: $primary-color;
      }
    }
    
    .section-actions {
      display: flex;
      gap: 4px;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px;
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    background: rgba(15, 28, 51, 0.8);
    border: 1px solid rgba(24, 144, 255, 0.15);
    
    .stat-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 20px;
      flex-shrink: 0;
    }
    
    &.primary .stat-icon {
      background: rgba(24, 144, 255, 0.2);
      color: $primary-color;
    }
    
    &.success .stat-icon {
      background: rgba(82, 196, 26, 0.2);
      color: #52C41A;
    }
    
    &.warning .stat-icon {
      background: rgba(250, 173, 20, 0.2);
      color: #FAAD14;
    }
    
    &.info .stat-icon {
      background: rgba(19, 194, 194, 0.2);
      color: #13C2C2;
    }
    
    .stat-info {
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: $text-color-primary;
        line-height: 1.2;
      }
      
      .stat-label {
        font-size: 11px;
        color: $text-color-secondary;
        margin-top: 2px;
      }
    }
  }
}

.stations-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  
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
  
  .station-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    margin-bottom: 6px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(24, 144, 255, 0.08);
    }
    
    &.selected {
      background: rgba(24, 144, 255, 0.15);
      border: 1px solid rgba(24, 144, 255, 0.4);
    }
    
    .station-status {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
      
      &.idle {
        background: #8C9BB3;
      }
      
      &.running {
        background: #52C41A;
        box-shadow: 0 0 8px #52C41A;
      }
      
      &.blocked {
        background: #FAAD14;
        box-shadow: 0 0 8px #FAAD14;
      }
      
      &.waiting {
        background: #1890FF;
      }
      
      &.fault {
        background: #F5222D;
        box-shadow: 0 0 8px #F5222D;
      }
      
      &.maintenance {
        background: #722ED1;
      }
    }
    
    .station-info {
      flex: 1;
      min-width: 0;
      
      .station-name {
        font-size: 13px;
        font-weight: 500;
        color: $text-color-primary;
      }
      
      .station-type {
        font-size: 11px;
        color: $text-color-tertiary;
      }
    }
    
    .station-progress {
      width: 80px;
      flex-shrink: 0;
      
      .status-text {
        font-size: 11px;
        color: $text-color-secondary;
      }
    }
    
    .station-actions {
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    &:hover .station-actions {
      opacity: 1;
    }
  }
}

.params-form {
  padding: 12px;
}

.cars-list {
  max-height: 250px;
  overflow-y: auto;
  padding: 8px;
  
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
  
  .car-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    margin-bottom: 6px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(24, 144, 255, 0.08);
    }
    
    &.selected {
      background: rgba(24, 144, 255, 0.15);
      border: 1px solid rgba(24, 144, 255, 0.4);
    }
    
    .car-color {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      flex-shrink: 0;
    }
    
    .car-info {
      flex: 1;
      min-width: 0;
      
      .car-id {
        font-size: 12px;
        font-weight: 600;
        color: $text-color-primary;
        font-family: monospace;
      }
      
      .car-status {
        font-size: 10px;
        color: $text-color-tertiary;
      }
    }
    
    .car-progress {
      width: 60px;
      flex-shrink: 0;
    }
    
    .car-time {
      font-size: 10px;
      color: $text-color-secondary;
      font-family: monospace;
      flex-shrink: 0;
    }
  }
}

.empty-cars {
  padding: 20px;
}

.events-log {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  
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
  
  .event-item {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 6px 8px;
    font-size: 11px;
    border-radius: 4px;
    margin-bottom: 2px;
    
    &:hover {
      background: rgba(24, 144, 255, 0.05);
    }
    
    .event-time {
      color: $text-color-tertiary;
      font-family: monospace;
      flex-shrink: 0;
    }
    
    .event-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }
    
    .event-message {
      flex: 1;
      color: $text-color-secondary;
      line-height: 1.4;
    }
    
    &.fault {
      .event-icon {
        color: #F5222D;
      }
    }
    
    &.process_complete,
    &.car_complete,
    &.recovery {
      .event-icon {
        color: #52C41A;
      }
    }
    
    &.blocked,
    &.waiting {
      .event-icon {
        color: #FAAD14;
      }
    }
  }
}

.car-detail {
  padding: 12px;
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(24, 144, 255, 0.1);
    
    .detail-label {
      font-size: 12px;
      color: $text-color-secondary;
    }
    
    .detail-value {
      font-size: 12px;
      font-weight: 500;
      color: $text-color-primary;
    }
  }
  
  .process-timeline {
    margin-top: 16px;
    
    .timeline-title {
      font-size: 12px;
      font-weight: 600;
      color: $text-color-primary;
      margin-bottom: 12px;
    }
    
    .timeline-item {
      display: flex;
      align-items: flex-start;
      position: relative;
      padding-left: 20px;
      padding-bottom: 12px;
      
      .timeline-dot {
        position: absolute;
        left: 0;
        top: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(24, 144, 255, 0.3);
        border: 2px solid rgba(24, 144, 255, 0.5);
      }
      
      .timeline-content {
        display: flex;
        justify-content: space-between;
        flex: 1;
        font-size: 11px;
        
        .timeline-name {
          color: $text-color-secondary;
        }
        
        .timeline-status {
          color: $text-color-tertiary;
        }
      }
      
      .timeline-line {
        position: absolute;
        left: 5px;
        top: 14px;
        width: 2px;
        height: calc(100% - 14px);
        background: rgba(24, 144, 255, 0.2);
      }
      
      &.completed {
        .timeline-dot {
          background: #52C41A;
          border-color: #52C41A;
        }
        
        .timeline-status {
          color: #52C41A;
        }
      }
      
      &.active {
        .timeline-dot {
          background: $primary-color;
          border-color: $primary-color;
          box-shadow: 0 0 8px $primary-color;
        }
        
        .timeline-status {
          color: $primary-color;
        }
      }
    }
  }
}

@media (max-width: 1680px) {
  .left-panel,
  .right-panel {
    width: 280px;
  }
}

@media (max-width: 1440px) {
  .left-panel,
  .right-panel {
    width: 260px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
