import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const PROCESS_STAGES = {
  HOISTING: 'hoisting',
  INTERIOR: 'interior',
  CHASSIS: 'chassis',
  TIRE: 'tire',
  ENGINE: 'engine',
  ELECTRICAL: 'electrical',
  GLASS: 'glass',
  SEAT: 'seat',
  DETECTION: 'detection',
  OFFLINE: 'offline'
}

export const PROCESS_STAGE_CONFIG = {
  [PROCESS_STAGES.HOISTING]: {
    name: '吊装工序',
    icon: 'Top',
    color: '#1890FF',
    description: '车身吊装与定位',
    defaultTime: 15,
    equipment: ['lift', 'robot-arm']
  },
  [PROCESS_STAGES.INTERIOR]: {
    name: '内饰装配',
    icon: 'Box',
    color: '#52C41A',
    description: '仪表盘、座椅、门板等内饰件安装',
    defaultTime: 25,
    equipment: ['robot-arm', 'agv']
  },
  [PROCESS_STAGES.CHASSIS]: {
    name: '底盘装配',
    icon: 'Connection',
    color: '#FAAD14',
    description: '底盘部件安装与调校',
    defaultTime: 30,
    equipment: ['robot-arm', 'conveyor']
  },
  [PROCESS_STAGES.TIRE]: {
    name: '轮胎装配',
    icon: 'Promotion',
    color: '#722ED1',
    description: '轮胎与轮毂安装',
    defaultTime: 12,
    equipment: ['robot-arm']
  },
  [PROCESS_STAGES.ENGINE]: {
    name: '发动机装配',
    icon: 'Cpu',
    color: '#F5222D',
    description: '发动机与变速箱安装',
    defaultTime: 35,
    equipment: ['robot-arm', 'lift', 'agv']
  },
  [PROCESS_STAGES.ELECTRICAL]: {
    name: '电气装配',
    icon: 'Lightning',
    color: '#13C2C2',
    description: '线束、传感器、电控系统安装',
    defaultTime: 20,
    equipment: ['robot-arm', 'sensor']
  },
  [PROCESS_STAGES.GLASS]: {
    name: '玻璃安装',
    icon: 'Picture',
    color: '#EB2F96',
    description: '前后挡风玻璃与车窗安装',
    defaultTime: 10,
    equipment: ['robot-arm', 'lift']
  },
  [PROCESS_STAGES.SEAT]: {
    name: '座椅装配',
    icon: 'Suitcase',
    color: '#2F54EB',
    description: '座椅与内饰件最终安装',
    defaultTime: 15,
    equipment: ['robot-arm', 'agv']
  },
  [PROCESS_STAGES.DETECTION]: {
    name: '检测工序',
    icon: 'View',
    color: '#FA8C16',
    description: '质量检测与功能测试',
    defaultTime: 25,
    equipment: ['sensor', 'robot-arm']
  },
  [PROCESS_STAGES.OFFLINE]: {
    name: '下线工序',
    icon: 'Right',
    color: '#00B42A',
    description: '成品下线与入库',
    defaultTime: 8,
    equipment: ['conveyor', 'agv']
  }
}

export const CAR_STATUS = {
  WAITING: 'waiting',
  MOVING: 'moving',
  PROCESSING: 'processing',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
  FAULT: 'fault'
}

export const STATION_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  BLOCKED: 'blocked',
  WAITING: 'waiting',
  FAULT: 'fault',
  MAINTENANCE: 'maintenance'
}

