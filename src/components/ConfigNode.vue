<template>
  <div 
    class="config-node"
    :class="{ 
      'selected': selected,
      'disabled': !node.params.enabled,
      [node.type]: true 
    }"
    :style="nodeStyle"
    @mousedown.stop="handleMouseDown"
    @click.stop="handleClick"
    @dblclick.stop="handleDoubleClick"
  >
    <div 
      class="node-header"
      :style="{ background: nodeConfig.color }"
    >
      <el-icon class="node-icon">
        <component :is="nodeIcon" />
      </el-icon>
      <span class="node-title">{{ node.params.name }}</span>
      <div class="node-actions">
        <el-button 
          class="action-btn connect-btn" 
          size="small" 
          circle
          @click.stop="handleStartConnection"
          title="创建连接"
        >
          <el-icon><Link /></el-icon>
        </el-button>
        <el-button 
          class="action-btn delete-btn" 
          size="small" 
          circle
          @click.stop="handleDelete"
          title="删除节点"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="node-body">
      <div class="node-type">{{ nodeConfig.name }}</div>
      <div class="node-params">
        <template v-if="node.type === 'station'">
          <div class="param-item">
            <span class="param-label">节拍:</span>
            <span class="param-value">{{ node.params.processTime }}s</span>
          </div>
          <div class="param-item">
            <span class="param-label">容量:</span>
            <span class="param-value">{{ node.params.capacity }}</span>
          </div>
        </template>
        
        <template v-else-if="node.type === 'robot-arm'">
          <div class="param-item">
            <span class="param-label">速度:</span>
            <span class="param-value">{{ node.params.speed }}%</span>
          </div>
          <div class="param-item">
            <span class="param-label">周期:</span>
            <span class="param-value">{{ node.params.cycleTime }}s</span>
          </div>
        </template>
        
        <template v-else-if="node.type === 'conveyor'">
          <div class="param-item">
            <span class="param-label">速度:</span>
            <span class="param-value">{{ node.params.speed }}m/s</span>
          </div>
          <div class="param-item">
            <span class="param-label">长度:</span>
            <span class="param-value">{{ node.params.length }}m</span>
          </div>
        </template>
        
        <template v-else-if="node.type === 'sensor'">
          <div class="param-item">
            <span class="param-label">采样:</span>
            <span class="param-value">{{ node.params.samplingRate }}Hz</span>
          </div>
          <div class="param-item">
            <span class="param-label">灵敏度:</span>
            <span class="param-value">{{ node.params.sensitivity }}%</span>
          </div>
        </template>
        
        <template v-else-if="node.type === 'lift'">
          <div class="param-item">
            <span class="param-label">高度:</span>
            <span class="param-value">{{ node.params.maxHeight }}m</span>
          </div>
          <div class="param-item">
            <span class="param-label">速度:</span>
            <span class="param-value">{{ node.params.speed }}m/s</span>
          </div>
        </template>
        
        <template v-else-if="node.type === 'agv'">
          <div class="param-item">
            <span class="param-label">速度:</span>
            <span class="param-value">{{ node.params.maxSpeed }}m/s</span>
          </div>
          <div class="param-item">
            <span class="param-label">载重:</span>
            <span class="param-value">{{ node.params.loadCapacity }}kg</span>
          </div>
        </template>
        
        <template v-else-if="node.type === 'pipeline-node'">
          <div class="param-item">
            <span class="param-label">类型:</span>
            <span class="param-value">{{ node.params.nodeType }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">延迟:</span>
            <span class="param-value">{{ node.params.delayTime }}s</span>
          </div>
        </template>
      </div>
      
      <div class="node-position">
        <span>3D: ({{ node.position3D.x.toFixed(1) }}, {{ node.position3D.z.toFixed(1) }})</span>
      </div>
    </div>
    
    <div class="connection-point input" title="输入连接点">
      <div class="point-dot" />
    </div>
    <div class="connection-point output" title="输出连接点">
      <div class="point-dot" />
    </div>
    
    <div 
      v-if="!node.params.enabled" 
      class="disabled-overlay"
    >
      <el-icon><Warning /></el-icon>
      <span>已禁用</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NODE_TYPE_CONFIG } from '@/store/configEditor'
