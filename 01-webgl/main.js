import * as Scene from './scene.js'

const canvas = window.canvas = document.querySelector('#glcanvas')
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight

const gl = canvas.getContext('webgl')

function play () {
  let id = location.hash.slice(1) || '01'
  console.log(id)
  if (canvas.isPlaying) {
    canvas.isPlaying = false
  }
  // 等待上一个动画完全停止后, 再开启当前场景
  setTimeout(() => {
    new Scene['Scene' + id](gl).render()
  }, 100)
}

function initBtns () {
  const frag = document.createDocumentFragment()
  const btnGroup = document.querySelector('.btn-group')
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

if (!gl) {
  alert('无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。')
} else {
  initBtns()
  window.onhashchange = play
  play()
}
