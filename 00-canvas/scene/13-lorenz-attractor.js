import { mat4, vec3, vec4 } from 'gl-matrix'
import { canvas, ctx } from '../utils/canvas'

function LorenzAttractor(σ, ρ, β) {
  return function (v, t) {
    const [x, y, z] = v
    v[0] += t * (σ * (y - x))
    v[1] += t * (x * (ρ - z) - y)
    return v[2] += t * (x * y - β * z)
  }
}

var lorenz, model, mvp, p, projection, u, v, view
lorenz = LorenzAttractor(10, 28, 8 / 3)
model = mat4.create()
view = mat4.create()
projection = mat4.create()
mvp = mat4.create()
v = vec4.fromValues(1, 0, 0, 1)
u = vec4.create()
p = vec4.create()

export default class Scene13 {
  draw(c) {
    const T = 1e-3 * Date.now()
    const W = canvas.clientWidth
    const H = canvas.clientHeight
    const HW = W / 2
    const HH = H / 2
    if (W !== canvas.width || H !== canvas.height) {
      canvas.width = W
      canvas.height = H
      ctx.globalCompositeOperation = 'lighter'
      ctx.strokeStyle = 'rgb(64,32,128)'
    }
    mat4.identity(model)
    mat4.rotateY(model, model, 0.05 * T)
    mat4.rotateX(model, model, 1.89 * Math.PI)
    mat4.rotateZ(model, model, 1.66 * Math.PI)
    mat4.translate(model, model, [0, 0, -27])
    mat4.lookAt(view, [0, 3, 25], [0, -2, 0], [0, 1, 0])
    mat4.perspective(projection, Math.PI / 4, W / H, 1e-3, 1e3)
    mat4.scale(projection, projection, [HW, HH, 1])
      ;[model, view, projection].reduce(function (a, b) {
        return mat4.mul(mvp, b, a)
      })
    ctx.setTransform(1, 0, 0, -1, HW, HH)

    let lastX, lastY, outside
    for (let i = 0; i < 15000; ++i) {
      if (i === 5e1) {
        vec3.copy(u, v)
      }
      lorenz(v, 5e-3)
      vec4.transformMat4(p, v, mvp)
      vec3.scale(p, p, 1 / p[3])
      const [x, y, z] = p
      if ((-1 < z && z < 1) && (-HH < y && y < HH) && (-HW < x && x < HW)) {
        if (outside) {
          outside = false
          ctx.moveTo(lastX, lastY)
        }
        ctx.lineTo(x, y)
      } else {
        if (!outside) {
          outside = true
          ctx.lineTo(x, y)
        }
        lastX = x
        lastY = y
      }
    }
    vec3.copy(v, u)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.stroke()
    ctx.beginPath()
  }
  update () {}
}
