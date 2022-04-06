import * as THREE from 'three'
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import scene from './15-my-geometry.js'

const noop = () => {}

function getApp (options) {
  const { width, height } = options

  // renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  const canvas = renderer.domElement
  document.body.appendChild(canvas)

  // camera
  const cameraConfig = {
    angle: 45,
    near: 0.1,
    far: 1000,
    distance: 100,
    ...(options.camera || {}),
  }
  const camera = new THREE.PerspectiveCamera(
    cameraConfig.angle,
    width / height, // aspect ratio
    cameraConfig.near,
    cameraConfig.far
  )
  camera.position.z = cameraConfig.distance

  // scene
  const scene = new THREE.Scene()

  return {
    canvas,

    // three.js 的三要素
    renderer,
    camera,
    scene,

    // 实用方法
    render () {
      renderer.render(this.scene, this.camera)
    },
    add (...args) {
      this.scene.add(...args)
    },
    // 动画主循环
    animate (callback = noop) {
      const frame = time => {
        requestAnimationFrame(frame)
        this.responsive()
        callback(time * 0.001)
        this.render()
      }
      requestAnimationFrame(frame)
    },
    // 响应窗口变化
    responsive () {
      const canvas = this.renderer.domElement
      // const pixelRatio = window.devicePixelRatio // 设备像素比
      const pixelRatio = 1 // 在高分辨率屏幕上, 仍以原分辨率渲染, 以节约资源
      const width = canvas.clientWidth * pixelRatio | 0 // 向零取整
      const height = canvas.clientHeight * pixelRatio | 0
      if (canvas.width !== width || canvas.height !== height) {
        this.renderer.setSize(width, height, false)
        this.updateCamera(width, height)
      }
    },
    // 平行光与环境光
    lightOn (x = 400, y = 200, z = 300) {
      const intensity = 1
      const light = new THREE.DirectionalLight(0xffffff, intensity)
      light.position.set(x, y, z)
      this.add(light)

      const ambient = new THREE.AmbientLight(0x444444)
      this.add(ambient)
    },
    // 如果实际大小与缓冲区大小不符, 则用 setSize 改变缓冲区大小
    // setSize 默认通过 css 改变画布的实际大小, 但不会改变缓冲区大小
    // 如果要改变缓冲区大小, 需要设置第三个参数为 false
    updateCamera (width, height) {
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
    },
    orbitControl (x = 0, y = 5, z = 0) {
      const controls = new OrbitControls(this.camera, this.canvas)
      controls.target.set(x, y, z)
      controls.update()
      return controls
    },
  }
}

// 检查兼容性
if (!WEBGL.isWebGL2Available()) {
  alert('your browser does not support WebGL 2')
} else {
  const app = getApp({
    width: window.innerWidth,
    height: window.innerHeight,
    // camera: {
    //   angle: 45,
    //   near: 1,
    //   far: 500,
    //   distance: 100,
    // }
  })
  scene(app)
}
