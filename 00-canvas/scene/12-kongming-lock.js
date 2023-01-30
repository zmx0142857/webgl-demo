import Color from '../utils/color'
import { Transform3D, Camera } from '../utils/transform'
import { ctx } from '../utils/canvas'

export default class Scene12 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    this.points = [
      [-2, -1, -10], [-2, -1, 10], [-2, 1, -10], [-2, 1, 10],
      [2, -1, -10], [2, -1, 10], [2, 1, -10], [2, 1, 10],

      [-1, -10, -2], [-1, -10, 2], [-1, 10, -2], [-1, 10, 2],
      [1, -10, -2], [1, -10, 2], [1, 10, -2], [1, 10, 2],

      [-10, -2, -1], [-10, -2, 1], [-10, 2, -1], [-10, 2, 1],
      [10, -2, -1], [10, -2, 1], [10, 2, -1], [10, 2, 1]
    ]
    this.faces = [
      [0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1],
      [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3],

      [8, 9, 11, 10], [12, 14, 15, 13], [8, 12, 13, 9],
      [10, 11, 15, 14], [8, 10, 14, 12], [9, 13, 15, 11],

      [16, 17, 19, 18], [20, 22, 23, 21], [16, 20, 21, 17],
      [18, 19, 23, 22], [16, 18, 22, 20], [17, 21, 23, 19]
    ]
    this.colors = this.points.map(p =>
      new Color(...p.map(x => x * 255))
    )
    this.t = new Transform3D(this.points)
    this.t.scale(15)
    this.t.translate(225, 150, -100)
    ctx.camera = new Camera({ width, height })
  }
  draw (c) {
    const points = this.t.points
    this.faces.forEach(f => {
      if (c.camera?.visible(points[f[0]], points[f[1]], points[f[2]], points[f[3]])) {
        const ps = [0, 1, 2, 3].map(i => {
          let ret = c.camera.shot(points[f[i]])
          ret.color = this.colors[f[i]]
          return ret
        })
        let grad = c.createLinearGradient(
          ps[0][0], ps[0][1], ps[1][0], ps[1][1]
        )
        grad.addColorStop(0, ps[0].color.toStr())
        grad.addColorStop(1, ps[1].color.toStr())

        const saveStyle = c.fillStyle
        c.fillStyle = grad
        c.beginPath()
        c.moveTo(...ps[0])
        c.lineTo(...ps[1])
        c.lineTo(...ps[2])
        c.lineTo(...ps[3])
        c.fill()
        c.fillStyle = saveStyle
      }
    })
  }
  update () {
    this.t.rotateX(0.01, this.height/2)
    this.t.rotateY(0.02, 0, this.width/2)
  }
}