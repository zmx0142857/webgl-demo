function getApp ({ width, height }) {
  // renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement)

  // camera
  const fieldOfView = 75 // degrees
  const aspectRatio = width / height
  const near = 0.1
  const far = 1000
  const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, near, far)
  camera.position.z = 5

  // scene
  const scene = new THREE.Scene()

  return {
    width,
    height,
    renderer,
    camera,
    scene,
    animate (callback) {
      const frame = () => {
        requestAnimationFrame(frame)
        callback()
        renderer.render(scene, camera)
      }
      requestAnimationFrame(frame)
    }
  }
}

const app = getApp({
  width: window.innerWidth,
  height: window.innerHeight
})

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x66ccff })
const cube = new THREE.Mesh(geometry, material)
app.scene.add(cube)
app.animate(() => {
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
})
