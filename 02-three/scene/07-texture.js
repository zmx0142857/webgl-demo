// 纹理示例
import * as THREE from 'three'

export default function scene07 (app) {
  app.camera.position.z = 3
  const cubes = []

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  // BoxGeometry 可以使用6种材料，每个面一个。ConeGeometry
  // 可以使用2种材料，一种用于底部，一种用于侧面。 CylinderGeometry
  // 可以使用3种材料，分别是底部、顶部和侧面。
  // 对于其他情况，你需要建立或加载自定义几何体和（或）修改纹理坐标。
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  const loader = new THREE.TextureLoader()
  // 一般来说，纹理会占用 宽度 * 高度 * 4 * 1.33 字节的内存。
  // 4 = rgba, 1.33 = mipmaps
  const materials = [
    'flower-1.jpg',
    'flower-2.jpg',
    'flower-3.jpg',
    'flower-4.jpg',
    'flower-5.jpg',
    'flower-6.jpg',
  ].map(src => new THREE.MeshBasicMaterial({
    map: loader.load('texture/flower/' + src),
  }))

  const cube = new THREE.Mesh(geometry, materials);
  app.add(cube);
  cubes.push(cube)

  app.animate(time => {
    cubes.forEach((cube, i) => {
      const speed = .2 + i * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });
  })
}
