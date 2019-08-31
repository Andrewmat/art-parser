import artParser from './art-parser.js'

const $ = document.querySelector.bind(document)

$('#submit').addEventListener('click', () => {
  const targetString = $('#input')
    .value.split('\n')
    .map(line => line.trim())
    .join('')

  const obj = artParser.run(targetString)

  $('#output').value = JSON.stringify(obj.result, null, 2)
})
