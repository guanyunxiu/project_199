<template>
  <div class="settings-page">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="基础设置" name="basic">
        <div class="settings-card">
          <h3 class="card-title">系统信息</h3>
          <el-form :model="basicForm" label-width="120px" class="settings-form">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" style="width: 360px" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicForm.version" disabled style="width: 200px" />
            </el-form-item>
            <el-form-item label="运行环境">
              <el-input v-model="basicForm.environment" disabled style="width: 200px" />
            </el-form-item>
            <el-form-item label="服务地址">
              <el-input v-model="basicForm.serverUrl" placeholder="http://" style="width: 360px" />
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="basicForm.language" style="width: 200px">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="basicForm.timezone" style="width: 360px">
                <el-option label="Asia/Shanghai (UTC+8)" value="Asia/Shanghai" />
                <el-option label="America/New_York (UTC-5)" value="America/New_York" />
                <el-option label="Europe/London (UTC+0)" value="Europe/London" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasic">保存设置</el-button>
              <el-button @click="resetBasic">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="3D场景设置" name="scene">
        <div class="settings-card">
          <h3 class="card-title">显示设置</h3>
          <el-form :model="sceneForm" label-width="140px" class="settings-form">
            <el-form-item label="抗锯齿">
              <el-switch v-model="sceneForm.antialias" />
            </el-form-item>
            <el-form-item label="阴影效果">
              <el-switch v-model="sceneForm.shadows" />
            </el-form-item>
            <el-form-item label="环境光强度">
              <el-slider
                v-model="sceneForm.ambientIntensity"
                :min="0"
                :max="1"
                :step="0.1"
                :show-tooltip="true"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="渲染质量">
              <el-select v-model="sceneForm.quality" style="width: 200px">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="极高" value="ultra" />
              </el-select>
            </el-form-item>
            <el-form-item label="背景颜色">
              <el-color-picker v-model="sceneForm.backgroundColor" />
            </el-form-item>
            <el-form-item label="显示网格">
              <el-switch v-model="sceneForm.showGrid" />
            </el-form-item>
            <el-form-item label="自动旋转">
              <el-switch v-model="sceneForm.autoRotate" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveScene">保存设置</el-button>
              <el-button @click="resetScene">恢复默认</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="通知设置" name="notification">
        <div class="settings-card">
          <h3 class="card-title">告警通知</h3>
          <el-form :model="notifyForm" label-width="140px" class="settings-form">
            <el-form-item label="设备异常告警">
              <el-switch v-model="notifyForm.deviceError" />
            </el-form-item>
            <el-form-item label="产量异常告警">
              <el-switch v-model="notifyForm.productionError" />
            </el-form-item>
            <el-form-item label="设备预警阈值">
              <el-slider
                v-model="notifyForm.warningThreshold"
                :min="50"
                :max="100"
                :show-tooltip="true"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item label="通知方式">
              <el-checkbox-group v-model="notifyForm.methods">
                <el-checkbox value="system">系统通知</el-checkbox>
                <el-checkbox value="email">邮件通知</el-checkbox>
                <el-checkbox value="sms">短信通知</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="通知声音">
              <el-switch v-model="notifyForm.sound" />
            </el-form-item>
            <el-form-item label="声音音量">
              <el-slider
                v-model="notifyForm.volume"
                :min="0"
                :max="100"
                :show-tooltip="true"
                style="width: 300px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotify">保存设置</el-button>
              <el-button @click="resetNotify">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="数据管理" name="data">
        <div class="settings-card">
          <h3 class="card-title">数据备份</h3>
          <div class="data-actions">
            <el-button type="primary" size="large">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
            <el-button type="success" size="large">
              <el-icon><Upload /></el-icon>
              导入数据
            </el-button>
            <el-button type="warning" size="large">
              <el-icon><RefreshRight /></el-icon>
              清空缓存
            </el-button>
            <el-button type="danger" size="large">
              <el-icon><Delete /></el-icon>
              重置数据
            </el-button>
          </div>

          <h3 class="card-title" style="margin-top: 30px">存储信息</h3>
          <div class="storage-info">
            <div class="storage-item">
              <div class="storage-label">本地缓存</div>
              <el-progress :percentage="45" :stroke-width="8" />
              <div class="storage-size">45.2 MB / 100 MB</div>
            </div>
            <div class="storage-item">
              <div class="storage-label">历史数据</div>
              <el-progress :percentage="72" :stroke-width="8" color="#FAAD14" />
              <div class="storage-size">723.5 MB / 1 GB</div>
            </div>
            <div class="storage-item">
              <div class="storage-label">日志文件</div>
              <el-progress :percentage="28" :stroke-width="8" color="#52C41A" />
              <div class="storage-size">28.6 MB / 100 MB</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关于" name="about">
        <div class="settings-card about-card">
          <div class="about-logo">
            <el-icon :size="80" color="#1890FF"><Monitor /></el-icon>
          </div>
          <h2 class="about-title">整车车间流水线3D仿真组态系统</h2>
          <p class="about-subtitle">Intelligent Workshop 3D Simulation System</p>
          <div class="about-info">
            <div class="info-row">
              <span class="info-label">版本号</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-row">
              <span class="info-label">构建时间</span>
              <span class="info-value">2026-06-01</span>
            </div>
            <div class="info-row">
              <span class="info-label">技术栈</span>
              <span class="info-value">Vue3 + Vite + Three.js + Element Plus</span>
            </div>
            <div class="info-row">
              <span class="info-label">版权所有</span>
              <span class="info-value">© 2024 智能工厂技术中心</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Upload, RefreshRight, Delete, Monitor } from '@element-plus/icons-vue'

