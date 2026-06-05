import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class SceneControls {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement
    this.controls = null
    this.defaultPosition = new THREE.Vector3(30, 25, 30)
    this.defaultTarget = new THREE.Vector3(0, 0, 0)
    this.init()
  }

  init() {
    this.controls = new OrbitControls(this.camera, this.domElement)

    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05

    this.controls.minPolarAngle = 0.1
    this.controls.maxPolarAngle = Math.PI / 2.2

    this.controls.minDistance = 5
    this.controls.maxDistance = 100

    this.controls.enablePan = true
    this.controls.screenSpacePanning = false

    this.controls.rotateSpeed = 0.5
    this.controls.zoomSpeed = 0.8
    this.controls.panSpeed = 0.6

    this.controls.target.copy(this.defaultTarget)
    this.camera.position.copy(this.defaultPosition)
    this.controls.update()
  }

  update() {
    if (this.controls) {
      this.controls.update()
    }
  }

  resetView() {
    new TWEEN.Tween(this.camera.position)
      .to({
        x: this.defaultPosition.x,
        y: this.defaultPosition.y,
        z: this.defaultPosition.z
      }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    new TWEEN.Tween(this.controls.target)
      .to({
        x: this.defaultTarget.x,
        y: this.defaultTarget.y,
        z: this.defaultTarget.z
      }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        this.controls.update()
      })
      .start()
  }

  setDefaultPosition(position, target) {
    if (position) {
      this.defaultPosition.copy(position)
    }
    if (target) {
      this.defaultTarget.copy(target)
    }
  }

  focusOn(target, distance = 10, height = 5) {
    const targetPos = new THREE.Vector3()
    if (target instanceof THREE.Vector3) {
      targetPos.copy(target)
    } else if (target.position) {
      targetPos.copy(target.position)
    }

    const newCameraPos = new THREE.Vector3(
      targetPos.x + distance,
      targetPos.y + height,
      targetPos.z + distance
    )

    new TWEEN.Tween(this.camera.position)
      .to({
        x: newCameraPos.x,
        y: newCameraPos.y,
        z: newCameraPos.z
      }, 800)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start()

    new TWEEN.Tween(this.controls.target)
      .to({
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z
      }, 800)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        this.controls.update()
      })
      .start()
  }

  setEnabled(enabled) {
    if (this.controls) {
      this.controls.enabled = enabled
    }
  }

  dispose() {
    if (this.controls) {
      this.controls.dispose()
      this.controls = null
    }
  }
}
