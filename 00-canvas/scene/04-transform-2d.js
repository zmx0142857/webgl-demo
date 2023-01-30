import { Transform2D } from '../utils/transform'

// transform2d
export default class Scene04 {
  constructor () {
    this.t = new Transform2D([
      [100, 100], [100, 150], [200, 150], [200, 100]
    ])
  }
  draw (c) {
    this.drawBox(c)
    this.t.translate(200, 100)
    this.drawBox(c)
    canvas.setPixel(200, 200)
    this.t.rotate(Math.PI/3, 200, 200)
    this.drawBox(c)
    this.t.scale(0.5, 0.5, 200, 200)
    this.drawBox(c)
    this.t.reflect(200, 200)
    this.drawBox(c)
  }
  drawBox (c) {
    const points = this.t.points
    c.beginPath()
    c.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; ++i) {
      c.lineTo(points[i][0], points[i][1])
    }
    c.closePath()
    c.stroke()
  }
}