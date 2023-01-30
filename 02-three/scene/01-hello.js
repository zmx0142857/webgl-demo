import * as THREE from 'three'

// 两条线段组成 ^ 形
export default function scene01 (app) {
  const material = new THREE.LineBasicMaterial({ color: 0x66ccff })
  const points = [
    [-10, 0, 0],
    [0, 10, 0],
    [10, 0, 0]
  ].map(point => new THREE.Vector3(...point))
  const geometry = new THREE.BufferGeometry().setFromPoints( points )
  const line = new THREE.Line(geometry, material)
  app.add(line)
  app.render()
}