const activeTab = ref('basic')

const basicForm = reactive({
  systemName: '整车车间流水线3D仿真组态系统',
  version: 'v1.0.0',
  environment: '生产环境',
  serverUrl: 'http://localhost:5999',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
})

const sceneForm = reactive({
  antialias: true,
  shadows: true,
  ambientIntensity: 0.4,
  quality: 'high',
  backgroundColor: '#1a1a2e',
  showGrid: false,
  autoRotate: false
})

const notifyForm = reactive({
  deviceError: true,
  productionError: true,
  warningThreshold: 80,
  methods: ['system', 'email'],
  sound: true,
  volume: 70
})

const saveBasic = () => {
  ElMessage.success('基础设置已保存')
}

const resetBasic = () => {
  basicForm.systemName = '整车车间流水线3D仿真组态系统'
  basicForm.serverUrl = 'http://localhost:5999'
  basicForm.language = 'zh-CN'
  basicForm.timezone = 'Asia/Shanghai'
  ElMessage.info('已重置为默认值')
}

const saveScene = () => {
  ElMessage.success('3D场景设置已保存')
}

const resetScene = () => {
  sceneForm.antialias = true
  sceneForm.shadows = true
  sceneForm.ambientIntensity = 0.4
  sceneForm.quality = 'high'
  sceneForm.backgroundColor = '#1a1a2e'
  sceneForm.showGrid = false
  sceneForm.autoRotate = false
  ElMessage.info('已恢复默认设置')
}

const saveNotify = () => {
  ElMessage.success('通知设置已保存')
}

const resetNotify = () => {
  notifyForm.deviceError = true
  notifyForm.productionError = true
  notifyForm.warningThreshold = 80
  notifyForm.methods = ['system', 'email']
  notifyForm.sound = true
  notifyForm.volume = 70
  ElMessage.info('已重置为默认值')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.settings-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: auto;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(15, 28, 51, 0.95) 100%);

  .page-header {
    margin-bottom: 20px;

    .page-title {
      font-size: 22px;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
    }
  }

  :deep(.el-tabs) {
    --el-tabs-header-bg-color: transparent;
    --el-tabs-item-color: $text-color-secondary;
    --el-tabs-active-color: $primary-color;
    --el-tabs-border-color: rgba(24, 144, 255, 0.2);
  }

  :deep(.el-tabs__item) {
    height: 48px;
    line-height: 48px;
    font-size: 15px;
  }

  :deep(.el-tabs__active-bar) {
    background-color: $primary-color;
  }

  .settings-card {
    background: rgba(15, 28, 51, 0.85);
    border: 1px solid rgba(24, 144, 255, 0.2);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    padding: 24px;
    max-width: 800px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0 0 24px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(24, 144, 255, 0.1);
    }

    .settings-form {
      :deep(.el-form-item__label) {
        color: $text-color-secondary;
        font-size: 14px;
      }

      :deep(.el-input),
      :deep(.el-select),
      :deep(.el-textarea) {
        --el-input-bg-color: rgba(10, 22, 40, 0.8);
        --el-input-border-color: rgba(24, 144, 255, 0.2);
        --el-input-text-color: $text-color-primary;
        --el-input-placeholder-color: $text-color-tertiary;
      }
    }

    .data-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .storage-info {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .storage-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .storage-label {
          width: 100px;
          color: $text-color-secondary;
          font-size: 14px;
        }

        .storage-size {
          width: 160px;
          text-align: right;
          color: $text-color-primary;
          font-size: 13px;
          font-family: 'Monaco', 'Consolas', monospace;
        }

        :deep(.el-progress) {
          flex: 1;
        }
      }
    }
  }

  .about-card {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;

    .about-logo {
      margin-bottom: 20px;
    }

    .about-title {
      font-size: 24px;
      font-weight: 700;
      color: $text-color-primary;
      margin: 0 0 8px 0;
    }

    .about-subtitle {
      font-size: 14px;
      color: $text-color-secondary;
      margin: 0 0 32px 0;
      letter-spacing: 2px;
    }

    .about-info {
      background: rgba(10, 22, 40, 0.6);
      border-radius: 8px;
      padding: 24px;
      text-align: left;

      .info-row {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px solid rgba(24, 144, 255, 0.1);

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          width: 120px;
          color: $text-color-secondary;
          font-size: 14px;
        }

        .info-value {
          flex: 1;
          color: $text-color-primary;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
