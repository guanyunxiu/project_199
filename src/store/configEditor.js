import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const NODE_TYPES = {
  STATION: 'station',
  ROBOT_ARM: 'robot-arm',
  CONVEYOR: 'conveyor',
  SENSOR: 'sensor',
  LIFT: 'lift',
  AGV: 'agv',
  PIPELINE_NODE: 'pipeline-node'
}

export const NODE_TYPE_CONFIG = {
  [NODE_TYPES.STATION]: {
    name: '工位',
    icon: 'Grid',
    color: '#1890FF',
    width: 80,
    height: 80,
    defaultParams: {
      name: '新工位',
      processTime: 10,
      capacity: 1,
      priority: 1,
      enabled: true
    }
  },
  [NODE_TYPES.ROBOT_ARM]: {
    name: '机械臂',
    icon: 'Cpu',
    color: '#52C41A',
    width: 60,
    height: 60,
    defaultParams: {
      name: '机械臂',
      speed: 100,
      cycleTime: 5,
      repeatability: 0.02,
      payload: 50,
      enabled: true
    }
  },
  [NODE_TYPES.CONVEYOR]: {
    name: '传送带',
    icon: 'Promotion',
    color: '#FAAD14',
    width: 120,
    height: 40,
    defaultParams: {
      name: '传送带',
      speed: 1,
      length: 10,
      direction: 'forward',
      enabled: true
    }
  },
  [NODE_TYPES.SENSOR]: {
    name: '传感器',
    icon: 'Aim',
    color: '#722ED1',
    width: 40,
    height: 40,
    defaultParams: {
      name: '传感器',
      type: 'photoelectric',
      samplingRate: 100,
      sensitivity: 80,
      enabled: true
    }
  },
  [NODE_TYPES.LIFT]: {
    name: '升降机',
    icon: 'Top',
    color: '#13C2C2',
    width: 60,
    height: 80,
    defaultParams: {
      name: '升降机',
      maxHeight: 5,
      speed: 0.5,
      loadCapacity: 1000,
      enabled: true
    }
  },
  [NODE_TYPES.AGV]: {
    name: 'AGV小车',
    icon: 'Van',
    color: '#EB2F96',
    width: 70,
    height: 50,
    defaultParams: {
      name: 'AGV小车',
      maxSpeed: 2,
      batteryLife: 8,
      loadCapacity: 500,
      enabled: true
    }
  },
  [NODE_TYPES.PIPELINE_NODE]: {
    name: '流水线节点',
    icon: 'Connection',
    color: '#F5222D',
    width: 50,
    height: 50,
    defaultParams: {
      name: '流水线节点',
      nodeType: 'junction',
      delayTime: 0,
      bufferSize: 0,
      enabled: true
    }
  }
}

