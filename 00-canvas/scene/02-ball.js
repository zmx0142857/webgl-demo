// ball
export default class Scene02 {
  constructor ({ width, height }) {
    this.width = width
    this.height = height
    this.r = 10
    this.x = 200
    this.y = 200
    this.dx = 2
    this.dy = -2
  }
  draw (c) {
    c.beginPath()
    c.arc(this.x, this.y, this.r, 0, Math.PI*2)
    c.fill()
    //c.closePath()
  }
  update () {
    if (this.x + this.r >= this.width || this.x - this.r <= 0)
      this.dx = -this.dx
    if (this.y + this.r >= this.height || this.y - this.r <= 0) {
      this.dy = -this.dy
    }
    this.x += this.dx, this.y += this.dy
  }
}