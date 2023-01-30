import { bezier } from '../utils/bezier'

// bezier
export default class Scene06 {
  constructor () {
    this.points = [
      [100, 100], [100, 300], [300, 300], [300, 100]
    ]
    this.curve = bezier(this.points)
  }
  draw (c) {
    this.drawBezier(c)

    // drag control points
    const that = this
    canvas.onmousedown = function (e) {
      let index = that.findNearest(e)
      document.onmousemove = function (e) {
        that.points[index] = canvas.fromClient(e)
        canvas.clear()
        that.drawBezier(c)
      }
      document.onmouseup = function (e) {
        this.onmouseup = null
        this.onmousemove = null
      }
    }
  }
  drawBezier (c) {
    c.fillText('试着拖拽控制点', 10, 20)
    // path
    c.beginPath()
    c.moveTo(this.points[0][0], this.points[0][1])
    for (let i = 1; i < this.points.length; ++i) {
      c.lineTo(this.points[i][0], this.points[i][1])
    }
    c.stroke()

    // points
    this.points.forEach(function (p) {
      c.beginPath()
      c.arc(p[0], p[1], 3, 0, 2 * Math.PI)
      c.fill()
    })

    // curve
    let p = this.curve(0)
    c.save()
    c.strokeStyle = '#ff8'
    c.beginPath()
    c.moveTo(...p)
    for (let t = 0; t <= 1; t += 0.01) {
      c.lineTo(...this.curve(t)) // 以直代曲
    }
    c.stroke()
    c.restore()
  }
  findNearest (e) {
    const [x, y] = canvas.fromClient(e)
    let minDist = Infinity
    let index = 0
    for (let i = 0; i < this.points.length; ++i) {
      let p = this.points[i]
      let dist = Math.hypot(x-p[0], y-p[1])
      if (dist < minDist) {
        minDist = dist
        index = i
      }
    }
    return index
  }
}
