import P, { node, strLimit } from './utils.js'

const numberParser = P.digits.map(r => node('number', { value: Number(r) }))
const stringParser = P.between(strLimit)(strLimit)(
  P.everythingUntil(strLimit)
).map(r => node('string', { value: r }))

const nativeObjectNames = ['svg', 'circle', 'ellipse', 'line', 'rect', 'g']

const nativeObjectParser = P.choice(nativeObjectNames.map(s => P.str(s))).map(
  r =>
    node('var-name', {
      native: true,
      type: 'object',
      value: r,
    })
)

export { nativeObjectParser, numberParser, stringParser }