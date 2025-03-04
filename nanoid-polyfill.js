// This is a polyfill for nanoid
// It provides a compatible API with nanoid v5
// that works in all environments

const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

function nanoid(size = 21) {
  let id = '';
  let i = size;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id;
}

// Export in the format expected by nanoid v5
module.exports = { nanoid };
module.exports.nanoid = nanoid;