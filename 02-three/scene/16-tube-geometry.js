import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

class CustomSinCurve extends THREE.Curve {
  constructor(scale = 1) {
    super();
    this.scale = scale;
  }

  getPoint(t, optionalTarget = new THREE.Vector3()) {
    const tx = t * 3 - 1.5;
    const ty = Math.sin(2 * Math.PI * t);
    const tz = 0;
    return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
  }
}


// tube geometry
export default function scene16 (app) {
  Object.assign(app.camera, {
    fov: 40,
    aspect: 2,
    near: 0.1,
    far: 10000,
  })
  app.camera.position.set(0, 10, 10)
  app.camera.lookAt(0, 0, 0)
  const controls = new OrbitControls(app.camera, app.canvas)
  controls.update()

  app.lightOn(-1, -10, -4)
  app.lightOn(-1, 10, 4)

  // mesh
  {
    const path = new CustomSinCurve(10);
    const tubularSegments = 20 // 管道分段
    const radius = 2 // 管道半径
    const radialSegments = 8 // 截面分段
    const isClosed = false // 是否闭合
    // const geometry = new THREE.TubeGeometry(path, tubularSegments, radius, radialSegments, isClosed);
    const geometry = new THREE.TubeGeometry();
    const material = new THREE.MeshPhongMaterial({ color: 0x0088ff, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    app.add(mesh);
  }

  app.animate()
}

