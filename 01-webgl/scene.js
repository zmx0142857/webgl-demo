import { initShaderProgram } from './shader.js'
const { mat4 } = window.glMatrix

// 做一些相同工作的基类
class Scene {
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

  perspectiveMatrix () {
    const { gl } = this

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)
    return projectionMatrix
  }

  modelMatrix () {
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create()

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(modelViewMatrix,     // destination matrix
                   modelViewMatrix,     // matrix to translate
                   [-0.0, 0.0, -6.0]);  // amount to translate
    return modelViewMatrix
  }

  initShader (vsId, fsId) {
    const vsSource = document.getElementById(vsId).innerText
    const fsSource = document.getElementById(fsId).innerText
    const { gl } = this
    const program = initShaderProgram(gl, vsSource, fsSource)
    gl.useProgram(program)
    return program
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
    n,                  // pull out n values per iteration
    type,               // the data in the buffer is 32bit floats
    normalize = false,  // don't normalize
    stride = 0,         // how many bytes to get from one set of values to the next
    offset = 0,         // how many bytes inside the buffer to start from; 0 = use type and numComponents above
  }) {
    const { gl } = this
    if (type === undefined) type = gl.FLOAT
    if (buffer) gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(
      attribute,
      n,
      type,
      normalize,
      stride,
      offset
    )
    gl.enableVertexAttribArray(attribute)
  }

  drawArrays (vertexCount, offset = 0) {
    const { gl } = this
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
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
    const image = new Image()
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.bindTexture(gl.TEXTURE_2D, null)
    }
    image.src = src
    return texture
  }
}

// 用深蓝填充缓冲区
export class Scene01 extends Scene {
  render () {
    const { gl } = this
    gl.clearColor(0.1, 0.2, 0.3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
}

// 黑背景 白方块
export class Scene02 extends Scene {
  initShader () {
    const vsSource = `
      attribute vec4 aVertexPosition;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;

      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `
    const fsSource = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `
    const { gl } = this
    const program = initShaderProgram(gl, vsSource, fsSource)

    // Tell WebGL to use our program when drawing
    gl.useProgram(program)

    return {
      aVertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    }
  }

  initBuffers () {
    return {
      position: this.arrayBuffer([
        1.0,  1.0,  0.0,
        -1.0, 1.0,  0.0,
        1.0,  -1.0, 0.0,
        -1.0, -1.0, 0.0
      ])
    }
  }

  render () {
    const { gl } = this
    const programInfo = this.initShader()
    const buffers = this.initBuffers()
    this.clear()

    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 3 })

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, this.modelMatrix())
    this.drawArrays(4)
  }
}


// 给方块着色
export class Scene03 extends Scene {
  initShader () {
    const program = super.initShader('vs-03', 'fs-03')
    const { gl } = this
    return {
      aVertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      aVertexColor: gl.getAttribLocation(program, 'aVertexColor'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    }
  }

  initBuffers () {
    return {
      position: this.arrayBuffer([
        1.0,  1.0,
        -1.0,  1.0,
        1.0, -1.0,
        -1.0, -1.0,
      ]),
      color: this.arrayBuffer([
        1.0,  1.0,  1.0,  1.0,    // 白
        1.0,  0.0,  0.0,  1.0,    // 红
        0.0,  1.0,  0.0,  1.0,    // 绿
        0.0,  0.0,  1.0,  1.0,    // 蓝
      ])
    }
  }

  render () {
    const programInfo = this.initShader()
    const buffers = this.initBuffers()
    const { gl } = this
    this.clear()

    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 2 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { n: 4 })

    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, this.modelMatrix())
    this.drawArrays(4)
  }
}

// 让方块动起来
export class Scene04 extends Scene03 {

  draw (programInfo, squareRotation) {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = this.modelMatrix()
    mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,    // matrix to rotate
              squareRotation,     // amount to rotate in radians
              [0, 0, 1]);         // axis to rotate around

    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, modelViewMatrix)
    this.drawArrays(4)
  }

  render () {
    const programInfo = this.initShader()
    const buffers = this.initBuffers()
    const { gl } = this

    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 2 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { n: 4 })
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())

    const frame = now => {
      requestAnimationFrame(frame) // 异步请求下一帧
      this.draw(programInfo, now * 0.001)
    }
    requestAnimationFrame(frame)
  }
}

// 3D 的立方体
export class Scene05 extends Scene04 {
  initBuffers () {
    const position = [
      // Front face
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ]

    const color = [
      [1.0,  1.0,  1.0,  1.0],    // Front face: white
      [1.0,  0.0,  0.0,  1.0],    // Back face: red
      [0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0]     // Left face: purple
    ].reduce((acc, face) => {
      // 每一行重复 4 次, 然后全部压扁
      for (let v = 0; v < 4; ++v)
        acc.push(...face)
      return acc
    }, [])

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    const index = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23    // left
    ]

    return {
      position: this.arrayBuffer(position),
      color: this.arrayBuffer(color),
      index: this.elementBuffer(index)
    }
  }

  draw (programInfo, squareRotation) {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = this.modelMatrix()
    mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,    // matrix to rotate
              squareRotation,     // amount to rotate in radians
              [0, 1, 1]);         // axis to rotate around

    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, modelViewMatrix)

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
  }

  render () {
    const programInfo = this.initShader()
    const buffers = this.initBuffers()
    const { gl } = this

    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 3 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { n: 4 })
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)

    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())

    const frame = now => {
      requestAnimationFrame(frame) // 异步请求下一帧
      this.draw(programInfo, now * 0.001)
    }
    requestAnimationFrame(frame)
  }
}

// 带纹理的立方体
export class Scene06 extends Scene05 {
  initShader () {
    const { gl } = this
    const program = Scene.prototype.initShader.call(this, 'vs-06', 'fs-06')

    return {
      program,
      aVertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      aTextureCoord: gl.getAttribLocation(program, 'aTextureCoord'),
      uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
    }
  }

  initBuffers () {
    // 纹理坐标的取值范围是 0 到 1
    const texture = [
      // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0
    ]

    return {
      ...super.initBuffers(),
      texture: this.arrayBuffer(texture)
    }
  }

  render () {
    const programInfo = this.initShader()
    const buffers = this.initBuffers()
    console.log(buffers)
    const { gl } = this

    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 3 })
    this.setAttr(programInfo.aTextureCoord, null, { n: 2 })

    gl.activeTexture(gl.TEXTURE0); // GL 最多可同时注册32张纹理；gl.TEXTURE0 是第一张。
    gl.bindTexture(gl.TEXTURE_2D, this.initTexture('cubetexture.png'));
    gl.uniform1i(gl.getUniformLocation(programInfo.program, 'uSampler'), 0)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)

    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())

    const frame = now => {
      requestAnimationFrame(frame) // 异步请求下一帧
      this.draw(programInfo, now * 0.001)
    }
    requestAnimationFrame(frame)
  }
}
