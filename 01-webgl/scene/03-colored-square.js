import Scene from '../utils/scene.js'

// 给方块着色
export default class Scene03 extends Scene {
  async initShader () {
    const program = await this.loadShaderByAjax(
      'shader/basic.vs.glsl',
      'shader/basic.fs.glsl',
    )
    return this.initProgramInfo(program, {
      aVertexPosition: 'attribute',
      aVertexColor: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
    })
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

  initAttr () {
    const { gl, programInfo, buffers } = this
    this.setAttr(programInfo.aVertexPosition, buffers.position, { count: 2 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { count: 4 })
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, this.modelViewMatrix())
  }

  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.clear()
    this.initAttr()
    this.drawArrays(4)
  }
}
