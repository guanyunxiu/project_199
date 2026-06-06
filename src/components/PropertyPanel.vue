<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        属性配置
      </h3>
    </div>
    
    <div class="panel-content">
      <div v-if="configEditorStore.selectedNode" class="property-section">
        <div class="section-header">
          <el-icon :color="getNodeColor(configEditorStore.selectedNode.type)">
            <component :is="getNodeIcon(configEditorStore.selectedNode.type)" />
          </el-icon>
          <span class="section-title">{{ getNodeTypeName(configEditorStore.selectedNode.type) }}</span>
          <el-tag size="small" :type="configEditorStore.selectedNode.params.enabled ? 'success' : 'info'">
            {{ configEditorStore.selectedNode.params.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </div>
        
        <el-form label-position="top" class="property-form">
          <el-form-item label="节点名称">
            <el-input 
              v-model="configEditorStore.selectedNode.params.name" 
              @change="updateNodeParam('name', $event)"
            />
          </el-form-item>
          
          <el-form-item label="节点ID">
            <el-input :value="configEditorStore.selectedNode.id" disabled />
          </el-form-item>
          
          <el-divider />
          
          <div class="form-row">
            <el-form-item label="X坐标" class="form-item-half">
              <el-input-number 
                v-model="configEditorStore.selectedNode.x" 
                :step="5"
                @change="updateNodePosition"
              />
            </el-form-item>
            <el-form-item label="Y坐标" class="form-item-half">
              <el-input-number 
                v-model="configEditorStore.selectedNode.y" 
                :step="5"
                @change="updateNodePosition"
              />
            </el-form-item>
          </div>
          
          <div class="form-row">
            <el-form-item label="宽度" class="form-item-half">
              <el-input-number 
                v-model="configEditorStore.selectedNode.width" 
                :min="20" 
                :max="300" 
                :step="10"
                @change="updateNodeSize"
              />
            </el-form-item>
            <el-form-item label="高度" class="form-item-half">
              <el-input-number 
                v-model="configEditorStore.selectedNode.height" 
                :min="20" 
                :max="300" 
                :step="10"
                @change="updateNodeSize"
              />
            </el-form-item>
          </div>
          
          <el-form-item label="旋转角度">
            <el-slider 
              v-model="configEditorStore.selectedNode.rotation" 
              :min="0" 
              :max="360" 
              :step="15"
              @change="updateNodeRotation"
              show-input
            />
          </el-form-item>
          
          <el-divider />
          
          <template v-if="configEditorStore.selectedNode.type === 'station'">
            <el-form-item label="工位类型">
              <el-select v-model="configEditorStore.selectedNode.params.stationType" @change="updateNodeParam('stationType', $event)">
                <el-option label="吊装工位" value="hoisting" />
                <el-option label="内饰工位" value="interior" />
                <el-option label="底盘工位" value="chassis" />
                <el-option label="轮胎工位" value="tire" />
                <el-option label="发动机工位" value="engine" />
                <el-option label="电气工位" value="electrical" />
                <el-option label="玻璃工位" value="glass" />
                <el-option label="座椅工位" value="seat" />
                <el-option label="检测工位" value="detection" />
                <el-option label="下线工位" value="offline" />
              </el-select>
            </el-form-item>
            <el-form-item label="加工节拍 (秒)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.processTime" 
                :min="1" 
                :max="120" 
                :step="1"
                @change="updateNodeParam('processTime', $event)"
              />
            </el-form-item>
            <el-form-item label="工位容量">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.capacity" 
                :min="1" 
                :max="10" 
                :step="1"
                @change="updateNodeParam('capacity', $event)"
              />
            </el-form-item>
            <el-form-item label="优先级">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.priority" 
                :min="1" 
                :max="10" 
                :step="1"
                @change="updateNodeParam('priority', $event)"
              />
            </el-form-item>
            <el-form-item label="前置依赖">
              <el-select 
                v-model="configEditorStore.selectedNode.params.dependencies" 
                multiple 
                placeholder="选择前置工位"
                @change="updateNodeParam('dependencies', $event)"
              >
                <el-option 
                  v-for="node in otherStations" 
                  :key="node.id" 
                  :label="node.params.name" 
                  :value="node.id" 
                />
              </el-select>
            </el-form-item>
          </template>
          
          <template v-else-if="configEditorStore.selectedNode.type === 'robot-arm'">
            <el-form-item label="运行速度 (%)">
              <el-slider 
                v-model="configEditorStore.selectedNode.params.speed" 
                :min="10" 
                :max="200" 
                :step="10"
                @change="updateNodeParam('speed', $event)"
                show-input
              />
            </el-form-item>
            <el-form-item label="循环周期 (秒)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.cycleTime" 
                :min="0.5" 
                :max="60" 
                :step="0.5"
                @change="updateNodeParam('cycleTime', $event)"
              />
            </el-form-item>
            <el-form-item label="重复精度 (mm)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.repeatability" 
                :min="0.01" 
                :max="1" 
                :step="0.01"
                :precision="2"
                @change="updateNodeParam('repeatability', $event)"
              />
            </el-form-item>
            <el-form-item label="负载能力 (kg)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.payload" 
                :min="1" 
                :max="1000" 
                :step="10"
                @change="updateNodeParam('payload', $event)"
              />
            </el-form-item>
          </template>
          
          <template v-else-if="configEditorStore.selectedNode.type === 'conveyor'">
            <el-form-item label="输送速度 (m/s)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.speed" 
                :min="0.1" 
                :max="10" 
                :step="0.1"
                :precision="1"
                @change="updateNodeParam('speed', $event)"
              />
            </el-form-item>
            <el-form-item label="输送长度 (m)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.length" 
                :min="1" 
                :max="100" 
                :step="1"
                @change="updateNodeParam('length', $event)"
              />
            </el-form-item>
            <el-form-item label="输送方向">
              <el-select v-model="configEditorStore.selectedNode.params.direction" @change="updateNodeParam('direction', $event)">
                <el-option label="正向" value="forward" />
                <el-option label="反向" value="reverse" />
                <el-option label="双向" value="bidirectional" />
              </el-select>
            </el-form-item>
          </template>
          
          <template v-else-if="configEditorStore.selectedNode.type === 'sensor'">
            <el-form-item label="传感器类型">
              <el-select v-model="configEditorStore.selectedNode.params.type" @change="updateNodeParam('type', $event)">
                <el-option label="光电传感器" value="photoelectric" />
                <el-option label="接近传感器" value="proximity" />
                <el-option label="压力传感器" value="pressure" />
                <el-option label="温度传感器" value="temperature" />
                <el-option label="视觉传感器" value="vision" />
              </el-select>
            </el-form-item>
            <el-form-item label="采样频率 (Hz)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.samplingRate" 
                :min="1" 
                :max="1000" 
                :step="10"
                @change="updateNodeParam('samplingRate', $event)"
              />
            </el-form-item>
            <el-form-item label="灵敏度 (%)">
              <el-slider 
                v-model="configEditorStore.selectedNode.params.sensitivity" 
                :min="0" 
                :max="100" 
                :step="5"
                @change="updateNodeParam('sensitivity', $event)"
                show-input
              />
            </el-form-item>
          </template>
          
          <template v-else-if="configEditorStore.selectedNode.type === 'lift'">
            <el-form-item label="最大高度 (m)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.maxHeight" 
                :min="1" 
                :max="50" 
                :step="0.5"
                :precision="1"
                @change="updateNodeParam('maxHeight', $event)"
              />
            </el-form-item>
            <el-form-item label="升降速度 (m/s)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.speed" 
                :min="0.1" 
                :max="5" 
                :step="0.1"
                :precision="1"
                @change="updateNodeParam('speed', $event)"
              />
            </el-form-item>
            <el-form-item label="载重能力 (kg)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.loadCapacity" 
                :min="100" 
                :max="10000" 
                :step="100"
                @change="updateNodeParam('loadCapacity', $event)"
              />
            </el-form-item>
          </template>
          
          <template v-else-if="configEditorStore.selectedNode.type === 'agv'">
            <el-form-item label="最大速度 (m/s)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.maxSpeed" 
                :min="0.5" 
                :max="10" 
                :step="0.5"
                :precision="1"
                @change="updateNodeParam('maxSpeed', $event)"
              />
            </el-form-item>
            <el-form-item label="续航时间 (h)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.batteryLife" 
                :min="1" 
                :max="24" 
                :step="0.5"
                :precision="1"
                @change="updateNodeParam('batteryLife', $event)"
              />
            </el-form-item>
            <el-form-item label="载重能力 (kg)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.loadCapacity" 
                :min="50" 
                :max="5000" 
                :step="50"
                @change="updateNodeParam('loadCapacity', $event)"
              />
            </el-form-item>
          </template>
          
          <template v-else-if="configEditorStore.selectedNode.type === 'pipeline-node'">
            <el-form-item label="节点类型">
              <el-select v-model="configEditorStore.selectedNode.params.nodeType" @change="updateNodeParam('nodeType', $event)">
                <el-option label="交汇点" value="junction" />
                <el-option label="分流点" value="diverter" />
                <el-option label="合流点" value="confluence" />
                <el-option label="缓冲站" value="buffer" />
                <el-option label="检查点" value="checkpoint" />
              </el-select>
            </el-form-item>
            <el-form-item label="延迟时间 (秒)">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.delayTime" 
                :min="0" 
                :max="60" 
                :step="1"
                @change="updateNodeParam('delayTime', $event)"
              />
            </el-form-item>
            <el-form-item label="缓冲区大小">
              <el-input-number 
                v-model="configEditorStore.selectedNode.params.bufferSize" 
                :min="0" 
                :max="20" 
                :step="1"
                @change="updateNodeParam('bufferSize', $event)"
              />
            </el-form-item>
          </template>
          
          <el-divider />
          
          <el-form-item label="启用节点">
            <el-switch 
              v-model="configEditorStore.selectedNode.params.enabled" 
              active-text="启用"
              inactive-text="禁用"
              @change="updateNodeParam('enabled', $event)"
            />
          </el-form-item>
          
          <el-form-item label="3D位置">
            <div class="position-info">
              <span>X: {{ configEditorStore.selectedNode.position3D.x.toFixed(2) }}</span>
              <span>Y: {{ configEditorStore.selectedNode.position3D.y.toFixed(2) }}</span>
              <span>Z: {{ configEditorStore.selectedNode.position3D.z.toFixed(2) }}</span>
            </div>
          </el-form-item>
        </el-form>
        
        <div class="section-actions">
          <el-button type="danger" @click="deleteSelectedNode" :icon="Delete">
            删除节点
          </el-button>
        </div>
      </div>
      
      <div v-else-if="configEditorStore.selectedPath" class="property-section">
        <div class="section-header">
          <el-icon color="#1890FF"><Connection /></el-icon>
          <span class="section-title">路径配置</span>
          <el-tag size="small" :type="configEditorStore.selectedPath.enabled ? 'success' : 'info'">
            {{ configEditorStore.selectedPath.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </div>
        
        <el-form label-position="top" class="property-form">
          <el-form-item label="路径名称">
            <el-input 
              v-model="configEditorStore.selectedPath.name" 
              @change="updatePathProp('name', $event)"
            />
          </el-form-item>
          
          <el-form-item label="路径ID">
            <el-input :value="configEditorStore.selectedPath.id" disabled />
          </el-form-item>
          
          <el-divider />
          
          <el-form-item label="路径颜色">
            <el-color-picker 
              v-model="configEditorStore.selectedPath.color" 
              @change="updatePathProp('color', $event)"
            />
          </el-form-item>
          
          <el-form-item label="路径宽度">
            <el-slider 
              v-model="configEditorStore.selectedPath.width" 
              :min="2" 
              :max="20" 
              :step="1"
              @change="updatePathProp('width', $event)"
              show-input
            />
          </el-form-item>
          
          <el-form-item label="运行速度">
            <el-slider 
              v-model="configEditorStore.selectedPath.speed" 
              :min="0.1" 
              :max="5" 
              :step="0.1"
              @change="updatePathProp('speed', $event)"
              show-input
            />
          </el-form-item>
          
          <el-form-item label="路径点数">
            <el-input :value="configEditorStore.selectedPath.points.length" disabled />
          </el-form-item>
          
          <el-divider />
          
          <el-form-item label="路径点列表">
            <div class="path-points-list">
              <div 
                v-for="(point, index) in configEditorStore.selectedPath.points" 
                :key="index"
                class="path-point-item"
              >
                <span class="point-index">{{ index + 1 }}</span>
                <el-input-number 
                  v-model="point.x" 
                  size="small" 
                  :step="5"
                  @change="updatePathPoint(index)"
                />
                <el-input-number 
                  v-model="point.y" 
                  size="small" 
                  :step="5"
                  @change="updatePathPoint(index)"
                />
                <el-button 
                  size="small" 
                  type="danger" 
                  :icon="Delete" 
                  circle
                  :disabled="configEditorStore.selectedPath.points.length <= 2"
                  @click="deletePathPoint(index)"
                />
              </div>
            </div>
          </el-form-item>
          
          <el-divider />
          
          <el-form-item label="启用路径">
            <el-switch 
              v-model="configEditorStore.selectedPath.enabled" 
              active-text="启用"
              inactive-text="禁用"
              @change="updatePathProp('enabled', $event)"
            />
          </el-form-item>
        </el-form>
        
        <div class="section-actions">
          <el-button type="danger" @click="deleteSelectedPath" :icon="Delete">
            删除路径
          </el-button>
        </div>
      </div>
      
      <div v-else class="empty-section">
        <el-empty description="选择节点或路径查看属性">
          <template #image>
            <el-icon :size="64" color="rgba(24, 144, 255, 0.3)"><Setting /></el-icon>
          </template>
        </el-empty>
        
        <div class="stats-section">
          <h4 class="stats-title">组态统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ configEditorStore.nodes.length }}</span>
              <span class="stat-label">节点总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ configEditorStore.paths.length }}</span>
              <span class="stat-label">路径总数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ configEditorStore.connections.length }}</span>
              <span class="stat-label">连接数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ enabledNodeCount }}</span>
              <span class="stat-label">已启用</span>
            </div>
          </div>
          
          <div class="node-type-stats">
            <h5 class="stats-subtitle">节点类型分布</h5>
            <div 
              v-for="(count, type) in nodeTypeCounts" 
              :key="type"
              class="type-stat-item"
            >
              <span class="type-dot" :style="{ background: getNodeColor(type) }" />
              <span class="type-name">{{ getNodeTypeName(type) }}</span>
              <span class="type-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Setting, Connection, Grid, Cpu, Promotion, Aim, Top, Van, Delete
} from '@element-plus/icons-vue'
import { useConfigEditorStore, NODE_TYPE_CONFIG } from '@/store/configEditor'

