import { mat4 } from 'gl-matrix'

class Matrix4 {
  constructor(mat) {
    if (mat) {
      this.data = mat
    } else {
      this.data = mat4.create()
    }
  }

  get () {
    return this.data
  }

  multiply (mat) {
    mat4.multiply(this.data, this.data, mat)
    return this
  }

  transpose () {
    mat4.transpose(this.data, this.data)
    return this
  }

  invert () {
    mat4.invert(this.data, this.data)
    return this
  }

  /**
   * @param angle amount to rotate in radians
   * @param axis axis to rotate around
   */
  rotate (...args) {
    mat4.rotate(this.data, this.data, ...args)
    return this
  }

  /**
   * @param translate amount to translate
   */
  translate (...args) {
    mat4.translate(this.data, this.data, ...args)
    return this
  }
}

const m4 = (...args) => new Matrix4(...args)

export default m4