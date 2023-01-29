import Scene from '../scene.js'

// 用深蓝填充缓冲区
export default class Scene01 extends Scene {
  render () {
    const { gl } = this
    gl.clearColor(0.1, 0.2, 0.3, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
}
