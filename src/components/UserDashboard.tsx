// src/components/UserDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Plus, LogOut, AlertCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { SubscriptionCard } from './SubscriptionCard';
import CreateSubscription from './CreateSubscription';

const UserDashboard: React.FC = () => {
  const { user, disconnect } = useAuth();
  const { subscriptions, getDueSubscriptions } = useSubscriptions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');

  const dueSubscriptions = getDueSubscriptions();

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'all') return true;
    return sub.status === activeTab;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    monthlySpend: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const multiplier = s.frequency === 'daily' ? 30 : s.frequency === 'weekly' ? 4 : 1;
        return sum + (s.amount * multiplier);
      }, 0)
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'paused', label: 'Paused', count: subscriptions.filter(s => s.status === 'paused').length },
    { id: 'cancelled', label: 'Cancelled', count: subscriptions.filter(s => s.status === 'cancelled').length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MicroStream</h1>
              <p className="text-sm text-gray-600">Manage your subscriptions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Connected as</p>
                <p className="text-sm font-mono font-medium">
                  {user?.address.slice(0, 8)}...{user?.address.slice(-6)}
                </p>
              </div>
              <button
                onClick={disconnect}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Due Payments Alert */}
        {dueSubscriptions.length > 0 && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-orange-800 font-medium">
                You have {dueSubscriptions.length} payment{dueSubscriptions.length !== 1 ? 's' : ''} due
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Spend</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlySpend.toFixed(2)} XRP</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs and Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Subscription</span>
          </button>
        </div>

        {/* Subscriptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No subscriptions found</p>
              {activeTab === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create your first subscription
                </button>
              )}
            </div>
          ) : (
            filteredSubscriptions.map(subscription => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))
          )}
        </div>
      </div>

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <CreateSubscription onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default UserDashboard;