<template>
  <div class="config-editor-page">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <el-icon><EditPen /></el-icon>
          可视化组态编辑器
        </h2>
        <span class="current-scheme">{{ configEditorStore.currentScheme.name }}</span>
      </div>
      
      <div class="toolbar-center">
        <el-button-group>
          <el-button :icon="ArrowLeft" @click="configEditorStore.undo()" :disabled="configEditorStore.historyIndex <= 0">
            撤销
          </el-button>
          <el-button :icon="ArrowRight" @click="configEditorStore.redo()" :disabled="configEditorStore.historyIndex >= configEditorStore.history.length - 1">
            重做
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button-group>
          <el-button :type="configEditorStore.showGrid ? 'primary' : 'default'" :icon="Grid" @click="configEditorStore.showGrid = !configEditorStore.showGrid">
            网格
          </el-button>
          <el-button :type="configEditorStore.snapToGrid ? 'primary' : 'default'" :icon="Magnet" @click="configEditorStore.snapToGrid = !configEditorStore.snapToGrid">
            吸附
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button-group>
          <el-button :type="configEditorStore.isPathEditing ? 'success' : 'default'" :icon="Connection" @click="togglePathEditing">
            {{ configEditorStore.isPathEditing ? '完成路径' : '绘制路径' }}
          </el-button>
          <el-button :type="configEditorStore.isConnecting ? 'warning' : 'default'" :icon="Link" @click="cancelConnection">
            连接
          </el-button>
        </el-button-group>
        
        <el-divider direction="vertical" />
        
        <el-button @click="zoomIn" :icon="ZoomIn">放大</el-button>
        <span class="zoom-value">{{ Math.round(configEditorStore.scale * 100) }}%</span>
        <el-button @click="zoomOut" :icon="ZoomOut">缩小</el-button>
        <el-button @click="resetView" :icon="Refresh">重置视图</el-button>
      </div>
      
      <div class="toolbar-right">
        <el-button @click="openSchemeManager" :icon="Folder">方案管理</el-button>
        <el-button @click="handleSave" :icon="Check">保存</el-button>
        <el-button @click="handleLoad" :icon="Upload">加载</el-button>
        <el-button @click="handleReset" :icon="RefreshLeft">重置</el-button>
        <el-button type="primary" @click="handleExport" :icon="Download">导出JSON</el-button>
        <el-upload 
          :show-file-list="false" 
          accept=".json" 
          :before-upload="handleImport"
          class="import-upload"
        >
          <el-button :icon="Upload">导入JSON</el-button>
        </el-upload>
        <el-button type="success" @click="syncTo3D" :icon="VideoPlay">同步到3D</el-button>
      </div>
    </div>
    
    <div class="editor-content">
      <NodeLibrary />
      
      <div 
        class="canvas-container" 
        ref="canvasContainer"
        @dragover.prevent
        @drop="handleDrop"
        @wheel="handleWheel"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @mouseleave="handleCanvasMouseUp"
        @click="handleCanvasClick"
        :class="{ 
          'path-editing': configEditorStore.isPathEditing,
          'connecting': configEditorStore.isConnecting 
        }"
      >
        <svg 
          class="connections-layer"
          :width="canvasWidth" 
          :height="canvasHeight"
          :style="{ transform: `scale(${configEditorStore.scale}) translate(${configEditorStore.offset.x}px, ${configEditorStore.offset.y}px)` }"
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#1890FF" />
            </marker>
          </defs>
          
          <path 
            v-for="path in configEditorStore.paths" 
            :key="path.id"
            :d="getPathD(path)"
            :stroke="path.color"
            :stroke-width="path.width"
            fill="none"
            :class="{ 'selected': configEditorStore.selectedPathId === path.id }"
            @click.stop="selectPath(path.id)"
          />
          
          <g v-for="path in configEditorStore.paths" :key="'points-' + path.id">
            <circle 
              v-for="(point, index) in path.points" 
              :key="'point-' + path.id + '-' + index"
              :cx="point.x" 
              :cy="point.y" 
              r="6"
              :fill="configEditorStore.selectedPathId === path.id ? '#52C41A' : path.color"
              stroke="#fff"
              stroke-width="2"
              :class="{ 'dragging': draggingPoint?.pathId === path.id && draggingPoint?.pointIndex === index }"
              @mousedown.stop="startDragPoint(path.id, index, $event)"
              @click.stop="() => {}"
            />
          </g>
          
          <path 
            v-if="configEditorStore.isPathEditing && configEditorStore.tempPathPoints.length > 0"
            :d="getTempPathD()"
            stroke="#52C41A"
            stroke-width="8"
            stroke-dasharray="10,5"
            fill="none"
          />
          
          <circle 
            v-for="(point, index) in configEditorStore.tempPathPoints" 
            :key="'temp-point-' + index"
            :cx="point.x" 
            :cy="point.y" 
            r="5"
            fill="#52C41A"
            stroke="#fff"
            stroke-width="2"
          />
          
          <path 
            v-for="conn in configEditorStore.connections" 
            :key="conn.id"
            :d="getConnectionD(conn)"
            stroke="#8C9BB3"
            stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead)"
          />
          
          <line 
            v-if="configEditorStore.isConnecting && mousePosition"
            :x1="connectionStartPos?.x"
            :y1="connectionStartPos?.y"
            :x2="mousePosition.x"
            :y2="mousePosition.y"
            stroke="#FAAD14"
            stroke-width="3"
            stroke-dasharray="5,5"
          />
        </svg>
        
        <div 
          class="canvas-grid" 
          v-if="configEditorStore.showGrid"
          :style="{ 
            backgroundSize: `${configEditorStore.gridSize * configEditorStore.scale}px ${configEditorStore.gridSize * configEditorStore.scale}px`,
            backgroundPosition: `${configEditorStore.offset.x * configEditorStore.scale}px ${configEditorStore.offset.y * configEditorStore.scale}px`
          }"
        />
        
        <div 
          class="nodes-layer"
          :style="{ 
            transform: `scale(${configEditorStore.scale}) translate(${configEditorStore.offset.x}px, ${configEditorStore.offset.y}px)`,
            width: canvasWidth + 'px',
            height: canvasHeight + 'px'
          }"
        >
          <ConfigNode 
            v-for="node in configEditorStore.nodes" 
            :key="node.id" 
            :node="node"
            :selected="configEditorStore.selectedNodeId === node.id"
            @select="selectNode(node.id)"
            @dragstart="handleNodeDragStart(node.id, $event)"
            @drag="handleNodeDrag(node.id, $event)"
            @dragend="handleNodeDragEnd"
            @start-connection="startConnection(node.id)"
            @delete="deleteNode(node.id)"
          />
        </div>
        
        <div 
          v-if="configEditorStore.isPathEditing"
          class="path-editing-hint"
        >
          <el-icon><InfoFilled /></el-icon>
          点击画布添加路径点，至少需要2个点。完成后点击"完成路径"按钮。
          <el-button size="small" @click="configEditorStore.cancelPathEditing()">取消</el-button>
        </div>
      </div>
      
      <PropertyPanel />
    </div>
    
    <SchemeManager 
      v-model:visible="showSchemeManager"
      @save="handleSaveAs"
    />
    
    <el-dialog 
      v-model="showSaveDialog" 
      title="保存方案" 
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="方案名称">
          <el-input v-model="saveForm.name" placeholder="请输入方案名称" />
        </el-form-item>
        <el-form-item label="方案描述">
          <el-input 
            v-model="saveForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入方案描述（可选）" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  EditPen, ArrowLeft, ArrowRight, Grid, Magnet, Connection, Link, 
  ZoomIn, ZoomOut, Refresh, Folder, Check, Upload, RefreshLeft, 
  Download, VideoPlay, InfoFilled
} from '@element-plus/icons-vue'
import { useConfigEditorStore, NODE_TYPE_CONFIG } from '@/store/configEditor'
import { useSimulationStore } from '@/store/simulation'
import NodeLibrary from '@/components/NodeLibrary.vue'
import ConfigNode from '@/components/ConfigNode.vue'
import PropertyPanel from '@/components/PropertyPanel.vue'
import SchemeManager from '@/components/SchemeManager.vue'

