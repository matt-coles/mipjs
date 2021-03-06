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
