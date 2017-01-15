(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// --- START DEBUG ONLY CODE ---
// const fs = require('fs')
// const input = fs.readFileSync('test.asm', { encoding: 'utf-8' })
// --- END DEBUG ONLY CODE ---

const encoders = require('./encoders.js')
const lines = raw => raw.split('\n').map(s => s.trim()).filter(s => !!s)

const parse = lineArray => lineArray.map(line => {
  return { 
    instruction: line.substr(0, line.indexOf(' ')),
    arguments: line.substr(line.indexOf(' ')+1).split(',').map(s => s.trim())
  }
}).map(line => encoders[line.instruction].apply(null, line.arguments))

// console.log(parse(lines(input)))
module.exports = {
  'lines': lines,
  'parse': parse
}

},{"./encoders.js":4}],2:[function(require,module,exports){
// put some stuff into memory
const memory = require('../memory/memory.js')
const utils = require('./utils.js')

// Pads a string with 0's until it is the desired length
const padAddress = (addr, len, ch) => (addr.length >= len) ? 
  addr : ch.repeat(len-addr.length).concat(addr)

const incrAddr = (addr, n) => padAddress((parseInt(addr, 2) + n).toString(2), 32, '0')

const baseAddr = '0xbfc00000'
const loadBootCode = (code) => {
  memory.clearMemory()
  code.map((c, i) => memory.storeWord(incrAddr(utils.hex2bin(baseAddr, 32), i*4), utils.hex2bin(c, 32)))
}

module.exports = {
  'loadBootCode': loadBootCode
}

},{"../memory/memory.js":6,"./utils.js":5}],3:[function(require,module,exports){
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

},{"./assembler.js":1,"./bootload.js":2}],4:[function(require,module,exports){
const utils = require('./utils.js')

const regmap = [
  'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3', 't0', 't1', 't2', 't3', 't4', 't5',
  't6', 't7', 's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 't8', 't9', 'k0',
  'k1', 'gp', 'sp', 's8', 'ra' ]

const getReg = (id) => {
  if (id.startsWith('$')) {
    id = id.slice(1)
  }
  if ((isNaN(id) === false && +id >= 0 && +id <= 31) || (id = regmap.indexOf(id)) > -1) {
    return id
  } else {
    utils.error("Invalid register: " + id)
  }
}

const encoders = {
  'LUI': (rt, immediate) => 
  '0x'.concat(utils.bin2hex(
    '001111'.concat(
      '0'.repeat(5),
      utils.dec2binu(getReg(rt), 5),
      utils.hex2bin(immediate, 16)), 8)),
  'ORI': (rt, rs, immediate) => 
  '0x'.concat(utils.bin2hex(
    '001101'.concat(
      utils.dec2binu(getReg(rs), 5),
      utils.dec2binu(getReg(rt), 5),
      utils.hex2bin(immediate, 16)), 8)),
  'SW': (rt, offsetBase) => {
    const [offset, base] = utils.splitOffsetBase(offsetBase)
    return '0x'.concat(utils.bin2hex(
      '101011'.concat(
        utils.dec2binu(getReg(base), 5),
        utils.dec2binu(getReg(rt), 5),
        utils.int16_2bin(offset, 16)), 8))
  }
}

module.exports = encoders

},{"./utils.js":5}],5:[function(require,module,exports){
const error = (error) => console.error(error)

const dec2binu = (dec, length) => {
  let unsigned = Math.abs(dec)
  let bin = unsigned.toString(2)
  if (bin.length >= length) {
    return bin
  } else {
    return '0'.repeat(length - bin.length).concat(bin)
  }
}

const int16_2bin = (int16) => {
  const signed32 = (int16 >>> 0).toString(2)
  if (signed32.length > 16) {
    return signed32.slice(16)
  } else {
    return '0'.repeat(16 - signed32.length).concat(signed32)
  }
}

const hex2bin = (hex, length) => {
  if (hex.startsWith('0x')) {
    return dec2binu(parseInt(hex.slice(2), 16), length)
  } else {
    console.error("Hex immediates must start with 0x")
  }
}

const bin2hex = (bin, length) => {
  let hex = parseInt(bin, 2).toString(16)
  if (hex.length >= length) {
    return hex
  } else {
    return '0'.repeat(length - hex.length).concat(hex)
  }
}

const splitOffsetBase = (offsetBase) => offsetBase.trim().slice(0, -1).split('(').map(s => s.trim())

module.exports = {
  'error': error,
  'dec2binu': dec2binu,
  'hex2bin': hex2bin,
  'bin2hex': bin2hex,
  'int16_2bin': int16_2bin,
  'splitOffsetBase': splitOffsetBase
}

},{}],6:[function(require,module,exports){
// At the moment the memory array is a simple array, this means that _most_ of the time we
// will not be filling up the array and therefore will not be using much RAM, however if
// the full 4gb of memory are used, then it might prove problematic, and I will likely
// move to a server side memory model that persists most data to disk
let mainMemory = {}

// Pads a string with 0's until it is the desired length
const padAddress = (addr, len, ch) => (addr.length >= len) ? 
  addr : ch.repeat(len-addr.length).concat(addr)

// Converts a string address to a number, adds 1, then back to a string to be padded to 32 bits
const getNextAddr = addr => padAddress((parseInt(addr, 2) + 1).toString(2), 32, '0')

// Load a byte as a 32 bit 0 extended word
const loadByte = addr => padAddress(mainMemory[addr], 32, '0')

// Load a halfword as a 32 bit 0 extended word
const loadHalfWord = addr => padAddress(
  loadByte(getNextAddr(addr))
  .concat(loadByte(addr)), 32, '0')

// load a full 32 bit word into memory
const loadWord  = addr => padAddress(
  loadHalfWord(getNextAddr(getNextAddr(addr))).concat(
    loadHalfWord(addr)), 32, '0')

// Stores a single byte in the memory array
const storeByte = (addr, data) => {
  if (data.length == 8) {
    mainMemory[addr] = data
  } else {
    console.error("data length should be 8bit for byte store")
  }
}

// Stores two bytes in memory array, with the lower bytes in the lower addresses
const storeHalfWord = (addr, data) => {
  if (data.length == 16) {
    if (addr.slice(-1) === '0') {
      storeByte(addr, data.slice(8))
      storeByte(getNextAddr(addr), data.slice(0,8))
    } else {
      console.error("misaligned halfword assignments are not yet supported")
    }
  } else {
    console.error("data length should be 16bit for halfword store")
  }
}

// Stores two bytes in memory array, with the lower bytes in the lower addresses
const storeWord = (addr, data) => {
  if (data.length != 32) return console.error("data length should be 32bit") // function is void anyway so returning undefined doesn't matter
  storeHalfWord(addr, data.slice(16))
  storeHalfWord(getNextAddr(getNextAddr(addr)), data.slice(0, 16))
}

module.exports = {
  storeWord: storeWord,
  storeByte: storeByte,
  storeHalfWord, storeHalfWord,
  loadByte: loadByte,
  loadHalfWord: loadHalfWord,
  loadWord: loadWord,
  clearMemory: () => mainMemory = {}
}

},{}]},{},[3]);
