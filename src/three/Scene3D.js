import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Workshop from './models/Workshop'
import Conveyor from './models/Conveyor'
import RobotArm from './models/RobotArm'
import CarBody from './models/CarBody'
import SceneControls from './controls/SceneControls'
import { Animator } from './animation/Animator'
import { Simulation } from './animation/Simulation'
import { useSimulationStore } from '../store/simulation'

export class Scene3D {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.container = null
    this.controls = null
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    this.clock = new THREE.Clock()
    this.animator = null
    this.simulation = null
    this.workshop = null
    this.conveyor = null
    this.robotArms = []
    this.carBodies = []
    this.sceneControls = null
    this.highlightedMesh = null
    this.originalMaterial = null
    this.store = useSimulationStore()
    this.isRunning = false
    this.animationId = null
  }

  init(container) {
    this.container = container
    
    this.initScene()
    this.initCamera()
    this.initRenderer()
    this.initLights()
    this.initModels()
    this.initControls()
    this.initAnimation()
    
    this.handleResize()
    window.addEventListener('resize', this.handleResize.bind(this))
    this.container.addEventListener('click', this.handleClick.bind(this))
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this))
    
    this.animate()
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a2e)
    this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 100)
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(20, 15, 20)
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.container.appendChild(this.renderer.domElement)
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(15, 30, 15)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -30
    directionalLight.shadow.camera.right = 30
    directionalLight.shadow.camera.top = 30
    directionalLight.shadow.camera.bottom = -30
    this.scene.add(directionalLight)

    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x362222, 0.3)
    this.scene.add(hemisphereLight)
  }

  initModels() {
    this.workshop = new Workshop()
    this.scene.add(this.workshop)

    this.conveyor = new Conveyor(30, 3)
    this.scene.add(this.conveyor)

    const armPositions = [
      { x: -12, z: -5 },
      { x: -5, z: -5 },
      { x: 0, z: -5 },
      { x: 5, z: -5 },
      { x: 12, z: -5 }
    ]

    const carColors = [0xff0000, 0x0000ff, 0xffffff, 0x000000, 0xffd700]

    armPositions.forEach((pos, index) => {
      const robotArm = new RobotArm()
      robotArm.position.set(pos.x, 0, pos.z)
      robotArm.userData.deviceId = index + 1
      this.setDeviceUserData(robotArm, index + 1)
      this.robotArms.push(robotArm)
      this.scene.add(robotArm)
    })

    for (let i = 0; i < 5; i++) {
      const carBody = new CarBody(i + 1, carColors[i])
      carBody.userData.carId = i + 1
      this.carBodies.push(carBody)
      this.scene.add(carBody)
    }

    this.conveyor.userData.deviceId = 7
    this.setDeviceUserData(this.conveyor, 7)
  }

  setDeviceUserData(object, deviceId) {
    object.traverse((child) => {
      if (child.isMesh) {
        child.userData.deviceId = deviceId
        child.userData.originalMaterial = child.material.clone()
      }
    })
  }

  initControls() {
    this.sceneControls = new SceneControls(this.camera, this.renderer.domElement)
    this.controls = this.sceneControls.controls
  }

  initAnimation() {
    this.animator = new Animator()
    this.simulation = new Simulation(
      this.scene,
      this.animator,
      this.conveyor,
      this.robotArms,
      this.carBodies
    )
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this))
    
    const deltaTime = this.clock.getDelta()
    
    this.controls.update()
    this.animator.update(deltaTime)
    this.simulation.update(deltaTime)
    
    this.renderer.render(this.scene, this.camera)
  }

  handleResize() {
    if (!this.container || !this.camera || !this.renderer) return
    
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
  }

  handleMouseMove(event) {
    const rect = this.container.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    const allMeshes = []
    this.robotArms.forEach(arm => allMeshes.push(arm))
    this.conveyor && allMeshes.push(this.conveyor)
    
    const intersects = this.raycaster.intersectObjects(allMeshes, true)
    
    if (intersects.length > 0) {
      const hoveredObject = intersects[0].object
      const device = this.findDeviceByMesh(hoveredObject)
      if (device && this.onDeviceHover) {
        this.onDeviceHover(device, event)
        this.container.style.cursor = 'pointer'
      } else {
        if (this.onDeviceHover) {
          this.onDeviceHover(null, event)
        }
        this.container.style.cursor = 'grab'
      }
    } else {
      if (this.onDeviceHover) {
        this.onDeviceHover(null, event)
      }
      this.container.style.cursor = 'grab'
    }
  }

  handleClick(event) {
    const rect = this.container.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    
    this.raycaster.setFromCamera(this.mouse, this.camera)
    
    const allMeshes = []
    this.robotArms.forEach(arm => allMeshes.push(arm))
    this.conveyor && allMeshes.push(this.conveyor)
    
    const intersects = this.raycaster.intersectObjects(allMeshes, true)
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object
      const device = this.findDeviceByMesh(clickedObject)
      if (device) {
        this.highlightDevice(device.id)
        this.showDeviceInfo(device)
        if (this.onDeviceClick) {
          this.onDeviceClick(device)
        }
      }
    }
  }

  findDeviceByMesh(mesh) {
    let current = mesh
    while (current) {
      if (current.userData && current.userData.deviceId !== undefined) {
        const deviceId = current.userData.deviceId
        return this.store.devices.find(d => d.id === deviceId)
      }
      current = current.parent
    }
    return null
  }

  highlightDevice(deviceId) {
    this.restoreOriginalMaterial()

    const deviceMeshes = this.getAllDeviceMeshes(deviceId)
    if (deviceMeshes.length > 0) {
      this.highlightedMesh = deviceMeshes[0]
      
      deviceMeshes.forEach(mesh => {
        if (mesh.material && mesh.userData?.originalMaterial) {
          mesh.material = mesh.material.clone()
          mesh.material.emissive = new THREE.Color(0x1890FF)
          mesh.material.emissiveIntensity = 0.4
        }
      })
    }
  }

  restoreOriginalMaterial() {
    if (this.highlightedMesh) {
      const deviceId = this.highlightedMesh.userData?.deviceId
      if (deviceId !== undefined) {
        const deviceMeshes = this.getAllDeviceMeshes(deviceId)
        deviceMeshes.forEach(mesh => {
          if (mesh.userData?.originalMaterial) {
            mesh.material = mesh.userData.originalMaterial
          }
        })
      }
    }
    this.highlightedMesh = null
    this.originalMaterial = null
  }

  getAllDeviceMeshes(deviceId) {
    const meshes = []
    this.scene.traverse((object) => {
      if (object.userData && object.userData.deviceId === deviceId && object.isMesh) {
        meshes.push(object)
      }
    })
    return meshes
  }

  showDeviceInfo(device) {
    this.store.addOutput(`选中设备: ${device.name}`)
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize)
    this.container?.removeEventListener('click', this.handleClick)
    this.container?.removeEventListener('mousemove', this.handleMouseMove)

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    this.animator?.clear()
    this.simulation?.reset()

    this.scene.traverse((object) => {
      if (object.isMesh) {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose())
        } else {
          object.material?.dispose()
        }
      }
    })

    this.renderer?.dispose()
    this.controls?.dispose()

    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.animator = null
    this.simulation = null
  }
}

export default Scene3D
