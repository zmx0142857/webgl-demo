import { loadVideo } from '../utils.js'
import Scene07 from './07-texture.js'

// 使用视频贴图
export default class Scene08 extends Scene07 {
  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.texture0 = this.initVideoTexture()
    this.initAttr()
    const video = loadVideo('model/cube.mp4')
    this.update(now => {
      if (video.isReady) this.updateTexture(this.texture0, video)
      this.draw(now)
    })
  }
}