import Scene from '../scene.js'
import fData from '../model/f.js'
// import { mat4 } from 'gl-matrix'
const { mat4 } = window.glMatrix

// F 模型, 点光源
export default class Scene09 extends Scene {
  async initShader () {
    const program = await this.loadShaderByAjax(
      'shader/point-light.vs.glsl',
      'shader/point-light.fs.glsl',
    )

    return this.initProgramInfo(program, {
      aPosition: 'attribute',
      aNormal: 'attribute',
      uColor: 'uniform',
      uLightPosition: 'uniform',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
      uNormalMatrix: 'uniform',
    })
  }

  initBuffers () {
    return {
      position: this.arrayBuffer(fData.position),
      normal: this.arrayBuffer(fData.normal),
    }
  }

  initAttr () {
    const { gl, programInfo, buffers } = this

    this.setAttr(programInfo.aPosition, buffers.position, { count: 3 })
    this.setAttr(programInfo.aNormal, buffers.normal, { count: 3 })

    gl.uniform4fv(programInfo.uColor, [0.2, 1, 0.2, 1]) // green
    gl.uniform3fv(programInfo.uLightPosition, [20, 30, -60])
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix({ far: 5000 }))
  }

  draw = (now) => {
    this.clear()
    const { gl, programInfo } = this

    // add rotation
    const modelViewMatrix = this.modelViewMatrix({ translate: [0, 0, -500] })
    mat4.rotate(modelViewMatrix, modelViewMatrix, now * 0.001, [0, 1, 0]);
    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, modelViewMatrix)

    // light
    const normalMatrix = modelViewMatrix
    mat4.invert(normalMatrix, normalMatrix)
    mat4.transpose(normalMatrix, normalMatrix)
    gl.uniformMatrix4fv(programInfo.uNormalMatrix, false, normalMatrix)

    // we are not using element array buffer,
    // so we call drawArrays instead of drawElements
    this.drawArrays(fData.position.length / 3, {
      type: gl.TRIANGLES
    })
  }

  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.initAttr()
    this.update(this.draw)
  }
}