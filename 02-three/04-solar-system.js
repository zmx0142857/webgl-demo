// solar system example
import * as THREE from 'three'
import * as dat from 'dat.gui'
const gui = new dat.GUI()

// 打开/关闭轴和网格的可见性
// dat.GUI 要求一个返回类型为bool型的属性
// 来创建一个复选框，所以我们为 `visible`属性
// 绑定了一个setter 和 getter。 从而让dat.GUI
// 去操作该属性.
class AxisGridHelper {
  constructor (obj, units = 10) {
    const grid = new THREE.GridHelper(units, units)
    grid.material.depthTest = false
    grid.renderOrder = 1 // 在场景之上
    obj.add(grid)

    // x: red, y: green, z: blue
    const axes = new THREE.AxesHelper()
    axes.material.depthTest = false
    axes.renderOrder = 2 // 在网格之上
    obj.add(axes)

    this.grid = grid
    this.axes = axes
    this.visible = false
  }
  get visible () {
    return this._visible
  }
  set visible (v) {
    this._visible = v
    this.grid.visible = v
    this.axes.visible = v
  }
}

function makeAxisGrid (obj, label, units) {
  const helper = new AxisGridHelper(obj, units)
  gui.add(helper, 'visible').name(label)
}

export default function scene04 (app) {

  const objs = []

  // sphere
  const radius = 1
  const widthSegments = 6
  const heightSegments = 6
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  )

  // solar system
  const solarSystem = new THREE.Object3D()
  app.add(solarSystem)
  objs.push(solarSystem)
  makeAxisGrid(solarSystem, 'solarSystem', 25)

  // sun
  const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffcc44 })
  const sun = new THREE.Mesh(sphereGeometry, sunMaterial)
  sun.scale.set(5, 5, 5)
  solarSystem.add(sun)
  objs.push(sun)
  makeAxisGrid(sun, 'sun')

  // earth orbit
  const earthOrbit = new THREE.Object3D()
  earthOrbit.position.x = 10
  solarSystem.add(earthOrbit)
  objs.push(earthOrbit)
  makeAxisGrid(earthOrbit, 'earthOrbit')

  // earth
  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
  })
  const earth = new THREE.Mesh(sphereGeometry, earthMaterial)
  earthOrbit.add(earth)
  objs.push(earth)
  makeAxisGrid(earth, 'earth')

  // moon orbit
  const moonOrbit = new THREE.Object3D()
  moonOrbit.position.x = 2
  earthOrbit.add(moonOrbit)
  makeAxisGrid(moonOrbit, 'moonOrbit')

  // moon
  const moonMaterial = new THREE.MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x222222,
  })
  const moon = new THREE.Mesh(sphereGeometry, moonMaterial)
  moon.scale.set(.5, .5, .5)
  moonOrbit.add(moon)
  objs.push(moon)
  makeAxisGrid(moon, 'moon')

  // point light
  {
    const color = 0xffffff
    const intensity = 3
    const light = new THREE.PointLight(color, intensity)
    app.add(light)
  }

  // camera
  {
    app.camera.position.set(0, 50, 0);
    app.camera.up.set(0, 0, 1);
    app.camera.lookAt(0, 0, 0);
  }

  app.animate(time => {
    objs.forEach(obj => {
      obj.rotation.y = time
    })
  })
}
