import { Xumm } from 'xumm';

const apiKey = process.env.REACT_APP_XUMM_API_KEY;

if (!apiKey) {
  throw new Error("❌ Missing REACT_APP_XUMM_API_KEY in your .env file.");
}

export const xumm = new Xumm(apiKey);
