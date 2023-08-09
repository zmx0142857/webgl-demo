import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

async function getPoints () {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = 'texture/ccbc12-1817.webp'
    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      ctx.drawImage(image, 0, 0, image.width, image.height)
      const data = ctx.getImageData(0, 0, image.width, image.height).data
      console.log(data)
      const points = []
      for (let i = 0; i < data.length; i += 4) {
        points.push(data[i], data[i+1], data[i+2])
      }
      resolve(points)
    }
  })
}

// 点云
export default async function scene17 (app) {
  app.camera.position.set(-255, -255, -255)
  const controls = new OrbitControls(app.camera, app.canvas)
  controls.target.set(180, 180, 180);
  controls.update();

  const material = new THREE.PointsMaterial({ size: 4, color: 0xffffff })
  const geometry = new THREE.BufferGeometry()
  const points = await getPoints()

  geometry.attributes.position = new THREE.Float32BufferAttribute(points, 3)
  const cloud = new THREE.Points(geometry, material)
  app.add(cloud)
  // app.render()
  app.animate()
}
