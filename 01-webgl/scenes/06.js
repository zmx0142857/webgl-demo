import Scene from '../scene.js'
import Scene05 from './05.js'

// 带纹理的立方体: uv 属性
export default class Scene06 extends Scene05 {
  initShader () {
    const { gl } = this
    const program = Scene.prototype.initShader.call(this, 'vs-06', 'fs-06')

    return this.initProgramInfo(program, {
      aVertexPosition: 'attribute',
      aTextureCoord: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
      uSampler: 'uniform',
    })
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

  initAttr () {
    const texture0 = this.initTexture('cubetexture.png')
    const { gl, programInfo, buffers } = this

    this.setTexture(programInfo.uSampler, texture0, gl.TEXTURE0)
    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 3 })
    this.setAttr(programInfo.aTextureCoord, buffers.texture, { n: 2 })

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
  }

  render () {
    this.programInfo = this.initShader()
    this.buffers = this.initBuffers()
    this.initAttr()
    this.update(this.draw)
  }
}
