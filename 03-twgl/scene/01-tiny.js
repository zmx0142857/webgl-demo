import * as twgl from 'twgl.js'
import square from '../model/square'
import { fetchShaders } from '../utils'

export default async function Scene01 (gl, animate) {
  // 1. shader program
  const shaders = await fetchShaders('shader/tiny.vs.glsl', 'shader/tiny.fs.glsl')
  const programInfo = twgl.createProgramInfo(gl, shaders)
  gl.useProgram(programInfo.program)

  // 2. buffer arrays
  const arrays = {
    position: square.position,
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

  // 3. render loop
  animate(time => {
    const uniforms = {
      time,
      resolution: [gl.canvas.width, gl.canvas.height],
    }
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo)
  })
}