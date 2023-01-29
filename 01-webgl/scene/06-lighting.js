import Scene from '../scene.js'
import Scene05 from './05-rotating-3d.js'
import cubeData from '../model/cube.js'
const { mat4 } = window.glMatrix

// 带有光照的立方体: normal 属性
export default class Scene06 extends Scene05 {
  async initShader () {
    const program = await this.loadShaderByAjax(
      'shader/directional-light.vs.glsl',
      'shader/directional-light.fs.glsl',
    )

    return this.initProgramInfo(program, {
      aVertexPosition: 'attribute',
      aVertexColor: 'attribute',
      aVertexNormal: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
      uNormalMatrix: 'uniform',
    })
  }

  initBuffers () {
    return {
      ...super.initBuffers(),
      normal: this.arrayBuffer(cubeData.normal)
    }
  }

  draw = (now) => {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = this.modelViewMatrix()
    mat4.rotate(modelViewMatrix, modelViewMatrix, now * 0.001, [0, 1, 1]);
    gl.uniformMatrix4fv(this.programInfo.uModelViewMatrix, false, modelViewMatrix)

    // 加入光照法向量, normalMatrix 是 modelViewMatrix 的逆的转置
    const normalMatrix = modelViewMatrix
    mat4.invert(normalMatrix, normalMatrix)
    mat4.transpose(normalMatrix, normalMatrix)
    gl.uniformMatrix4fv(this.programInfo.uNormalMatrix, false, normalMatrix)

    this.drawElements(36)
  }

  initAttr () {
    const { gl, programInfo, buffers } = this

    this.setAttr(programInfo.aVertexPosition, buffers.position, { count: 3 })
    this.setAttr(programInfo.aVertexNormal, buffers.normal, { count: 3 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { count: 4 })

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
  }

  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.initAttr()
    this.update(this.draw)
  }
}