const configEditorStore = useConfigEditorStore()
const simulationStore = useSimulationStore()

const canvasContainer = ref(null)
const canvasWidth = ref(2000)
const canvasHeight = ref(1500)
const showSchemeManager = ref(false)
const showSaveDialog = ref(false)
const mousePosition = ref(null)
const connectionStartPos = ref(null)
const draggingNode = ref(null)
const draggingPoint = ref(null)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

const saveForm = reactive({
  name: '',
  description: ''
})

onMounted(() => {
  configEditorStore.init()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleKeyDown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (configEditorStore.selectedNodeId) {
      configEditorStore.deleteNode(configEditorStore.selectedNodeId)
      ElMessage.success('节点已删除')
    } else if (configEditorStore.selectedPathId) {
      configEditorStore.deletePath(configEditorStore.selectedPathId)
      ElMessage.success('路径已删除')
    }
  }
  
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault()
      configEditorStore.undo()
    } else if (e.key === 'y') {
      e.preventDefault()
      configEditorStore.redo()
    } else if (e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }
  
  if (e.key === 'Escape') {
    configEditorStore.cancelConnection()
    configEditorStore.cancelPathEditing()
    configEditorStore.clearSelection()
  }
}

const zoomIn = () => {
  configEditorStore.scale = Math.min(3, configEditorStore.scale + 0.1)
}

