import * as Scene from './scene/index.js'
import * as twgl from 'twgl.js'

const gl = document.getElementById('canvas').getContext('webgl')
window.gl = gl
let isPlaying = false
if (!gl) {
  alert('无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。')
} else {
  initBtns()
  window.onhashchange = play
  play()
}

function animate(callback) {
  function loop(time) {
    if (isPlaying) requestAnimationFrame(loop)
    twgl.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    callback(time * 0.001)
  }
  requestAnimationFrame(loop)
}

function play () {
  let id = location.hash.slice(1) || '01'
  console.log(id)
  isPlaying = false

  // 等待上一个动画完全停止后, 再开启当前场景
  setTimeout(() => {
    isPlaying = true
    Scene['Scene' + id](gl, animate)
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
