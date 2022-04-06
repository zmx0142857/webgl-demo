import * as THREE from 'three'
import Delaunay from 'delaunay'

function setAttr (geometry, name, arr, nComponents) {
  const attr = new THREE.BufferAttribute(new Float32Array(arr), nComponents)
  geometry.setAttribute(name, attr)
}

function myGeometry (vertices, indexes) {
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const normals = []
  const uvs = []
  const colors = []
  for (const vertex of vertices) {
    positions.push(...vertex.pos)
    normals.push(...vertex.norm)
    //uvs.push(...vertex.uv)
    //colors.push(...vertex.color)
  }
  setAttr(geometry, 'position', positions, 3)
  setAttr(geometry, 'normal', normals, 3)
  //setAttr(geometry, 'uv', uvs, 2)
  //setAttr(geometry, 'color', colors, 4)
  if (indexes)
    geometry.setIndex(indexes)
  return geometry
}

function triGeometry () {
  const vertices = [
    { pos: [0, 0, 0], norm: [0, 0, -1], },
    { pos: [0, 100, 0], norm: [0, 0, -1], },
    { pos: [50, 0, 0], norm: [0, 0, -1], },
    { pos: [0, 0, 0], norm: [0, -1, 0], },
    { pos: [50, 0, 0], norm: [0, -1, 0], },
    { pos: [0, 0, 100], norm: [0, -1, 0], },
  ]
  const indexes = [
    0, 1, 2, 3, 4, 5
  ]
  return myGeometry(vertices, indexes)
}

function cubeGeometry () {
  const vertices = [
    // front
    { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
    { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
    { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
    { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
    // right
    { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
    { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
    { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
    { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
    // back
    { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
    { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], }, // 9
    { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
    { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
    // left
    { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], }, // 12
    { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], }, // 13
    { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], }, // 14
    { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], }, // 15
    // top
    { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
    { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
    { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
    { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
    // bottom
    { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
    { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
    { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
    { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], }, // 23
  ];

  const indexes = [
     0,  1,  2,   2,  1,  3,
     4,  5,  6,   6,  5,  7,
     8,  9, 10,  10,  9, 11,
    12, 13, 14,  14, 13, 15,
    16, 17, 18,  18, 17, 19,
    20, 21, 22,  22, 21, 23,
  ]

  return myGeometry(vertices, indexes)
}

function getNorm(v1, v2, v3) {
  const a = new THREE.Vector3(v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2])
  const b = new THREE.Vector3(v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2])
  a.cross(b)
  return [a.x, a.y, a.z]
}

function delaunayGeometry (n, width, height) {
  const vertices = new Array(n)
  let i, x, y, z

  // 生成平面点集
  for (i = n; i--; ) {
    do {
      x = Math.random() - 0.5
      y = Math.random() - 0.5
      z = Math.random()
    } while(x * x + y * y > 0.25) // [-0.5, 0.5]

    x = x * width
    y = y * height
    z = z * 5

    vertices[i] = {
      pos: [x, y],
      z,
    }
  }

  // 建立三角网
  console.time('triangulate')
  const triangles = Delaunay.triangulate(vertices, 'pos')
  console.timeEnd('triangulate')

  // 加入 z 坐标
  const arr = triangles.map(v => ({
    pos: [...vertices[v].pos, vertices[v].z]
  }))
  console.log('len % 3 === 0:', arr.length)

  // 计算法向量
  for (i = 0; i < arr.length; ++i) {
    arr[i].norm = i % 3 === 0
      ? getNorm(arr[i].pos, arr[i+1].pos, arr[i+2].pos)
      : arr[i-1].norm
  }

  return myGeometry(arr)
}

function solidMesh (geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xff8888,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(geometry, material)
}

/**
 * @param {string} wrapper
 *   '' // 残缺的三角形
 *   EdgesGeometry // 补全所有边
 *   WireframeGeometry // 补全所有三角形
 */
function lineMesh (geometry, wrapper='EdgesGeometry') { // 残缺的三角形
  if (wrapper) geometry = new THREE[wrapper](geometry)
  const material = new THREE.LineBasicMaterial({
    color: 0x66ccff,
  })
  return new THREE.LineSegments(geometry, material)
}

export default function scene15 (app) {
  app.orbitControl()
  app.lightOn(400, 200, 300)

  const geometry = delaunayGeometry(100, 100, 100)
  // const obj = lineMesh(geometry, 'WireframeGeometry')
  const obj = solidMesh(geometry)
  app.add(obj)

  app.animate()
}
