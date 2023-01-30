import Scene03 from './03-colored-square.js'
import m4 from '../utils/m4.js'

// 让方块动起来
export default class Scene04 extends Scene03 {

  draw = (now) => {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = m4().translate([0, 0, -6]).rotate(now * 0.001, [0, 0, 1]).get()
    gl.uniformMatrix4fv(this.programInfo.uModelViewMatrix, false, modelViewMatrix)
    this.drawArrays(4)
  }

  initAttr () {
    const { gl, programInfo, buffers } = this
    this.setAttr(programInfo.aVertexPosition, buffers.position, { count: 2 })
    this.setAttr(programInfo.aVertexColor, buffers.color, { count: 4 })
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, this.perspectiveMatrix())
  }

  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.initAttr()
    this.update(this.draw)
  }
}
