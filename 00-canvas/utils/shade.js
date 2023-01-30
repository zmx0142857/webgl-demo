import { Vector } from './vector'
import Color from './color'

export class TriangleShader {
  constructor (points) {
    let p = this.points = points.sort((p,q) => p[1] - q[1])
    this.bound = [[], []]
    const vec1 = Vector.sub(p[1], p[0])
    const vec2 = Vector.sub(p[2], p[0])
    // 三角形是否位于直线 P0 P2 左侧
    const flag = Vector.cross(vec1[0], vec1[1], vec2[0], vec2[1]) < 0 ? 1 : 0
    this.setFlag(p[0], p[1], 1-flag)
    this.setFlag(p[1], p[2], 1-flag)
    this.setFlag(p[0], p[2], flag)
  }
  setFlag (begin, end, flag) {
    const dx = end[0] - begin[0]
    const dy = end[1] - begin[1]
    const m = dx / dy
    for (let x = begin[0], y = begin[1]; y < end[1]; x += m, ++y) {
      const alpha = (y - begin[1]) / dy
      const data = {
        x: Math.round(x),
        color: Color.mix(begin.color, end.color, alpha)
      }
      this.bound[flag].push(data)
    }
  }
  draw () {
    const p = this.points
    const minY = p[0][1], maxY = p[2][1]
    for (let y = minY, n = 0; y < maxY; ++y, ++n) { // 下闭上开
      const minX = this.bound[0][n].x,
            maxX = this.bound[1][n].x,
            dx = maxX - minX,
            c0 = this.bound[0][n].color,
            c1 = this.bound[1][n].color
      for (let x = minX; x < maxX; ++x) { // 左闭右开
        const alpha = (x - minX) / dx
        const color = Color.mix(c0, c1, alpha)
        canvas.setPixel(x, y, color)
      }
    }
  }
}
