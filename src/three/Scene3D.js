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
    this.configNodes = []
    this.configPaths = []
  }

  updateFromConfig(config) {
    this.clearConfigObjects()

    if (config.nodes) {
      config.nodes.forEach(node => {
        this.createConfigNode(node)
      })
    }

    if (config.paths) {
      config.paths.forEach(path => {
        this.createConfigPath(path)
      })
    }

    if (this.simulation) {
      const simConfig = {
        stations: config.nodes.filter(n => n.type === 'station').map(n => ({
          id: n.id,
          name: n.params.name,
          processTime: n.params.processTime || 20,
          position: n.position3D,
          capacity: n.params.capacity || 1,
          dependencies: n.params.dependencies || []
        })),
        paths: config.paths.map(p => ({
          id: p.id,
          name: p.name,
          points: p.points3D,
          speed: p.speed
        }))
      }
      
      if (this.simulation.loadConfig) {
        this.simulation.loadConfig(simConfig)
      }
    }

    this.store.addOutput('3D场景已从组态编辑器同步更新')
  }

  clearConfigObjects() {
    this.configNodes.forEach(obj => {
      this.scene.remove(obj)
      obj.traverse(child => {
        if (child.isMesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    })
    this.configNodes = []

    this.configPaths.forEach(obj => {
      this.scene.remove(obj)
      obj.geometry?.dispose()
      obj.material?.dispose()
    })
    this.configPaths = []
  }

  createConfigNode(node) {
    const group = new THREE.Group()
    group.position.set(node.position3D.x, 0, node.position3D.z)
    group.userData.nodeId = node.id
    group.userData.nodeType = node.type
    group.userData.configNode = true

    const color = new THREE.Color(this.getNodeColor(node.type))
    const opacity = node.params.enabled ? 0.8 : 0.3

    if (node.type === 'station') {
      const baseGeo = new THREE.BoxGeometry(3, 0.2, 3)
      const baseMat = new THREE.MeshStandardMaterial({ 
        color, 
        opacity, 
        transparent: true,
        emissive: color,
        emissiveIntensity: 0.2
      })
      const base = new THREE.Mesh(baseGeo, baseMat)
      base.position.y = 0.1
      group.add(base)

      const pillarGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8)
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const positions = [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]
      positions.forEach(pos => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat)
        pillar.position.set(pos[0], 1, pos[1])
        group.add(pillar)
      })

      const roofGeo = new THREE.BoxGeometry(3.2, 0.1, 3.2)
      const roofMat = new THREE.MeshStandardMaterial({ color, opacity: 0.5, transparent: true })
      const roof = new THREE.Mesh(roofGeo, roofMat)
      roof.position.y = 2.1
      group.add(roof)
    } else if (node.type === 'robot-arm') {
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.3, 16)
      const baseMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.1 })
      const base = new THREE.Mesh(baseGeo, baseMat)
      base.position.y = 0.15
      group.add(base)

      const armGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2)
      const armMat = new THREE.MeshStandardMaterial({ color: 0x666666 })
      const arm = new THREE.Mesh(armGeo, armMat)
      arm.position.y = 1.05
      group.add(arm)

      const jointGeo = new THREE.SphereGeometry(0.15, 16, 16)
      const jointMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
      const joint = new THREE.Mesh(jointGeo, jointMat)
      joint.position.y = 1.8
      group.add(joint)
    } else if (node.type === 'conveyor') {
      const conveyorGeo = new THREE.BoxGeometry(4, 0.3, 1)
      const conveyorMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15 })
      const conveyor = new THREE.Mesh(conveyorGeo, conveyorMat)
      conveyor.position.y = 0.15
      group.add(conveyor)

      for (let i = -1; i <= 1; i += 0.5) {
        const rollerGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8)
        const rollerMat = new THREE.MeshStandardMaterial({ color: 0x444444 })
        const roller = new THREE.Mesh(rollerGeo, rollerMat)
        roller.rotation.z = Math.PI / 2
        roller.position.set(i * 1.5, 0.15, 0)
        group.add(roller)
      }
    } else if (node.type === 'sensor') {
      const sensorGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12)
      const sensorMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
      const sensor = new THREE.Mesh(sensorGeo, sensorMat)
      sensor.position.y = 0.25
      group.add(sensor)

      const lensGeo = new THREE.SphereGeometry(0.12, 12, 12)
      const lensMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
      const lens = new THREE.Mesh(lensGeo, lensMat)
      lens.position.y = 0.55
      group.add(lens)
    } else if (node.type === 'lift') {
      const columnGeo = new THREE.BoxGeometry(0.3, 4, 0.3)
      const columnMat = new THREE.MeshStandardMaterial({ color: 0x555555 })
      const column = new THREE.Mesh(columnGeo, columnMat)
      column.position.y = 2
      group.add(column)

      const platformGeo = new THREE.BoxGeometry(2, 0.2, 2)
      const platformMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.2 })
      const platform = new THREE.Mesh(platformGeo, platformMat)
      platform.position.y = 1
      group.add(platform)
    } else if (node.type === 'agv') {
      const bodyGeo = new THREE.BoxGeometry(1.5, 0.4, 0.8)
      const bodyMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15 })
      const body = new THREE.Mesh(bodyGeo, bodyMat)
      body.position.y = 0.35
      group.add(body)

      const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12)
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const wheelPositions = [[-0.5, -0.35], [-0.5, 0.35], [0.5, -0.35], [0.5, 0.35]]
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat)
        wheel.rotation.x = Math.PI / 2
        wheel.position.set(pos[0], 0.15, pos[1])
        group.add(wheel)
      })
    } else if (node.type === 'pipeline-node') {
      const nodeGeo = new THREE.OctahedronGeometry(0.4, 0)
      const nodeMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 })
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat)
      nodeMesh.position.y = 0.5
      group.add(nodeMesh)
    }

    const labelCanvas = document.createElement('canvas')
    labelCanvas.width = 256
    labelCanvas.height = 64
    const labelCtx = labelCanvas.getContext('2d')
    labelCtx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    labelCtx.roundRect(0, 0, 256, 64, 8)
    labelCtx.fill()
    labelCtx.fillStyle = '#ffffff'
    labelCtx.font = 'bold 20px Arial'
    labelCtx.textAlign = 'center'
    labelCtx.textBaseline = 'middle'
    labelCtx.fillText(node.params.name || node.type, 128, 32)

    const labelTex = new THREE.CanvasTexture(labelCanvas)
    const labelMat = new THREE.SpriteMaterial({ map: labelTex })
    const label = new THREE.Sprite(labelMat)
    label.scale.set(2, 0.5, 1)
    label.position.y = 3
    group.add(label)

    this.setDeviceUserData(group, this.configNodes.length + 100)
    this.configNodes.push(group)
    this.scene.add(group)
  }

  createConfigPath(path) {
    if (!path.points3D || path.points3D.length < 2) return

    const points = path.points3D.map(p => new THREE.Vector3(p.x, 0.1, p.z))
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
    const tubeGeo = new THREE.TubeGeometry(curve, 100, (path.width || 8) * 0.03, 8, false)
    const tubeMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(path.color || '#1890FF'), 
      emissive: new THREE.Color(path.color || '#1890FF'),
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.6
    })
    const tube = new THREE.Mesh(tubeGeo, tubeMat)
    tube.userData.pathId = path.id
    tube.userData.configPath = true
    
    this.configPaths.push(tube)
    this.scene.add(tube)

    const linePoints = curve.getPoints(100)
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const lineMat = new THREE.LineBasicMaterial({ 
      color: new THREE.Color(path.color || '#1890FF'),
      linewidth: 2
    })
    const line = new THREE.Line(lineGeo, lineMat)
    line.position.y = 0.02
    this.configPaths.push(line)
    this.scene.add(line)
  }

  getNodeColor(type) {
    const colors = {
      'station': '#1890FF',
      'robot-arm': '#52C41A',
      'conveyor': '#FAAD14',
      'sensor': '#722ED1',
      'lift': '#13C2C2',
      'agv': '#EB2F96',
      'pipeline-node': '#F5222D'
    }
    return colors[type] || '#1890FF'
  }
}

export default Scene3D
