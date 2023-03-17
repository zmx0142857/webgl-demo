import * as twgl from 'twgl.js'
import square from '../model/square'
import { fetchShaders } from '../utils'

export default async function Scene01 (gl, animate) {
  const shaders = await fetchShaders('shader/image.vs.glsl', 'shader/image.fs.glsl')
  const programInfo = twgl.createProgramInfo(gl, shaders)
  gl.useProgram(programInfo.program)

  const arrays = {
    aPosition: square.position,
    aTexture: square.uv,
  }
  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)

  const uniforms = {}

  twgl.createTexture(gl, { src: 'texture/wall.jpg' }, (err, texture, img) => {
    if (err) console.error(err)
    uniforms.uImage = texture
    uniforms.uImageSize = [img.width, img.height]
  })

  animate(time => {
    uniforms.uTime = time;
    uniforms.uResolution = [gl.canvas.width, gl.canvas.height]
    twgl.setUniforms(programInfo, uniforms)
    twgl.drawBufferInfo(gl, bufferInfo)
  })
}