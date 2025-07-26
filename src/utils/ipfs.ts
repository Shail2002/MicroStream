import { NFTStorage, File } from 'nft.storage';

const token = process.env.REACT_APP_NFT_STORAGE_TOKEN;
if (!token) {
  throw new Error("❌ Missing REACT_APP_NFT_STORAGE_TOKEN in your .env file.");
}

const client = new NFTStorage({ token });

export async function uploadToNFTStorage(data: any): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], 'subscription.json');
  const cid = await client.storeBlob(file);
  return `https://ipfs.io/ipfs/${cid}`;
}