const configEditorStore = useConfigEditorStore()

const iconMap = {
  'station': Grid,
  'robot-arm': Cpu,
  'conveyor': Promotion,
  'sensor': Aim,
  'lift': Top,
  'agv': Van,
  'pipeline-node': Connection
}

const otherStations = computed(() => {
  if (!configEditorStore.selectedNode) return []
  return configEditorStore.nodes.filter(n => 
    n.type === 'station' && n.id !== configEditorStore.selectedNode.id
  )
})

const enabledNodeCount = computed(() => {
  return configEditorStore.nodes.filter(n => n.params.enabled).length
})

const nodeTypeCounts = computed(() => {
  const counts = {}
  configEditorStore.nodes.forEach(n => {
    counts[n.type] = (counts[n.type] || 0) + 1
  })
  return counts
})

const getNodeIcon = (type) => {
  return iconMap[type] || Grid
}

const getNodeName = (type) => {
  return NODE_TYPE_CONFIG[type]?.name || type
}

const getNodeTypeName = (type) => {
  return NODE_TYPE_CONFIG[type]?.name || type
}

const getNodeColor = (type) => {
  return NODE_TYPE_CONFIG[type]?.color || '#1890FF'
}

const updateNodeParam = (key, value) => {
  if (configEditorStore.selectedNodeId) {
    configEditorStore.updateNodeParams(configEditorStore.selectedNodeId, { [key]: value })
  }
}

