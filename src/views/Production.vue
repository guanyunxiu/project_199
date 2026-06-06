<template>
  <div class="production-page">
    <div class="page-header">
      <h2 class="page-title">生产统计</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px"
        />
        <el-select v-model="timeDimension" style="width: 140px">
          <el-option label="按日统计" value="day" />
          <el-option label="按周统计" value="week" />
          <el-option label="按月统计" value="month" />
        </el-select>
        <el-button type="primary">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ productionData.totalOutput }}</div>
          <div class="stat-label">总产量</div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            <span>+12.5%</span>
          </div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ productionData.qualifiedRate }}%</div>
          <div class="stat-label">合格率</div>
          <div class="stat-trend up">
            <el-icon><Top /></el-icon>
            <span>+2.3%</span>
          </div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ productionData.efficiency }}%</div>
          <div class="stat-label">设备利用率</div>
          <div class="stat-trend down">
            <el-icon><Bottom /></el-icon>
            <span>-1.2%</span>
          </div>
        </div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ productionData.defectCount }}</div>
          <div class="stat-label">缺陷数</div>
          <div class="stat-trend down">
            <el-icon><Bottom /></el-icon>
            <span>-8.3%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-container">
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">产量趋势</h3>
          <div class="chart-legend">
            <span class="legend-item"><i class="dot primary"></i>计划产量</span>
            <span class="legend-item"><i class="dot success"></i>实际产量</span>
          </div>
        </div>
        <div class="chart-body">
          <div class="bar-chart">
            <div v-for="(item, index) in trendData" :key="index" class="bar-item">
              <div class="bar-labels">
                <span class="label">{{ item.date }}</span>
              </div>
              <div class="bar-group">
                <div class="bar planned" :style="{ height: (item.planned / maxTrendValue) * 200 + 'px' }">
                  <span class="bar-value">{{ item.planned }}</span>
                </div>
                <div class="bar actual" :style="{ height: (item.actual / maxTrendValue) * 200 + 'px' }">
                  <span class="bar-value">{{ item.actual }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">工位产量排行</h3>
        </div>
        <div class="chart-body">
          <div class="rank-list">
            <div v-for="(station, index) in stationRanking" :key="station.id" class="rank-item">
              <div class="rank-number" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ station.name }}</div>
                <div class="rank-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: station.percentage + '%' }"></div>
                  </div>
                </div>
              </div>
              <div class="rank-value">{{ station.output }} 台</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-table">
      <div class="chart-header">
        <h3 class="chart-title">生产明细</h3>
      </div>
      <el-table :data="productionDetails" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="shift" label="班次" width="100">
          <template #default="{ row }">
            <el-tag :type="row.shift === '早班' ? 'primary' : row.shift === '中班' ? 'warning' : 'info'">
              {{ row.shift }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planned" label="计划产量" width="100" />
        <el-table-column prop="actual" label="实际产量" width="100" />
        <el-table-column prop="completion" label="完成率" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.completion || 0"
              :color="(row.completion || 0) >= 100 ? '#52C41A' : (row.completion || 0) >= 80 ? '#FAAD14' : '#F5222D'"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="qualified" label="合格数" width="100" />
        <el-table-column prop="defect" label="缺陷数" width="100" />
        <el-table-column prop="operator" label="负责人" width="120" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download, Box, CircleCheck, Timer, Warning, Top, Bottom } from '@element-plus/icons-vue'

const dateRange = ref([])
const timeDimension = ref('day')

const productionData = ref({
  totalOutput: 12580,
  qualifiedRate: 98.5,
  efficiency: 87.2,
  defectCount: 189
})

const trendData = ref([
  { date: '6/1', planned: 800, actual: 785 },
  { date: '6/2', planned: 800, actual: 820 },
  { date: '6/3', planned: 800, actual: 790 },
  { date: '6/4', planned: 800, actual: 810 },
  { date: '6/5', planned: 800, actual: 830 },
  { date: '6/6', planned: 800, actual: 805 },
  { date: '6/7', planned: 800, actual: 795 }
])

const maxTrendValue = computed(() => {
  return Math.max(...trendData.value.map(d => Math.max(d.planned, d.actual)))
})

const stationRanking = ref([
  { id: 1, name: '底盘装配工位', output: 2450, percentage: 98 },
  { id: 2, name: '车身焊接工位', output: 2380, percentage: 95 },
  { id: 3, name: '涂装工位', output: 2320, percentage: 92 },
  { id: 4, name: '总装工位', output: 2280, percentage: 90 },
  { id: 5, name: '检测工位', output: 2150, percentage: 85 }
])

