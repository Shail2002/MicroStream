// src/components/PaymentQRCode.tsx
import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { xummService } from '../services/xumm-service';
import { Check, X, Clock, Smartphone, Info } from 'lucide-react';

interface PaymentQRCodeProps {
  creatorAddress: string;
  amount: number;
  subscriptionId: string;
  memo?: string;
  onSuccess: (txHash: string) => void;
  onCancel: () => void;
}

const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  creatorAddress,
  amount,
  subscriptionId,
  memo,
  onSuccess,
  onCancel
}) => {
  const [paymentData, setPaymentData] = useState<{
    uuid: string;
    qrUrl: string;
    deeplink: string;
  } | null>(null);
  const [status, setStatus] = useState<'pending' | 'signed' | 'cancelled'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createPaymentRequest();
  }, []);

  useEffect(() => {
    if (!paymentData) return;

    const interval = setInterval(async () => {
      try {
        const paymentStatus = await xummService.checkPaymentStatus(paymentData.uuid);
        
        if (paymentStatus.signed && paymentStatus.txHash) {
          setStatus('signed');
          clearInterval(interval);
          setTimeout(() => {
            onSuccess(paymentStatus.txHash!);
          }, 2000);
        } else if (paymentStatus.cancelled) {
          setStatus('cancelled');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [paymentData, onSuccess]);

  const createPaymentRequest = async () => {
    try {
      setLoading(true);
      const paymentMemo = memo || `subscription:${subscriptionId}`;
      const data = await xummService.createPaymentRequest(
        creatorAddress,
        (amount * 1000000).toString(), // Convert to drops
        paymentMemo
      );
      setPaymentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment request');
    } finally {
      setLoading(false);
    }
  };

  const openInApp = () => {
    if (paymentData?.deeplink) {
      window.open(paymentData.deeplink, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Creating payment request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        {status === 'pending' && (
          <>
            <h3 className="text-xl font-semibold text-center mb-2">Approve Payment</h3>
            <p className="text-gray-600 text-center mb-6">
              Scan this QR code with XUMM app to approve the payment
            </p>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">{amount} XRP</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">To:</span>
                <span className="font-mono text-sm">{creatorAddress.slice(0, 8)}...{creatorAddress.slice(-6)}</span>
              </div>
              {memo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="text-sm">{memo.includes('Prepayment') ? 'Subscription Funding' : 'Subscription Payment'}</span>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6">
              {paymentData?.qrUrl && (
                <QRCode
                  value={paymentData.qrUrl}
                  size={200}
                  className="mx-auto"
                />
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
              <Clock className="w-5 h-5 animate-pulse" />
              <span>Waiting for approval...</span>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                Open XUMM app on your phone and scan this QR code, or click the button below to open directly.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={openInApp}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-5 h-5" />
                <span>Open in XUMM</span>
              </button>
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {status === 'signed' && (
          <div className="text-center">
            <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600">
              {memo?.includes('Prepayment') 
                ? 'Your subscription has been funded successfully' 
                : 'Your subscription payment has been processed'}
            </p>
          </div>
        )}

        {status === 'cancelled' && (
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Cancelled</h3>
            <p className="text-gray-600 mb-6">The payment was cancelled in XUMM</p>
            <button
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentQRCode;