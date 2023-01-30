import { BezierMesh } from '../utils/bezier'

// bezier mesh
export default class Scene07 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    this.pointMat = [
      [ [100, 100, 200], [180, 100, 200], [260, 100, 200], [340, 100, 200] ],
      [ [100, 180, 200], [180, 180, 0], [260, 180, 0], [340, 180, 200] ],
      [ [100, 260, 200], [180, 260, 0], [260, 260, 0], [340, 260, 200] ],
      [ [100, 340, 200], [180, 340, 200], [260, 340, 200], [340, 340, 200] ],
    ]
    this.mesh = new BezierMesh(this.pointMat)
    this.mesh.transform(t => {
      t.rotateX(-1.2, this.height/2)
      t.translate(55, -150, 0)
    })
  }
  draw (c) {
    this.mesh.draw(c, 4)
  }
  update () {
    this.mesh.transform(t => {
      t.rotateX(-Math.PI/2+1.2, this.height/2)
      t.rotateY(0.02, 0, this.width/2)
      t.rotateX(Math.PI/2-1.2, this.height/2)
    })
  }
}
