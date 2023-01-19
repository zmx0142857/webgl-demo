import Scene from '../scene.js'
import Scene06 from './06.js'

// 带有光照的立方体: normal 属性
export default class Scene07 extends Scene06 {
  initShader () {
    const { gl } = this
    const program = Scene.prototype.initShader.call(this, 'vs-07', 'fs-07')

    return this.initProgramInfo(program, {
      aVertexPosition: 'attribute',
      aTextureCoord: 'attribute',
      aVertexNormal: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
      uNormalMatrix: 'uniform',
      uSampler: 'uniform',
    })
  }

  initBuffers () {
    const normal = [
      // Front
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,

      // Back
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,

      // Top
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,

      // Bottom
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,

      // Right
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,

      // Left
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0
    ]

    return {
      ...super.initBuffers(),
      normal: this.arrayBuffer(normal)
    }
  }

  draw (now) {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = this.modelViewMatrix()
    mat4.rotate(modelViewMatrix, modelViewMatrix, now * 0.001, [0, 1, 1]);
    gl.uniformMatrix4fv(this.programInfo.uModelViewMatrix, false, modelViewMatrix)

    // 加入光照法向量
    const normalMatrix = modelViewMatrix
    mat4.invert(normalMatrix, normalMatrix)
    mat4.transpose(normalMatrix, normalMatrix)
    gl.uniformMatrix4fv(this.programInfo.uNormalMatrix, false, normalMatrix)

    this.drawElements(36)
  }

  initAttr () {
    const { gl, programInfo, buffers, texture0 } = this

    this.setAttr(programInfo.aVertexPosition, buffers.position, { n: 3 })
    this.setAttr(programInfo.aVertexNormal, buffers.normal, { n: 3 })
    this.setTexture(programInfo.uSampler, texture0, gl.TEXTURE0)
    this.setAttr(programInfo.aTextureCoord, buffers.texture, { n: 2 })

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index)
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
  }

  render () {
    this.programInfo = this.initShader()
    this.buffers = this.initBuffers()
    this.texture0 = this.initTexture('cubetexture.png')
    this.initAttr()
    this.update(this.draw)
  }
}
