import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'

export default class RobotArm extends THREE.Group {
  constructor() {
    super()
    this.joints = {}
    this.isWelding = false
    this.init()
  }

  init() {
    this.createBase()
    this.createJoint1()
    this.createJoint2()
    this.createEndEffector()
  }

  createBase() {
    const baseGeometry = new THREE.CylinderGeometry(0.8, 1, 0.4, 24)
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.3
    })
    const base = new THREE.Mesh(baseGeometry, baseMaterial)
    base.position.y = 0.2
    base.castShadow = true
    base.receiveShadow = true
    base.name = 'base'
    this.add(base)

    const basePlateGeometry = new THREE.BoxGeometry(1.6, 0.1, 1.6)
    const basePlate = new THREE.Mesh(basePlateGeometry, baseMaterial)
    basePlate.position.y = 0.45
    basePlate.castShadow = true
    this.add(basePlate)
  }

  createJoint1() {
    const joint1Group = new THREE.Group()
    joint1Group.name = 'joint1'
    joint1Group.position.y = 0.5

    const shoulderGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.7,
      roughness: 0.3
    })
    const shoulder = new THREE.Mesh(shoulderGeometry, armMaterial)
    shoulder.position.y = 0.4
    shoulder.castShadow = true
    joint1Group.add(shoulder)

    const arm1Geometry = new THREE.BoxGeometry(0.4, 2, 0.4)
    const arm1 = new THREE.Mesh(arm1Geometry, armMaterial)
    arm1.position.y = 1.8
    arm1.castShadow = true
    joint1Group.add(arm1)

    const joint1ConnectorGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const joint1Connector = new THREE.Mesh(joint1ConnectorGeometry, armMaterial)
    joint1Connector.position.y = 2.8
    joint1Connector.castShadow = true
    joint1Group.add(joint1Connector)

    this.joints.joint1 = joint1Group
    this.add(joint1Group)
  }

  createJoint2() {
    const joint2Group = new THREE.Group()
    joint2Group.name = 'joint2'
    joint2Group.position.set(0, 2.8, 0)

    const arm2Geometry = new THREE.BoxGeometry(0.35, 1.8, 0.35)
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0xff8800,
      metalness: 0.7,
      roughness: 0.3
    })
    const arm2 = new THREE.Mesh(arm2Geometry, armMaterial)
    arm2.position.y = 0.9
    arm2.castShadow = true
    joint2Group.add(arm2)

    const joint2ConnectorGeometry = new THREE.SphereGeometry(0.25, 16, 16)
    const joint2Connector = new THREE.Mesh(joint2ConnectorGeometry, armMaterial)
    joint2Connector.position.y = 1.8
    joint2Connector.castShadow = true
    joint2Group.add(joint2Connector)

    this.joints.joint2 = joint2Group
    this.joints.joint1.add(joint2Group)
  }

  createEndEffector() {
    const endEffectorGroup = new THREE.Group()
    endEffectorGroup.name = 'endEffector'
    endEffectorGroup.position.set(0, 1.8, 0)

    const wristGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3)
    const wristMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.8,
      roughness: 0.2
    })
    const wrist = new THREE.Mesh(wristGeometry, wristMaterial)
    wrist.castShadow = true
    endEffectorGroup.add(wrist)

    const torchGeometry = new THREE.ConeGeometry(0.1, 0.5, 8)
    const torchMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1
    })
    const torch = new THREE.Mesh(torchGeometry, torchMaterial)
    torch.position.y = -0.4
    torch.rotation.x = Math.PI
    torch.castShadow = true
    endEffectorGroup.add(torch)

    const tipGeometry = new THREE.SphereGeometry(0.06, 8, 8)
    const tipMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4400,
      emissive: 0xff2200,
      emissiveIntensity: 0.5
    })
    const tip = new THREE.Mesh(tipGeometry, tipMaterial)
    tip.position.y = -0.65
    tip.name = 'weldingTip'
    endEffectorGroup.add(tip)

    this.joints.endEffector = endEffectorGroup
    this.joints.joint2.add(endEffectorGroup)

    this.weldingTip = tip
    this.weldingLight = new THREE.PointLight(0xff6600, 0, 5)
    this.weldingLight.position.set(0, -0.65, 0)
    endEffectorGroup.add(this.weldingLight)
  }

  rotateJoints(joint1Angle, joint2Angle, endEffectorAngle) {
    if (joint1Angle !== undefined) {
      this.joints.joint1.rotation.z = joint1Angle
    }
    if (joint2Angle !== undefined) {
      this.joints.joint2.rotation.z = joint2Angle
    }
    if (endEffectorAngle !== undefined) {
      this.joints.endEffector.rotation.z = endEffectorAngle
    }
  }

  doWelding(duration = 2000) {
    if (this.isWelding) return

    this.isWelding = true

    const originalJ1 = this.joints.joint1.rotation.z
    const originalJ2 = this.joints.joint2.rotation.z
    const originalEE = this.joints.endEffector.rotation.z

    new TWEEN.Tween(this.joints.joint1.rotation)
      .to({ z: -0.5 }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    new TWEEN.Tween(this.joints.joint2.rotation)
      .to({ z: 1.2 }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    new TWEEN.Tween(this.joints.endEffector.rotation)
      .to({ z: -0.5 }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        this.startWeldingEffect()

        new TWEEN.Tween(this.joints.joint1.rotation)
          .to({ z: -0.3 }, duration / 2)
          .easing(TWEEN.Easing.Linear.None)
          .yoyo(true)
          .repeat(3)
          .start()

        new TWEEN.Tween(this.joints.joint2.rotation)
          .to({ z: 1.0 }, duration / 2)
          .easing(TWEEN.Easing.Linear.None)
          .yoyo(true)
          .repeat(3)
          .onComplete(() => {
            this.stopWeldingEffect()

            new TWEEN.Tween(this.joints.joint1.rotation)
              .to({ z: originalJ1 }, 500)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start()

            new TWEEN.Tween(this.joints.joint2.rotation)
              .to({ z: originalJ2 }, 500)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .start()

            new TWEEN.Tween(this.joints.endEffector.rotation)
              .to({ z: originalEE }, 500)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onComplete(() => {
                this.isWelding = false
              })
              .start()
          })
          .start()
      })
      .start()
  }

  startWeldingEffect() {
    if (this.weldingLight) {
      this.weldingLight.intensity = 2
    }
    if (this.weldingTip) {
      this.weldingTip.material.emissiveIntensity = 2
    }
    this.sparkInterval = setInterval(() => {
      this.createSpark()
    }, 50)
  }

  stopWeldingEffect() {
    if (this.weldingLight) {
      this.weldingLight.intensity = 0
    }
    if (this.weldingTip) {
      this.weldingTip.material.emissiveIntensity = 0.5
    }
    if (this.sparkInterval) {
      clearInterval(this.sparkInterval)
      this.sparkInterval = null
    }
  }

  createSpark() {
    const sparkGeometry = new THREE.SphereGeometry(0.03, 4, 4)
    const sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00
    })
    const spark = new THREE.Mesh(sparkGeometry, sparkMaterial)
    
    const tipWorldPos = new THREE.Vector3()
    this.weldingTip.getWorldPosition(tipWorldPos)
    spark.position.copy(tipWorldPos)

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      -Math.random() * 0.15,
      (Math.random() - 0.5) * 0.1
    )

    this.parent.add(spark)

    let life = 0
    const animateSpark = () => {
      life += 0.016
      spark.position.add(velocity)
      velocity.y -= 0.002
      spark.material.opacity = 1 - life * 3
      spark.material.transparent = true

      if (life < 0.5) {
        requestAnimationFrame(animateSpark)
      } else {
        this.parent.remove(spark)
        spark.geometry.dispose()
        spark.material.dispose()
      }
    }
    animateSpark()
  }

  reset() {
    this.rotateJoints(0, 0, 0)
    this.stopWeldingEffect()
    this.isWelding = false
  }
}
