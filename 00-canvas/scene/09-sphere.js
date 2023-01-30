import { RevolutionMesh } from '../utils/bezier'
import { ctx } from '../utils/canvas'
import { Camera } from '../utils/transform'

// sphere
export default class Scene09 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    const r = 150
    const magic = 82.8427
    this.northPoints = [
      [width / 2, height / 2 - r],
      [width / 2 - magic, height / 2 - r],
      [width / 2 - r, height / 2 - magic],
      [width / 2 - r, height / 2],
    ]
    this.southPoints = [
      [width / 2 - r, height / 2],
      [width / 2 - r, height / 2 + magic],
      [width / 2 - magic, height / 2 + r],
      [width / 2, height / 2 + r],
    ]
    this.north = new RevolutionMesh(this.northPoints, { width, height }) // 北半球
    this.south = new RevolutionMesh(this.southPoints, { width, height }) // 南半球
    ctx.camera = new Camera({ width, height }) // 开启透视投影
    //ctx.camera.xray = true // 开启 x 光
  }
  draw (c) {
    this.north.draw(c, 3)
    this.south.draw(c, 3)
  }
  update () {
    const callback = t => {
      t.rotateY(0.02, 0, this.width/2)
    }
    this.north.transform(callback)
    this.south.transform(callback)
  }
}