export const useAdvancedSimulationStore = defineStore('advancedSimulation', () => {
  const isRunning = ref(false)
  const isPaused = ref(false)
  const speed = ref(1)
  const currentTime = ref(0)
  const simulationTime = ref(0)
  const totalCarsProduced = ref(0)
  const totalCycleTime = ref(0)

  const carBodies = ref([])
  const stations = ref([])
  const processes = ref([])
  const paths = ref([])
  const events = ref([])

  const faultProbability = ref(0.02)
  const autoRecovery = ref(true)
  const recoveryTime = ref(5)
  const maxConcurrentCars = ref(10)
  const carSpawnInterval = ref(20)

  const selectedCarId = ref(null)
  const selectedStationId = ref(null)

  const activeCars = computed(() => carBodies.value.filter(c => c.status !== CAR_STATUS.COMPLETED))
  const completedCars = computed(() => carBodies.value.filter(c => c.status === CAR_STATUS.COMPLETED))
  const runningStations = computed(() => stations.value.filter(s => s.status === STATION_STATUS.RUNNING))
  const blockedStations = computed(() => stations.value.filter(s => s.status === STATION_STATUS.BLOCKED))
  const faultStations = computed(() => stations.value.filter(s => s.status === STATION_STATUS.FAULT))

  const productionRate = computed(() => {
    if (simulationTime.value === 0) return 0
    return Math.round((totalCarsProduced.value / simulationTime.value) * 3600 * 10) / 10
  })

  const averageCycleTime = computed(() => {
    if (totalCarsProduced.value === 0) return 0
    return Math.round((totalCycleTime.value / totalCarsProduced.value) * 10) / 10
  })

  const overallEquipmentEffectiveness = computed(() => {
    const totalStations = stations.value.length
    if (totalStations === 0) return 0
    const availableStations = stations.value.filter(s => 
      s.status !== STATION_STATUS.FAULT && s.status !== STATION_STATUS.MAINTENANCE
    ).length
    return Math.round((availableStations / totalStations) * 100 * 10) / 10
  })

  let carIdCounter = 1
  let stationIdCounter = 1
  let processIdCounter = 1
  let simulationTimer = null
  let carSpawnTimer = null
  let lastSpawnTime = 0

  const generateCarId = () => `car_${carIdCounter++}`
  const generateStationId = () => `station_${stationIdCounter++}`
  const generateProcessId = () => `process_${processIdCounter++}`

  const addEvent = (type, message, data = {}) => {
    const event = {
      id: Date.now() + Math.random(),
      time: simulationTime.value,
      type,
      message,
      data
    }
    events.value.unshift(event)
    if (events.value.length > 200) {
      events.value.pop()
    }
  }

  const createStation = (config) => {
    const station = {
      id: generateStationId(),
      name: config.name || '工位',
      type: config.type || PROCESS_STAGES.INTERIOR,
      position: config.position || { x: 0, y: 0, z: 0 },
      position2D: config.position2D || { x: 0, y: 0 },
      processTime: config.processTime || PROCESS_STAGE_CONFIG[config.type]?.defaultTime || 20,
      setupTime: config.setupTime || 2,
      capacity: config.capacity || 1,
      priority: config.priority || 1,
      status: STATION_STATUS.IDLE,
      currentCarId: null,
      progress: 0,
      remainingTime: 0,
      totalProcessed: 0,
      totalProcessingTime: 0,
      faultCount: 0,
      faultTime: 0,
      recoveryTimer: 0,
      dependencies: config.dependencies || [],
      equipment: config.equipment || [],
      enabled: config.enabled !== undefined ? config.enabled : true,
      buffer: [],
      maxBufferSize: config.maxBufferSize || 3,
      params: config.params || {}
    }
    stations.value.push(station)
    return station
  }

  const createProcess = (config) => {
    const process = {
      id: generateProcessId(),
      name: config.name || '工序',
      type: config.type || PROCESS_STAGES.INTERIOR,
      stationId: config.stationId,
      requiredTime: config.requiredTime || PROCESS_STAGE_CONFIG[config.type]?.defaultTime || 20,
      startTime: null,
      endTime: null,
      status: 'pending',
      progress: 0,
      dependencies: config.dependencies || [],
      parameters: config.parameters || {}
    }
    processes.value.push(process)
    return process
  }

  const createCarBody = (config = {}) => {
    const carColors = [0xff0000, 0x0000ff, 0xffffff, 0x000000, 0xffd700, 0x00ff00, 0xff00ff, 0x00ffff]
    const car = {
      id: generateCarId(),
      color: config.color || carColors[Math.floor(Math.random() * carColors.length)],
      status: CAR_STATUS.WAITING,
      currentPathId: config.pathId || null,
      pathProgress: 0,
      currentStationId: null,
      currentProcessId: null,
      processes: [],
      completedProcesses: [],
      startTime: simulationTime.value,
      endTime: null,
      cycleTime: 0,
      waitingTime: 0,
      position: config.position || { x: 0, y: 0.5, z: 0 },
      rotation: config.rotation || { x: 0, y: 0, z: 0 },
      faultCount: 0,
      reworkCount: 0,
      qualityScore: 100
    }
    carBodies.value.push(car)
    addEvent('car_spawn', `车身 ${car.id} 进入生产线`, { carId: car.id })
    return car
  }

  const initializeDefaultAssemblyLine = () => {
    stations.value = []
    carBodies.value = []
    processes.value = []
    events.value = []
    totalCarsProduced.value = 0
    totalCycleTime.value = 0
    simulationTime.value = 0
    carIdCounter = 1
    stationIdCounter = 1
    processIdCounter = 1

    const stageOrder = [
      PROCESS_STAGES.HOISTING,
      PROCESS_STAGES.INTERIOR,
      PROCESS_STAGES.CHASSIS,
      PROCESS_STAGES.ENGINE,
      PROCESS_STAGES.ELECTRICAL,
      PROCESS_STAGES.TIRE,
      PROCESS_STAGES.GLASS,
      PROCESS_STAGES.SEAT,
      PROCESS_STAGES.DETECTION,
      PROCESS_STAGES.OFFLINE
    ]

    const positions3D = [
      { x: -18, z: -8 },
      { x: -12, z: -8 },
      { x: -6, z: -8 },
      { x: 0, z: -8 },
      { x: 6, z: -8 },
      { x: 12, z: -8 },
      { x: 18, z: -8 },
      { x: 18, z: 0 },
      { x: 12, z: 0 },
      { x: 6, z: 0 }
    ]

    stageOrder.forEach((stage, index) => {
      const config = PROCESS_STAGE_CONFIG[stage]
      createStation({
        name: `${config.name}工位`,
        type: stage,
        processTime: config.defaultTime,
        position: { x: positions3D[index].x, y: 0, z: positions3D[index].z },
        position2D: { x: 100 + index * 70, y: 200 },
        dependencies: index > 0 ? [`station_${index}`] : [],
        equipment: config.equipment,
        capacity: index === 1 ? 2 : 1
      })
    })

    const pathPoints = [
      { x: -20, y: 0.5, z: 0 },
      { x: -18, y: 0.5, z: -8 },
      { x: -12, y: 0.5, z: -8 },
      { x: -6, y: 0.5, z: -8 },
      { x: 0, y: 0.5, z: -8 },
      { x: 6, y: 0.5, z: -8 },
      { x: 12, y: 0.5, z: -8 },
      { x: 18, y: 0.5, z: -8 },
      { x: 18, y: 0.5, z: 0 },
      { x: 12, y: 0.5, z: 0 },
      { x: 6, y: 0.5, z: 0 },
      { x: 0, y: 0.5, z: 0 }
    ]

    paths.value = [{
      id: 'main_path',
      name: '主装配线',
      points: pathPoints,
      color: '#1890FF',
      width: 3,
      speed: 1,
      enabled: true
    }]

    addEvent('system', '总装生产线初始化完成', { stationCount: stations.value.length })
  }

  const loadConfigFromEditor = (config) => {
    stations.value = []
    processes.value = []
    events.value = []

    config.nodes.filter(n => n.type === 'station').forEach(node => {
      createStation({
        name: node.params.name,
        type: node.params.stationType || PROCESS_STAGES.INTERIOR,
        processTime: node.params.processTime || 20,
        capacity: node.params.capacity || 1,
        position: node.position3D,
        position2D: { x: node.x + node.width / 2, y: node.y + node.height / 2 },
        dependencies: node.params.dependencies || [],
        params: node.params
      })
    })

    paths.value = config.paths.map(path => ({
      id: path.id,
      name: path.name,
      points: path.points3D,
      color: path.color,
      width: path.width / 10,
      speed: path.speed,
      enabled: path.enabled
    }))

    addEvent('system', '从组态编辑器加载配置完成', { 
      stationCount: stations.value.length,
      pathCount: paths.value.length 
    })
  }

  const getPathPosition = (pathId, progress) => {
    const path = paths.value.find(p => p.id === pathId)
    if (!path || path.points.length < 2) return null

    const totalSegments = path.points.length - 1
    const segmentProgress = progress * totalSegments
    const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1)
    const localProgress = segmentProgress - segmentIndex

    const start = path.points[segmentIndex]
    const end = path.points[segmentIndex + 1]

    return {
      x: start.x + (end.x - start.x) * localProgress,
      y: start.y + (end.y - start.y) * localProgress,
      z: start.z + (end.z - start.z) * localProgress
    }
  }

  const checkDependenciesMet = (station, car) => {
    if (!station.dependencies || station.dependencies.length === 0) return true
    return station.dependencies.every(depId => {
      return car.completedProcesses.some(p => {
        const process = processes.value.find(proc => proc.id === p)
        const depStation = stations.value.find(s => s.id === depId)
        return process && depStation && process.stationId === depStation.id
      })
    })
  }

  const getNextStation = (car) => {
    for (const station of stations.value) {
      if (!station.enabled) continue
      if (car.completedProcesses.some(p => {
        const proc = processes.value.find(pr => pr.id === p)
        return proc && proc.stationId === station.id
      })) continue

      if (station.buffer.length >= station.maxBufferSize) continue

      if (checkDependenciesMet(station, car)) {
        return station
      }
    }
    return null
  }

  const assignCarToStation = (car, station) => {
    if (!station || station.status === STATION_STATUS.FAULT) return false

    const currentOccupancy = carBodies.value.filter(c => c.currentStationId === station.id).length
    if (currentOccupancy >= station.capacity) {
      if (!station.buffer.includes(car.id)) {
        station.buffer.push(car.id)
        car.status = CAR_STATUS.BLOCKED
        addEvent('blocked', `车身 ${car.id} 在 ${station.name} 等待`, { 
          carId: car.id, 
          stationId: station.id 
        })
      }
      return false
    }

    const bufferIndex = station.buffer.indexOf(car.id)
    if (bufferIndex > -1) {
      station.buffer.splice(bufferIndex, 1)
    }

    const process = createProcess({
      name: `${station.name} - ${car.id}`,
      type: station.type,
      stationId: station.id,
      requiredTime: station.processTime
    })

    car.currentStationId = station.id
    car.currentProcessId = process.id
    car.status = CAR_STATUS.PROCESSING
    car.position = { ...station.position, y: 0.5 }
    car.processes.push(process.id)

    station.currentCarId = car.id
    station.status = STATION_STATUS.RUNNING
    station.progress = 0
    station.remainingTime = station.processTime

    process.startTime = simulationTime.value
    process.status = 'running'

    addEvent('process_start', `${station.name} 开始处理 ${car.id}`, {
      carId: car.id,
      stationId: station.id,
      processId: process.id
    })

    return true
  }

  const completeProcess = (car, station, process) => {
    process.endTime = simulationTime.value
    process.status = 'completed'
    process.progress = 100

    car.completedProcesses.push(process.id)
    car.currentStationId = null
    car.currentProcessId = null

    station.totalProcessed++
    station.totalProcessingTime += station.processTime
    station.status = station.buffer.length > 0 ? STATION_STATUS.BLOCKED : STATION_STATUS.IDLE
    station.currentCarId = null
    station.progress = 0
    station.remainingTime = 0

    addEvent('process_complete', `${station.name} 完成处理 ${car.id}`, {
      carId: car.id,
      stationId: station.id,
      processId: process.id,
      duration: simulationTime.value - process.startTime
    })

    if (station.buffer.length > 0) {
      const nextCarId = station.buffer.shift()
      const nextCar = carBodies.value.find(c => c.id === nextCarId)
      if (nextCar) {
        assignCarToStation(nextCar, station)
      }
    }

    const allStations = stations.value.filter(s => s.enabled)
    const allProcessesCompleted = allStations.every(s => 
      car.completedProcesses.some(p => {
        const proc = processes.value.find(pr => pr.id === p)
        return proc && proc.stationId === s.id
      })
    )

    if (allProcessesCompleted) {
      car.status = CAR_STATUS.COMPLETED
      car.endTime = simulationTime.value
      car.cycleTime = car.endTime - car.startTime
      totalCarsProduced.value++
      totalCycleTime.value += car.cycleTime
      addEvent('car_complete', `车身 ${car.id} 总装完成，总耗时: ${car.cycleTime.toFixed(1)}s`, {
        carId: car.id,
        cycleTime: car.cycleTime
      })
    } else {
      car.status = CAR_STATUS.MOVING
      moveCarToNextStation(car)
    }
  }

  const moveCarToNextStation = (car) => {
    const nextStation = getNextStation(car)
    if (nextStation) {
      car.currentPathId = 'main_path'
      car.pathProgress = 0
      car.status = CAR_STATUS.MOVING
      
      setTimeout(() => {
        if (car.status === CAR_STATUS.MOVING) {
          assignCarToStation(car, nextStation)
        }
      }, 2000 / speed.value)
    } else {
      car.status = CAR_STATUS.WAITING
      addEvent('waiting', `车身 ${car.id} 等待可用工位`, { carId: car.id })
    }
  }

  const triggerFault = (station) => {
    if (station.status === STATION_STATUS.FAULT) return
    
    station.status = STATION_STATUS.FAULT
    station.faultCount++
    station.recoveryTimer = autoRecovery.value ? recoveryTime.value : 999999
    
    const currentCar = carBodies.value.find(c => c.id === station.currentCarId)
    if (currentCar) {
      currentCar.status = CAR_STATUS.FAULT
      currentCar.faultCount++
    }

    addEvent('fault', `${station.name} 发生故障`, {
      stationId: station.id,
      recoveryTime: station.recoveryTimer
    })
  }

  const recoverStation = (station) => {
    if (station.status !== STATION_STATUS.FAULT) return
    
    station.status = STATION_STATUS.IDLE
    station.recoveryTimer = 0
    station.faultTime += recoveryTime.value

    const currentCar = carBodies.value.find(c => c.id === station.currentCarId)
    if (currentCar) {
      currentCar.status = CAR_STATUS.PROCESSING
    }

    addEvent('recovery', `${station.name} 故障恢复`, {
      stationId: station.id,
      downtime: recoveryTime.value
    })
  }

  const update = (deltaTime) => {
    if (!isRunning.value || isPaused.value) return

    const adjustedDelta = deltaTime * speed.value
    simulationTime.value += adjustedDelta
    currentTime.value = simulationTime.value

    if (carBodies.value.length < maxConcurrentCars.value) {
      if (simulationTime.value - lastSpawnTime >= carSpawnInterval.value / speed.value) {
        const newCar = createCarBody({ pathId: 'main_path' })
        newCar.status = CAR_STATUS.MOVING
        newCar.pathProgress = 0
        lastSpawnTime = simulationTime.value
      }
    }

    stations.value.forEach(station => {
      if (!station.enabled) return

      if (station.status === STATION_STATUS.FAULT) {
        station.recoveryTimer -= adjustedDelta
        if (autoRecovery.value && station.recoveryTimer <= 0) {
          recoverStation(station)
        }
        return
      }

      if (station.status === STATION_STATUS.RUNNING && station.currentCarId) {
        station.remainingTime -= adjustedDelta
        station.progress = Math.min(100, ((station.processTime - station.remainingTime) / station.processTime) * 100)

        const process = processes.value.find(p => p.id === carBodies.value.find(c => c.id === station.currentCarId)?.currentProcessId)
        if (process) {
          process.progress = station.progress
        }

        if (Math.random() < faultProbability.value * adjustedDelta * 0.1) {
          triggerFault(station)
          return
        }

        if (station.remainingTime <= 0) {
          const car = carBodies.value.find(c => c.id === station.currentCarId)
          const currentProcess = processes.value.find(p => p.id === car?.currentProcessId)
          if (car && currentProcess) {
            completeProcess(car, station, currentProcess)
          }
        }
      }
    })

    carBodies.value.forEach(car => {
      if (car.status === CAR_STATUS.MOVING && car.currentPathId) {
        car.pathProgress += adjustedDelta * 0.02 * speed.value
        if (car.pathProgress >= 1) {
          car.pathProgress = 1
        }
        const pos = getPathPosition(car.currentPathId, car.pathProgress)
        if (pos) {
          car.position = pos
        }
      }

      if (car.status === CAR_STATUS.WAITING || car.status === CAR_STATUS.BLOCKED) {
        car.waitingTime += adjustedDelta
        const nextStation = getNextStation(car)
        if (nextStation && nextStation.status !== STATION_STATUS.FAULT) {
          const currentOccupancy = carBodies.value.filter(c => c.currentStationId === nextStation.id).length
          if (currentOccupancy < nextStation.capacity) {
            assignCarToStation(car, nextStation)
          }
        }
      }
    })

    events.value.forEach(event => {
      event.age = (event.age || 0) + adjustedDelta
    })
  }

  const start = () => {
    if (stations.value.length === 0) {
      initializeDefaultAssemblyLine()
    }

    isRunning.value = true
    isPaused.value = false
    lastSpawnTime = simulationTime.value

    stations.value.forEach(s => {
      if (s.status === STATION_STATUS.IDLE && s.buffer.length > 0) {
        s.status = STATION_STATUS.BLOCKED
      }
    })

    addEvent('system', '高阶仿真开始运行', { speed: speed.value })

    if (simulationTimer) {
      clearInterval(simulationTimer)
    }

    simulationTimer = setInterval(() => {
      update(0.1)
    }, 100)
  }

  const pause = () => {
    if (!isRunning.value) return
    isPaused.value = true
    addEvent('system', '高阶仿真已暂停')
  }

  const resume = () => {
    if (!isRunning.value || !isPaused.value) return
    isPaused.value = false
    addEvent('system', '高阶仿真已恢复')
  }

  const reset = () => {
    isRunning.value = false
    isPaused.value = false
    simulationTime.value = 0
    currentTime.value = 0
    totalCarsProduced.value = 0
    totalCycleTime.value = 0
    carBodies.value = []
    processes.value = []
    events.value = []
    lastSpawnTime = 0
    carIdCounter = 1
    processIdCounter = 1

    stations.value.forEach(s => {
      s.status = STATION_STATUS.IDLE
      s.currentCarId = null
      s.progress = 0
      s.remainingTime = 0
      s.totalProcessed = 0
      s.totalProcessingTime = 0
      s.faultCount = 0
      s.faultTime = 0
      s.recoveryTimer = 0
      s.buffer = []
    })

    if (simulationTimer) {
      clearInterval(simulationTimer)
      simulationTimer = null
    }

    addEvent('system', '高阶仿真已重置')
  }

  const setSpeed = (newSpeed) => {
    speed.value = Math.max(0.5, Math.min(10, newSpeed))
    addEvent('system', `仿真速度调整为 ${speed.value}x`)
  }

  const setFaultProbability = (prob) => {
    faultProbability.value = Math.max(0, Math.min(1, prob))
  }

  const selectCar = (carId) => {
    selectedCarId.value = carId
    selectedStationId.value = null
  }

  const selectStation = (stationId) => {
    selectedStationId.value = stationId
    selectedCarId.value = null
  }

  const clearSelection = () => {
    selectedCarId.value = null
    selectedStationId.value = null
  }

  const manuallyTriggerFault = (stationId) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      triggerFault(station)
    }
  }

  const manuallyRecoverStation = (stationId) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      recoverStation(station)
    }
  }

  const updateStation = (stationId, updates) => {
    const index = stations.value.findIndex(s => s.id === stationId)
    if (index !== -1) {
      stations.value[index] = { ...stations.value[index], ...updates }
    }
  }

  const getSimulationStats = () => {
    return {
      simulationTime: simulationTime.value,
      totalCarsProduced: totalCarsProduced.value,
      activeCars: activeCars.value.length,
      completedCars: completedCars.value.length,
      productionRate: productionRate.value,
      averageCycleTime: averageCycleTime.value,
      oee: overallEquipmentEffectiveness.value,
      runningStations: runningStations.value.length,
      blockedStations: blockedStations.value.length,
      faultStations: faultStations.value.length,
      totalStations: stations.value.length
    }
  }

  return {
    isRunning,
    isPaused,
    speed,
    currentTime,
    simulationTime,
    totalCarsProduced,
    totalCycleTime,
    carBodies,
    stations,
    processes,
    paths,
    events,
    faultProbability,
    autoRecovery,
    recoveryTime,
    maxConcurrentCars,
    carSpawnInterval,
    selectedCarId,
    selectedStationId,
    activeCars,
    completedCars,
    runningStations,
    blockedStations,
    faultStations,
    productionRate,
    averageCycleTime,
    overallEquipmentEffectiveness,
    createStation,
    createProcess,
    createCarBody,
    initializeDefaultAssemblyLine,
    loadConfigFromEditor,
    getPathPosition,
    update,
    start,
    pause,
    resume,
    reset,
    setSpeed,
    setFaultProbability,
    selectCar,
    selectStation,
    clearSelection,
    manuallyTriggerFault,
    manuallyRecoverStation,
    updateStation,
    getSimulationStats,
    addEvent
  }
})
