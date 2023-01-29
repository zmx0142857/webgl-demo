import { initShaderProgram } from './utils.js'
const { mat4 } = window.glMatrix

export default class Scene {
  constructor (gl) {
    this.gl = gl
  }

  clear () {
    const { gl } = this
    gl.clearColor(0.0, 0.0, 0.0, 1.0)   // Clear to black, fully opaque
    gl.clearDepth(1.0)                  // Clear everything
    gl.enable(gl.DEPTH_TEST)            // Enable depth testing
    gl.depthFunc(gl.LEQUAL)             // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  perspectiveMatrix ({
    fov = 45 * Math.PI / 180, // in radians
    near = 0.1,
    far = 100,
  } = {}) {
    const { gl } = this

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const projectionMatrix = mat4.create()
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fov, aspect, near, far)
    return projectionMatrix
  }

  onResize (width, height) {
    canvas.width = width
    canvas.height = height
    const { gl, programInfo } = this
    gl.viewport(0, 0, width, height)
    // updateProjectionMatrix
    if (programInfo?.uProjectionMatrix) {
      gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
    }
  }

  modelViewMatrix ({
    translate = [0.0, 0.0, -6.0],
  } = {}) {
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create()

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    /**
     * @param dest destination matrix
     * @param src matrix to translate
     * @param offset amount to translate
     */
    mat4.translate(modelViewMatrix, modelViewMatrix, translate)
    return modelViewMatrix
  }

  loadShaderById (vsId, fsId) {
    const vsSource = document.getElementById(vsId).innerText
    const fsSource = document.getElementById(fsId).innerText
    const { gl } = this
    const program = initShaderProgram(gl, vsSource, fsSource)
    gl.useProgram(program)
    return program
  }

  async loadShaderByAjax (vsUrl, fsUrl) {
    const [vsSource, fsSource] = await Promise.all([
      fetch(vsUrl).then(res => res.text()),
      fetch(fsUrl).then(res => res.text()),
    ])
    const { gl } = this
    const program = initShaderProgram(gl, vsSource, fsSource)
    gl.useProgram(program)
    return program
  }

  initProgramInfo (program, config) {
    const programInfo = {}
    const { gl } = this
    Object.keys(config).forEach(key => {
      switch (config[key]) {
        case 'attribute': return programInfo[key] = gl.getAttribLocation(program, key)
        case 'uniform': return programInfo[key] = gl.getUniformLocation(program, key)
        default: break
      }
    })
    return programInfo
  }

  arrayBuffer (arr) {
    const { gl } = this
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer) // or WebGLRenderingContext.ARRAY_BUFFER
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW)
    return buffer
  }

  elementBuffer (arr) {
    const { gl } = this
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), gl.STATIC_DRAW)
    return buffer
  }

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setAttr (attribute, buffer, {
    count,              // number of values pulled out per iteration
    type,               // the data in the buffer is 32bit floats
    normalize = false,  // don't normalize
    stride = 0,         // how many bytes to get from one set of values to the next
    offset = 0,         // how many bytes inside the buffer to start from; 0 = use type and numComponents above
  }) {
    const { gl } = this
    if (buffer) gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(
      attribute,
      count,
      type ?? gl.FLOAT,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(attribute)
  }

  drawArrays (vertexCount, { offset = 0, type } = {}) {
    const { gl } = this
    type = type ?? gl.TRIANGLE_STRIP
    gl.drawArrays(type, offset, vertexCount)
  }

  drawElements (vertexCount, { offset = 0, type } = {}) {
    const { gl } = this
    type = type ?? gl.TRIANGLES
    gl.drawElements(type, vertexCount, gl.UNSIGNED_SHORT, offset)
  }

  tempTexture (texture) {
    const { gl } = this
    // 图片下载完成前, 临时显示的图片
    const level = 0
    const internalFormat = gl.RGBA
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    const width = 1
    const height = 1
    const border = 0
    const pixel = new Uint8Array([100, 100, 100, 255])  // grey
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      width, height, border, srcFormat, srcType,
      pixel)
  }

  // 注意纹理大小应该是 2 的幂, 否则会受到限制
  // // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // // Prevents s-coordinate wrapping (repeating).
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // // Prevents t-coordinate wrapping (repeating).
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  initTexture (src) {
    const { gl } = this
    const texture = gl.createTexture()
    this.tempTexture(texture)

    const isPowerOf2 = value => (value & (value - 1)) === 0
    const image = new Image()
    image.onload = () => {
      this.updateTexture(texture, image)
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
      } else {
        console.warn('texture is not power of 2:', src)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    }
    image.src = src
    return texture
  }

  initVideoTexture () {
    const { gl } = this
    const texture = gl.createTexture()
    this.tempTexture(texture)

    // Turn off mips and set  wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    return texture
  }

  updateTexture (texture, image) {
    const { gl } = this
    const level = 0
    const internalFormat = gl.RGBA
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image)
  }

  setTexture (uniform, texture, textureId) {
    const { gl } = this
    // GL 最多可同时注册32张纹理；gl.TEXTURE0 是第一张。
    if (textureId === undefined) textureId = gl.TEXTURE0
    gl.activeTexture(textureId)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(uniform, 0)
  }

  update (callback) {
    const canvas = window.canvas
    canvas.isPlaying = true

    const frame = now => {
      // 异步请求下一帧
      if (canvas.isPlaying) requestAnimationFrame(frame)
      callback(now)
    }
    requestAnimationFrame(frame)
  }
}
