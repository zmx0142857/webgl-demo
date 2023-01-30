import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

const planeSize = 40
const mtlFile = 'model/windmill/windmill.mtl'
const objFile = 'model/windmill/windmill.obj'
//const planeSize = 4000
//const mtlFile = 'models/windmill2/windmill.mtl'
//const objFile = 'models/windmill2/windmill.obj'

export default function scene12 (app) {
  app.renderer.outputEncoding = THREE.sRGBEncoding
  app.camera.position.set(0, 10, 20)

  const controls = new OrbitControls(app.camera, app.canvas)
  controls.target.set(0, 5, 0)
  controls.update()

  {
    const repeats = 20

    const loader = new THREE.TextureLoader()
    const texture = loader.load('texture/checker.png')
    texture.encoding = THREE.sRGBEncoding
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
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
    light.position.set(0, 10, 0)
    light.target.position.set(-5, 0, 0)
    app.scene.add(light)
    app.scene.add(light.target)
  }

  // load the model (obj and mtl)
  {
    const mtlLoader = new MTLLoader()
    mtlLoader.load(mtlFile, mtl => {
      mtl.preload()
      const material = mtl.materials['Material']
      if (material) material.side = THREE.DoubleSide // let blade doublesided
      const objLoader = new OBJLoader()
      objLoader.setMaterials(mtl)
      objLoader.load(objFile, obj => {
        app.scene.add(obj)
        const boundingBox = new THREE.Box3().setFromObject(obj)
        fitInFrame(app.camera, controls, boundingBox, 1.2)
      })
    })
  }

  app.animate()
}

// 适应模型大小
function fitInFrame(camera, controls, box, sizeToFitOnScreen) {
  const boxSize = box.getSize(new THREE.Vector3()).length()
  const boxCenter = box.getCenter(new THREE.Vector3())
  const halfSizeToFitOnScreen = boxSize * sizeToFitOnScreen * 0.5
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

  // update the Trackball controls to handle the new size
  controls.maxDistance = boxSize * 10;
  controls.target.copy(boxCenter);
  controls.update();
}