import { 
  Grid, Cpu, Promotion, Aim, Top, Van, Connection, 
  Link, Close, Warning 
} from '@element-plus/icons-vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'dragstart', 'drag', 'dragend', 'start-connection', 'delete'])

const iconMap = {
  'station': Grid,
  'robot-arm': Cpu,
  'conveyor': Promotion,
  'sensor': Aim,
  'lift': Top,
  'agv': Van,
  'pipeline-node': Connection
}

const nodeConfig = computed(() => {
  return NODE_TYPE_CONFIG[props.node.type] || {}
})

const nodeIcon = computed(() => {
  return iconMap[props.node.type] || Grid
})

const nodeStyle = computed(() => {
  return {
    left: props.node.x + 'px',
    top: props.node.y + 'px',
    width: props.node.width + 'px',
    height: props.node.height + 'px',
    transform: `rotate(${props.node.rotation || 0}deg)`,
    borderColor: nodeConfig.value.color
  }
})

const handleClick = () => {
  emit('select', props.node.id)
}

const handleDoubleClick = () => {
  emit('select', props.node.id)
}

const handleMouseDown = (e) => {
  if (e.button !== 0) return
  
  emit('select', props.node.id)
  emit('dragstart', props.node.id, e)
  
  const startX = e.clientX
  const startY = e.clientY
  const startNodeX = props.node.x
  const startNodeY = props.node.y
  
  const handleMouseMove = (moveEvent) => {
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY
    emit('drag', props.node.id, { 
      x: startNodeX + deltaX, 
      y: startNodeY + deltaY 
    })
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    emit('dragend', props.node.id)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleStartConnection = () => {
  emit('start-connection', props.node.id)
}

const handleDelete = () => {
  emit('delete', props.node.id)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.config-node {
  position: absolute;
  background: rgba(15, 28, 51, 0.95);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &:hover {
    box-shadow: 0 4px 20px rgba(24, 144, 255, 0.3);
    z-index: 10;
  }
  
  &.selected {
    border-color: #52C41A !important;
    box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2), 0 4px 20px rgba(82, 196, 26, 0.3);
    z-index: 20;
  }
  
  &.disabled {
    opacity: 0.6;
    
    .disabled-overlay {
      display: flex;
    }
  }
  
  .node-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    color: #fff;
    
    .node-icon {
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .node-title {
      flex: 1;
      font-size: 12px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .node-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
      
      .action-btn {
        width: 18px;
        height: 18px;
        padding: 0;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
          
          &.connect-btn {
            background: rgba(82, 196, 26, 0.8);
          }
          
          &.delete-btn {
            background: rgba(245, 34, 45, 0.8);
          }
        }
        
        .el-icon {
          font-size: 10px;
        }
      }
    }
  }
  
  &:hover .node-actions {
    opacity: 1;
  }
  
  .node-body {
    padding: 6px 8px;
    
    .node-type {
      font-size: 10px;
      color: $text-color-tertiary;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .node-params {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .param-item {
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        
        .param-label {
          color: $text-color-secondary;
        }
        
        .param-value {
          color: $text-color-primary;
          font-weight: 500;
        }
      }
    }
    
    .node-position {
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px solid rgba(24, 144, 255, 0.1);
      font-size: 9px;
      color: $text-color-tertiary;
      font-family: monospace;
    }
  }
  
  .connection-point {
    position: absolute;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: crosshair;
    opacity: 0;
    transition: opacity 0.2s;
    
    .point-dot {
      width: 8px;
      height: 8px;
      background: #FAAD14;
      border: 2px solid #fff;
      border-radius: 50%;
      transition: all 0.2s;
    }
    
    &:hover .point-dot {
      width: 12px;
      height: 12px;
      background: #52C41A;
    }
    
    &.input {
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
    }
    
    &.output {
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  
  &:hover .connection-point {
    opacity: 1;
  }
  
  .disabled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #FAAD14;
    font-size: 11px;
    font-weight: 600;
    
    .el-icon {
      font-size: 20px;
    }
  }
}
</style>
