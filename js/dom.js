// This file should hold the DOM interaction code
let hex = ''
const assembler = require('./assembler.js')
const bootloader = require('./bootload.js')

const assembleButton = document.getElementById('assemble')
const assembleButtonHandler = event => {
  const code = document.getElementById('code')
  const rawCode = code.value
  hex = assembler.parse(assembler.lines(rawCode))
  bootloader.loadBootCode(hex)
  console.log(hex.join('\n'))
}
  

assembleButton.addEventListener('click', assembleButtonHandler)
