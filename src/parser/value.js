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
  P.recursiveParser(() => mapperParser),
  numberParser,
  stringParser,
  varNameParser,
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
  P.choice([
    varNameParser.map(r => [r]),
    betweenParenthesis(
      P.sepBy(
        P.sequenceOf([P.optionalWhitespace, P.char(','), P.optionalWhitespace])
      )(varNameParser)
    ),
  ]),
  P.optionalWhitespace,
  P.str('=>'),
  P.optionalWhitespace,
  operationParser,
]).map(rs =>
  node('mapper', {
    args: rs[0],
    operation: rs[4],
  })
)

export { valueParser, operationParser, mapperParser }
