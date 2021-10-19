import * as THREE from 'three'

export default function parse ({ app, template, data }) {
  const objs = []
  const refs = Object.create(null)
  const classes = Object.create(null)

  // TODO: 小心代码注入
  function parseExpr (str) {
    if (typeof str !== 'string') return str
    str = str.replace(/^\.\.\./, '') // 去掉开头的三点
    return Function(['data'],
      'with (data) { return ' + str + '}'
    )(data)
  }

  function testEllipsis (str) {
    return typeof str === 'string' && str.startsWith('...')
  }

  function newWith (fn, args, ellipsis) {
    return ellipsis ? new fn(...args) : new fn(args)
  }

  function parseNode (node, parent) {
    const { tagName } = node
    if (tagName === 'parsererror') {
      return console.log(node)
    }
    // console.log(tagName, node.getAttributeNames())

    // create object
    const args = node.getAttribute('args') || undefined
    const obj = newWith(THREE[tagName], parseExpr(args), testEllipsis(args))

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
        if (testEllipsis(args)) {
          context.set.apply(context, parseExpr(args))
        } else {
          context.set.call(context, parseExpr(args))
        }
      } else if (attr.startsWith('position.')) {
        const args = node.getAttribute(attr) || undefined
        attr = attr.replace(/^position\./, '')
        obj.position[attr] = parseExpr(args)
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
