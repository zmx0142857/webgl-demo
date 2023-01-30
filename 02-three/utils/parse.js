import * as THREE from 'three'

const preservedAttrs = new Set(['ref', 'class', 'args'])

export default function parse ({ app, template, data }) {
  const objs = []
  const refs = Object.create(null)
  const classes = Object.create(null)

  // 接受 javascript 表达式, 将求值结果用数组返回
  // 比如 "5" => [5], 或者 "1, 2, 3" => [1, 2, 3]
  // TODO: 小心代码注入
  function parseExpr (str) {
    if (typeof str !== 'string') return [str] // null 或 undefined 直接返回
    return Function(['data'],
      'with (data) { return [' + str + '] }'
    )(data)
  }

  function parseNode (node, parent) {
    const { tagName } = node
    if (tagName === 'parsererror') {
      return console.log(node)
    }
    // console.log(tagName, node.getAttributeNames())

    // create object
    const args = node.getAttribute('args') || undefined
    const obj = new THREE[tagName](...parseExpr(args))

    // save object
    objs.push(obj)
    parent.add(obj)
    // save object ref
    const ref = node.getAttribute('ref')
    if (ref) {
      refs[ref] = obj
    }
    // save object to classes
    const className = node.getAttribute('class')
    if (className) {
      const classList = className.split(/\s+/)
      classList.forEach(key => {
        const arr = classes[key] || []
        arr.push(obj)
        classes[key] = arr
      })
    }

    // set attr
    node.getAttributeNames().forEach(attr => {
      if (attr.startsWith('set.')) {
        const args = node.getAttribute(attr) || undefined
        attr = attr.replace(/^set\./, '')
        const context = obj[attr]
        context.set.apply(context, parseExpr(args))
      } else if (!preservedAttrs.has(attr)) {
        const path = attr.split('.')
        const context = path.slice(0, -1)
          .reduce((acc, key) => acc[key], obj)
        const args = node.getAttribute(attr) || true // 属性不写值视为 true
        const key = path[path.length-1]
        context[key] = parseExpr(args)[0] // 逗号分隔的值只取第一个, 后面忽略
      }
    })

    if (node.children) {
      for (const child of node.children) {
        parseNode(child, obj)
      }
    }
  }

  const parser = new window.DOMParser()
  const dom = parser.parseFromString(template, 'text/xml')
  // dom.children[0] must be <template>
  for (const child of dom.children[0].children) {
    parseNode(child, app)
  }
  console.log(refs)
  console.log(classes)
  return { objs, refs, classes }
}
