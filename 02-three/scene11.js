/*
    绘制参数曲面
	Three.js "tutorials by example"
	Author: Lee Stemkoski
	Date: July 2013 (three.js v59dev)
*/
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js'
import * as dat from 'dat.gui'
import Parser from './parser'
window.Parser = Parser // wtf

const global = {}
const gui = new dat.GUI()
const presets = [
  // Torus
  {
    xFunc: 'cos(u)*(a + b*cos(v))',
    yFunc: 'sin(u)*(a + b*cos(v))',
    zFunc: 'b*sin(v)',
    uMin: 0,
    uMax: Math.PI*2,
    vMin: 0,
    vMax: Math.PI*2,
    segments: 40,
    a: 3,
    b: 1,
    c: 1,
    d: 1,
  },
  // Catenoid
  {
    xFunc: 'u*cos(v)',
    yFunc: 'u*sin(v)',
    zFunc: 'log(u+sqrt(u*u-1))',
    uMin: 1,
    uMax: 5,
    vMin: 0,
    vMax: Math.PI*2,
    segments: 40,
  },
  // helicoid
  {
    xFunc: 'u*v',
    yFunc: 'v',
    zFunc: 'atan(u)',
    uMin: -1,
    uMax: 1,
    vMin: -10,
    vMax: 10,
    segments: 40,
  },
  // Scherk's surface
  {
    xFunc: 'u',
    yFunc: 'v',
    zFunc: 'log(cos(u)/cos(v))',
    uMin: -1,
    uMax: 1,
    vMin: -1,
    vMax: 1,
    segments: 40,
  }
]
let preset = { ...presets[0] }

function createGraph () {
  const { a, b, c, d } = preset
  Object.assign(Parser.values, { a, b, c, d })

  const uRange = preset.uMax - preset.uMin
  const vRange = preset.vMax - preset.vMin
  const xFunc = Parser.parse(preset.xFunc).toJSFunction(['u','v'])
  const yFunc = Parser.parse(preset.yFunc).toJSFunction(['u','v'])
  const zFunc = Parser.parse(preset.zFunc).toJSFunction(['u','v'])

  function meshFunction (u0, v0, target) {
    var u = uRange * u0 + preset.uMin
    var v = vRange * v0 + preset.vMin
    var x = xFunc(u, v)
    var y = yFunc(u, v)
    var z = zFunc(u, v)
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      target.set(0, 0, 0); // TODO: better fix
    } else {
      target.set(x, y, z)
    }
  }

  // true => sensible image tile repeat...
  const graphGeometry = new ParametricGeometry(
    meshFunction,
    preset.segments,
    preset.segments,
    true
  )

  if (global.graphMesh) {
      global.app.scene.remove(global.graphMesh)
      // renderer.deallocateObject( graphMesh )
  }

  const material = global.material
  global.graphMesh = new THREE.Mesh(graphGeometry, material)
  global.graphMesh.doubleSided = true
  global.app.add(global.graphMesh)

  graphGeometry.computeBoundingBox()
  const { x, y, z } = graphGeometry.boundingBox.max
  global.app.camera.position.set(0, -8 * y, 8 * z)
  global.app.camera.lookAt(global.app.scene.position)
}

function initGUI () {
  const gui_parameters = gui.addFolder('Parameters')
  const addParameter = name =>
    gui_parameters.add(preset, name).min(-5).max(5).step(0.01).onChange(createGraph)

  const config = {
    xFunc: gui.add(preset, 'xFunc').name('x(u,v)'),
    yFunc: gui.add(preset, 'yFunc').name('y(u,v)'),
    zFunc: gui.add(preset, 'zFunc').name('z(u,v)'),
    uMin: gui.add(preset, 'uMin'),
    uMax: gui.add(preset, 'uMax'),
    vMin: gui.add(preset, 'vMin'),
    vMax: gui.add(preset, 'vMax'),
    segments: gui.add(preset, 'segments'),
    a: addParameter('a'),
    b: addParameter('b'),
    c: addParameter('c'),
    d: addParameter('d'),
  }

  const loadPreset = p => {
    Object.keys(preset).forEach(key => {
      config[key].setValue(p[key])
    })
    createGraph()
  }

  const methods = {
    createGraph,
    preset00: () => loadPreset(presets[0]),
    preset01: () => loadPreset(presets[1]),
    preset02: () => loadPreset(presets[2]),
    preset03: () => loadPreset(presets[3]),
  }
  const gui_preset = gui.addFolder('Preset equations')
  gui_preset.add(methods, 'preset00').name('Torus')
  gui_preset.add(methods, 'preset01').name('Catenoid')
  gui_preset.add(methods, 'preset02').name('Helicoid')
  gui_preset.add(methods, 'preset03').name('Scherk\'s surface')

  gui.add(methods, 'createGraph')

  loadPreset(preset)
}

function initMaterial () {
  global.material = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide
  })
}

export default function scene11 (app) {
  global.app = app

  // 滚轮缩放画面, 鼠标拖拽调整视角
  {
    const controls = new OrbitControls(app.camera, app.canvas)
    controls.target.set(0, 5, 0)
    controls.update()
  }

  // 光照, 坐标轴, 雾
  {
    const light = new THREE.PointLight(0xffffff)
    light.position.set(0, 250, 0)
    app.add(light)
    app.add(new THREE.AxesHelper())
    app.scene.fog = new THREE.FogExp2(0x888888, 0.0025)
  }

  // xy 平面的线框
  {
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x224488,
      wireframe: true,
      side: THREE.DoubleSide
    })
    const floorGeometry = new THREE.PlaneGeometry(100,100,10,10)
    const floor = new THREE.Mesh(floorGeometry, wireframeMaterial)
    floor.position.z = -0.01
    // rotate to lie in x-y plane
    // floor.rotation.x = Math.PI / 2
    app.add(floor)
  }

  initMaterial()
  initGUI()
  app.animate()
}
