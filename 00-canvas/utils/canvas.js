import Color from './color'

export const canvas = document.getElementById('canvas')
export const ctx = canvas.getContext('2d')

ctx.fillStyle = '#ace'
ctx.strokeStyle = '#29f'
ctx.font = '14px sans serif'
canvas.fillColor = Color.fromStr(ctx.fillStyle).toArr()
canvas.strokeColor = Color.fromStr(ctx.strokeStyle).toArr()
canvas.isPlaying = false

// methods
canvas.clear = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

canvas.fadeout = function () {
  const savedStyle = ctx.fillStyle
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = savedStyle
}

canvas.draw = function (sprites) {
  canvas.clear()
  sprites.forEach(function (s) {
    s.draw(ctx)
  })
}

canvas.onChangeScene = function () {}

canvas.play = function (sprites) {
  canvas.clear()
  function loop() {
    //canvas.fadeout()
    canvas.clear()
    sprites.forEach(function (s) {
      s.draw(ctx)
      s.update()
    })
    canvas.isPlaying ? requestAnimationFrame(loop) : canvas.onChangeScene()
  }
  loop()
}

canvas.save = function () {
  const a = document.createElement('a')
  a.download = 'untitled.png'
  a.href = canvas.toDataURL()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

canvas.load = function (src) {
  var img = new Image()
  //img.crossOrigin = 'anonymous'
  img.src = src
  img.onload = function() {
    ctx.drawImage(img, 0, 0)
    img.style.display = 'none'
  }
}

canvas.getPixel = function (x, y) {
  return ctx.getImageData(x, y, 1, 1).data
}

canvas.setPixel = function (x, y, color = canvas.strokeColor) {
  const imageData = ctx.getImageData(x, y, 1, 1)
  const data = imageData.data
  if (color instanceof Color) color = color.toArr()
  for (let i = 0; i < 4; ++i) data[i] = color[i]
  ctx.putImageData(imageData, x, y)
}

canvas.fromClient = function (e) {
  const container = document.body
  var x = e.clientX - (this.offsetLeft - container.scrollLeft)
  var y = e.clientY - (this.offsetTop - container.scrollTop)
  return [x, y]
}

canvas.between = function (x, y) {
  return [
    Math.min(Math.max(x, 0), canvas.width),
    Math.min(Math.max(y, 0), canvas.height)
  ]
}
