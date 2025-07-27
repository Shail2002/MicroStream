// src/components/SubscriptionCard.tsx
import React, { useState } from 'react';
import { Calendar, DollarSign, User, Pause, Play, X, CreditCard, Clock, CheckCircle, Wallet, Lock, AlertCircle } from 'lucide-react';
import { Subscription } from '../context/SubscriptionsContext';
import { useSubscriptions } from '../context/SubscriptionsContext';
import PaymentQRCode from './PaymentQRCode';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => {
  const { pauseSubscription, resumeSubscription, cancelSubscription, recordPayment } = useSubscriptions();
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = () => {
    switch (subscription.paymentMethod) {
      case 'wallet':
        return <Wallet className="w-4 h-4 text-indigo-600" />;
      case 'escrow':
        return <Lock className="w-4 h-4 text-purple-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = () => {
    switch (subscription.paymentMethod) {
      case 'wallet':
        return 'Subscription Wallet';
      case 'escrow':
        return 'Escrow Prepaid';
      default:
        return 'Manual Approval';
    }
  };

  const isDue = subscription.status === 'active' && 
    subscription.paymentMethod === 'manual' && 
    new Date(subscription.nextPaymentDate) <= new Date();

  const needsRefunding = subscription.status === 'active' && 
    (subscription.paymentMethod === 'wallet' || subscription.paymentMethod === 'escrow') &&
    subscription.prepaidUntil && new Date(subscription.prepaidUntil) <= new Date();

  const lowBalance = subscription.paymentMethod === 'wallet' && 
    subscription.walletBalance !== undefined && 
    subscription.walletBalance < subscription.amount;

  const handlePaymentSuccess = (txHash: string) => {
    recordPayment(subscription.id, txHash);
    setShowPaymentQR(false);
    setIsProcessing(false);
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    setShowPaymentQR(true);
  };

  const handlePauseResume = () => {
    if (subscription.status === 'active') {
      pauseSubscription(subscription.id);
    } else if (subscription.status === 'paused') {
      resumeSubscription(subscription.id);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      cancelSubscription(subscription.id);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 border ${isDue || needsRefunding ? 'border-orange-300' : 'border-gray-200'} hover:shadow-lg transition-shadow`}>
        {/* Alerts */}
        {isDue && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Payment Due</span>
            </div>
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              Pay Now
            </button>
          </div>
        )}

        {needsRefunding && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Refunding Required</span>
            </div>
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700 disabled:opacity-50"
            >
              Refund Wallet
            </button>
          </div>
        )}

        {lowBalance && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">Low wallet balance: {subscription.walletBalance} XRP</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600 font-mono">
              {subscription.creatorAddress.substring(0, 8)}...{subscription.creatorAddress.substring(subscription.creatorAddress.length - 6)}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
            {subscription.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-lg font-semibold">{subscription.amount} XRP</span>
            </div>
            <span className="text-sm text-gray-500 capitalize">{subscription.frequency}</span>
          </div>

          {/* Payment Method */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
            {getPaymentMethodIcon()}
            <span className="text-sm font-medium">{getPaymentMethodLabel()}</span>
            {subscription.prepaidUntil && (
              <span className="text-xs text-gray-500 ml-auto">
                Prepaid until: {formatDate(subscription.prepaidUntil)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Next Payment:</span>
              <p className="font-medium">{formatDate(subscription.nextPaymentDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Started:</span>
              <p className="font-medium">{formatDate(subscription.startDate)}</p>
            </div>
          </div>

          {subscription.lastPaymentDate && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Last payment: {formatDate(subscription.lastPaymentDate)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t flex space-x-2">
            {subscription.status !== 'cancelled' && (
              <>
                {!isDue && !needsRefunding && subscription.status === 'active' && subscription.paymentMethod === 'manual' && (
                  <button
                    onClick={handlePayNow}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Early</span>
                  </button>
                )}
                
                <button
                  onClick={handlePauseResume}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                  {subscription.status === 'active' ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Resume</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showPaymentQR && (
        <PaymentQRCode
          creatorAddress={subscription.creatorAddress}
          amount={needsRefunding ? subscription.amount * 3 : subscription.amount}
          subscriptionId={subscription.id}
          memo={needsRefunding ? 'Prepayment for subscription: wallet refund' : undefined}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentQR(false);
            setIsProcessing(false);
          }}
        />
      )}
    </>
  );
};