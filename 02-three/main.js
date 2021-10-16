import * as THREE from 'three'
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import scene03 from './scene03.js'
import scene04 from './scene04.js'
// import scene05 from './scene05.js'

function getApp (options) {
  const { width, height } = options

  // renderer
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  document.body.appendChild(renderer.domElement)

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
    // three.js 的三要素
    renderer,
    camera,
    scene,

    // 实用方法
    render () {
      renderer.render(scene, camera)
    },
    add: scene.add.bind(scene),
    // 动画主循环
    animate (callback) {
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
      const canvas = renderer.domElement
      // const pixelRatio = window.devicePixelRatio // 设备像素比
      const pixelRatio = 1 // 在高分辨率屏幕上, 仍以原分辨率渲染, 以节约资源
      const width = canvas.clientWidth * pixelRatio | 0 // 向零取整
      const height = canvas.clientHeight * pixelRatio | 0
      // 如果实际大小与缓冲区大小不符, 则用 setSize 改变缓冲区大小
      // setSize 默认通过 css 改变画布的实际大小, 但不会改变缓冲区大小
      // 如果要改变缓冲区大小, 需要设置第三个参数为 false
      if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
    },
    // 平行光
    lightOn (x, y, z) {
      const intensity = 1
      const light = new THREE.DirectionalLight(0xffffff, intensity)
      light.position.set(x, y, z)
      this.add(light)
    }
  }
}

// 两条线段组成 ^ 形
function scene01 (app) {
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

// 转动的方块
function scene02 (app) {
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
  scene04(app)
}
