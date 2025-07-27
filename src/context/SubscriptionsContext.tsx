// src/context/SubscriptionsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Subscription {
  id: string;
  creatorAddress: string;
  subscriberAddress: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  nextPaymentDate: Date;
  lastPaymentDate?: Date;
  lastPaymentTxHash?: string;
  status: 'active' | 'paused' | 'cancelled';
  paymentHistory: PaymentRecord[];
  paymentMethod: 'manual' | 'wallet' | 'escrow';
  walletAddress?: string; // For subscription wallet method
  escrowId?: string; // For escrow method
  prepaidUntil?: Date; // For wallet/escrow methods
  walletBalance?: number; // Current balance in subscription wallet
}

export interface PaymentRecord {
  date: Date;
  amount: number;
  txHash: string;
  status: 'success' | 'failed';
  type: 'subscription' | 'funding'; // funding for wallet/escrow
}

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  loading: boolean;
  createSubscription: (
    creatorAddress: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly'
  ) => Promise<{ success: boolean; subscriptionId?: string; subscription?: Subscription }>;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
  recordPayment: (subscriptionId: string, txHash: string, type?: 'subscription' | 'funding') => void;
  updatePaymentMethod: (subscriptionId: string, method: 'manual' | 'wallet' | 'escrow', details?: any) => void;
  getNextPaymentDate: (subscription: Subscription) => Date;
  getDueSubscriptions: () => Subscription[];
  getSubscriptionById: (id: string) => Subscription | undefined;
  updateWalletBalance: (subscriptionId: string, balance: number) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

const STORAGE_KEY = 'microstream_subscriptions_v3';

export const SubscriptionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);

  // Load subscriptions from localStorage
  useEffect(() => {
    if (user?.address) {
      loadUserSubscriptions(user.address);
    }
  }, [user]);

  const loadUserSubscriptions = (userAddress: string) => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userAddress}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hydratedSubs = parsed.map((sub: any) => ({
          ...sub,
          startDate: new Date(sub.startDate),
          nextPaymentDate: new Date(sub.nextPaymentDate),
          lastPaymentDate: sub.lastPaymentDate ? new Date(sub.lastPaymentDate) : undefined,
          prepaidUntil: sub.prepaidUntil ? new Date(sub.prepaidUntil) : undefined,
          paymentHistory: sub.paymentHistory.map((p: any) => ({
            ...p,
            date: new Date(p.date)
          }))
        }));
        setSubscriptions(hydratedSubs);
      } catch (err) {
        console.error('Failed to load subscriptions:', err);
      }
    }
  };

  // Save subscriptions to localStorage
  useEffect(() => {
    if (user?.address && subscriptions.length > 0) {
      localStorage.setItem(
        `${STORAGE_KEY}_${user.address}`,
        JSON.stringify(subscriptions)
      );
    }
  }, [subscriptions, user]);

  const getNextPaymentDate = (subscription: Subscription): Date => {
    const baseDate = subscription.lastPaymentDate || subscription.startDate;
    const next = new Date(baseDate);

    switch (subscription.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }

    return next;
  };

  const getDueSubscriptions = (): Subscription[] => {
    const now = new Date();
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      
      // For manual payments, check if due
      if (sub.paymentMethod === 'manual') {
        return sub.nextPaymentDate <= now;
      }
      
      // For wallet/escrow, check if wallet needs refunding
      if (sub.paymentMethod === 'wallet' || sub.paymentMethod === 'escrow') {
        if (sub.prepaidUntil && sub.prepaidUntil <= now) {
          return true; // Needs refunding
        }
        if (sub.walletBalance !== undefined && sub.walletBalance < sub.amount) {
          return true; // Low balance
        }
      }
      
      return false;
    });
  };

  const createSubscription = async (
    creatorAddress: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<{ success: boolean; subscriptionId?: string; subscription?: Subscription }> => {
    if (!user?.address) {
      return { success: false };
    }

    const newSubscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorAddress,
      subscriberAddress: user.address,
      amount,
      frequency,
      startDate: new Date(),
      nextPaymentDate: new Date(),
      status: 'active',
      paymentHistory: [],
      paymentMethod: 'manual' // Default to manual, user can change later
    };

    // Calculate next payment date based on frequency
    newSubscription.nextPaymentDate = getNextPaymentDate(newSubscription);

    setSubscriptions(prev => [...prev, newSubscription]);

    return { 
      success: true, 
      subscriptionId: newSubscription.id,
      subscription: newSubscription 
    };
  };

  const updatePaymentMethod = (
    subscriptionId: string, 
    method: 'manual' | 'wallet' | 'escrow',
    details?: any
  ) => {
    setSubscriptions(prev =>
      prev.map(sub => {
        if (sub.id === subscriptionId) {
          return {
            ...sub,
            paymentMethod: method,
            walletAddress: details?.walletAddress,
            escrowId: details?.escrowId,
            prepaidUntil: details?.prepaidUntil,
            walletBalance: details?.walletBalance
          };
        }
        return sub;
      })
    );
  };

  const pauseSubscription = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: 'paused' } : sub
      )
    );
  };

  const resumeSubscription = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub => {
        if (sub.id === id) {
          return {
            ...sub,
            status: 'active',
            nextPaymentDate: getNextPaymentDate(sub)
          };
        }
        return sub;
      })
    );
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status: 'cancelled' } : sub
      )
    );
  };

  const recordPayment = (
    subscriptionId: string, 
    txHash: string,
    type: 'subscription' | 'funding' = 'subscription'
  ) => {
    setSubscriptions(prev =>
      prev.map(sub => {
        if (sub.id === subscriptionId) {
          const paymentRecord: PaymentRecord = {
            date: new Date(),
            amount: type === 'subscription' ? sub.amount : 0, // Will be set for funding
            txHash,
            status: 'success',
            type
          };

          const updatedSub = {
            ...sub,
            paymentHistory: [...sub.paymentHistory, paymentRecord]
          };

          if (type === 'subscription') {
            updatedSub.lastPaymentDate = new Date();
            updatedSub.lastPaymentTxHash = txHash;
            updatedSub.nextPaymentDate = getNextPaymentDate(sub);
          }

          return updatedSub;
        }
        return sub;
      })
    );
  };

  const getSubscriptionById = (id: string): Subscription | undefined => {
    return subscriptions.find(sub => sub.id === id);
  };

  const updateWalletBalance = (subscriptionId: string, balance: number) => {
    setSubscriptions(prev =>
      prev.map(sub =>
        sub.id === subscriptionId 
          ? { ...sub, walletBalance: balance } 
          : sub
      )
    );
  };

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        loading,
        createSubscription,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
        recordPayment,
        updatePaymentMethod,
        getNextPaymentDate,
        getDueSubscriptions,
        getSubscriptionById,
        updateWalletBalance
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error('useSubscriptions must be used within SubscriptionsProvider');
  }
  return context;
};