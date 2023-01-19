function loadShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('error compiling shader: ' + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('error linking shader program: ' + gl.getProgramInfoLog(shaderProgram))
    return null
  }
  return shaderProgram
}

export function loadVideo (src) {
  const video = document.createElement('video')

  let playing = false
  let timeupdate = false

  function checkReady() {
    if (playing && timeupdate) {
      video.isReady = true
    }
  }

  // Waiting for these 2 events ensures
  // there is data in the video
  video.addEventListener('playing', function() {
    playing = true
    checkReady()
  }, true)

  video.addEventListener('timeupdate', function() {
    timeupdate = true
    checkReady()
  }, true)

  // 自动循环播放 (静音)
  video.autoplay = true
  video.muted = true
  video.loop = true
  video.src = src
  video.play()
  return video
}
