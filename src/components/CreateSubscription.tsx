// src/components/CreateSubscription.tsx
import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { X, Calendar, DollarSign } from 'lucide-react';
import PaymentChoiceModal from './PaymentChoiceModal';
import PaymentQRCode from './PaymentQRCode';

interface CreateSubscriptionProps {
  onClose: () => void;
}

const CreateSubscription: React.FC<CreateSubscriptionProps> = ({ onClose }) => {
  const { createSubscription, updatePaymentMethod } = useSubscriptions();
  const [step, setStep] = useState<'details' | 'payment-choice' | 'payment'>('details');
  const [formData, setFormData] = useState({
    creatorAddress: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly'
  });
  const [newSubscription, setNewSubscription] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'wallet' | 'escrow'>('manual');
  const [prepayAmount, setPrepayAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createSubscription(
        formData.creatorAddress,
        parseFloat(formData.amount),
        formData.frequency
      );

      if (result.success && result.subscription) {
        setNewSubscription(result.subscription);
        setStep('payment-choice');
      } else {
        setError('Failed to create subscription');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentChoice = (method: 'manual' | 'wallet' | 'escrow', amount?: number) => {
    setPaymentMethod(method);
    setPrepayAmount(amount || 0);
    
    // Update the subscription with the chosen payment method
    if (newSubscription) {
      updatePaymentMethod(newSubscription.id, method);
    }
    
    if (method === 'manual') {
      // For manual, just close - no immediate payment needed
      alert('✅ Subscription created! You\'ll be notified when payments are due.');
      onClose();
    } else if (method === 'wallet') {
      // For wallet method, redirect to wallet funding instead of payment
      alert('✅ Subscription created! Please fund your subscription wallet from the dashboard.');
      onClose();
    } else if (method === 'escrow' && amount && amount > 0) {
      // For escrow, proceed to payment
      setStep('payment');
    }
  };

  const handlePaymentSuccess = (txHash: string) => {
    alert(`✅ Subscription funded successfully! TX: ${txHash}`);
    onClose();
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  if (step === 'payment-choice' && newSubscription) {
    return (
      <PaymentChoiceModal
        subscription={newSubscription}
        onClose={() => setStep('details')}
        onChoice={handlePaymentChoice}
      />
    );
  }

  if (step === 'payment' && newSubscription) {
    return (
      <PaymentQRCode
        creatorAddress={newSubscription.creatorAddress}
        amount={prepayAmount}
        subscriptionId={newSubscription.id}
        memo={`Prepayment for subscription: ${paymentMethod}`}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setStep('payment-choice')}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create New Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          {/* Creator Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creator's XRPL Address
            </label>
            <input
              type="text"
              value={formData.creatorAddress}
              onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              pattern="^r[1-9A-HJ-NP-Za-km-z]{24,34}$"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Amount (XRP)</span>
              </div>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.5"
              step="0.000001"
              min="0.000001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Payment Frequency</span>
              </div>
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next Step:</strong> Choose your preferred payment method - 
              manual approval, subscription wallet, or escrow.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Next: Payment Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubscription;