import fs from 'fs'
import artParser from '../src/index.mjs'

const args = process.argv.slice(2)
const fileName = args[0]

if (!fileName) {
  console.error('A file name should be specified')
  process.exit(1)
}

const artFile = fs.readFileSync(fileName, { encoding: 'UTF-8' })

const artTarget = artFile
  .split('\n')
  .map(line => line.trim())
  .join('')

const parseResponse = artParser.run(artTarget)

if (parseResponse.isError) {
  console.error(parseResponse.error)
  process.exit(1)
} else {
  console.log(JSON.stringify(parseResponse.result, null, 2))
}
