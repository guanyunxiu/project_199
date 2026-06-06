<template>
  <div class="node-library">
    <div class="library-header">
      <h3 class="library-title">
        <el-icon><Grid /></el-icon>
        组件库
      </h3>
    </div>
    
    <div class="library-content">
      <div class="category-section">
        <div class="category-title">生产工位</div>
        <div class="node-items">
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.STATION)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.STATION) }">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.STATION) }}</div>
              <div class="node-desc">生产加工工位</div>
            </div>
          </div>
          
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.PIPELINE_NODE)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.PIPELINE_NODE) }">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.PIPELINE_NODE) }}</div>
              <div class="node-desc">流水线连接节点</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="category-section">
        <div class="category-title">设备</div>
        <div class="node-items">
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.ROBOT_ARM)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.ROBOT_ARM) }">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.ROBOT_ARM) }}</div>
              <div class="node-desc">工业机械臂</div>
            </div>
          </div>
          
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.CONVEYOR)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.CONVEYOR) }">
              <el-icon><Promotion /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.CONVEYOR) }}</div>
              <div class="node-desc">物料传送带</div>
            </div>
          </div>
          
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.LIFT)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.LIFT) }">
              <el-icon><Top /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.LIFT) }}</div>
              <div class="node-desc">升降平台</div>
            </div>
          </div>
          
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.AGV)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.AGV) }">
              <el-icon><Van /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.AGV) }}</div>
              <div class="node-desc">智能AGV小车</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="category-section">
        <div class="category-title">感知</div>
        <div class="node-items">
          <div 
            class="node-item"
            draggable="true"
            @dragstart="handleDragStart($event, NODE_TYPES.SENSOR)"
          >
            <div class="node-icon" :style="{ background: getNodeColor(NODE_TYPES.SENSOR) }">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="node-info">
              <div class="node-name">{{ getNodeName(NODE_TYPES.SENSOR) }}</div>
              <div class="node-desc">检测传感器</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="library-footer">
        <el-alert 
          title="拖拽组件到画布" 
          type="info" 
          :closable="false"
          show-icon
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { NODE_TYPES, NODE_TYPE_CONFIG } from '@/store/configEditor'
import { Grid, Connection, Cpu, Promotion, Top, Van, Aim } from '@element-plus/icons-vue'

const getNodeName = (type) => {
  return NODE_TYPE_CONFIG[type]?.name || type
}

const getNodeColor = (type) => {
  return NODE_TYPE_CONFIG[type]?.color || '#1890FF'
}

const handleDragStart = (e, nodeType) => {
  e.dataTransfer.setData('nodeType', nodeType)
  e.dataTransfer.effectAllowed = 'copy'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.node-library {
  width: 240px;
  display: flex;
  flex-direction: column;
  background: rgba(15, 28, 51, 0.9);
  border-right: 1px solid rgba(24, 144, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  
  .library-header {
    padding: 16px;
    border-bottom: 1px solid rgba(24, 144, 255, 0.1);
    
    .library-title {
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
  
  .library-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    
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
    
    .category-section {
      margin-bottom: 16px;
      
      .category-title {
        font-size: 12px;
        font-weight: 600;
        color: $text-color-secondary;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        padding-left: 4px;
      }
      
      .node-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .node-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: rgba(10, 22, 40, 0.6);
        border: 1px solid rgba(24, 144, 255, 0.15);
        border-radius: 8px;
        cursor: grab;
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba(24, 144, 255, 0.1);
          border-color: rgba(24, 144, 255, 0.4);
          transform: translateX(4px);
        }
        
        &:active {
          cursor: grabbing;
        }
        
        .node-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 20px;
          flex-shrink: 0;
        }
        
        .node-info {
          flex: 1;
          min-width: 0;
          
          .node-name {
            font-size: 13px;
            font-weight: 500;
            color: $text-color-primary;
            margin-bottom: 2px;
          }
          
          .node-desc {
            font-size: 11px;
            color: $text-color-tertiary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
    
    .library-footer {
      margin-top: 16px;
    }
  }
}
</style>
