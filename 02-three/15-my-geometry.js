import * as THREE from 'three'
import Delaunay from 'delaunay'

/**
 * 设置 webgl 属性
 * @param {Geometry} geometry
 * @param {string} key
 * @param {Object} value: { arr, nComponents }
 */
function setAttr (geometry, key, value) {
  const attr = new THREE.BufferAttribute(
    new Float32Array(value.arr), value.nComponents
  )
  geometry.setAttribute(key, attr)
}

/**
 * 创建自定义几何体
 * @param {Array} vertices: [{ position, normal, uv?, color? }]
 * @param {Array} indexes: [number]
 */
function myGeometry (vertices, indexes) {
  const geometry = new THREE.BufferGeometry()
  const data = {
    position: { arr: [], nComponents: 3 },
    normal: { arr: [], nComponents: 3 },
    uv: { arr: [], nComponents: 2 },
    color: { arr: [], nComponents: 4 },
  }

  // 找出实际传入的 key
  const keys = Object.keys(data)
    .filter(key => vertices[0].hasOwnProperty(key))

  // 从 vertices 中载入并设置 webgl 属性
  keys.forEach(key => {
    const value = data[key]
    vertices.forEach(vertex => {
      value.arr.push(...vertex[key])
    })
    setAttr(geometry, key, value)
  })

  // 设置下标数組
  if (indexes) geometry.setIndex(indexes)
  return geometry
}

// 两个三角面
function triGeometry () {
  const vertices = [
    { position: [0, 0, 0], normal: [0, 0, -1], },
    { position: [0, 100, 0], normal: [0, 0, -1], },
    { position: [50, 0, 0], normal: [0, 0, -1], },
    { position: [0, 0, 0], normal: [0, -1, 0], },
    { position: [50, 0, 0], normal: [0, -1, 0], },
    { position: [0, 0, 100], normal: [0, -1, 0], },
  ]
  const indexes = [
    0, 1, 2, 3, 4, 5
  ]
  return myGeometry(vertices, indexes)
}

// 立方体
function cubeGeometry () {
  const vertices = [
    // front
    { position: [-1, -1,  1], normal: [ 0,  0,  1], uv: [0, 0], }, // 0
    { position: [ 1, -1,  1], normal: [ 0,  0,  1], uv: [1, 0], }, // 1
    { position: [-1,  1,  1], normal: [ 0,  0,  1], uv: [0, 1], }, // 2
    { position: [ 1,  1,  1], normal: [ 0,  0,  1], uv: [1, 1], }, // 3
    // right
    { position: [ 1, -1,  1], normal: [ 1,  0,  0], uv: [0, 0], }, // 4
    { position: [ 1, -1, -1], normal: [ 1,  0,  0], uv: [1, 0], }, // 5
    { position: [ 1,  1,  1], normal: [ 1,  0,  0], uv: [0, 1], }, // 6
    { position: [ 1,  1, -1], normal: [ 1,  0,  0], uv: [1, 1], }, // 7
    // back
    { position: [ 1, -1, -1], normal: [ 0,  0, -1], uv: [0, 0], }, // 8
    { position: [-1, -1, -1], normal: [ 0,  0, -1], uv: [1, 0], }, // 9
    { position: [ 1,  1, -1], normal: [ 0,  0, -1], uv: [0, 1], }, // 10
    { position: [-1,  1, -1], normal: [ 0,  0, -1], uv: [1, 1], }, // 11
    // left
    { position: [-1, -1, -1], normal: [-1,  0,  0], uv: [0, 0], }, // 12
    { position: [-1, -1,  1], normal: [-1,  0,  0], uv: [1, 0], }, // 13
    { position: [-1,  1, -1], normal: [-1,  0,  0], uv: [0, 1], }, // 14
    { position: [-1,  1,  1], normal: [-1,  0,  0], uv: [1, 1], }, // 15
    // top
    { position: [ 1,  1, -1], normal: [ 0,  1,  0], uv: [0, 0], }, // 16
    { position: [-1,  1, -1], normal: [ 0,  1,  0], uv: [1, 0], }, // 17
    { position: [ 1,  1,  1], normal: [ 0,  1,  0], uv: [0, 1], }, // 18
    { position: [-1,  1,  1], normal: [ 0,  1,  0], uv: [1, 1], }, // 19
    // bottom
    { position: [ 1, -1,  1], normal: [ 0, -1,  0], uv: [0, 0], }, // 20
    { position: [-1, -1,  1], normal: [ 0, -1,  0], uv: [1, 0], }, // 21
    { position: [ 1, -1, -1], normal: [ 0, -1,  0], uv: [0, 1], }, // 22
    { position: [-1, -1, -1], normal: [ 0, -1,  0], uv: [1, 1], }, // 23
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

// 输入三角形的顶点, 输出法向量
function getNorm(v1, v2, v3) {
  const a = new THREE.Vector3(v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2])
  const b = new THREE.Vector3(v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2])
  a.cross(b)
  return [a.x, a.y, a.z]
}

/**
 * delaunay 三角网
 * @param {number} n 顶点数
 * @param {number} width 宽
 * @param {number} height 高
 */
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
      position: [x, y],
      z,
    }
  }

  // 建立三角网
  console.time('triangulate')
  const triangles = Delaunay.triangulate(vertices, 'position')
  console.timeEnd('triangulate')

  // 加入 z 坐标
  const arr = triangles.map(v => ({
    position: [...vertices[v].position, vertices[v].z]
  }))
  console.log('len % 3 === 0:', arr.length)

  // 计算法向量
  for (i = 0; i < arr.length; ++i) {
    arr[i].normal = i % 3 === 0
      ? getNorm(arr[i].position, arr[i+1].position, arr[i+2].position)
      : arr[i-1].normal
  }

  return myGeometry(arr)
}

/**
 * 三角面模型
 * @param {Geometry} geometry
 */
function solidMesh (geometry) {
  const material = new THREE.MeshPhongMaterial({
    color: 0xff8888,
    side: THREE.DoubleSide,
  })
  return new THREE.Mesh(geometry, material)
}

/**
 * 线框模型
 * @param {Geometry} geometry
 * @param {string} wrapper = '' | EdgesGeometry | WireframeGeometry
 *     '' // 残缺的三角形
 *     EdgesGeometry // 补全所有边
 *     WireframeGeometry // 补全所有三角形
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