const productionDetails = ref([
  { date: '2026-06-06', shift: '早班', planned: 400, actual: 410, completion: 102.5, qualified: 405, defect: 5, operator: '张工' },
  { date: '2026-06-06', shift: '中班', planned: 400, actual: 395, completion: 98.8, qualified: 390, defect: 5, operator: '李工' },
  { date: '2026-06-06', shift: '夜班', planned: 400, actual: 420, completion: 105, qualified: 415, defect: 5, operator: '王工' },
  { date: '2026-06-05', shift: '早班', planned: 400, actual: 390, completion: 97.5, qualified: 385, defect: 5, operator: '张工' },
  { date: '2026-06-05', shift: '中班', planned: 400, actual: 405, completion: 101.3, qualified: 400, defect: 5, operator: '李工' }
])
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.production-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
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
    padding: 24px;
    background: rgba(15, 28, 51, 0.85);
    border: 1px solid rgba(24, 144, 255, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }

    &.primary::before { background: $primary-color; }
    &.success::before { background: #52C41A; }
    &.warning::before { background: #FAAD14; }
    &.danger::before { background: #F5222D; }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      flex-shrink: 0;
    }

    &.primary .stat-icon {
      background: rgba(24, 144, 255, 0.15);
      color: $primary-color;
    }

    &.success .stat-icon {
      background: rgba(82, 196, 26, 0.15);
      color: #52C41A;
    }

    &.warning .stat-icon {
      background: rgba(250, 173, 20, 0.15);
      color: #FAAD14;
    }

    &.danger .stat-icon {
      background: rgba(245, 34, 45, 0.15);
      color: #F5222D;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: $text-color-primary;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 13px;
        color: $text-color-secondary;
        margin-top: 4px;
      }

      .stat-trend {
        font-size: 12px;
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 4px;

        &.up { color: #52C41A; }
        &.down { color: #F5222D; }
      }
    }
  }
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  background: rgba(15, 28, 51, 0.85);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  padding: 20px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
    }

    .chart-legend {
      display: flex;
      gap: 20px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: $text-color-secondary;

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 2px;

          &.primary { background: rgba(24, 144, 255, 0.6); }
          &.success { background: #52C41A; }
        }
      }
    }
  }

  .chart-body {
    min-height: 280px;
  }
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 240px;
  padding: 0 10px;

  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .bar-labels {
      margin-bottom: 10px;

      .label {
        font-size: 12px;
        color: $text-color-secondary;
      }
    }

    .bar-group {
      display: flex;
      gap: 6px;
      align-items: flex-end;
      height: 200px;

      .bar {
        width: 24px;
        border-radius: 4px 4px 0 0;
        position: relative;
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.8;
        }

        .bar-value {
          position: absolute;
          top: -24px;
          font-size: 11px;
          color: $text-color-secondary;
          white-space: nowrap;
        }

        &.planned {
          background: rgba(24, 144, 255, 0.6);
        }

        &.actual {
          background: linear-gradient(180deg, #52C41A 0%, #389E0D 100%);
          box-shadow: 0 0 10px rgba(82, 196, 26, 0.3);
        }
      }
    }
  }
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .rank-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .rank-number {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      background: rgba(24, 144, 255, 0.1);
      color: $primary-color;
      flex-shrink: 0;

      &.rank-1 {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: #fff;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
        color: #fff;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
        color: #fff;
      }
    }

    .rank-info {
      flex: 1;
      min-width: 0;

      .rank-name {
        font-size: 14px;
        color: $text-color-primary;
        margin-bottom: 6px;
      }

      .rank-progress {
        .progress-bar {
          height: 6px;
          background: rgba(24, 144, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, $primary-color, $primary-color-light);
            border-radius: 3px;
            transition: width 0.3s ease;
          }
        }
      }
    }

    .rank-value {
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
      flex-shrink: 0;
    }
  }
}

.detail-table {
  background: rgba(15, 28, 51, 0.85);
  border: 1px solid rgba(24, 144, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  padding: 20px;

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

    th.el-table__cell {
      background: rgba(24, 144, 255, 0.1);
      font-weight: 600;
    }

    tr:hover > td {
      background: rgba(24, 144, 255, 0.05) !important;
    }
  }
}

@media (max-width: 1440px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-container {
    grid-template-columns: 1fr;
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
