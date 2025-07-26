const crypto = require('crypto');

const AES_KEY = crypto.createHash('sha256').update('microstream_secret').digest(); // 🔐 256-bit key

function encryptMetadata(metadata) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(metadata), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    iv: iv.toString('base64'),
    data: encrypted,
  };
}

module.exports = { encryptMetadata };
