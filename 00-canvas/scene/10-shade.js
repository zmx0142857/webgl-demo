import Color from '../utils/color'
import { Transform3D, Camera } from '../utils/transform'
import { ctx } from '../utils/canvas'
import { TriangleShader } from '../utils/shade'

// shade
export default class Scene10 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    this.initCube()
    ctx.camera = new Camera({ width, height })
  }
  initCube () {
    this.points = [
      [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
      [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]
    ]
    this.colors = this.points.map(p =>
      new Color(...p.map(x => x * 255))
    )
    this.t = new Transform3D(this.points)
    this.faces = [
      [0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1],
      [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]
    ]
    this.t.scale(70)
    this.t.translate(225, 150, -100)
  }
  draw (c) {
    const points = this.t.points
    this.faces.forEach(f => {
      if (c.camera.visible(points[f[0]], points[f[1]], points[f[2]], points[f[3]])) {
        const getPoint = i => {
          let ret = c.camera.shot(points[f[i]])
          ret.color = this.colors[f[i]]
          return ret
        }
        new TriangleShader([0, 1, 2].map(getPoint)).draw()
        new TriangleShader([2, 3, 0].map(getPoint)).draw()
      }
    })
  }
  update () {
    this.t.rotateX(0.1, this.height/2)
    this.t.rotateY(0.2, 0, this.width/2)
  }
}
