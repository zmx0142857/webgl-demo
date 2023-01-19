import Scene03 from './03.js'
const { mat4 } = window.glMatrix

// 让方块动起来
export default class Scene04 extends Scene03 {

  draw = (now) => {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = this.modelViewMatrix()
    /**
     * @param dest destination matrix
     * @param src matrix to rotate
     * @param angle amount to rotate in radians
     * @param axis axis to rotate around
     */
    mat4.rotate(modelViewMatrix, modelViewMatrix, now * 0.001, [0, 0, 1]);
    gl.uniformMatrix4fv(this.programInfo.uModelViewMatrix, false, modelViewMatrix)
    this.drawArrays(4)
  }

  initAttr () {
    const { gl, programInfo, buffers } = this
    this.setAttr(programInfo.aVertexPosition, buffers.position, { count: 2 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { count: 4 })
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
  }

  render () {
    this.programInfo = this.initShader()
    this.buffers = this.initBuffers()
    this.initAttr()
    this.update(this.draw)
  }
}
