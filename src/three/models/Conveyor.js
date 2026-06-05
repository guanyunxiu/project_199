import * as THREE from 'three'

export default class Conveyor extends THREE.Group {
  constructor(length = 15, width = 3) {
    super()
    this.length = length
    this.width = width
    this.isRunning = false
    this.isFault = false
    this.beltOffset = 0
    this.state = 'idle'
    this.rollers = []
    this.init()
  }

  init() {
    this.createFrame()
    this.createBelt()
    this.createRollers()
    this.updateStateColor()
  }

  createFrame() {
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.6,
      roughness: 0.4
    })

    const sideFrameGeometry = new THREE.BoxGeometry(this.length, 0.15, 0.15)
    const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial)
    leftFrame.position.set(0, 0.4, this.width / 2 - 0.075)
    leftFrame.castShadow = true
    leftFrame.receiveShadow = true
    this.add(leftFrame)

    const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial)
    rightFrame.position.set(0, 0.4, -this.width / 2 + 0.075)
    rightFrame.castShadow = true
    rightFrame.receiveShadow = true
    this.add(rightFrame)

    const crossBarCount = Math.floor(this.length / 2) + 1
    const crossBarGeometry = new THREE.BoxGeometry(0.1, 0.1, this.width)

    for (let i = 0; i < crossBarCount; i++) {
      const crossBar = new THREE.Mesh(crossBarGeometry, frameMaterial)
      crossBar.position.set(
        -this.length / 2 + i * (this.length / (crossBarCount - 1)),
        0.3,
        0
      )
      crossBar.castShadow = true
      crossBar.receiveShadow = true
      this.add(crossBar)
    }

    const legGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.15)
    const legPositions = [
      { x: -this.length / 2 + 0.3, z: this.width / 2 - 0.075 },
      { x: -this.length / 2 + 0.3, z: -this.width / 2 + 0.075 },
      { x: this.length / 2 - 0.3, z: this.width / 2 - 0.075 },
      { x: this.length / 2 - 0.3, z: -this.width / 2 + 0.075 }
    ]

    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, frameMaterial)
      leg.position.set(pos.x, -0.1, pos.z)
      leg.castShadow = true
      leg.receiveShadow = true
      this.add(leg)
    })

    this.leftFrame = leftFrame
    this.rightFrame = rightFrame
  }

  createBelt() {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#333333'
    ctx.fillRect(0, 0, 512, 128)

    ctx.fillStyle = '#222222'
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(i * 64, 0, 2, 128)
    }

    ctx.fillStyle = '#444444'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(0, i * 32 + 15, 512, 2)
    }

    this.beltTexture = new THREE.CanvasTexture(canvas)
    this.beltTexture.wrapS = THREE.RepeatWrapping
    this.beltTexture.wrapT = THREE.RepeatWrapping
    this.beltTexture.repeat.set(this.length / 2, 1)

    const beltMaterial = new THREE.MeshStandardMaterial({
      map: this.beltTexture,
      roughness: 0.8,
      metalness: 0.1
    })

    const beltGeometry = new THREE.BoxGeometry(this.length, 0.08, this.width - 0.2)
    this.belt = new THREE.Mesh(beltGeometry, beltMaterial)
    this.belt.position.y = 0.54
    this.belt.receiveShadow = true
    this.belt.castShadow = true
    this.add(this.belt)
  }

  createRollers() {
    const rollerGeometry = new THREE.CylinderGeometry(0.25, 0.25, this.width - 0.1, 16)
    const rollerMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3
    })

    const rollerCount = Math.floor(this.length / 1.5) + 1

    for (let i = 0; i < rollerCount; i++) {
      const roller = new THREE.Mesh(rollerGeometry, rollerMaterial)
      roller.rotation.z = Math.PI / 2
      roller.position.set(
        -this.length / 2 + i * (this.length / (rollerCount - 1)),
        0.35,
        0
      )
      roller.castShadow = true
      this.rollers.push(roller)
      this.add(roller)
    }
  }

  animateBelt(speed = 0.02) {
    if (!this.isRunning || this.isFault) return

    this.beltOffset += speed
    if (this.beltOffset > 1) {
      this.beltOffset = 0
    }
    this.beltTexture.offset.x = this.beltOffset

    this.rollers.forEach(roller => {
      roller.rotation.x += speed * 5
    })
  }

  start() {
    if (this.isFault) return
    this.isRunning = true
    this.state = 'running'
    this.updateStateColor()
  }

  stop() {
    this.isRunning = false
    this.state = 'idle'
    this.updateStateColor()
  }

  setFault(fault) {
    this.isFault = fault
    if (fault) {
      this.isRunning = false
      this.state = 'fault'
    } else {
      this.state = 'idle'
    }
    this.updateStateColor()
  }

  updateStateColor() {
    let color
    switch (this.state) {
      case 'running':
        color = 0x00ff00
        break
      case 'fault':
        color = 0xff0000
        break
      case 'idle':
      default:
        color = 0x888888
        break
    }

    const statusGeometry = new THREE.BoxGeometry(0.5, 0.15, this.width + 0.3)
    const statusMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3
    })

    if (this.statusLight) {
      this.remove(this.statusLight)
      this.statusLight.geometry.dispose()
      this.statusLight.material.dispose()
    }

    this.statusLight = new THREE.Mesh(statusGeometry, statusMaterial)
    this.statusLight.position.set(0, 0.7, 0)
    this.add(this.statusLight)
  }

  getState() {
    return this.state
  }

  reset() {
    this.stop()
    this.setFault(false)
    this.beltOffset = 0
    if (this.beltTexture) {
      this.beltTexture.offset.x = 0
    }
  }
}
