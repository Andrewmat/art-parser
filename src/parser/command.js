import P, { node } from './utils.js'
import { varNameParser } from './name.js'
import { objectParser } from './object.js'

const defArgsParser = P.sequenceOf([
  varNameParser,
  P.whitespace,
  objectParser,
]).map(r => node('args', [r[0], r[2]]))

const drawArgsParser = objectParser.map(r => node('args', [r]))

const argsParserMap = new Map([
  ['def', defArgsParser],
  ['draw', drawArgsParser],
])

const commandParser = P.choice([
  // explicit command
  P.sequenceOf([P.letters, P.whitespace]).map(rs => rs[0]),

  // implicit "draw" command
  drawArgsParser,
]).chain(result => {
  // implicit "draw" commmand
  if (result.type === 'args') {
    return P.succeedWith(
      node('command', {
        command: 'draw',
        args: result,
      })
    )
  }
  let argParser = argsParserMap.get(result)
  if (!argParser) {
    return P.fail(`Unrecognized command '${result}'`)
  }

  return argParser.map(args =>
    node('command', {
      command: result,
      args,
    })
  )
})

const commandListParser = P.recursiveParser(() => P.many(commandParser))

export { commandParser, commandListParser }
