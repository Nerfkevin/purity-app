// This is a polyfill for nanoid/non-secure
// It provides the same API as nanoid/non-secure but uses a simple implementation
// that works in all environments

function nanoid(size = 21) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return id;
}

module.exports = nanoid;