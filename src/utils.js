import P from 'arcsecond'

const node = (type, payload) => ({ type, payload })
const strLimit = P.char("'")
const betweenParenthesis = P.between(P.char('('))(P.char(')'))
const betweenCurlyBrackets = P.between(P.char('{'))(P.char('}'))

export { node, strLimit, betweenParenthesis, betweenCurlyBrackets }

export default P
