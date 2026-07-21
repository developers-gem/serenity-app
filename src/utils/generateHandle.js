const crypto = require('crypto');
const User = require('../models/User');

/**
 * Generates a unique anon-XXXXXXXX handle, retrying on the rare
 * collision. This is the only "username" concept in the system.
 */
async function generateUniqueHandle() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const handle = `anon-${crypto.randomBytes(4).toString('hex')}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await User.exists({ anonHandle: handle });
    if (!exists) return handle;
  }
  throw new Error('Could not generate a unique anonymous handle after 5 attempts.');
}

module.exports = generateUniqueHandle;
