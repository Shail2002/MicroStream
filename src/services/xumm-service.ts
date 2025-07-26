// src/services/xumm-service.ts
import { Xumm } from 'xumm';

class XummService {
  private xumm: Xumm;

  constructor() {
    const apiKey = process.env.REACT_APP_XUMM_API_KEY;

    if (!apiKey) {
      throw new Error('Missing XUMM API key');
    }

    this.xumm = new Xumm(apiKey);
  }

  async connectWallet(): Promise<{
    address: string;
    network: string;
    publicKey?: string;
  }> {
    try {
      const subscription = await this.xumm.authorize();
      
      if (!subscription || subscription instanceof Error) {
        throw new Error('Failed to authorize XUMM wallet');
      }

      return {
        address: subscription.me.account,
        network: subscription.me.networkType || 'Unknown'
      };
    } catch (error) {
      console.error('XUMM connection error:', error);
      throw error;
    }
  }

  async createPaymentRequest(
    destination: string,
    amount: string,
    memo?: string
  ): Promise<{
    uuid: string;
    qrUrl: string;
    deeplink: string;
  }> {
    try {
      const request = {
        TransactionType: 'Payment' as const,
        Destination: destination,
        Amount: amount, // in drops
        Memos: memo ? [
          {
            Memo: {
              MemoData: Buffer.from(memo).toString('hex')
            }
          }
        ] : undefined
      };

      const payload = await this.xumm.payload?.create(request);

      if (!payload) {
        throw new Error('Failed to create XUMM payload');
      }

      return {
        uuid: payload.uuid,
        qrUrl: payload.refs.qr_png,
        deeplink: payload.next.always || payload.refs.qr_png // Fallback to QR if no deeplink
      };
    } catch (error) {
      console.error('Payment request creation error:', error);
      throw error;
    }
  }

  async checkPaymentStatus(uuid: string): Promise<{
    signed: boolean;
    txHash?: string;
    cancelled: boolean;
  }> {
    try {
      const payload = await this.xumm.payload?.get(uuid);

      if (!payload) {
        throw new Error('Failed to get payment status');
      }

      const txHash = payload.response?.txid || undefined;

      return {
        signed: payload.meta.signed,
        txHash: txHash,
        cancelled: payload.meta.cancelled || false
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  async createSubscriptionPayment(
    creatorAddress: string,
    amount: number,
    subscriptionId: string
  ): Promise<{
    uuid: string;
    qrUrl: string;
    deeplink: string;
  }> {
    const memo = JSON.stringify({
      type: 'subscription',
      id: subscriptionId,
      timestamp: new Date().toISOString()
    });

    return this.createPaymentRequest(
      creatorAddress,
      (amount * 1000000).toString(), // Convert XRP to drops
      memo
    );
  }

  disconnect(): void {
    // XUMM SDK handles cleanup internally
    console.log('XUMM wallet disconnected');
  }
}

export const xummService = new XummService();