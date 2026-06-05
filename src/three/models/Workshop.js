import * as THREE from 'three'

export default class Workshop extends THREE.Group {
  constructor() {
    super()
    this.workstations = []
    this.init()
  }

  init() {
    this.createGround()
    this.createFence()
    this.createWorkstations()
    this.createShelves()
    this.createLights()
  }

  createGround() {
    const size = 60
    const gridSize = 2

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#555555'
    ctx.fillRect(0, 0, 512, 512)

    ctx.strokeStyle = '#777777'
    ctx.lineWidth = 2
    for (let i = 0; i <= 512; i += 512 / (size / gridSize)) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 512)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(512, i)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)

    const geometry = new THREE.PlaneGeometry(size, size)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1
    })
    const ground = new THREE.Mesh(geometry, material)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.name = 'ground'
    this.add(ground)
  }

  createFence() {
    const postGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8)
    const railGeometry = new THREE.BoxGeometry(2, 0.08, 0.08)
    const material = new THREE.MeshStandardMaterial({
      color: 0x336699,
      metalness: 0.6,
      roughness: 0.3
    })

    const fenceLength = 50
    const segmentLength = 2
    const postCount = (fenceLength / segmentLength) + 1

    const totalInstances = postCount * 4 + (postCount - 1) * 4

    const postMesh = new THREE.InstancedMesh(postGeometry, material, postCount * 4)
    const railMesh = new THREE.InstancedMesh(railGeometry, material, (postCount - 1) * 4)

    const dummy = new THREE.Object3D()
    const halfFence = fenceLength / 2

    let postIndex = 0
    let railIndex = 0

    const sides = [
      { x: -halfFence, zStart: -halfFence, zEnd: halfFence, rotY: 0 },
      { x: halfFence, zStart: -halfFence, zEnd: halfFence, rotY: 0 },
      { z: -halfFence, xStart: -halfFence, xEnd: halfFence, rotY: Math.PI / 2 },
      { z: halfFence, xStart: -halfFence, xEnd: halfFence, rotY: Math.PI / 2 }
    ]

    sides.forEach((side, sideIndex) => {
      if (sideIndex < 2) {
        for (let i = 0; i < postCount; i++) {
          const z = side.zStart + i * segmentLength
          dummy.position.set(side.x, 0.75, z)
          dummy.updateMatrix()
          postMesh.setMatrixAt(postIndex++, dummy.matrix)
        }
        for (let i = 0; i < postCount - 1; i++) {
          const z = side.zStart + i * segmentLength + segmentLength / 2
          dummy.position.set(side.x, 0.4, z)
          dummy.rotation.y = Math.PI / 2
          dummy.updateMatrix()
          railMesh.setMatrixAt(railIndex++, dummy.matrix)
          dummy.position.set(side.x, 1.1, z)
          dummy.updateMatrix()
          railMesh.setMatrixAt(railIndex++, dummy.matrix)
        }
      } else {
        for (let i = 0; i < postCount; i++) {
          const x = side.xStart + i * segmentLength
          dummy.position.set(x, 0.75, side.z)
          dummy.updateMatrix()
          postMesh.setMatrixAt(postIndex++, dummy.matrix)
        }
        for (let i = 0; i < postCount - 1; i++) {
          const x = side.xStart + i * segmentLength + segmentLength / 2
          dummy.position.set(x, 0.4, side.z)
          dummy.rotation.y = 0
          dummy.updateMatrix()
          railMesh.setMatrixAt(railIndex++, dummy.matrix)
          dummy.position.set(x, 1.1, side.z)
          dummy.updateMatrix()
          railMesh.setMatrixAt(railIndex++, dummy.matrix)
        }
      }
    })

    postMesh.instanceMatrix.needsUpdate = true
    railMesh.instanceMatrix.needsUpdate = true

    this.add(postMesh)
    this.add(railMesh)
  }

  createWorkstations() {
    const rows = 3
    const cols = 4
    const spacingX = 12
    const spacingZ = 14
    const startX = -((cols - 1) * spacingX) / 2
    const startZ = -((rows - 1) * spacingZ) / 2

    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.3,
      roughness: 0.6
    })

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.5,
      roughness: 0.4
    })

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col + 1
        const x = startX + col * spacingX
        const z = startZ + row * spacingZ

        const stationGroup = new THREE.Group()
        stationGroup.name = `workstation-${index}`
        stationGroup.position.set(x, 0, z)

        const platformGeometry = new THREE.BoxGeometry(8, 0.3, 10)
        const platform = new THREE.Mesh(platformGeometry, platformMaterial)
        platform.position.y = 0.15
        platform.receiveShadow = true
        platform.castShadow = true
        stationGroup.add(platform)

        const baseGeometry = new THREE.BoxGeometry(3, 0.5, 3)
        const base = new THREE.Mesh(baseGeometry, baseMaterial)
        base.position.set(0, 0.55, 0)
        base.castShadow = true
        base.receiveShadow = true
        stationGroup.add(base)

        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#222222'
        ctx.fillRect(0, 0, 256, 256)
        ctx.fillStyle = '#00ff88'
        ctx.font = 'bold 120px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(index.toString(), 128, 128)

        const numberTexture = new THREE.CanvasTexture(canvas)
        const numberMaterial = new THREE.MeshBasicMaterial({
          map: numberTexture,
          transparent: true
        })
        const numberGeometry = new THREE.PlaneGeometry(1.5, 1.5)
        const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial)
        numberMesh.position.set(0, 1.5, 1.51)
        stationGroup.add(numberMesh)

        this.workstations.push(stationGroup)
        this.add(stationGroup)
      }
    }
  }

  createShelves() {
    const shelfGroup = new THREE.Group()
    shelfGroup.name = 'shelves'

    const shelfMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      metalness: 0.1,
      roughness: 0.8
    })

    const shelfCount = 4
    const shelfWidth = 6
    const shelfHeight = 3
    const shelfDepth = 1.5
    const shelfSpacing = 3

    for (let i = 0; i < shelfCount; i++) {
      const singleShelf = new THREE.Group()
      singleShelf.position.set(-20, 0, -15 + i * shelfSpacing)

      const verticalGeometry = new THREE.BoxGeometry(0.15, shelfHeight, 0.15)
      const leftPost = new THREE.Mesh(verticalGeometry, shelfMaterial)
      leftPost.position.set(-shelfWidth / 2, shelfHeight / 2, 0)
      leftPost.castShadow = true
      singleShelf.add(leftPost)

      const rightPost = new THREE.Mesh(verticalGeometry, shelfMaterial)
      rightPost.position.set(shelfWidth / 2, shelfHeight / 2, 0)
      rightPost.castShadow = true
      singleShelf.add(rightPost)

      const backLeftPost = new THREE.Mesh(verticalGeometry, shelfMaterial)
      backLeftPost.position.set(-shelfWidth / 2, shelfHeight / 2, -shelfDepth)
      backLeftPost.castShadow = true
      singleShelf.add(backLeftPost)

      const backRightPost = new THREE.Mesh(verticalGeometry, shelfMaterial)
      backRightPost.position.set(shelfWidth / 2, shelfHeight / 2, -shelfDepth)
      backRightPost.castShadow = true
      singleShelf.add(backRightPost)

      const shelfLevelCount = 4
      const levelHeight = shelfHeight / shelfLevelCount
      const shelfBoardGeometry = new THREE.BoxGeometry(shelfWidth, 0.08, shelfDepth)

      for (let j = 0; j < shelfLevelCount; j++) {
        const board = new THREE.Mesh(shelfBoardGeometry, shelfMaterial)
        board.position.set(0, j * levelHeight + 0.04, -shelfDepth / 2)
        board.castShadow = true
        board.receiveShadow = true
        singleShelf.add(board)

        if (j > 0) {
          const boxCount = Math.floor(Math.random() * 3) + 1
          for (let k = 0; k < boxCount; k++) {
            const boxSize = 0.5 + Math.random() * 0.5
            const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize)
            const boxMaterial = new THREE.MeshStandardMaterial({
              color: new THREE.Color().setHSL(Math.random(), 0.3, 0.6),
              roughness: 0.9
            })
            const box = new THREE.Mesh(boxGeometry, boxMaterial)
            box.position.set(
              (Math.random() - 0.5) * (shelfWidth - boxSize),
              j * levelHeight + boxSize / 2 + 0.08,
              -shelfDepth / 2 + (Math.random() - 0.5) * (shelfDepth - boxSize)
            )
            box.castShadow = true
            singleShelf.add(box)
          }
        }
      }

      shelfGroup.add(singleShelf)
    }

    this.add(shelfGroup)
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(20, 30, 20)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -40
    directionalLight.shadow.camera.right = 40
    directionalLight.shadow.camera.top = 40
    directionalLight.shadow.camera.bottom = -40
    this.add(directionalLight)

    const pointLightPositions = [
      [-15, 8, -15],
      [15, 8, -15],
      [-15, 8, 15],
      [15, 8, 15]
    ]

    pointLightPositions.forEach((pos, index) => {
      const pointLight = new THREE.PointLight(0xffffff, 0.6, 30)
      pointLight.position.set(pos[0], pos[1], pos[2])
      pointLight.castShadow = true
      pointLight.shadow.mapSize.width = 512
      pointLight.shadow.mapSize.height = 512
      pointLight.name = `shopLight-${index + 1}`
      this.add(pointLight)

      const lightGeometry = new THREE.CylinderGeometry(0.5, 0.3, 0.8, 16)
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffaa,
        emissiveIntensity: 0.8
      })
      const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
      lightMesh.position.set(pos[0], pos[1] - 0.4, pos[2])
      this.add(lightMesh)
    })
  }

  getWorkstation(index) {
    return this.workstations[index - 1]
  }
}
