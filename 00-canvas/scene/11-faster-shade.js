import Scene10 from './10-shade'

// faster shade
export default class Scene11 extends Scene10 {
  draw (c) {
    const points = this.t.points
    this.faces.forEach(f => {
      if (c?.camera.visible(points[f[0]], points[f[1]], points[f[2]], points[f[3]])) {
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
