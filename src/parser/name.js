import P, { node, betweenAngledBrackets } from './utils.js'

const varNameParser = P.choice([
  betweenAngledBrackets(
    P.many(P.choice([P.letters, P.digits, P.anyOfString('$#- ')])).map(rs =>
      rs.join('')
    )
  ),
  P.sequenceOf([
    P.choice([P.letter]),
    P.many(P.choice([P.letter, P.digits])).map(rs => rs.join('')),
  ]).map(rs => rs.join('')),
]).map(r =>
  node('var-name', {
    value: r,
  })
)

export { varNameParser }
