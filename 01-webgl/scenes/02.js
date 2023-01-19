import Scene from '../scene.js'
import { initShaderProgram } from '../utils.js'

// 黑背景 白方块
export default class Scene02 extends Scene {
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

    return this.initProgramInfo(program, {
      aVertexPosition: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
    })
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
    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, this.modelViewMatrix())
    this.drawArrays(4)
  }
}
