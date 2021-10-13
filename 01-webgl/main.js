import { scene01, scene02 } from './scene.js'

const canvas = document.querySelector('#glcanvas')
canvas.width = document.body.clientWidth
canvas.height = document.body.clientHeight
const gl = canvas.getContext('webgl')
if (!gl) {
  alert('无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。')
} else {
  scene02(gl)
}
