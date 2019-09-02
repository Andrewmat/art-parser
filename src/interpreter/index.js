export default function artInterpreter(tree, renderer) {
  return resolveBlock(
    {
      value: tree,
    },
    createContext({ renderer })
  )
}

const NODE_TYPES = {
  str: 'string',
  num: 'number',
  varName: 'var-name',
  operator: 'operator',
  val: 'value',
  operation: 'operation',
  mapper: 'mapper',
  attr: 'attribute',
  attrs: 'attribute-list',
  block: 'block',
  obj: 'object',
  cmd: 'command',
  args: 'args',
}

const RESOLVER_MAP = new Map([
  [NODE_TYPES.str, resolveString], // ✔️
  [NODE_TYPES.num, resolveNumber], // ✔️
  [NODE_TYPES.varName, resolveName], // ✔️
  [NODE_TYPES.operator, resolveOperator], // ✔️
  [NODE_TYPES.val, resolveValue], // ✔️
  [NODE_TYPES.operation, resolveOperation], // ✔️
  [NODE_TYPES.mapper, resolveMapper], // ✔️
  [NODE_TYPES.attr, resolveAttribute], // ✔️
  [NODE_TYPES.attrs, resolveAttributeList], // ✔️
  [NODE_TYPES.obj, resolveObject], // ✔️
  [NODE_TYPES.cmd, resolveCommand], // ✔️
  [NODE_TYPES.block, resolveBlock], // ✔️
  [NODE_TYPES.args, resolveArgs], // ✔️
])

function resolveNode(node, context) {
  const resolver = RESOLVER_MAP.get(node.type)

  if (!resolver) {
    throw new Error(`Cannot resolve node type '${node.type}'`)
  }

  return resolver(node.payload, context)
}

function resolveString({ value }) {
  return String(value)
}

function resolveNumber({ value }) {
  return Number(value)
}

function resolveName({ value }, context) {
  if (!context.defs.has(value)) {
    return undefined
  }

  return context.defs.get(value)
}

function resolveUndefinedName({ value }, context) {
  if (context.defs.has(value)) {
    throw new Error(`Expected ${value} to be undefined`)
  }
  return value
}

function resolveOperator({ value }) {
  return value
}

function resolveValue({ value }, context) {
  return resolveNode(value, context)
}

function resolveOperation({ leftArg, operation, rightArg }, context) {
  const [l, op, r] = [
    resolveNode(leftArg, context),
    resolveNode(operation, context),
    resolveNode(rightArg, context),
  ]

  switch (op) {
    case '+': {
      return l + r
    }
    case '-': {
      return l - r
    }
    case '*': {
      return l * r
    }
    case '/': {
      return l / r
    }
    default: {
      throw new Error(`Cannot resolve operator '${op}'`)
    }
  }
}

function resolveMapper({ args, operation }, context) {
  const defNames = args.map(arg => {
    if (arg.type !== NODE_TYPES.varName) {
      const erroredValue = resolveNode(arg, context)
      throw new Error(
        `Unexpected value '${erroredValue}'. It should be a defined name`
      )
    }
    // TODO resolver of undefined name
    return resolveUndefinedName(arg.payload, context)
  })
  const defs = new Map(defNames.map((name, i) => [name, context.args[i]]))
  const mapperContext = mergeContext(context, { defs })
  return resolveNode(operation, mapperContext)
}

function resolveAttribute({ name: nameNode, value }, context) {
  const name = nameNode.payload.value
  const parentAttributes = (context.parent && context.parent.attributes) || []
  // import same parent attribute to use in operations
  const parentAttribute = parentAttributes.find(
    ([attrName]) => attrName === name
  )
  const attributeContext = parentAttribute
    ? mergeContext(context, {
        args: [parentAttribute[1]],
      })
    : context

  const resolvedValue = resolveNode(value, attributeContext)
  return [name, resolvedValue]
}

function resolveAttributeList({ values }, context) {
  const parentAttributes = (context.parent && context.parent.attributes) || []
  const ownAttributes = values.map(attributeNode => {
    if (attributeNode.type !== NODE_TYPES.attr) {
      throw new Error(
        `Cannot resolve attribute of type '${attributeNode.type}'`
      )
    }
    return resolveNode(attributeNode, context)
  })
  return parentAttributes
    .concat(ownAttributes)
    .reduce((acc, [attrKey, attrValue]) => {
      // removing repeating attributes
      const filtered = acc.filter(([k]) => k !== attrKey)
      return [...filtered, [attrKey, attrValue]]
    }, [])
}

function resolveObject({ name, attributes, block }, context) {
  if (block.type !== NODE_TYPES.block) {
    throw new Error(`Cannot resolve block of type '${block.type}'`)
  }
  if (attributes.type !== NODE_TYPES.attrs) {
    throw new Error(`Cannot resolve attributes of type '${attributes.type}'`)
  }
  if (name.type !== NODE_TYPES.varName) {
    throw new Error(`Cannot resolve name of type '${name.type}'`)
  }

  const parent = resolveNode(name, context)
  if (!parent) {
    // native object of the renderer
    return {
      name: resolveUndefinedName(name.payload, context),
      attributes: resolveNode(attributes, context),
      block: resolveNode(block, context),
    }
  }
  const childrenContext = mergeContext(context, { parent })
  return {
    name: parent.name,
    attributes: resolveNode(attributes, childrenContext),
    block: resolveNode(block, childrenContext),
  }
}

function resolveCommand({ command, args }, context) {
  if (args.type !== 'args') {
    throw new Error(
      `Invalid args of type '${args.type}' to command '${command}'`
    )
  }
  const resolvedArgs = resolveNode(args, context)
  if (command === 'def') {
    return resolveCommandDef(resolvedArgs, context)
  } else if (command === 'draw') {
    return resolveCommandDraw(resolvedArgs, context)
  } else {
    throw new Error(`Cannot understand command '${command}'`)
  }
}

function resolveArgs(args) {
  return args
}

function resolveCommandDef([name, value], context) {
  // TODO resolver of undefined name
  const definitionName = resolveUndefinedName(name.payload, context)
  const definitionValue = resolveNode(value, context)
  context.defs.set(definitionName, definitionValue)
}
function resolveCommandDraw([value], context) {
  if (!context.renderer || !context.renderer.render) {
    throw new Error(`Cannot render without renderer`)
  }
  if (value.type !== NODE_TYPES.obj) {
    throw new Error(`Cannot render '${value.type}'. It must be an object`)
  }
  const resolvedObject = resolveNode(value, context)
  return context.renderer.render(resolvedObject)
}

function resolveBlock({ value }, context) {
  const blockContext = mergeContext(context, { defs: new Map() })
  const parentBlock = context.parent.block || []
  const ownBlock = value
    .map(node => resolveNode(node, blockContext))
    .filter(Boolean)
  return [...parentBlock, ...ownBlock]
}

function mergeContext(ourContext = {}, theirContext = {}) {
  const defs = new Map([...ourContext.defs, ...(theirContext.defs || [])])
  const parent = theirContext.parent
    ? theirContext.parent
    : ourContext.parent || {}

  const args = theirContext.args ? theirContext.args : ourContext.args || []

  const renderer = ourContext.renderer

  return {
    defs,
    parent,
    args,
    renderer,
  }
}

function createContext(initialContext) {
  return {
    defs: new Map(),
    parent: {},
    args: [],
    renderer: undefined,
    ...initialContext,
  }
}
