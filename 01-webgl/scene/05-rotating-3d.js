import Scene04 from './04-rotating-2d.js'
import cubeData from '../model/cube.js'
import m4 from '../utils/m4.js'

// 3D 的立方体
export default class Scene05 extends Scene04 {
  initBuffers () {
    return {
      position: this.arrayBuffer(cubeData.position),
      color: this.arrayBuffer(cubeData.color),
      index: this.elementBuffer(cubeData.index)
    }
  }

  draw = (now) => {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = m4().translate([0, 0, -6]).rotate(now * 0.001, [0, 1, 1]).get()
    gl.uniformMatrix4fv(this.programInfo.uModelViewMatrix, false, modelViewMatrix)

    this.drawElements(36)
  }

  initAttr () {
    const { gl, programInfo, buffers } = this

    this.setAttr(programInfo.aVertexPosition, buffers.position, { count: 3 })
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
