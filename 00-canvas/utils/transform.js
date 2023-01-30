import { Vector } from './vector'

class Transform {
  constructor (points) {
    // 原地修改
    this.points = points
    points.forEach(p => {
      p.push(1)
    })
    // 返回新数组
    //this.points = points.map(p => p.concat([1]))
  }
  transform (mat) {
    // 原地修改
    this.points.forEach((p, i, points) => {
      points[i] = mat.map(row => Vector.innerP(row, p))
    })
    // 返回新数组
    //this.points = this.points.map(p => mat.map(row => this.innerP(row, p)))
  }
}

export class Transform2D extends Transform {
  // 平移
  translate (x, y) {
    this.transform([
      [1, 0, x],
      [0, 1, y],
      [0, 0, 1]
    ])
  }
  // 缩放
  // [1   a] [x    ] [1   -a]   [x   a(1-x)]
  // [  1 b] [  y  ] [  1 -b] = [  y b(1-y)]
  // [    1] [    1] [     1]   [      1   ]
  scale (x, y = x, aboutX = 0, aboutY = 0) {
    this.transform([
      [x, 0, aboutX*(1-x)],
      [0, y, aboutY*(1-y)],
      [0, 0, 1]
    ])
  }
  // 反射
  reflect (aboutX, aboutY) {
    const x = aboutX === undefined ? 1 : -1
    const y = aboutY === undefined ? 1 : -1
    this.scale(x, y, aboutX, aboutY)
  }
  // 旋转
  // [1   a] [c -s  ] [1   -a]   [c -s a(1-c)+bs]
  // [  1 b] [s  c  ] [  1 -b] = [s  c b(1-c)-as]
  // [    1] [     1] [     1]   [          1   ]
  rotate (angle, aboutX = 0, aboutY = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    this.transform([
      [cos, -sin, aboutX*(1-cos) + aboutY*sin],
      [sin, cos, aboutY*(1-cos) - aboutX*sin],
      [0, 0, 1]
    ])
  }
}

export class Transform3D extends Transform {
  translate (x, y, z) {
    this.transform([
      [1, 0, 0, x],
      [0, 1, 0, y],
      [0, 0, 1, z],
      [0, 0, 0, 1]
    ])
  }
  scale (x, y = x, z = x, aboutX = 0, aboutY = 0, aboutZ = 0) {
    this.transform([
      [x, 0, 0, aboutX*(1-x)],
      [0, y, 0, aboutY*(1-y)],
      [0, 0, z, aboutZ*(1-z)],
      [0, 0, 0, 1]
    ])
  }
  rotateZ (angle, aboutX = 0, aboutY = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    this.transform([
      [cos, -sin, 0, aboutX*(1-cos) + aboutY*sin],
      [sin, cos, 0, aboutY*(1-cos) - aboutX*sin],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ])
  }
  rotateX (angle, aboutY = 0, aboutZ = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    this.transform([
      [1, 0, 0, 0],
      [0, cos, -sin, aboutY*(1-cos) + aboutZ*sin],
      [0, sin, cos, aboutZ*(1-cos) - aboutY*sin],
      [0, 0, 0, 1]
    ])
  }
  rotateY (angle, aboutZ = 0, aboutX = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    this.transform([
      [cos, 0, sin, aboutX*(1-cos) - aboutZ*sin],
      [0, 1, 0, 0],
      [-sin, 0, cos, aboutZ*(1-cos) + aboutX*sin],
      [0, 0, 0, 1]
    ])
  }
}

export class Camera {
  constructor ({ width, height, pos }) {
    if (pos === undefined) {
      pos = [width / 2, height / 2, -500]
    }
    this.pos = pos // 相机坐标
  }
  // 投影到 xOy 平面上
  // 计算 pos -- point 连线与 xOy 平面的交点
  // (x - x0)/(x1 - x0) = (y - y0)/(y1 - y0) = -z0/(z1 - z0)
  shot (point) {
    const pos = this.pos
    const k = -pos[2]/(point[2] - pos[2])
    return [
      k * (point[0] - pos[0]) + pos[0],
      k * (point[1] - pos[1]) + pos[1]
    ]
  }
  // 判断可见性
  // p0, p1, p2, p3 为平面上 (从外铡看) 逆时针四点
  visible (p0, p1, p2, p3) {
    const v = Vector.normalize(Vector.sub(this.pos, p0))
    const v1 = Vector.sub(p1, p0)
    const v2 = Vector.sub(p2, p0)
    const v3 = Vector.sub(p3, p0)
    const n = Vector.normalize(
      Vector.add(
        Vector.outerP(v1, v2),
        Vector.outerP(v2, v3)
      )
    )
    return Vector.innerP(v, n) >= 0
  }
}
