import artParser from './art-parser.js'
import artAsDOM from './art-dom.js'

const $ = document.querySelector.bind(document)

$('#submit').addEventListener('click', () => {
  $('#output').innerHTML = ''
  const targetString = $('#input')
    .value.split('\n')
    .map(line => line.trim())
    .join('')

  const tree = artParser.run(targetString)

  const treeDom = artAsDOM(tree.result)
  console.log(treeDom)
  treeDom.forEach(dom => {
    $('#output').appendChild(dom)
  })
})
