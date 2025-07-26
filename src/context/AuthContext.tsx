// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { xummService } from '../services/xumm-service';

interface User {
  address: string;
  network: string;
  publicKey?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('xumm_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('xumm_user');
      }
    }
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);

    try {
      const walletInfo = await xummService.connectWallet();
      
      const userData: User = {
        address: walletInfo.address,
        network: walletInfo.network,
        publicKey: walletInfo.publicKey
      };

      setUser(userData);
      localStorage.setItem('xumm_user', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setUser(null);
    localStorage.removeItem('xumm_user');
    xummService.disconnect();
  };

  const value = {
    user,
    loading,
    error,
    connectWallet,
    disconnect,
    isConnected: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};