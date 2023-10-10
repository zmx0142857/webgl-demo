import * as Scene from './scene/index.js'

let isPlaying = false, props

async function main() {
  const adapter = await navigator.gpu?.requestAdapter() // adapter represents the GPU itself
  const device = await adapter?.requestDevice() // device represents an instance of the API on that GPU
  if (!device) return alert('webgpu is not supported')

  const format = navigator.gpu.getPreferredCanvasFormat(adapter)
  const canvas = document.getElementById('canvas')
  const context = canvas.getContext('webgpu')
  context.configure({ device, format })

  props = {
    device,
    canvas,
    context,
    format,
    // these are filled out in resizeToDisplaySize
    renderTarget: undefined,
    renderTargetView: undefined,
    depthTexture: undefined,
    depthTextureView: undefined,
    sampleCount: 4,  // can be 1 or 4
    animate,
  }

  initBtns()
  window.onhashchange = play
  play()
}

const between = (value, min, max) => Math.max(min, Math.min(max, value))

function resizeToDisplaySize(props) {
  const { device, canvas, renderTarget, format, depthTexture, sampleCount } = props
  const maxSize = device.limits.maxTextureDimension2D
  const width = between(canvas.clientWidth, 1, maxSize)
  const height = between(canvas.clientHeight, 1, maxSize)

  const needResize = !renderTarget || width !== canvas.width || height !== canvas.height
  if (!needResize) return false
  if (renderTarget) renderTarget.destroy()
  if (depthTexture) depthTexture.destroy()
  canvas.width = width
  canvas.height = height

  if (sampleCount > 1) {
    const newRenderTarget = device.createTexture({
      size: [width, height],
      format,
      sampleCount,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    props.renderTarget = newRenderTarget
    props.renderTargetView = newRenderTarget.createView()
  }

  const newDepthTexture = device.createTexture({
    size: [width, height],
    format: 'depth24plus',
    sampleCount,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })
  props.depthTexture = newDepthTexture
  props.depthTextureView = newDepthTexture.createView()
  return true
}

function animate(render) {
  function loop(time) {
    if (isPlaying) requestAnimationFrame(loop)
    resizeToDisplaySize(props)
    render(time * 0.001)
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
    resizeToDisplaySize(props)
    Scene['Scene' + id](props)
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

main()