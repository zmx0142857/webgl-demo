export function zipWith (f, arr, brr) {
  let ret = []
  let len = Math.min(arr.length, brr.length)
  for (let i = 0; i < len; ++i) {
    ret.push(f(arr[i], brr[i]))
  }
  return ret
}

function cloneDeep (obj) {
  if (Array.isArray(obj)) {
    return obj.map(cloneDeep)
  } else if (typeof obj === 'object') {
    let ret = {}
    for (let [k, v] of Object.entries(obj)) {
      ret[k] = cloneDeep(v)
    }
    return ret
  } else {
    return obj
  }
}

export class Vector {
  static add(p, q) {
    return zipWith((x, y) => x + y, p, q)
  }
  static sub(p, q) {
    return zipWith((x, y) => x - y, p, q)
  }
  static normalize(vec) {
    let len = Math.hypot(...vec)
    return len > 1e-4 ? vec.map(x => x / len) : vec
  }
  static innerP (xs, ys) {
    let sum = 0
    for (let i = 0; i < xs.length && i < ys.length; ++i) {
      sum += xs[i] * ys[i]
    }
    return sum
  }
  static cross (a, b, c, d) {
    return a * d - b * c
  }
  static outerP (x, y) {
    return [
      Vector.cross(x[1], x[2], y[1], y[2]),
      Vector.cross(x[2], x[0], y[2], y[0]),
      Vector.cross(x[0], x[1], y[0], y[1])
    ]
  }
}