const updateNodePosition = () => {
  if (configEditorStore.selectedNodeId) {
    configEditorStore.updateNode(configEditorStore.selectedNodeId, {
      x: configEditorStore.selectedNode.x,
      y: configEditorStore.selectedNode.y
    })
  }
}

const updateNodeSize = () => {
  if (configEditorStore.selectedNodeId) {
    configEditorStore.updateNode(configEditorStore.selectedNodeId, {
      width: configEditorStore.selectedNode.width,
      height: configEditorStore.selectedNode.height
    })
  }
}

const updateNodeRotation = () => {
  if (configEditorStore.selectedNodeId) {
    configEditorStore.updateNode(configEditorStore.selectedNodeId, {
      rotation: configEditorStore.selectedNode.rotation
    })
  }
}

const updatePathProp = (key, value) => {
  if (configEditorStore.selectedPathId) {
    configEditorStore.updatePath(configEditorStore.selectedPathId, { [key]: value })
  }
}

const updatePathPoint = (index) => {
  if (configEditorStore.selectedPathId && configEditorStore.selectedPath?.points[index]) {
    const point = configEditorStore.selectedPath.points[index]
    configEditorStore.updatePathPoint(configEditorStore.selectedPathId, index, point.x, point.y)
  }
}

const deletePathPoint = (index) => {
  ElMessageBox.confirm('确定要删除这个路径点吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    if (configEditorStore.selectedPathId) {
      configEditorStore.deletePathPoint(configEditorStore.selectedPathId, index)
      ElMessage.success('路径点已删除')
    }
  }).catch(() => {})
}

