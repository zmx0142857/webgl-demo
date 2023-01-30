import * as THREE from 'three'
import { WEBGL } from 'three/examples/jsm/WebGL.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as Scene from './scene'

const noop = () => {}

function getApp (options) {
  const { width, height } = options

  const canvas = document.getElementById('canvas')

  // renderer
  const renderer = new THREE.WebGLRenderer({ canvas })
  canvas.width = width
  canvas.height = height
  renderer.setSize(width, height)

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
        if (this.isPlaying) requestAnimationFrame(frame)
        this.responsive()
        callback(time * 0.001)
        this.render()
      }
      this.isPlaying = true
      requestAnimationFrame(frame)
    },
    dispose () {
      this.isPlaying = false
      this.scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose()
        }
      })
      this.scene.clear()
      this.renderer.clear()
      this.gui?.destroy()
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

const newApp = () => getApp({
  width: window.innerWidth,
  height: window.innerHeight,
  // camera: {
  //   angle: 45,
  //   near: 1,
  //   far: 500,
  //   distance: 100,
  // }
})

let app
function play () {
  let id = location.hash.slice(1) || '01'
  console.log(id)
  if (app === undefined) {
    app = newApp()
  } else if (app.isPlaying) {
    app.dispose()
    app = newApp()
  }
  // 等待上一个动画完全停止后, 再开启当前场景
  setTimeout(() => {
    const scene = Scene['Scene' + id]
    scene(app)
  }, 100)
}

function initBtns () {
  const frag = document.createDocumentFragment()
  const btnGroup = document.getElementById('router')
  btnGroup.innerHTML = ''
  const sceneCount = Object.keys(Scene).length
  for (let i = 1; i <= sceneCount; ++i) {
    const btn = document.createElement('a')
    const id = i.toString().padStart(2, '0')
    btn.id = btn.textContent = id
    btn.href = '#' + id
    frag.appendChild(btn)
  }
  btnGroup.appendChild(frag)
}

// 检查兼容性
if (!WEBGL.isWebGL2Available()) {
  alert('your browser does not support WebGL 2')
} else {
  initBtns()
  window.onhashchange = play
  app = newApp()
  play()
}
