const utils = require('./utils.js')

const regmap = [
  'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 't0', 't1', 't2', 't3', 't4', 't5',
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