const deleteSelectedNode = () => {
  ElMessageBox.confirm('确定要删除这个节点吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    if (configEditorStore.selectedNodeId) {
      configEditorStore.deleteNode(configEditorStore.selectedNodeId)
      ElMessage.success('节点已删除')
    }
  }).catch(() => {})
}

const deleteSelectedPath = () => {
  ElMessageBox.confirm('确定要删除这条路径吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    if (configEditorStore.selectedPathId) {
      configEditorStore.deletePath(configEditorStore.selectedPathId)
      ElMessage.success('路径已删除')
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.property-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  background: rgba(15, 28, 51, 0.9);
  border-left: 1px solid rgba(24, 144, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid rgba(24, 144, 255, 0.1);
    
    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: $text-color-primary;
      margin: 0;
      
      .el-icon {
        color: $primary-color;
      }
    }
  }
  
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    
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
    
    .property-section {
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(24, 144, 255, 0.1);
        
        .el-icon {
          font-size: 20px;
        }
        
        .section-title {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: $text-color-primary;
        }
      }
      
      .property-form {
        .form-row {
          display: flex;
          gap: 12px;
          
          .form-item-half {
            flex: 1;
          }
        }
        
        .position-info {
          display: flex;
          gap: 12px;
          font-family: monospace;
          font-size: 12px;
          color: $text-color-secondary;
          padding: 8px 12px;
          background: rgba(10, 22, 40, 0.6);
          border-radius: 6px;
        }
        
        .path-points-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
          
          .path-point-item {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .point-index {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(24, 144, 255, 0.2);
              color: $primary-color;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 600;
              flex-shrink: 0;
            }
            
            .el-input-number {
              flex: 1;
            }
          }
        }
      }
      
      .section-actions {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid rgba(24, 144, 255, 0.1);
      }
    }
    
    .empty-section {
      .el-empty {
        padding: 40px 0;
        
        .el-icon {
          font-size: 64px;
        }
      }
      
      .stats-section {
        margin-top: 20px;
        
        .stats-title {
          font-size: 14px;
          font-weight: 600;
          color: $text-color-primary;
          margin-bottom: 12px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
          
          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;
            background: rgba(10, 22, 40, 0.6);
            border: 1px solid rgba(24, 144, 255, 0.15);
            border-radius: 8px;
            
            .stat-value {
              font-size: 24px;
              font-weight: 700;
              color: $primary-color;
            }
            
            .stat-label {
              font-size: 12px;
              color: $text-color-secondary;
              margin-top: 4px;
            }
          }
        }
        
        .node-type-stats {
          .stats-subtitle {
            font-size: 13px;
            font-weight: 600;
            color: $text-color-secondary;
            margin-bottom: 12px;
          }
          
          .type-stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(10, 22, 40, 0.4);
            border-radius: 6px;
            margin-bottom: 6px;
            
            .type-dot {
              width: 10px;
              height: 10px;
              border-radius: 50%;
            }
            
            .type-name {
              flex: 1;
              font-size: 12px;
              color: $text-color-secondary;
            }
            
            .type-count {
              font-size: 14px;
              font-weight: 600;
              color: $text-color-primary;
            }
          }
        }
      }
    }
  }
}
</style>
