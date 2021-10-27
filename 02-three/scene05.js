// solar system example with template
import * as THREE from 'three'
import parse from './parse'

const template = `
<template>
  <Object3D ref="solarSystem">
    <Mesh ref="sun" class="sky"
      args="sphereGeometry, sunMaterial"
      set.scale="5, 5, 5"
    />
    <Object3D ref="earthOrbit" position.x="10">
      <Mesh ref="earth" args="sphereGeometry, earthMaterial" class="sky" />
      <Object3D ref="moonOrbit" position.x="2">
        <Mesh ref="moon"
          class="sky"
          args="sphereGeometry, moonMaterial"
          set.scale=".5, .5, .5"
        />
      </Object3D>
    </Object3D>
  </Object3D>
  <PointLight args="0xffffff, 3" />
</template>`

const data = {
  sphereGeometry: new THREE.SphereGeometry(1),
  sunMaterial: new THREE.MeshPhongMaterial({ emissive: 0xffcc44 }),
  earthMaterial: new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244
  }),
  moonMaterial: new THREE.MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x222222,
  })
}

export default function scene05 (app) {
  const { objs, refs } = parse({ app, template, data })
  app.camera.position.set(0, 50, 0);
  app.camera.up.set(0, 0, 1);
  app.camera.lookAt(0, 0, 0);
  app.animate(time => {
    objs.forEach(obj => {
      obj.rotation.y = time
    })
  })
}