const zoomOut = () => {
  configEditorStore.scale = Math.max(0.3, configEditorStore.scale - 0.1)
}

const resetView = () => {
  configEditorStore.scale = 1
  configEditorStore.offset = { x: 0, y: 0 }
}

const handleWheel = (e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  configEditorStore.scale = Math.max(0.3, Math.min(3, configEditorStore.scale + delta))
}

const handleDrop = (e) => {
  e.preventDefault()
  const nodeType = e.dataTransfer.getData('nodeType')
  if (!nodeType) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / configEditorStore.scale - configEditorStore.offset.x
  const y = (e.clientY - rect.top) / configEditorStore.scale - configEditorStore.offset.y
  
  configEditorStore.addNode(nodeType, x, y)
  ElMessage.success(`已添加${NODE_TYPE_CONFIG[nodeType]?.name || '节点'}`)
}

const handleCanvasMouseDown = (e) => {
  if (e.button === 1 || (e.button === 0 && e.altKey)) {
    isPanning.value = true
    panStart.value = { x: e.clientX - configEditorStore.offset.x * configEditorStore.scale, y: e.clientY - configEditorStore.offset.y * configEditorStore.scale }
    canvasContainer.value.style.cursor = 'grabbing'
  }
}

const handleCanvasMouseMove = (e) => {
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / configEditorStore.scale - configEditorStore.offset.x
  const y = (e.clientY - rect.top) / configEditorStore.scale - configEditorStore.offset.y
  mousePosition.value = { x, y }
  
  if (isPanning.value) {
    configEditorStore.offset.x = (e.clientX - panStart.value.x) / configEditorStore.scale
    configEditorStore.offset.y = (e.clientY - panStart.value.y) / configEditorStore.scale
  }
  
  if (draggingNode.value) {
    const snapped = configEditorStore.snapPosition(x, y)
    configEditorStore.updateNode(draggingNode.value, {
      x: snapped.x - draggingNode.value.width / 2,
      y: snapped.y - draggingNode.value.height / 2
    })
  }
  
  if (draggingPoint.value) {
    configEditorStore.updatePathPoint(draggingPoint.value.pathId, draggingPoint.value.pointIndex, x, y)
  }
}

const handleCanvasMouseUp = () => {
  isPanning.value = false
  draggingNode.value = null
  draggingPoint.value = null
  if (canvasContainer.value) {
    canvasContainer.value.style.cursor = configEditorStore.isPathEditing ? 'crosshair' : 'default'
  }
}

const handleCanvasClick = (e) => {
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / configEditorStore.scale - configEditorStore.offset.x
  const y = (e.clientY - rect.top) / configEditorStore.scale - configEditorStore.offset.y
  
  if (configEditorStore.isPathEditing) {
    configEditorStore.addPathPoint(x, y)
    return
  }
  
  if (e.target === canvasContainer.value || e.target.classList.contains('canvas-grid')) {
    configEditorStore.clearSelection()
  }
}

const selectNode = (nodeId) => {
  configEditorStore.selectNode(nodeId)
}

const selectPath = (pathId) => {
  configEditorStore.selectPath(pathId)
}

const deleteNode = (nodeId) => {
  ElMessageBox.confirm('确定要删除这个节点吗？', '删除确认', {
    type: 'warning'
  }).then(() => {
    configEditorStore.deleteNode(nodeId)
    ElMessage.success('节点已删除')
  }).catch(() => {})
}

const handleNodeDragStart = (nodeId, e) => {
  const node = configEditorStore.nodes.find(n => n.id === nodeId)
  if (node) {
    draggingNode.value = node
    configEditorStore.selectNode(nodeId)
  }
}

const handleNodeDrag = () => {}

const handleNodeDragEnd = () => {
  draggingNode.value = null
}

const startDragPoint = (pathId, pointIndex, e) => {
  draggingPoint.value = { pathId, pointIndex }
  configEditorStore.selectPath(pathId)
  e.stopPropagation()
}

const startConnection = (nodeId) => {
  const node = configEditorStore.nodes.find(n => n.id === nodeId)
  if (node) {
    configEditorStore.startConnection(nodeId)
    connectionStartPos.value = {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2
    }
  }
}

const cancelConnection = () => {
  configEditorStore.cancelConnection()
  connectionStartPos.value = null
}

const togglePathEditing = () => {
  if (configEditorStore.isPathEditing) {
    if (configEditorStore.tempPathPoints.length >= 2) {
      ElMessageBox.prompt('请输入路径名称', '创建路径', {
        inputValue: '流水线',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        configEditorStore.finishPath(value)
        ElMessage.success('路径创建成功')
      }).catch(() => {
        configEditorStore.cancelPathEditing()
      })
    } else {
      ElMessage.warning('至少需要2个路径点')
    }
  } else {
    configEditorStore.startPathEditing()
  }
}

