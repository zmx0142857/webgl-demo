import Scene05 from './05-rotating-3d.js'
import cubeData from '../model/cube.js'

// 带纹理的立方体: uv 属性
export default class Scene06 extends Scene05 {
  async initShader () {
    const program = await this.loadShaderByAjax(
      'shader/texture.vs.glsl',
      'shader/texture.fs.glsl',
    )

    return this.initProgramInfo(program, {
      aVertexPosition: 'attribute',
      aTextureCoord: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
      uSampler: 'uniform',
    })
  }

  initBuffers () {
    return {
      ...super.initBuffers(),
      texture: this.arrayBuffer(cubeData.uv)
    }
  }

  initAttr () {
    const texture0 = this.initTexture('texture/cube/cube.png')
    const { gl, programInfo, buffers } = this

    this.setTexture(programInfo.uSampler, texture0, gl.TEXTURE0)
    this.setAttr(programInfo.aVertexPosition, buffers.position, { count: 3 })
    this.setAttr(programInfo.aTextureCoord, buffers.texture, { count: 2 })

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
