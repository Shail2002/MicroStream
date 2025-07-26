// src/utils/did.ts
import { Client, isValidAddress } from 'xrpl';

export const createDIDFromAddress = (xrplAddress: string): string => {
  if (!isValidAddress(xrplAddress)) {
    throw new Error('Invalid XRPL address');
  }
  return `did:xrpl:${xrplAddress}`;
};

export const resolveDomainFromXRPL = async (address: string): Promise<string | null> => {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  
  try {
    await client.connect();
    
    const response = await client.request({
      command: 'account_info',
      account: address
    });
    
    const domain = response.result.account_data?.Domain;
    
    if (domain) {
      return Buffer.from(domain, 'hex').toString();
    }
    
    return null;
  } catch (error) {
    console.error('Error resolving domain from XRPL:', error);
    return null;
  } finally {
    await client.disconnect();
  }
};