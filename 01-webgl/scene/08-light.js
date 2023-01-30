import Scene05 from './05-rotating-3d.js'
import fData from '../model/f.js'
import m4 from '../utils/m4.js'
import { GUI } from 'dat.gui'

// F 模型, 平行光, 点光源
export default class Scene08 extends Scene05 {
  async initShader () {
    const program = await this.loadShaderByAjax(
      'shader/light.vs.glsl',
      'shader/light.fs.glsl',
    )

    return this.initProgramInfo(program, {
      aPosition: 'attribute',
      aNormal: 'attribute',
      uProjectionMatrix: 'uniform',
      uModelViewMatrix: 'uniform',
      uNormalMatrix: 'uniform',

      uLightPosition: 'uniform',
      uLightDirection: 'uniform',
      uAmbientLight: 'uniform',
      uDirectionalLight: 'uniform',
      uPointLight: 'uniform',
    })
  }

  initBuffers () {
    return {
      position: this.arrayBuffer(fData.position),
      normal: this.arrayBuffer(fData.normal),
    }
  }

  initAttr () {
    const { gl, programInfo, buffers } = this
    this.setAttr(programInfo.aPosition, buffers.position, { count: 3 })
    this.setAttr(programInfo.aNormal, buffers.normal, { count: 3 })

    const projectionMatrix = this.perspectiveMatrix({ far: 2000 })
    gl.uniformMatrix4fv(programInfo.uProjectionMatrix, false, projectionMatrix)
  }

  initGui () {
    // 可以调戏的参数
    const params = this.params = {
      lightPosition: [0, 0, -430], // 点光源位置
      lightDirection: [0.85, 0.8, -0.75], // 方向光的朝向
      ambientLight: 0.2, // 环境光强度
      directionalLight: 0.0, // 方向光强度
      pointLight: 1.0, // 点光源强度
    }

    const gui = this.gui = new GUI()

    function makeXYZGUI(vector3, name, onChange) {
      const folder = gui.addFolder(name)
      const min = -500
      const max = 500
      folder.add(vector3, 0, min, max).onChange(onChange)
      folder.add(vector3, 1, min, max).onChange(onChange)
      folder.add(vector3, 2, min, max).onChange(onChange)
    }

    gui.add(params, 'ambientLight', 0, 1, 0.01)
    gui.add(params, 'directionalLight', 0, 1, 0.01)
    makeXYZGUI(params.lightDirection, 'lightDirection')
    gui.add(params, 'pointLight', 0, 1, 0.01)
    makeXYZGUI(params.lightPosition, 'lightPosition')
  }

  draw = (now) => {
    this.clear()
    const { gl, programInfo, params } = this

    gl.uniform3fv(programInfo.uLightPosition, params.lightPosition)
    gl.uniform3fv(programInfo.uLightDirection, params.lightDirection)
    gl.uniform1f(programInfo.uAmbientLight, params.ambientLight)
    gl.uniform1f(programInfo.uDirectionalLight, params.directionalLight)
    gl.uniform1f(programInfo.uPointLight, params.pointLight)

    const modelViewMatrix = m4().translate([0, 0, -500]).rotate(now * 0.001, [0, 1, 0]).get()
    gl.uniformMatrix4fv(programInfo.uModelViewMatrix, false, modelViewMatrix)

    // 加入光照法向量, normalMatrix 是 modelViewMatrix 的转置
    const normalMatrix = m4(modelViewMatrix).transpose().get()
    gl.uniformMatrix4fv(programInfo.uNormalMatrix, false, normalMatrix)

    // we are not using element array buffer,
    // so we call drawArrays instead of drawElements
    this.drawArrays(fData.position.length / 3, {
      type: gl.TRIANGLES
    })
  }

  async render () {
    this.programInfo = await this.initShader()
    this.buffers = this.initBuffers()
    this.initGui()
    this.initAttr()
    this.update(this.draw)
  }
}
