import P, { node, strLimit } from './utils.js'

const numberParser = P.sequenceOf([
  P.digits,
  P.possibly(P.sequenceOf([P.char('.'), P.digits]).map(rs => rs.join(''))),
])
  .map(rs => rs.join(''))
  .map(r => node('number', { value: Number(r) }))

const stringParser = P.between(strLimit)(strLimit)(
  P.everythingUntil(strLimit)
).map(r => node('string', { value: r }))

export { numberParser, stringParser }
