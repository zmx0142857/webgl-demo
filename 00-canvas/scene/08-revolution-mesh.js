import { RevolutionMesh } from '../utils/bezier'

// revolution mesh
export default class Scene08 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    this.points = [
      [140, 100], [200, 180], [200, 260], [100, 340]
    ]
    this.mesh = new RevolutionMesh(this.points, { width, height })
  }
  draw (c) {
    this.mesh.draw(c, 3)
  }
  update () {
    this.mesh.transform(t => {
      t.rotateY(0.02, 0, this.width/2)
    })
  }
}
