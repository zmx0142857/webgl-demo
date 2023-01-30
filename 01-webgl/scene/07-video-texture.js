import { loadVideo } from '../utils/utils.js'
import Scene06 from './06-texture.js'

// 使用视频贴图
export default class Scene07 extends Scene06 {
  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.texture0 = this.initVideoTexture()
    this.initAttr()
    const video = loadVideo('texture/cube/cube.mp4')
    this.update(now => {
      if (video.isReady) this.updateTexture(this.texture0, video)
      this.draw(now)
    })
  }
}