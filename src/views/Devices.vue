<template>
  <div class="devices-page">
    <div class="page-header">
      <h2 class="page-title">设备管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备名称..."
          clearable
          style="width: 240px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
          <el-option label="运行中" value="running" />
          <el-option label="空闲" value="idle" />
          <el-option label="警告" value="warning" />
          <el-option label="故障" value="error" />
        </el-select>
        <el-button type="primary">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon running">
          <el-icon><Cpu /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalDevices }}</div>
          <div class="stat-label">设备总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon online">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ runningCount }}</div>
          <div class="stat-label">运行中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ warningCount }}</div>
          <div class="stat-label">警告</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon error">
          <el-icon><CircleClose /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ errorCount }}</div>
          <div class="stat-label">故障</div>
        </div>
      </div>
    </div>

    <div class="table-container">
      <el-table
        :data="filteredDevices"
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="设备ID" width="160" />
        <el-table-column prop="name" label="设备名称" width="140" />
        <el-table-column prop="type" label="设备类型" width="120">
          <template #default="{ row }">
            <span>{{ typeMap[row.type] || row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]" effect="light">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="runtime" label="运行时长" width="120">
          <template #default="{ row }">
            {{ formatRuntime(row.runtime) }}
          </template>
        </el-table-column>
        <el-table-column prop="efficiency" label="效率" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="row.efficiency || 0"
              :color="getEfficiencyColor(row.efficiency || 0)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度(°C)" width="110" />
        <el-table-column label="位置" width="160">
          <template #default="{ row }">
            <span>X: {{ row.position.x }}, Y: {{ row.position.y }}, Z: {{ row.position.z }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button type="success" link size="small" @click="focusDevice(row)">
              定位
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50]"
      :total="filteredDevices.length"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Cpu, CircleCheck, Warning, CircleClose } from '@element-plus/icons-vue'
import devices from '@/mock/devices'

const searchKeyword = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const typeMap = {
  'robot-arm': '机械臂',
  'conveyor': '传送带',
  'lift': '升降机',
  'agv': 'AGV'
}

const statusMap = {
  'running': '运行中',
  'idle': '空闲',
  'warning': '警告',
  'error': '故障'
}

const statusTypeMap = {
  'running': 'success',
  'idle': 'info',
  'warning': 'warning',
  'error': 'danger'
}

const totalDevices = computed(() => devices.length)
const runningCount = computed(() => devices.filter(d => d.status === 'running').length)
const warningCount = computed(() => devices.filter(d => d.status === 'warning').length)
const errorCount = computed(() => devices.filter(d => d.status === 'error').length)

const filteredDevices = computed(() => {
  return devices.filter(device => {
    const matchKeyword = !searchKeyword.value || 
      device.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      device.id.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchStatus = !statusFilter.value || device.status === statusFilter.value
    return matchKeyword && matchStatus
  })
})

const formatRuntime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const getEfficiencyColor = (value) => {
  if (value >= 90) return '#52C41A'
  if (value >= 70) return '#FAAD14'
  return '#F5222D'
}

const tableRowClassName = ({ row }) => {
  if (row.status === 'error') return 'error-row'
  if (row.status === 'warning') return 'warning-row'
  return ''
}

const viewDetail = (row) => {
  ElMessage.info(`查看设备详情: ${row.name}`)
}

const focusDevice = (row) => {
  ElMessage.success(`定位设备: ${row.name}`)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.devices-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(15, 28, 51, 0.95) 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: $text-color-primary;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(15, 28, 51, 0.85);
    border: 1px solid rgba(24, 144, 255, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;

      &.running {
        background: rgba(82, 196, 26, 0.15);
        color: #52C41A;
      }

      &.online {
        background: rgba(24, 144, 255, 0.15);
        color: $primary-color;
      }

      &.warning {
        background: rgba(250, 173, 20, 0.15);
        color: #FAAD14;
      }

      &.error {
        background: rgba(245, 34, 45, 0.15);
        color: #F5222D;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: $text-color-primary;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 13px;
        color: $text-color-secondary;
        margin-top: 4px;
      }
    }
  }
}

.table-container {
  flex: 1;
  overflow: auto;
  background: rgba(15, 28, 51, 0.85);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: rgba(24, 144, 255, 0.1);
    --el-table-border-color: rgba(24, 144, 255, 0.1);
    --el-table-text-color: $text-color-primary;
    --el-table-header-text-color: $text-color-primary;

    &::before {
      display: none;
    }

    .warning-row {
      --el-table-tr-bg-color: rgba(250, 173, 20, 0.05);
    }

    .error-row {
      --el-table-tr-bg-color: rgba(245, 34, 45, 0.05);
    }

    th.el-table__cell {
      background: rgba(24, 144, 255, 0.1);
      font-weight: 600;
    }

    tr:hover > td {
      background: rgba(24, 144, 255, 0.05) !important;
    }
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    --el-pagination-color: $text-color-secondary;
    --el-pagination-hover-color: $primary-color;
    --el-pagination-button-color: $text-color-secondary;
    --el-pagination-button-bg-color: rgba(15, 28, 51, 0.85);
    --el-pagination-button-border-color: rgba(24, 144, 255, 0.2);
  }
}

@media (max-width: 1440px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
