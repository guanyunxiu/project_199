import { defineStore } from 'pinia'
import { ref, computed, markRaw } from 'vue'

export const useSimulationStore = defineStore('simulation', () => {
  const isRunning = ref(false)
  const isPaused = ref(false)
  const speed = ref(1)
  const currentTime = ref(0)
  const output = ref([])
  const selectedDevice = ref(null)

  const scene3D = ref(null)

  const stations = ref([
    { id: 1, name: '底盘装配工位', status: 'idle', processTime: 10, remainingTime: 0 },
    { id: 2, name: '车身焊接工位', status: 'idle', processTime: 15, remainingTime: 0 },
    { id: 3, name: '涂装工位', status: 'idle', processTime: 12, remainingTime: 0 },
    { id: 4, name: '总装工位', status: 'idle', processTime: 8, remainingTime: 0 },
    { id: 5, name: '检测工位', status: 'idle', processTime: 20, remainingTime: 0 },
    { id: 6, name: '内饰装配工位', status: 'idle', processTime: 18, remainingTime: 0 },
    { id: 7, name: '发动机装配工位', status: 'idle', processTime: 25, remainingTime: 0 },
    { id: 8, name: '底盘调校工位', status: 'idle', processTime: 14, remainingTime: 0 },
    { id: 9, name: '电气装配工位', status: 'idle', processTime: 16, remainingTime: 0 },
    { id: 10, name: '玻璃安装工位', status: 'idle', processTime: 10, remainingTime: 0 },
    { id: 11, name: '座椅装配工位', status: 'idle', processTime: 12, remainingTime: 0 },
    { id: 12, name: '终检工位', status: 'idle', processTime: 22, remainingTime: 0 }
  ])

  const devices = ref([
    { id: 1, name: '焊接机械臂A1', type: 'robot-arm', status: 'idle', runtime: 0, efficiency: 95.5, temperature: 35.2, position: { x: -12, z: -5 } },
    { id: 2, name: '焊接机械臂A2', type: 'robot-arm', status: 'idle', runtime: 0, efficiency: 94.2, temperature: 36.5, position: { x: -5, z: -5 } },
    { id: 3, name: '装配机械臂B1', type: 'robot-arm', status: 'idle', runtime: 0, efficiency: 96.8, temperature: 34.8, position: { x: 0, z: -5 } },
    { id: 4, name: '装配机械臂B2', type: 'robot-arm', status: 'idle', runtime: 0, efficiency: 93.5, temperature: 37.2, position: { x: 5, z: -5 } },
    { id: 5, name: '检测机械臂C1', type: 'robot-arm', status: 'idle', runtime: 0, efficiency: 99.1, temperature: 33.6, position: { x: 12, z: -5 } },
    { id: 6, name: '搬运机械臂D1', type: 'robot-arm', status: 'idle', runtime: 0, efficiency: 92.3, temperature: 38.1, position: { x: -12, z: 5 } },
    { id: 7, name: '主传送带L1', type: 'conveyor', status: 'idle', runtime: 0, efficiency: 98.2, temperature: 28.5, position: { x: 0, z: 0 } },
    { id: 8, name: '分装传送带L2', type: 'conveyor', status: 'idle', runtime: 0, efficiency: 97.6, temperature: 29.2, position: { x: -8, z: 8 } },
    { id: 9, name: '成品传送带L3', type: 'conveyor', status: 'idle', runtime: 0, efficiency: 98.8, temperature: 27.8, position: { x: 8, z: 8 } },
    { id: 10, name: '升降台E1', type: 'lift', status: 'idle', runtime: 0, efficiency: 95.0, temperature: 31.2, position: { x: -15, z: 0 } },
    { id: 11, name: '升降台E2', type: 'lift', status: 'idle', runtime: 0, efficiency: 94.5, temperature: 32.0, position: { x: 15, z: 0 } },
    { id: 12, name: 'AGV小车F1', type: 'agv', status: 'idle', runtime: 0, efficiency: 88.3, temperature: 30.4, position: { x: 0, z: 12 } },
    { id: 13, name: 'AGV小车F2', type: 'agv', status: 'idle', runtime: 0, efficiency: 89.1, temperature: 31.0, position: { x: 5, z: 12 } },
    { id: 14, name: '升降机E3', type: 'lift', status: 'stopped', runtime: 0, efficiency: 0, temperature: 25.0, position: { x: 10, z: -10 } }
  ])

  const productionData = ref({
    plannedOutput: 500,
    actualOutput: 368,
    completionRate: 73.6,
    runningTime: 8.5,
    stopTime: 0.5
  })

  const stationCount = computed(() => stations.value.length)
  const deviceCount = computed(() => devices.value.length)

  let simulationTimer = null

  const addOutput = (message) => {
    const time = new Date().toLocaleTimeString()
    output.value.unshift({ time, message })
    if (output.value.length > 100) {
      output.value.pop()
    }
  }

  const start = () => {
    if (isRunning.value && !isPaused.value) return

    isRunning.value = true
    isPaused.value = false
    addOutput('仿真开始运行')

    stations.value.forEach(s => {
      if (s.status === 'idle') {
        s.status = 'running'
        s.remainingTime = s.processTime
      } else if (s.status === 'paused') {
        s.status = 'running'
      }
    })

    devices.value.forEach(d => {
      if (d.status === 'idle' || d.status === 'paused') {
        d.status = 'running'
      }
    })

    if (scene3D.value?.simulation) {
      scene3D.value.simulation.start()
    }

    simulationTimer = setInterval(() => {
      currentTime.value += speed.value

      stations.value.forEach(s => {
        if (s.status === 'running') {
          s.remainingTime -= speed.value
          if (s.remainingTime <= 0) {
            s.remainingTime = s.processTime
            productionData.value.actualOutput++
            productionData.value.completionRate = 
              Math.round((productionData.value.actualOutput / productionData.value.plannedOutput) * 1000) / 10
            addOutput(`${s.name} 完成一个加工周期`)
          }
        }
      })

      devices.value.forEach(d => {
        if (d.status === 'running') {
          d.runtime += speed.value
          d.temperature = Math.min(80, d.temperature + Math.random() * 0.1 * speed.value)
          d.efficiency = Math.max(70, d.efficiency - Math.random() * 0.05 * speed.value)
        }
      })
    }, 1000)
  }

  const pause = () => {
    if (!isRunning.value) return

    isPaused.value = true
    addOutput('仿真已暂停')

    stations.value.forEach(s => {
      if (s.status === 'running') {
        s.status = 'paused'
      }
    })

    devices.value.forEach(d => {
      if (d.status === 'running') {
        d.status = 'paused'
      }
    })

    if (scene3D.value?.simulation) {
      scene3D.value.simulation.pause()
    }

    if (simulationTimer) {
      clearInterval(simulationTimer)
      simulationTimer = null
    }
  }

  const reset = () => {
    isRunning.value = false
    isPaused.value = false
    currentTime.value = 0
    output.value = []
    selectedDevice.value = null

    productionData.value.actualOutput = 0
    productionData.value.completionRate = 0

    stations.value.forEach(s => {
      s.status = 'idle'
      s.remainingTime = 0
    })

    devices.value.forEach(d => {
      if (d.id !== 14) {
        d.status = 'idle'
      }
      d.runtime = 0
      d.efficiency = 90 + Math.random() * 10
      d.temperature = 25 + Math.random() * 10
    })

    if (scene3D.value?.simulation) {
      scene3D.value.simulation.reset()
    }

    if (simulationTimer) {
      clearInterval(simulationTimer)
      simulationTimer = null
    }

    addOutput('仿真已重置')
  }

  const setSpeed = (newSpeed) => {
    speed.value = Math.max(0.5, Math.min(5, newSpeed))
    if (scene3D.value?.simulation) {
      scene3D.value.simulation.setSpeed(speed.value)
    }
    addOutput(`仿真速度调整为 ${speed.value}x`)
  }

  const setSelectedDevice = (device) => {
    selectedDevice.value = device
  }

  const setScene3D = (scene) => {
    scene3D.value = markRaw(scene)
  }

  const closeDeviceInfo = () => {
    selectedDevice.value = null
  }

  return {
    isRunning,
    isPaused,
    speed,
    currentTime,
    output,
    stationCount,
    deviceCount,
    stations,
    devices,
    selectedDevice,
    productionData,
    scene3D,
    start,
    pause,
    reset,
    setSpeed,
    setSelectedDevice,
    setScene3D,
    closeDeviceInfo,
    addOutput
  }
})
