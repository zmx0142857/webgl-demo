import * as THREE from 'three'

// 转动的方块
export default function scene02 (app) {
  app.camera.position.z = 10
  const geometry = new THREE.BoxGeometry()
  // const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }) // 无光泽
  const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }) // 有光泽
  const cube = new THREE.Mesh(geometry, material)
  app.add(cube)
  app.lightOn(-1, 2, 4)
  app.animate(() => {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
  })
}
