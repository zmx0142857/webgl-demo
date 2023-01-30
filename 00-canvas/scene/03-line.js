import { canvas, ctx } from '../utils/canvas'
import Color from '../utils/color'

// draw line
export default class Scene03 {
  draw (c) {
    c.fillText('拖拽鼠标绘制直线', 10, 20)
    const that = this
    canvas.onmousedown = function (e) {
      const [x0, y0] = canvas.fromClient(e)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height) // snapshot
      document.onmousemove = function (e) {
        ctx.putImageData(imageData, 0, 0) // restore
        let [x, y] = canvas.between(...canvas.fromClient(e))
        that.drawLinePixel(c, x0, y0, x, y)
        //that.drawLineNative(c, x0, y0, x, y)
      }
      document.onmouseup = function (e) {
        this.onmouseup = null
        this.onmousemove = null
      }
    }
  }
  drawLineNative (c, x0, y0, x, y) {
    c.beginPath()
    c.moveTo(x0, y0)
    c.lineTo(x, y)
    c.stroke()
  }
  drawLinePixel (c, x0, y0, x1, y1) {
    const dx = x1 - x0,
          dy = y1 - y0,
          adx = Math.abs(dx),
          ady = Math.abs(dy),
          vx = Math.sign(dx),
          vy = Math.sign(dy),
          color = Color.fromStr('#29f')
    let x = x0, y = y0
    if (adx >= ady) {
      let err = -adx // err = -0.5
      while (x !== x1) {
        //canvas.setPixel(x, y)
        const alpha = Math.abs(err) * 0.5 / adx
        canvas.setPixel(x, y, color.alpha(alpha))
        canvas.setPixel(x, y+vy, color.alpha(1-alpha))
        x += vx
        err += 2 * ady // err += ady / adx
        if (err >= 0) {
          y += vy
          err -= 2 * adx // err -= 1
        }
      }
    } else {
      let err = -ady
      while (y !== y1) {
        //canvas.setPixel(x, y)
        const alpha = Math.abs(err) * 0.5 / ady
        canvas.setPixel(x, y, color.alpha(alpha))
        canvas.setPixel(x+vx, y, color.alpha(1-alpha))
        y += vy
        err += 2 * adx
        if (err >= 0) {
          x += vx
          err -= 2 * ady
        }
      }
    }
  }
}