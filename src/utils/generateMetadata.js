const fs = require('fs');
const path = require('path');
const { encryptMetadata } = require('./crypto');

const metadata = {
  subscriber: 'rXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  creator: 'rYYYYYYYYYYYYYYYYYYYYYYYYYYY',
  amount: 0.5,
  duration: 30,
  timestamp: new Date().toISOString(),
};

const encrypted = encryptMetadata(metadata);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const filePath = path.join(uploadsDir, 'subscription.json');

// ✅ Create uploads dir if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

fs.writeFileSync(filePath, JSON.stringify(encrypted, null, 2));

console.log('✅ Metadata written to:', filePath);
