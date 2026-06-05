import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { useSimulationStore } from '../../store/simulation'
import Animator from './Animator'

export class Simulation {
  constructor(scene, animator, conveyor, robotArms, carBodies) {
    this.scene = scene
    this.animator = animator
    this.conveyor = conveyor
    this.robotArms = robotArms || []
    this.carBodies = carBodies || []
    this.store = useSimulationStore()
    this.path = null
    this.pathLength = 0
    this.state = 'idle'
    this.speed = 1
    this.currentStationIndex = 0
    this.progress = 0
    this.stationProgress = 0
    this.isProcessing = false
    this.processingTime = 0
    this.stations = []
    this.initPath()
    this.initStations()
  }

  initPath() {
    const controlPoints = [
      new THREE.Vector3(-15, 0.5, 8),
      new THREE.Vector3(-15, 0.5, -8),
      new THREE.Vector3(0, 0.5, -8),
      new THREE.Vector3(15, 0.5, -8),
      new THREE.Vector3(15, 0.5, 8),
      new THREE.Vector3(0, 0.5, 8)
    ]
    this.path = new THREE.CatmullRomCurve3(controlPoints, true)
    this.pathLength = this.path.getLength()
  }

  initStations() {
    this.stations = [
      { id: 1, position: 0.15, processTime: 10, name: '工位一' },
      { id: 2, position: 0.35, processTime: 15, name: '工位二' },
      { id: 3, position: 0.5, processTime: 12, name: '工位三' },
      { id: 4, position: 0.65, processTime: 8, name: '工位四' },
      { id: 5, position: 0.85, processTime: 20, name: '工位五' }
    ]
  }

  update(deltaTime) {
    if (this.state !== 'running') return

    const adjustedDelta = deltaTime * this.speed

    if (this.isProcessing) {
      this.processingTime += adjustedDelta
      this.stationProgress = Math.min(1, this.processingTime / this.currentStation.processTime)
      this.updateStoreStationProgress()
      
      if (this.processingTime >= this.currentStation.processTime) {
        this.completeStationProcessing()
      }
    } else {
      this.progress += (adjustedDelta * 0.05) / this.pathLength * 10
      if (this.progress >= 1) this.progress = 0
      this.checkStationArrival()
      this.updateCarPosition()
    }
  }

  checkStationArrival() {
    const station = this.stations.find(s => {
      const diff = Math.abs(this.progress - s.position)
      return diff < 0.01 && !this.isProcessing
    })

    if (station) {
      this.startStationProcessing(station)
    }
  }

  startStationProcessing(station) {
    this.isProcessing = true
    this.processingTime = 0
    this.stationProgress = 0
    this.currentStation = station
    this.currentStationIndex = this.stations.indexOf(station)
    this.triggerRobotArmAction(this.currentStationIndex)
    this.updateStoreStationStatus('running')
  }

  completeStationProcessing() {
    this.isProcessing = false
    this.processingTime = 0
    this.stationProgress = 0
    this.updateStoreStationStatus('idle')
    this.resetRobotArmAction(this.currentStationIndex)
    this.store.addOutput(`${this.currentStation.name} 完成加工`)
  }

  updateCarPosition() {
    if (this.carBodies && this.carBodies.length > 0) {
      const position = this.path.getPointAt(this.progress)
      const tangent = this.path.getTangentAt(this.progress).normalize()
      
      this.carBodies.forEach((car, index) => {
        const offsetIndex = (index * 0.2) % 1
        const carProgress = (this.progress + offsetIndex) % 1
        const carPos = this.path.getPointAt(carProgress)
        const carTan = this.path.getTangentAt(carProgress).normalize()
        
        car.position.copy(carPos)
        car.lookAt(carPos.clone().add(carTan))
        if (car.rotateWheels) {
          car.rotateWheels(0.1)
        }
      })
    }
  }

  triggerRobotArmAction(index) {
    if (this.robotArms[index]) {
      this.robotArms[index].doWelding && this.robotArms[index].doWelding()
      const device = this.store.devices.find(d => d.id === index + 1)
      if (device) {
        device.status = 'running'
      }
    }
  }

  resetRobotArmAction(index) {
    if (this.robotArms[index]) {
      this.robotArms[index].reset && this.robotArms[index].reset()
      const device = this.store.devices.find(d => d.id === index + 1)
      if (device) {
        device.status = 'idle'
      }
    }
  }

  updateStoreStationStatus(status) {
    const station = this.store.stations.find(s => s.id === this.currentStation.id)
    if (station) {
      station.status = status
      station.remainingTime = status === 'running' 
        ? this.currentStation.processTime - this.processingTime
        : 0
    }
  }

  updateStoreStationProgress() {
    const station = this.store.stations.find(s => s.id === this.currentStation.id)
    if (station) {
      station.remainingTime = Math.max(0, this.currentStation.processTime - this.processingTime)
    }
  }

  start() {
    if (this.state === 'running') return
    this.state = 'running'
    if (this.conveyor && this.conveyor.start) {
      this.conveyor.start()
    }
  }

  pause() {
    if (this.state !== 'running') return
    this.state = 'paused'
    if (this.conveyor && this.conveyor.stop) {
      this.conveyor.stop()
    }
  }

  reset() {
    this.state = 'idle'
    this.progress = 0
    this.currentStationIndex = 0
    this.isProcessing = false
    this.processingTime = 0
    this.stationProgress = 0
    
    this.robotArms.forEach(arm => arm && arm.reset && arm.reset())
    if (this.conveyor && this.conveyor.stop) {
      this.conveyor.stop()
    }
    this.updateCarPosition()
  }

  setSpeed(speed) {
    this.speed = Math.max(0.5, Math.min(5, speed))
  }

  getPath() {
    return this.path
  }
}

export default Simulation