export const useConfigEditorStore = defineStore('configEditor', () => {
  const nodes = ref([])
  const connections = ref([])
  const paths = ref([])
  const selectedNodeId = ref(null)
  const selectedPathId = ref(null)
  const isDragging = ref(false)
  const isConnecting = ref(false)
  const connectionStart = ref(null)
  const isPathEditing = ref(false)
  const tempPathPoints = ref([])
  const currentScheme = ref({
    id: null,
    name: '未命名方案',
    description: '',
    createdAt: null,
    updatedAt: null
  })
  const savedSchemes = ref([])
  const scale = ref(1)
  const offset = ref({ x: 0, y: 0 })
  const history = ref([])
  const historyIndex = ref(-1)
  const gridSize = ref(20)
  const showGrid = ref(true)
  const snapToGrid = ref(true)

  const selectedNode = computed(() => {
    return nodes.value.find(n => n.id === selectedNodeId.value) || null
  })

  const selectedPath = computed(() => {
    return paths.value.find(p => p.id === selectedPathId.value) || null
  })

  let nodeIdCounter = 1
  let connectionIdCounter = 1
  let pathIdCounter = 1

  const generateNodeId = () => `node_${nodeIdCounter++}`
  const generateConnectionId = () => `conn_${connectionIdCounter++}`
  const generatePathId = () => `path_${pathIdCounter++}`

  const saveHistory = () => {
    const state = {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      connections: JSON.parse(JSON.stringify(connections.value)),
      paths: JSON.parse(JSON.stringify(paths.value))
    }
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(state)
    historyIndex.value++
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }

  const undo = () => {
    if (historyIndex.value > 0) {
      historyIndex.value--
      const state = history.value[historyIndex.value]
      nodes.value = JSON.parse(JSON.stringify(state.nodes))
      connections.value = JSON.parse(JSON.stringify(state.connections))
      paths.value = JSON.parse(JSON.stringify(state.paths))
      selectedNodeId.value = null
      selectedPathId.value = null
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      const state = history.value[historyIndex.value]
      nodes.value = JSON.parse(JSON.stringify(state.nodes))
      connections.value = JSON.parse(JSON.stringify(state.connections))
      paths.value = JSON.parse(JSON.stringify(state.paths))
      selectedNodeId.value = null
      selectedPathId.value = null
    }
  }

  const snapPosition = (x, y) => {
    if (!snapToGrid.value) return { x, y }
    return {
      x: Math.round(x / gridSize.value) * gridSize.value,
      y: Math.round(y / gridSize.value) * gridSize.value
    }
  }

  const addNode = (type, x, y) => {
    const config = NODE_TYPE_CONFIG[type]
    if (!config) return null

    const pos = snapPosition(x, y)
    const node = {
      id: generateNodeId(),
      type,
      x: pos.x - config.width / 2,
      y: pos.y - config.height / 2,
      width: config.width,
      height: config.height,
      rotation: 0,
      params: { ...config.defaultParams },
      position3D: { x: 0, y: 0, z: 0 }
    }

    node.position3D = map2Dto3D(node.x + node.width / 2, node.y + node.height / 2)

    nodes.value.push(node)
    saveHistory()
    return node
  }

  const updateNode = (nodeId, updates) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      nodes.value[index] = { ...nodes.value[index], ...updates }
      if (updates.x !== undefined || updates.y !== undefined) {
        const node = nodes.value[index]
        node.position3D = map2Dto3D(node.x + node.width / 2, node.y + node.height / 2)
      }
      saveHistory()
      return nodes.value[index]
    }
    return null
  }

  const updateNodeParams = (nodeId, params) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      nodes.value[index].params = { ...nodes.value[index].params, ...params }
      saveHistory()
      return nodes.value[index]
    }
    return null
  }

  const deleteNode = (nodeId) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
    if (nodeIndex !== -1) {
      nodes.value.splice(nodeIndex, 1)
      connections.value = connections.value.filter(
        c => c.from !== nodeId && c.to !== nodeId
      )
      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = null
      }
      saveHistory()
    }
  }

  const selectNode = (nodeId) => {
    selectedNodeId.value = nodeId
    selectedPathId.value = null
  }

  const clearSelection = () => {
    selectedNodeId.value = null
    selectedPathId.value = null
  }

  const startConnection = (nodeId) => {
    isConnecting.value = true
    connectionStart.value = nodeId
  }

  const finishConnection = (nodeId) => {
    if (connectionStart.value && connectionStart.value !== nodeId) {
      const exists = connections.value.some(
        c => c.from === connectionStart.value && c.to === nodeId
      )
      if (!exists) {
        const connection = {
          id: generateConnectionId(),
          from: connectionStart.value,
          to: nodeId,
          type: 'flow',
          label: ''
        }
        connections.value.push(connection)
        saveHistory()
      }
    }
    cancelConnection()
  }

  const cancelConnection = () => {
    isConnecting.value = false
    connectionStart.value = null
  }

  const deleteConnection = (connectionId) => {
    const index = connections.value.findIndex(c => c.id === connectionId)
    if (index !== -1) {
      connections.value.splice(index, 1)
      saveHistory()
    }
  }

  const startPathEditing = () => {
    isPathEditing.value = true
    tempPathPoints.value = []
    selectedPathId.value = null
  }

  const addPathPoint = (x, y) => {
    if (isPathEditing.value) {
      const pos = snapPosition(x, y)
      tempPathPoints.value.push({ x: pos.x, y: pos.y })
    }
  }

  const finishPath = (name = '流水线') => {
    if (tempPathPoints.value.length >= 2) {
      const points3D = tempPathPoints.value.map(p => map2Dto3D(p.x, p.y))
      const path = {
        id: generatePathId(),
        name,
        points: [...tempPathPoints.value],
        points3D,
        color: '#1890FF',
        width: 8,
        speed: 1,
        enabled: true
      }
      paths.value.push(path)
      saveHistory()
    }
    cancelPathEditing()
  }

  const cancelPathEditing = () => {
    isPathEditing.value = false
    tempPathPoints.value = []
  }

  const selectPath = (pathId) => {
    selectedPathId.value = pathId
    selectedNodeId.value = null
  }

  const updatePath = (pathId, updates) => {
    const index = paths.value.findIndex(p => p.id === pathId)
    if (index !== -1) {
      paths.value[index] = { ...paths.value[index], ...updates }
      if (updates.points) {
        paths.value[index].points3D = updates.points.map(p => map2Dto3D(p.x, p.y))
      }
      saveHistory()
      return paths.value[index]
    }
    return null
  }

  const deletePath = (pathId) => {
    const index = paths.value.findIndex(p => p.id === pathId)
    if (index !== -1) {
      paths.value.splice(index, 1)
      if (selectedPathId.value === pathId) {
        selectedPathId.value = null
      }
      saveHistory()
    }
  }

  const addPathPointAt = (pathId, pointIndex, x, y) => {
    const path = paths.value.find(p => p.id === pathId)
    if (path) {
      const pos = snapPosition(x, y)
      path.points.splice(pointIndex, 0, { x: pos.x, y: pos.y })
      path.points3D = path.points.map(p => map2Dto3D(p.x, p.y))
      saveHistory()
    }
  }

  const updatePathPoint = (pathId, pointIndex, x, y) => {
    const path = paths.value.find(p => p.id === pathId)
    if (path && path.points[pointIndex]) {
      const pos = snapPosition(x, y)
      path.points[pointIndex] = pos
      path.points3D[pointIndex] = map2Dto3D(pos.x, pos.y)
      saveHistory()
    }
  }

  const deletePathPoint = (pathId, pointIndex) => {
    const path = paths.value.find(p => p.id === pathId)
    if (path && path.points.length > 2) {
      path.points.splice(pointIndex, 1)
      path.points3D.splice(pointIndex, 1)
      saveHistory()
    }
  }

  const map2Dto3D = (x2d, y2d) => {
    const scale3D = 0.1
    const offsetX = 0
    const offsetZ = 0
    return {
      x: (x2d - 400) * scale3D + offsetX,
      y: 0.5,
      z: (y2d - 300) * scale3D + offsetZ
    }
  }

  const saveScheme = (name, description = '') => {
    const scheme = {
      id: currentScheme.value.id || Date.now().toString(),
      name,
      description,
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      connections: JSON.parse(JSON.stringify(connections.value)),
      paths: JSON.parse(JSON.stringify(paths.value)),
      createdAt: currentScheme.value.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const existingIndex = savedSchemes.value.findIndex(s => s.id === scheme.id)
    if (existingIndex !== -1) {
      savedSchemes.value[existingIndex] = scheme
    } else {
      savedSchemes.value.push(scheme)
    }

    currentScheme.value = {
      id: scheme.id,
      name: scheme.name,
      description: scheme.description,
      createdAt: scheme.createdAt,
      updatedAt: scheme.updatedAt
    }

    localStorage.setItem('config_schemes', JSON.stringify(savedSchemes.value))
    localStorage.setItem('current_scheme', JSON.stringify(currentScheme.value))

    return scheme
  }

  const loadScheme = (schemeId) => {
    const scheme = savedSchemes.value.find(s => s.id === schemeId)
    if (scheme) {
      nodes.value = JSON.parse(JSON.stringify(scheme.nodes))
      connections.value = JSON.parse(JSON.stringify(scheme.connections))
      paths.value = JSON.parse(JSON.stringify(scheme.paths))
      currentScheme.value = {
        id: scheme.id,
        name: scheme.name,
        description: scheme.description,
        createdAt: scheme.createdAt,
        updatedAt: scheme.updatedAt
      }
      selectedNodeId.value = null
      selectedPathId.value = null
      history.value = []
      historyIndex.value = -1
      saveHistory()
      return true
    }
    return false
  }

  const loadSavedSchemes = () => {
    const saved = localStorage.getItem('config_schemes')
    if (saved) {
      savedSchemes.value = JSON.parse(saved)
    }
    const current = localStorage.getItem('current_scheme')
    if (current) {
      currentScheme.value = JSON.parse(current)
    }
  }

  const deleteScheme = (schemeId) => {
    const index = savedSchemes.value.findIndex(s => s.id === schemeId)
    if (index !== -1) {
      savedSchemes.value.splice(index, 1)
      localStorage.setItem('config_schemes', JSON.stringify(savedSchemes.value))
      if (currentScheme.value.id === schemeId) {
        resetConfig()
      }
    }
  }

  const resetConfig = () => {
    nodes.value = []
    connections.value = []
    paths.value = []
    selectedNodeId.value = null
    selectedPathId.value = null
    currentScheme.value = {
      id: null,
      name: '未命名方案',
      description: '',
      createdAt: null,
      updatedAt: null
    }
    scale.value = 1
    offset.value = { x: 0, y: 0 }
    history.value = []
    historyIndex.value = -1
    localStorage.removeItem('current_scheme')
    saveHistory()
  }

  const exportJSON = () => {
    const data = {
      scheme: currentScheme.value,
      nodes: nodes.value,
      connections: connections.value,
      paths: paths.value,
      exportTime: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(data, null, 2)
  }

  const importJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString)
      if (data.nodes && data.connections && data.paths) {
        nodes.value = data.nodes
        connections.value = data.connections
        paths.value = data.paths
        if (data.scheme) {
          currentScheme.value = data.scheme
        }
        saveHistory()
        return true
      }
      return false
    } catch (e) {
      console.error('Import error:', e)
      return false
    }
  }

  const downloadJSON = () => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentScheme.value.name || '组态方案'}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getConfig = () => {
    return {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      connections: JSON.parse(JSON.stringify(connections.value)),
      paths: JSON.parse(JSON.stringify(paths.value))
    }
  }

  const init = () => {
    loadSavedSchemes()
    saveHistory()
  }

  return {
    nodes,
    connections,
    paths,
    selectedNodeId,
    selectedPathId,
    selectedNode,
    selectedPath,
    isDragging,
    isConnecting,
    connectionStart,
    isPathEditing,
    tempPathPoints,
    currentScheme,
    savedSchemes,
    scale,
    offset,
    gridSize,
    showGrid,
    snapToGrid,
    history,
    historyIndex,
    addNode,
    updateNode,
    updateNodeParams,
    deleteNode,
    selectNode,
    clearSelection,
    startConnection,
    finishConnection,
    cancelConnection,
    deleteConnection,
    startPathEditing,
    addPathPoint,
    finishPath,
    cancelPathEditing,
    selectPath,
    updatePath,
    deletePath,
    addPathPointAt,
    updatePathPoint,
    deletePathPoint,
    saveScheme,
    loadScheme,
    deleteScheme,
    resetConfig,
    exportJSON,
    importJSON,
    downloadJSON,
    getConfig,
    snapPosition,
    undo,
    redo,
    init
  }
})
