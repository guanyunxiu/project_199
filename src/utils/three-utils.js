import * as THREE from 'three'

export function createStandardMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.3,
    roughness: 0.4
  })
}

export function createBoxMesh(width, height, depth, color, position) {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const material = createStandardMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  if (position) {
    mesh.position.set(position.x || 0, position.y || 0, position.z || 0)
  }
  return mesh
}

export function createCylinderMesh(radiusTop, radiusBottom, height, color) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32)
  const material = createStandardMaterial(color)
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

export function getCenterPoint(mesh) {
  const center = new THREE.Vector3()
  mesh.geometry.computeBoundingBox()
  mesh.geometry.boundingBox.getCenter(center)
  mesh.localToWorld(center)
  return center
}

export default {
  createStandardMaterial,
  createBoxMesh,
  createCylinderMesh,
  getCenterPoint
}
