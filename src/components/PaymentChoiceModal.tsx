// src/components/PaymentChoiceModal.tsx
import React, { useState } from 'react';
import { Shield, Zap, Lock, X } from 'lucide-react';

interface PaymentChoiceModalProps {
  subscription: any;
  onClose: () => void;
  onChoice: (method: 'manual' | 'wallet' | 'escrow', prepayAmount?: number) => void;
}

const PaymentChoiceModal: React.FC<PaymentChoiceModalProps> = ({ 
  subscription, 
  onClose, 
  onChoice 
}) => {
  const [selected, setSelected] = useState<string>('manual');

  // Calculate correct amounts based on frequency
  const calculateMonthlyEquivalent = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'daily':
        return amount * 30; // 30 days per month
      case 'weekly':
        return amount * 4.33; // ~4.33 weeks per month
      case 'monthly':
        return amount;
      default:
        return amount;
    }
  };

  const monthlyAmount = calculateMonthlyEquivalent(subscription.amount, subscription.frequency);

  const paymentMethods = [
    {
      id: 'manual',
      name: 'Manual Approval',
      description: 'Approve each payment individually when due',
      icon: Shield,
      pros: ['Maximum control', 'No prepayment needed', 'Pay as you go'],
      cons: ['Requires action each time'],
      prepayMonths: 0,
      prepayAmount: 0
    },
    {
      id: 'wallet',
      name: 'Subscription Wallet',
      description: 'Fund a dedicated wallet that automatically pays subscriptions',
      icon: Zap,
      pros: ['Automatic payments', 'Add funds anytime', 'Works for all subscriptions'],
      cons: ['Initial funding required'],
      prepayMonths: 3,
      prepayAmount: monthlyAmount * 3,
      recommended: true
    },
    {
      id: 'escrow',
      name: 'Escrow Prepayment',
      description: 'Lock funds on-chain for this specific subscription',
      icon: Lock,
      pros: ['Guaranteed payments', 'Creator security', 'No trust required'],
      cons: ['Funds locked', 'Cannot use for other subscriptions'],
      prepayMonths: 6,
      prepayAmount: monthlyAmount * 6
    }
  ];

  const selectedMethod = paymentMethods.find(m => m.id === selected);

  const handleContinue = () => {
    if (selected === 'wallet') {
      // For wallet method, we don't need prepayment here
      // User will fund the wallet separately
      onChoice('wallet', 0);
    } else {
      onChoice(selected as any, selectedMethod?.prepayAmount || 0);
    }
  };

  const formatFrequencyAmount = () => {
    const freq = subscription.frequency;
    const amount = subscription.amount;
    
    switch (freq) {
      case 'daily':
        return `${amount} XRP daily (${monthlyAmount.toFixed(2)} XRP/month)`;
      case 'weekly':
        return `${amount} XRP weekly (${monthlyAmount.toFixed(2)} XRP/month)`;
      case 'monthly':
        return `${amount} XRP monthly`;
      default:
        return `${amount} XRP ${freq}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Subscription to: <span className="font-mono">{subscription.creatorAddress.slice(0, 8)}...</span>
          </p>
          <p className="text-sm text-gray-600">
            Amount: <span className="font-semibold">{formatFrequencyAmount()}</span>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelected(method.id)}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selected === method.id 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {method.recommended && (
                <span className="absolute -top-3 right-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  selected === method.id ? 'bg-indigo-100' : 'bg-gray-100'
                }`}>
                  <method.icon className={`w-6 h-6 ${
                    selected === method.id ? 'text-indigo-600' : 'text-gray-500'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{method.name}</h3>
                  <p className="text-gray-600 mt-1">{method.description}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Advantages:</p>
                      <ul className="space-y-1">
                        {method.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-1">✓</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700 mb-1">Considerations:</p>
                      <ul className="space-y-1">
                        {method.cons.map((con, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-orange-500 mr-1">•</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {method.id === 'wallet' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>How it works:</strong> Create a separate wallet that holds funds for all your subscriptions. 
                        The system automatically pays from this wallet when payments are due.
                      </p>
                    </div>
                  )}

                  {method.id !== 'manual' && method.prepayAmount > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Prepayment required: <span className="font-semibold">{method.prepayAmount.toFixed(2)} XRP</span>
                        <span className="text-xs block mt-1">
                          Covers {method.prepayMonths} months of subscription
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Selected method:</p>
              <p className="font-semibold">{selectedMethod?.name}</p>
            </div>
            {selectedMethod && selectedMethod.prepayAmount > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Total to pay now:</p>
                <p className="text-xl font-bold text-indigo-600">{selectedMethod.prepayAmount.toFixed(2)} XRP</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Continue with {selectedMethod?.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentChoiceModal;