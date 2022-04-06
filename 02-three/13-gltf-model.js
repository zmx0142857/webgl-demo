import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

let cars

export default function scene13 (app) {
  app.renderer.outputEncoding = THREE.sRGBEncoding
  app.camera.position.set(0, 10, 20)

  const controls = new OrbitControls(app.camera, app.canvas)
  controls.target.set(0, 5, 0)
  controls.update()

  {
    const planeSize = 40

    const loader = new THREE.TextureLoader()
    const texture = loader.load('checker.png')
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    const repeats = planeSize / 2
    texture.repeat.set(repeats, repeats)

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(planeGeo, planeMat)
    mesh.rotation.x = Math.PI * -.5
    app.scene.add(mesh)
  }

  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 0.6
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    app.scene.add(light)
  }

  {
    const color = 0xFFFFFF
    const intensity = 0.8
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(5, 10, 2)
    app.scene.add(light)
    app.scene.add(light.target)
  }

  {
    const gltfLoader = new GLTFLoader()
    gltfLoader.load('models/lopoly-city/scene.gltf', (gltf) => {
      const root = gltf.scene
      app.scene.add(root)
      // console.log(dumpObject(root).join('\n'))
      cars = root.getObjectByName('Cars')

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root)

      const boxSize = box.getSize(new THREE.Vector3()).length()
      const boxCenter = box.getCenter(new THREE.Vector3())

      // set the camera to frame the box
      frameArea(boxSize * 0.5, boxSize, boxCenter, app.camera)

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10
      controls.target.copy(boxCenter)
      controls.update()
    })
  }

  app.animate(time => {
    if (cars) {
      cars.children.forEach(car => car.rotation.y = time)
    }
  })
}

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5)
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY)
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize()

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter))

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100
  camera.far = boxSize * 100

  camera.updateProjectionMatrix()

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z)
}

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}
