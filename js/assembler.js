// --- START DEBUG ONLY CODE ---
const fs = require('fs')
const input = fs.readFileSync('test.asm', { encoding: 'utf-8' })
// --- END DEBUG ONLY CODE ---

const encoders = require('./encoders.js')
const lines = raw => raw.split('\n').map(s => s.trim()).filter(s => !!s)

const parse = lineArray => lineArray.map(line => {
  return { 
    instruction: line.substr(0, line.indexOf(' ')),
    arguments: line.substr(line.indexOf(' ')+1).split(',').map(s => s.trim())
  }
}).map(line => encoders[line.instruction].apply(null, line.arguments))

console.log(parse(lines(input)))
