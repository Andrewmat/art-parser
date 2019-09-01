import artParser from './dist/art-parser.js'
// import artAsDOM from './art-dom.js'

const $ = document.querySelector.bind(document)

$('#submit').addEventListener('click', () => {
  $('#output').innerHTML = ''
  const targetString = $('#input')
    .value.split('\n')
    .map(line => line.trim())
    .join('')

  const tree = artParser.run(targetString)

  // const treeDom = artAsDOM(tree.result)
  // treeDom.forEach(dom => {
  //   $('#output').appendChild(dom)
  // })

  if (tree.isError) {
    $('#output').value = tree.error
  } else {
    $('#output').value = JSON.stringify(tree.result, 0, 2)
  }
})
