const renderer = {
  render({ name, attributes, block }) {
    let domElem = document.createElement(name)
    if (domElem instanceof HTMLUnknownElement) {
      // tries svg instead
      domElem = document.createElementNS('http://www.w3.org/2000/svg', name)
    }
    attributes.forEach(([attrName, attrValue]) => {
      domElem.setAttribute(attrName, attrValue)
    })
    block.forEach(c => {
      domElem.appendChild(c)
    })
    return domElem
  },
}

export default renderer
