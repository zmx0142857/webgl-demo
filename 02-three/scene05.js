import * as THREE from 'three'

const template = `
<Object3D ref="solarSystem">
  <MeshPhongMaterial ref="sun"
    :geometry="sphereGeometry"
    :args="{emissive: 0xffcc44}"
    :set:scale="[5, 5, 5]"
  />
  <Object3D ref="earthOrbit"
    :set.position.x="10"
  >
    <MeshPhongMaterial ref="earth"
      :geometry="sphereGeometry"
      :args="{
        color: 0x2233ff,
        emissive: 0x112244,
      }"
    />
    <Object3D ref="moonOrbit"
      :set.position.x="2"
    >
      <MeshPhongMaterial ref="moon" />
    </Object3D>
  </Object3D>
</Object3D>
`

const parser = new window.DOMParser()
const dom = parser.parseFromString(tempate, 'text/xml')

export default function scene05 () {

}
