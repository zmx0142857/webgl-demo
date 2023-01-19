import Scene04 from './04.js'
const { mat4 } = window.glMatrix

// 3D 的立方体
export default class Scene05 extends Scene04 {
  initBuffers () {
    const position = [
      // Front face
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ]

    const color = [
      [1.0,  1.0,  1.0,  1.0],    // Front face: white
      [1.0,  0.0,  0.0,  1.0],    // Back face: red
      [0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0]     // Left face: purple
    ].reduce((acc, face) => {
      // 每一行重复 4 次, 然后全部压扁
      for (let v = 0; v < 4; ++v)
        acc.push(...face)
      return acc
    }, [])

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    const index = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23    // left
    ]

    return {
      position: this.arrayBuffer(position),
      color: this.arrayBuffer(color),
      index: this.elementBuffer(index)
    }
  }

  draw = (now) => {
    this.clear()
    const { gl } = this

    // add rotation
    const modelViewMatrix = this.modelViewMatrix()
    mat4.rotate(modelViewMatrix, modelViewMatrix, now * 0.001, [0, 1, 1]);
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

  render () {
    this.programInfo = this.initShader()
    this.buffers = this.initBuffers()
    this.initAttr()
    this.update(this.draw)
  }
}
