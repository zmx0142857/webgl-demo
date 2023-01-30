import { Transform3D, Camera } from '../utils/transform'
import { ctx } from '../utils/canvas'

// transform3d
export default class Scene05 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    //this.initCube()
    this.initStamp()
  }
  initCube () {
    this.t = new Transform3D([
      [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1],
      [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]
    ])
    this.edges = [
      [0, 1], [0, 2], [0, 4], [1, 3],
      [1, 5], [2, 6], [2, 3], [3, 7],
      [4, 5], [4, 6], [5, 7], [6, 7]
    ]
    this.t.scale(200)
    this.t.translate(175, 100, -100)
  }
  initStamp () {
    const s = Math.sqrt(2)
    this.t = new Transform3D([
      [1, 1, -1-s], [-1, 1, -1-s], [-1, -1, -1-s], [1, -1, -1-s],
      [1, 1, 1+s], [-1, 1, 1+s], [-1, -1, 1+s], [1, -1, 1+s],
      [1, -1-s, 1], [-1, -1-s, 1], [-1, -1-s, -1], [1, -1-s, -1],
      [1, 1+s, 1], [-1, 1+s, 1], [-1, 1+s, -1], [1, 1+s, -1],
      [-1-s, 1, 1], [-1-s, -1, 1], [-1-s, -1, -1], [-1-s, 1, -1],
      [1+s, 1, 1], [1+s, -1, 1], [1+s, -1, -1], [1+s, 1, -1],
    ])
    this.edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [8, 9], [9, 10], [10, 11], [11, 8],
      [12, 13], [13, 14], [14, 15], [15, 12],
      [16, 17], [17, 18], [18, 19], [19, 16],
      [20, 21], [21, 22], [22, 23], [23, 20],

      [4, 12], [12, 20], [20, 4], // +++
      [0, 23], [23, 15], [15, 0], // ++-
      [7, 8], [8, 21], [21, 7], // +-+
      [22, 11], [11, 3], [3, 22], // +--
      [16, 5], [5, 13], [13, 16], // -++
      [1, 14], [14, 19], [19, 1], // -+-
      [6, 9], [9, 17], [17, 6], // --+
      [2, 10], [10, 18], [18, 2], // ---
    ]
    this.t.scale(50)
    this.t.translate(275, 200, 0)
    const { width, height } = this
    ctx.camera = new Camera({ width, height })
  }
  draw (c) {
    const points = this.t.points
    this.edges.forEach(function (e) {
      c.beginPath()
      c.moveTo(points[e[0]][0], points[e[0]][1])
      c.lineTo(points[e[1]][0], points[e[1]][1])
      //c.moveTo(...c.camera.shot(points[e[0]]))
      //c.lineTo(...c.camera.shot(points[e[1]]))
      c.stroke()
    })
  }
  update () {
    this.t.rotateX(0.01, this.height/2)
    this.t.rotateY(0.02, 0, this.width/2)
  }
}
