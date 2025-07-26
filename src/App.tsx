// src/App.tsx
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionsProvider } from './context/SubscriptionsContext';
import AppContent from './AppContent';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionsProvider>
        <AppContent />
      </SubscriptionsProvider>
    </AuthProvider>
  );
};

export default App;