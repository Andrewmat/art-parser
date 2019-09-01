import P, { node, betweenParenthesis } from './utils.js'
import { varNameParser } from './name.js'
import { numberParser, stringParser } from './native.js'

const operatorParser = P.choice([
  P.str('+'),
  P.str('-'),
  P.str('*'),
  P.str('/'),
]).map(r => node('operator', { value: r }))

const valueParser = P.choice([
  numberParser,
  stringParser,
  varNameParser,
  P.recursiveParser(() => mapperParser),
]).map(r => node('value', { value: r }))

const operationParser = P.sequenceOf([
  valueParser,
  P.optionalWhitespace,
  operatorParser,
  P.optionalWhitespace,
  valueParser,
]).map(rs =>
  node('operation', {
    leftArg: rs[0],
    operation: rs[2],
    rightArg: rs[4],
  })
)

const mapperParser = P.sequenceOf([
  P.str('fn'),
  P.optionalWhitespace,
  betweenParenthesis(
    P.sepBy(P.optionalWhitespace, P.char(','), P.optionalWhitespace)(
      varNameParser
    )
  ),
  P.optionalWhitespace,
  operationParser,
]).map(rs =>
  node('mapper', {
    args: rs[2],
    operation: rs[4],
  })
)

export { valueParser, operationParser, mapperParser }
