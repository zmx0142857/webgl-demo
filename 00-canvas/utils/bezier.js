import { Transform3D } from './transform'
import { zipWith } from './vector'

// 返回 Bezier 曲线的参数方程
export function bezier (points) {
  return function parameterCurve (t) {
    ps = points.slice()
    let len = ps.length
    while (--len) {
      for (let i = 0; i < len; ++i) {
        ps[i] = zipWith((x, y) => x + t*(y-x), ps[i], ps[i+1])
      }
    }
    return ps[0]
  }
}

// 返回 Bezier 曲面的参数方程
function bezierMesh (pointMat) {
  return function parameterMesh (u, v) {
    return bezier(
      pointMat.map(function (points) {
        return bezier(points)(v)
      })
    )(u)
  }
}

// Bezier 曲面绘制类
export class BezierMesh {
  constructor (pointMat) {
    this.mat = pointMat
    this.mesh = bezierMesh(pointMat)
    this.ts = pointMat.map(points => new Transform3D(points))
  }
  draw (c, depth) {
    const top = 0, right = 1, bottom = 1, left = 0
    this.drawRec(c, depth, top, right, bottom, left)
    // show control points
    //this.mat.forEach(row => row.forEach(p => canvas.setPixel(p[0], p[1])))
  }
  transform (callback) {
    return this.ts.forEach(callback)
  }
  drawRec (c, depth, top, right, bottom, left) {
    if (depth === 0) {
      const camera = c.camera
      c.beginPath()
      if (camera) {
        const topLeft = this.mesh(top, left)
        const topRight = this.mesh(top, right)
        const bottomLeft = this.mesh(bottom, left)
        const bottomRight = this.mesh(bottom, right)
        if (camera.xray || camera.visible(topRight, topLeft, bottomLeft, bottomRight)) {
          c.moveTo(...camera.shot(topRight))
          c.lineTo(...camera.shot(topLeft))
          c.lineTo(...camera.shot(bottomLeft))
          c.lineTo(...camera.shot(bottomRight))
        }
      } else {
        c.moveTo(...this.mesh(top, right))
        c.lineTo(...this.mesh(top, left))
        c.lineTo(...this.mesh(bottom, left))
        c.lineTo(...this.mesh(bottom, right))
      }
      c.closePath()
      c.stroke()
    } else {
      const center = (left + right) / 2
      const middle = (top + bottom) / 2
      this.drawRec(c, depth-1, top, right, middle, center)
      this.drawRec(c, depth-1, top, center, middle, left)
      this.drawRec(c, depth-1, middle, center, bottom, left)
      this.drawRec(c, depth-1, middle, right, bottom, center)
    }
  }
}

// 旋转面绘制类, 由 4 张 Bezier 曲面拼成
export class RevolutionMesh {
  constructor(points, { height, width }) {
    const axis = width / 2
    const magic = 4*(Math.sqrt(2)-1)/3 // 魔术常数, 约 0.5523
    let ts = [
      p => p.concat([0]),
      p => p.concat([magic * Math.abs(p[0]-axis)]),
      p => p.concat([-magic * Math.abs(p[0]-axis)]),
    ].map(f => new Transform3D(points.map(f)))
    let origin = ts[0].points.slice()
    let mat = []
    ts[2].rotateY(Math.PI / 2, 0, axis)
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 3; ++j) {
        mat.push(ts[j].points.slice())
        ts[j].rotateY(Math.PI / 2, 0, axis)
      }
    }
    mat.push(origin)

    this.ts = mat.map(points => new Transform3D(points))
    this.transform(t => {
      t.rotateX(Math.PI / 8, height/2)
      t.rotateY(0.05, 0, width/2)
    })
    this.meshes = [[0, 4], [3, 7], [6, 10], [9, 13]]
      .map(range => new BezierMesh(mat.slice(...range)))
  }
  draw (c, depth) {
    this.meshes.forEach(m => m.draw(c, depth))
  }
  transform (callback) {
    return this.ts.forEach(callback)
  }
}
