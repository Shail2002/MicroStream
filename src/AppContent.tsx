// src/AppContent.tsx
import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';

const AppContent: React.FC = () => {
  const { isConnected } = useAuth();

  return isConnected ? <UserDashboard /> : <Login />;
};

export default AppContent;