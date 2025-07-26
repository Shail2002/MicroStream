const fs = require('fs');
const path = require('path');
const { NFTStorage, File } = require('nft.storage');

const NFT_STORAGE_KEY = '1e139495.2844c3e250e84fa283e11d425a80c7ce'; // 🔐 Replace with your actual token
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

async function main() {
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'subscription.json');
  const buffer = fs.readFileSync(filePath);
  const file = new File([buffer], 'subscription.json', { type: 'application/json' });

  const cid = await client.storeBlob(file);
  console.log(`✅ Uploaded to IPFS: https://ipfs.io/ipfs/${cid}`);
}

main().catch(console.error);
