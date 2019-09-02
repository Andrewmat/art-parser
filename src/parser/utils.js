import * as arcsecond from 'arcsecond'

// Hack
// ES6 and NodeJS imports P in different ways
// ES6 cannot find a default import, NodeJS finds it
// so P is the import *, unless there is a default export
let P = arcsecond
if (arcsecond.default) {
  P = arcsecond.default
}

const node = (type, payload) => ({ type, payload })
const strLimit = P.char("'")
const betweenParenthesis = P.between(P.char('('))(P.char(')'))
const betweenCurlyBrackets = P.between(P.char('{'))(P.char('}'))
const betweenAngledBrackets = P.between(P.char('<'))(P.char('>'))

export {
  node,
  strLimit,
  betweenParenthesis,
  betweenCurlyBrackets,
  betweenAngledBrackets,
}

export default P
