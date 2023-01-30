import * as Scene from './scene'
import { canvas, ctx } from './utils/canvas'

function playScene() {
  ctx.camera = null

  const id = location.hash.slice(1)
  if (!id) return
  const scene = new Scene['Scene' + id]({
    height: canvas.height,
    width: canvas.width,
  })

  canvas.onChangeScene = scene.update ? function () {
    canvas.isPlaying = true
    canvas.play([scene])
  } : function () {
    canvas.draw([scene])
  }

  if (canvas.isPlaying) {
    canvas.isPlaying = false
  } else {
    canvas.onChangeScene()
    canvas.onChangeScene = function debug () {
      console.log(scene.data)
    }
  }
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

function main() {
  initBtns()
  window.onhashchange = playScene
  playScene()
}

main()