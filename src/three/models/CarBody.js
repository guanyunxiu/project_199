import * as THREE from 'three'

export default class CarBody extends THREE.Group {
  constructor(carId = 0, color = 0xff0000) {
    super()
    this.carId = carId
    this.bodyColor = color
    this.wheels = []
    this.init()
  }

  init() {
    this.createChassis()
    this.createRoof()
    this.createWindows()
    this.createWheels()
  }

  createChassis() {
    const chassisGeometry = new THREE.BoxGeometry(4, 0.8, 2)
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: this.bodyColor,
      metalness: 0.8,
      roughness: 0.2
    })
    const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial)
    chassis.position.y = 0.6
    chassis.castShadow = true
    chassis.name = 'chassis'
    this.add(chassis)

    const frontBumperGeometry = new THREE.BoxGeometry(0.3, 0.4, 1.8)
    const frontBumper = new THREE.Mesh(frontBumperGeometry, chassisMaterial)
    frontBumper.position.set(2.15, 0.5, 0)
    frontBumper.castShadow = true
    this.add(frontBumper)

    const rearBumper = new THREE.Mesh(frontBumperGeometry, chassisMaterial)
    rearBumper.position.set(-2.15, 0.5, 0)
    rearBumper.castShadow = true
    this.add(rearBumper)
  }

  createRoof() {
    const roofGeometry = new THREE.BoxGeometry(2.5, 0.7, 1.8)
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: this.bodyColor,
      metalness: 0.8,
      roughness: 0.2
    })
    const roof = new THREE.Mesh(roofGeometry, roofMaterial)
    roof.position.set(-0.2, 1.35, 0)
    roof.castShadow = true
    roof.name = 'roof'
    this.add(roof)
  }

  createWindows() {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.4
    })

    const frontWindowGeometry = new THREE.BoxGeometry(0.05, 0.5, 1.6)
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial)
    frontWindow.position.set(1.05, 1.35, 0)
    frontWindow.rotation.y = -0.3
    this.add(frontWindow)

    const rearWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial)
    rearWindow.position.set(-1.45, 1.35, 0)
    rearWindow.rotation.y = 0.3
    this.add(rearWindow)

    const sideWindowGeometry = new THREE.BoxGeometry(2.2, 0.5, 0.05)
    
    const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial)
    leftWindow.position.set(-0.2, 1.35, 0.9)
    this.add(leftWindow)

    const rightWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial)
    rightWindow.position.set(-0.2, 1.35, -0.9)
    this.add(rightWindow)
  }

  createWheels() {
    const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 24)
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.5,
      roughness: 0.7
    })

    const rimGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.26, 12)
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1
    })

    const wheelPositions = [
      { x: 1.4, y: 0.35, z: 0.9 },
      { x: 1.4, y: 0.35, z: -0.9 },
      { x: -1.4, y: 0.35, z: 0.9 },
      { x: -1.4, y: 0.35, z: -0.9 }
    ]

    wheelPositions.forEach((pos, index) => {
      const wheelGroup = new THREE.Group()
      wheelGroup.name = `wheel-${index + 1}`
      wheelGroup.position.set(pos.x, pos.y, pos.z)

      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.castShadow = true
      wheelGroup.add(wheel)

      const rim = new THREE.Mesh(rimGeometry, rimMaterial)
      rim.rotation.z = Math.PI / 2
      wheelGroup.add(rim)

      this.wheels.push(wheelGroup)
      this.add(wheelGroup)
    })
  }

  setColor(color) {
    this.bodyColor = color
    this.traverse((child) => {
      if (child.isMesh && child.material.color) {
        if (child.name === 'chassis' || child.name === 'roof') {
          child.material.color.setHex(color)
        }
      }
    })
  }

  rotateWheels(speed = 0.1) {
    this.wheels.forEach(wheel => {
      wheel.children.forEach(child => {
        child.rotation.x += speed
      })
    })
  }
}
