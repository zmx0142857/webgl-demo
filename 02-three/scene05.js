import * as THREE from 'three'

const template = `
<Object3D ref="solarSystem">
  <MeshPhongMaterial ref="sun"
    geometry="sphereGeometry"
    args="{emissive: 0xffcc44}"
    set.scale="...[5, 5, 5]"
  />
  <Object3D ref="earthOrbit"
    set.position.x="10"
  >
    <MeshPhongMaterial ref="earth"
      geometry="sphereGeometry"
      args="{
        color: 0x2233ff,
        emissive: 0x112244,
      }"
    />
    <Object3D ref="moonOrbit"
      set.position.x="2"
    >
      <MeshPhongMaterial ref="moon" />
    </Object3D>
  </Object3D>
</Object3D>
`
/*
material.color.set(0x00FFFF);    // 同 CSS的 #RRGGBB 风格
material.color.set(cssString);   // 任何 CSS 颜色字符串, 比如 'purple', '#F32',
                                 // 'rgb(255, 127, 64)',
                                 // 'hsl(180, 50%, 25%)'
material.color.set(someColor)    // 其他一些 THREE.Color
material.color.setHSL(h, s, l)   // 其中 h, s, 和 l 从 0 到 1
material.color.setRGB(r, g, b)   // 其中 r, g, 和 b 从 0 到 1
*/
const parser = new window.DOMParser()
const dom = parser.parseFromString(template, 'text/xml')
const data = {
  sphereGeometry: new THREE.SphereGeometry(1, 6, 6)
}
const objs = []

// TODO: 小心代码注入
function parseExpr (str) {
  if (typeof str !== 'string') return str
  str = str.replace(/^\.\.\./, '') // 去掉开头的三点
  return Function(['data'], '"use strict"; return ' + str)(data)
}

function testEllipsis (str) {
  return str === 'string' && str.startsWith('...')
}

function callWith (fn, ellipsis, args) {
  return ellipsis ? fn(...args) : fn(args)
}

function newWith (fn, ellipsis, args) {
  return ellipsis ? new fn(...args) : new fn(args)
}

function parseNode (node) {
  const { tagName } = node
  if (tagName) {
    console.log(tagName, node.getAttributeNames())
    const args = node.getAttribute('args')
    const obj = newWith(THREE[tagName], testEllipsis(args), parseExpr(args))
    objs.push(obj)
  }
  if (node.children) {
    for (const child of node.children) {
      parseNode(child)
    }
  }
}
parseNode(dom)
console.log(objs)

export default function scene05 (app) {

}
