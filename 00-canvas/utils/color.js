import { Vector } from './vector'

export default class Color {
  // e.g. new Color(255, 255, 255, 0.5)
  constructor (...arr) {
    if (arr.length === 0) return
    arr[3] = arr[3] === undefined ? 255 : Math.floor(arr[3] * 255)
    this.data = arr
  }
  static fromArr (arr) {
    return new Color(arr)
  }
  static fromStr (str) {
    if (str[0] !== '#') {
      throw new Error('invalid color value ' + str)
    }
    if (str.length === 4) { // #28c
      return new Color(...str.slice(1).split('')
        .map(c => parseInt(c.repeat(2), 16)))
    }
    if (str.length === 7) { // #2288cc
      return new Color(
        parseInt(str.slice(1, 3), 16),
        parseInt(str.slice(3, 5), 16),
        parseInt(str.slice(5, 7), 16)
      )
    }
  }
  static mix (c0, c1, alpha) {
    let color = new Color()
    color.data = Vector.add(
      c0.data.map(c => c * (1-alpha)),
      c1.data.map(c => c * alpha)
    ).map(Math.round)
    return color
  }
  alpha (val) {
    if (val === undefined) return this.data[3] / 255
    this.data[3] = Math.floor(val * 255)
    return this
  }
  toArr () {
    return this.data
  }
  toStr () {
    const len = this.data.length
    if (len === 4)
      return `rgba(${this.data.join(',')})`
    else if (len === 3)
      return `rgb(${this.data.join(',')})`
  }
}
