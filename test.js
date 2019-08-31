const fs = require('fs')
const args = process.argv.slice(2)
const { artParser } = require('./index.js')

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
} else {
  console.log(JSON.stringify(parseResponse.result, null, 2))
}
