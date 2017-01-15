// put some stuff into memory
const memory = require('../memory/memory.js')
const utils = require('./utils.js')

// Pads a string with 0's until it is the desired length
const padAddress = (addr, len, ch) => (addr.length >= len) ? 
  addr : ch.repeat(len-addr.length).concat(addr)

const incrAddr = (addr, n) => padAddress((parseInt(addr, 2) + n).toString(2), 32, '0')

const baseAddr = '0xbfc00000'
const loadBootCode = (code) => code.map((c, i) => memory.storeWord(incrAddr(utils.hex2bin(baseAddr, 32), i*4), utils.hex2bin(c, 32)))

module.exports = {
  'loadBootCode': loadBootCode
}
