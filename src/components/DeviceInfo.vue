<template>
  <Teleport to="body">
    <div v-if="visible" class="device-modal-overlay" @click.self="handleClose">
      <div class="device-modal">
        <div class="modal-header">
          <div class="header-left">
            <div class="device-icon" :class="deviceTypeClass">
              <el-icon>
                <component :is="deviceIcon" />
              </el-icon>
            </div>
            <div class="device-title">
              <h3 class="device-name">{{ device?.name }}</h3>
              <span class="device-type">{{ deviceTypeText }}</span>
            </div>
          </div>
          <button class="close-btn" @click="handleClose">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <div class="modal-body">
          <div class="info-section">
            <div class="section-title">基本信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">设备ID</span>
                <span class="info-value">{{ device?.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备状态</span>
                <span class="info-value" :class="statusClass">
                  <span class="status-dot"></span>
                  {{ statusText }}
                </span>
              </div>
            </div>
          </div>

          <div class="params-section">
            <div class="section-title">运行参数</div>
            <table class="params-table">
              <thead>
                <tr>
                  <th>参数名称</th>
                  <th>参数值</th>
                  <th>正常范围</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>运行时长</td>
                  <td class="highlight">{{ formatRuntime(device?.runtime) }}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>运行效率</td>
                  <td :class="{ warning: device?.efficiency < 85 }">
                    {{ device?.efficiency?.toFixed(1) }}%
                  </td>
                  <td>≥ 85%</td>
                </tr>
                <tr>
                  <td>当前温度</td>
                  <td :class="{ warning: device?.temperature > 60, danger: device?.temperature > 75 }">
                    {{ device?.temperature?.toFixed(1) }}°C
                  </td>
                  <td>25 ~ 60°C</td>
                </tr>
                <tr>
                  <td>上次维护</td>
                  <td>{{ lastMaintenance }}</td>
                  <td>≤ 30天</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="timeline-section">
            <div class="section-title">状态时间线</div>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot success"></div>
                <div class="timeline-content">
                  <span class="timeline-time">08:00</span>
                  <span class="timeline-text">设备启动，进入待机状态</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot running"></div>
                <div class="timeline-content">
                  <span class="timeline-time">08:15</span>
                  <span class="timeline-text">开始运行，执行生产任务</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot running"></div>
                <div class="timeline-content">
                  <span class="timeline-time">10:30</span>
                  <span class="timeline-text">完成第50个工件加工</span>
                </div>
              </div>
              <div class="timeline-item current">
                <div class="timeline-dot active"></div>
                <div class="timeline-content">
                  <span class="timeline-time">当前</span>
                  <span class="timeline-text">{{ statusText }}中</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="action-btn secondary" @click="handleClose">
            关闭
          </button>
          <button class="action-btn primary">
            查看详情
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Close, Cpu, Connection, DataLine, Monitor, Box } from '@element-plus/icons-vue'
import { useSimulationStore } from '../store/simulation'

const simulation = useSimulationStore()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

const device = computed(() => simulation.selectedDevice)

const deviceIconMap = {
  robot: Box,
  conveyor: Connection,
  welder: Cpu,
  inspector: Monitor,
  agv: DataLine
}

const deviceTypeTextMap = {
  robot: '机械臂',
  conveyor: '传送带',
  welder: '焊接机',
  inspector: '检测台',
  agv: 'AGV小车'
}

const deviceIcon = computed(() => {
  return deviceIconMap[device.value?.type] || Cpu
})

const deviceTypeClass = computed(() => {
  return device.value?.type || 'default'
})

const deviceTypeText = computed(() => {
  return deviceTypeTextMap[device.value?.type] || '未知设备'
})

const statusClass = computed(() => {
  const status = device.value?.status
  if (status === 'running') return 'running'
  if (status === 'paused') return 'paused'
  if (status === 'error') return 'error'
  return 'standby'
})

const statusText = computed(() => {
  const status = device.value?.status
  const map = {
    running: '运行',
    standby: '待机',
    paused: '暂停',
    error: '故障'
  }
  return map[status] || '未知'
})

const lastMaintenance = computed(() => {
  const days = Math.floor(Math.random() * 15) + 5
  return `${days}天前`
})

const formatRuntime = (seconds) => {
  if (!seconds) return '0h 0m'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hrs}h ${mins}m`
}

const handleClose = () => {
  simulation.selectedDevice = null
  emit('update:visible', false)
  emit('close')
}

watch(() => props.visible, (val) => {
  if (!val) {
    simulation.selectedDevice = null
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.device-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.device-modal {
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  background: rgba(15, 28, 51, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid $border-color-primary;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(24, 144, 255, 0.2);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.device-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 28px;

  &.robot {
    background: rgba(24, 144, 255, 0.2);
    color: $primary-color;
  }

  &.conveyor {
    background: rgba(82, 196, 26, 0.2);
    color: $success-color;
  }

  &.welder {
    background: rgba(245, 34, 45, 0.2);
    color: $error-color;
  }

  &.inspector {
    background: rgba(114, 46, 209, 0.2);
    color: #722ED1;
  }

  &.agv {
    background: rgba(255, 140, 0, 0.2);
    color: $warning-color;
  }
}

.device-title {
  .device-name {
    font-size: 20px;
    font-weight: 600;
    color: $text-color-primary;
    margin: 0 0 4px 0;
  }

  .device-type {
    font-size: 13px;
    color: $text-color-tertiary;
  }
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(19, 34, 56, 0.6);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 8px;
  color: $text-color-secondary;
  cursor: pointer;
  transition: all 0.3s ease;

  .el-icon {
    font-size: 18px;
  }

  &:hover {
    background: rgba(245, 34, 45, 0.1);
    border-color: $error-color;
    color: $error-color;
  }
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid $primary-color;
}

.info-section,
.params-section,
.timeline-section {
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  background: rgba(10, 22, 40, 0.5);
  border-radius: 8px;

  .info-label {
    font-size: 12px;
    color: $text-color-tertiary;
  }

  .info-value {
    font-size: 15px;
    font-weight: 500;
    color: $text-color-primary;
    display: flex;
    align-items: center;
    gap: 6px;

    &.running {
      color: $success-color;

      .status-dot {
        background: $success-color;
        box-shadow: 0 0 8px $success-color;
      }
    }

    &.standby {
      color: $text-color-tertiary;

      .status-dot {
        background: $text-color-tertiary;
      }
    }

    &.paused {
      color: $warning-color;

      .status-dot {
        background: $warning-color;
        box-shadow: 0 0 8px $warning-color;
      }
    }

    &.error {
      color: $error-color;

      .status-dot {
        background: $error-color;
        box-shadow: 0 0 8px $error-color;
      }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
}

.params-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  th,
  td {
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
  }

  thead {
    th {
      background: rgba(10, 22, 40, 0.7);
      color: $text-color-tertiary;
      font-weight: 500;
      font-size: 12px;

      &:first-child {
        border-radius: 8px 0 0 0;
      }

      &:last-child {
        border-radius: 0 8px 0 0;
      }
    }
  }

  tbody {
    tr {
      background: rgba(10, 22, 40, 0.3);

      &:nth-child(even) {
        background: rgba(10, 22, 40, 0.5);
      }

      td {
        color: $text-color-secondary;
        border-bottom: 1px solid rgba(24, 144, 255, 0.1);

        &.highlight {
          color: $primary-color;
          font-weight: 500;
        }

        &.warning {
          color: $warning-color;
        }

        &.danger {
          color: $error-color;
        }
      }

      &:last-child {
        td {
          &:first-child {
            border-radius: 0 0 0 8px;
          }

          &:last-child {
            border-radius: 0 0 8px 0;
          }
        }
      }
    }
  }
}

.timeline {
  position: relative;
  padding-left: 24px;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(to bottom, 
      $success-color 0%, 
      $success-color 25%, 
      $primary-color 25%, 
      $primary-color 50%,
      $primary-color 50%,
      $primary-color 75%,
      $primary-color-light 75%,
      $primary-color-light 100%
    );
    border-radius: 2px;
  }
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;

  &:last-child {
    padding-bottom: 0;
  }

  &.current {
    .timeline-text {
      color: $primary-color;
      font-weight: 500;
    }
  }
}

.timeline-dot {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid $bg-color-secondary;

  &.success {
    background: $success-color;
    box-shadow: 0 0 10px $success-color;
  }

  &.running {
    background: $primary-color;
    box-shadow: 0 0 10px $primary-color;
  }

  &.active {
    background: $primary-color-light;
    box-shadow: 0 0 15px $primary-color-light;
    animation: timelinePulse 2s infinite;
  }
}

@keyframes timelinePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 12px;

  .timeline-time {
    min-width: 50px;
    font-size: 12px;
    color: $text-color-tertiary;
    font-family: 'Monaco', 'Consolas', monospace;
  }

  .timeline-text {
    font-size: 13px;
    color: $text-color-secondary;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(24, 144, 255, 0.2);
  background: rgba(10, 22, 40, 0.5);
}

.action-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &.secondary {
    background: rgba(19, 34, 56, 0.8);
    color: $text-color-secondary;
    border: 1px solid rgba(24, 144, 255, 0.2);

    &:hover {
      background: rgba(24, 144, 255, 0.1);
      border-color: $primary-color;
      color: $text-color-primary;
    }
  }

  &.primary {
    background: linear-gradient(135deg, $primary-color, $primary-color-light);
    color: #fff;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
    }
  }
}
</style>
