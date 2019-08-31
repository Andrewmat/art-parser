import * as P from './arcsecond.js'

const nativeObjs = ['svg', 'circle', 'text']
const commands = ['def', 'draw']

const strLimit = P.char("'")
const numParser = P.digits.map(r => ({
  type: 'number',
  value: Number(r),
}))
const strParser = P.between(strLimit)(strLimit)(
  P.everythingUntil(strLimit)
).map(r => ({
  type: 'string',
  value: r,
}))
const betweenParenthesis = P.between(P.char('('))(P.char(')'))
const betweenCurlyBrackets = P.between(P.char('{'))(P.char('}'))

const objectNativeParser = P.choice(nativeObjs.map(s => P.str(s))).map(r => ({
  type: 'obj-name',
  native: true,
  value: r,
}))

const objectNameParser = P.sequenceOf([
  P.letter,
  P.many(P.choice([P.letter, P.digits])).map(rs => rs.join('')),
])
  .map(rs => rs.join(''))
  .map(r => ({
    type: 'obj-name',
    native: false,
    value: r,
  }))

const attributeParser = P.sequenceOf([
  P.letters,
  P.optionalWhitespace,
  P.str(':'),
  P.optionalWhitespace,
  P.choice([numParser, strParser]),
]).map(rs => ({
  name: rs[0],
  value: rs[4],
}))

const attributesParser = betweenParenthesis(
  P.sepBy(
    P.sequenceOf([P.optionalWhitespace, P.char(','), P.optionalWhitespace])
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

const childrenParser = P.sequenceOf([
  // prettier-ignore
  P.char('{'),
  P.recursiveParser(() => blockParser),
  P.char('}'),
]).map(rs => rs[1])

const objectParser = P.sequenceOf([
  P.choice([objectNativeParser, objectNameParser]),
  P.optionalWhitespace,
  attributesParser,
  P.optionalWhitespace,
  childrenParser,
]).map(rs => ({
  type: 'object',
  name: rs[0],
  attributes: rs[2],
  children: rs[4],
}))

const defParser = P.sequenceOf([
  objectNameParser,
  P.whitespace,
  objectParser,
]).map(r => ({
  name: r[0],
  value: r[2],
}))

const drawParser = objectParser.map(r => ({
  value: r,
}))

const commandParser = P.sequenceOf([
  P.choice(commands.map(c => P.str(c))),
  P.whitespace,
])
  .map(rs => ({ type: 'command', value: rs[0] }))
  .chain(cmdR =>
    (cmdR.value === 'def' ? defParser : drawParser).map(argR => ({
      ...cmdR,
      args: argR,
    }))
  )

const blockParser = P.many(commandParser)

const artParser = blockParser

export default artParser
