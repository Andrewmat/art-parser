import P, { node } from './utils.js'

const varNameParser = P.sequenceOf([
  P.letter,
  P.many(P.choice([P.letter, P.digits])).map(rs => rs.join('')),
])
  .map(rs => rs.join(''))
  .map(r =>
    node('var-name', {
      native: false,
      value: r,
    })
  )

export { varNameParser }
