// At the moment the memory array is a simple array, this means that _most_ of the time we
// will not be filling up the array and therefore will not be using much RAM, however if
// the full 4gb of memory are used, then it might prove problematic, and I will likely
// move to a server side memory model that persists most data to disk
const mainMemory = {}

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
  loadWord: loadWord
}
