import P, { node, betweenParenthesis, betweenCurlyBrackets } from './utils.js'
import { valueParser } from './value.js'
import { varNameParser } from './name.js'
import { commandListParser } from './command.js'
import { nativeObjectParser } from './native.js'

const attributeParser = P.sequenceOf([
  P.letters,
  P.optionalWhitespace,
  P.str(':'),
  P.optionalWhitespace,
  valueParser,
]).map(rs =>
  node('attribute', {
    name: rs[0],
    value: rs[4],
  })
)

const attributesParser = betweenParenthesis(
  P.sepBy(
    P.sequenceOf([P.optionalWhitespace, P.char(','), P.optionalWhitespace])
  )(attributeParser)
).map(rs => node('attribute-list', { value: rs }))

const blockParser = betweenCurlyBrackets(
  P.recursiveParser(() => commandListParser)
).map(rs => node('block', { value: rs }))

const objectParser = P.sequenceOf([
  P.choice([nativeObjectParser, varNameParser]),
  P.optionalWhitespace,
  P.possibly(attributesParser),
  P.optionalWhitespace,
  P.possibly(blockParser),
]).map(rs =>
  node('object', {
    name: rs[0],
    attributes: rs[2] || {},
    block: rs[4] || [],
  })
)

export { objectParser }
