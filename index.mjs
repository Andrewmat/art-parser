import p from 'arcsecond'

const nativeObjs = ['svg', 'circle', 'text']
const commands = ['def', 'draw']

const strLimit = p.char("'")
const numParser = p.digits.map(r => ({
  type: 'number',
  value: Number(r),
}))
const strParser = p
  .between(strLimit)(strLimit)(p.everythingUntil(strLimit))
  .map(r => ({
    type: 'string',
    value: r,
  }))
const betweenParenthesis = p.between(p.char('('))(p.char(')'))
const betweenCurlyBrackets = p.between(p.char('{'))(p.char('}'))

const objectNativeParser = p.choice(nativeObjs.map(s => p.str(s))).map(r => ({
  type: 'obj-name',
  native: true,
  value: r,
}))

const objectNameParser = p
  .sequenceOf([
    p.letter,
    p.many(p.choice([p.letter, p.digits])).map(rs => rs.join('')),
  ])
  .map(rs => rs.join(''))
  .map(r => ({
    type: 'obj-name',
    native: false,
    value: r,
  }))

const attributeParser = p
  .sequenceOf([
    p.letters,
    p.optionalWhitespace,
    p.str(':'),
    p.optionalWhitespace,
    p.choice([numParser, strParser]),
  ])
  .map(rs => ({
    name: rs[0],
    value: rs[4],
  }))

const attributesParser = betweenParenthesis(
  p.sepBy(
    p.sequenceOf([p.optionalWhitespace, p.char(','), p.optionalWhitespace])
  )(attributeParser)
).map(rs =>
  rs.reduce(
    (obj, attr) => ({
      ...obj,
      [attr.name]: attr.value,
    }),
    {}
  )
)

const childrenParser = p
  .sequenceOf([
    // prettier-ignore
    p.char('{'),
    p.recursiveParser(() => blockParser),
    p.char('}'),
  ])
  .map(rs => rs[1])

const objectParser = p
  .sequenceOf([
    p.choice([objectNativeParser, objectNameParser]),
    p.optionalWhitespace,
    attributesParser,
    p.optionalWhitespace,
    childrenParser,
  ])
  .map(rs => ({
    type: 'object',
    name: rs[0],
    attributes: rs[2],
    children: rs[4],
  }))

const defParser = p
  .sequenceOf([objectNameParser, p.whitespace, objectParser])
  .map(r => ({
    name: r[0],
    value: r[2],
  }))

const drawParser = objectParser.map(r => ({
  value: r,
}))

const commandParser = p
  .sequenceOf([p.choice(commands.map(c => p.str(c))), p.whitespace])
  .map(rs => ({ type: 'command', value: rs[0] }))
  .chain(cmdR =>
    (cmdR.value === 'def' ? defParser : drawParser).map(argR => ({
      ...cmdR,
      args: argR,
    }))
  )

const blockParser = p.many(commandParser)

const artParser = blockParser

export default artParser
