// src/utils/xrpl.ts
import { Client, Wallet, xrpToDrops } from 'xrpl';
import { Buffer } from 'buffer';
import { Payment } from 'xrpl';

export class XRPLService {
  private client: Client;

  constructor() {
    this.client = new Client('wss://s.altnet.rippletest.net:51233'); 
  }

  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  getWalletFromSeed(seed: string): Wallet {
    return Wallet.fromSeed(seed);
  }

  getAddressFromSeed(seed: string): string {
    return Wallet.fromSeed(seed).classicAddress;
  }

  async createSubscription(
    subscriber: string,
    creator: string,
    amount: number,
    duration: number,
    walletSeed: string
  ): Promise<{ success: boolean; hash?: string }> {
    try {
      await this.connect();
      const wallet = Wallet.fromSeed(walletSeed);

      const tx: Payment = {
        TransactionType: 'Payment',
        Account: wallet.classicAddress,
        Destination: creator,
        Amount: xrpToDrops(amount),
        Memos: [
          {
            Memo: {
              MemoData: Buffer.from(`subscribe:${subscriber}:${duration}`, 'utf8').toString('hex')
            }
          }
        ]
      };

      const prepared = await this.client.autofill(tx);
      const signed = wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      const resultCode = (result.result.meta as any)?.TransactionResult;
      if (resultCode !== 'tesSUCCESS') {
        throw new Error(`Transaction failed: ${resultCode}`);
      }

      return { success: true, hash: result.result.hash };
    } catch (err) {
      console.error('XRPL Error:', err);
      return { success: false };
    }
  }
}