const getPathD = (path) => {
  if (path.points.length < 2) return ''
  return path.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

const getTempPathD = () => {
  const points = [...configEditorStore.tempPathPoints]
  if (mousePosition.value) {
    points.push(mousePosition.value)
  }
  if (points.length < 2) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

const getConnectionD = (conn) => {
  const fromNode = configEditorStore.nodes.find(n => n.id === conn.from)
  const toNode = configEditorStore.nodes.find(n => n.id === conn.to)
  if (!fromNode || !toNode) return ''
  
  const x1 = fromNode.x + fromNode.width / 2
  const y1 = fromNode.y + fromNode.height / 2
  const x2 = toNode.x + toNode.width / 2
  const y2 = toNode.y + toNode.height / 2
  
  const midX = (x1 + x2) / 2
  return `M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2} ${x2} ${y2}`
}

const openSchemeManager = () => {
  showSchemeManager.value = true
}

const handleSave = () => {
  if (configEditorStore.currentScheme.id) {
    configEditorStore.saveScheme(configEditorStore.currentScheme.name, configEditorStore.currentScheme.description)
    ElMessage.success('方案已保存')
  } else {
    showSaveDialog.value = true
    saveForm.name = configEditorStore.currentScheme.name
  }
}

const handleSaveAs = (scheme) => {
  configEditorStore.saveScheme(scheme.name, scheme.description)
  ElMessage.success('方案已保存')
}

const confirmSave = () => {
  if (!saveForm.name.trim()) {
    ElMessage.warning('请输入方案名称')
    return
  }
  configEditorStore.saveScheme(saveForm.name.trim(), saveForm.description.trim())
  showSaveDialog.value = false
  ElMessage.success('方案已保存')
}

const handleLoad = () => {
  if (configEditorStore.savedSchemes.length === 0) {
    ElMessage.warning('没有已保存的方案')
    return
  }
  showSchemeManager.value = true
}

const handleReset = () => {
  ElMessageBox.confirm('确定要重置所有组态配置吗？此操作不可撤销。', '重置确认', {
    type: 'warning'
  }).then(() => {
    configEditorStore.resetConfig()
    ElMessage.success('组态已重置')
  }).catch(() => {})
}

const handleExport = () => {
  configEditorStore.downloadJSON()
  ElMessage.success('JSON配置已导出')
}

const handleImport = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const success = configEditorStore.importJSON(e.target.result)
      if (success) {
        ElMessage.success('JSON配置已导入')
      } else {
        ElMessage.error('JSON格式不正确')
      }
    } catch (err) {
      ElMessage.error('导入失败：' + err.message)
    }
  }
  reader.readAsText(file)
  return false
}

const syncTo3D = () => {
  const config = configEditorStore.getConfig()
  if (config.nodes.length === 0 && config.paths.length === 0) {
    ElMessage.warning('请先添加节点或路径')
    return
  }
  
  if (simulationStore.scene3D?.updateFromConfig) {
    simulationStore.scene3D.updateFromConfig(config)
  }
  
  ElMessage.success('已同步到3D场景')
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.config-editor-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(15, 28, 51, 0.95) 100%);
}

.editor-toolbar {
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
    
    .current-scheme {
      font-size: 13px;
      color: $text-color-secondary;
      padding: 4px 12px;
      background: rgba(24, 144, 255, 0.1);
      border-radius: 4px;
    }
  }
  
  .toolbar-center {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .zoom-value {
      font-size: 12px;
      color: $text-color-secondary;
      min-width: 50px;
      text-align: center;
    }
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .import-upload {
      display: inline-block;
    }
  }
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0A1628;
  cursor: default;
  
  &.path-editing {
    cursor: crosshair;
  }
  
  &.connecting {
    cursor: crosshair;
  }
  
  .canvas-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-image: 
      linear-gradient(rgba(24, 144, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(24, 144, 255, 0.08) 1px, transparent 1px);
  }
  
  .connections-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    
    path {
      pointer-events: stroke;
      cursor: pointer;
      transition: stroke 0.2s, stroke-width 0.2s;
      
      &:hover {
        stroke-width: 12;
      }
      
      &.selected {
        stroke: #52C41A !important;
        stroke-width: 10;
      }
    }
    
    circle {
      pointer-events: all;
      cursor: move;
      transition: r 0.2s;
      
      &:hover {
        r: 8;
      }
      
      &.dragging {
        fill: #FAAD14;
        r: 10;
      }
    }
  }
  
  .nodes-layer {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
  }
  
  .path-editing-hint {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(82, 196, 26, 0.9);
    color: #fff;
    border-radius: 8px;
    font-size: 13px;
    backdrop-filter: blur(10px);
    z-index: 100;
    
    .el-icon {
      font-size: 18px;
    }
  }
}
</style>
