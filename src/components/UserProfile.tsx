import React from 'react';
import { CheckCircle, Shield } from 'lucide-react';

const UserProfile: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => (
  <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6">
    <div className="flex items-center space-x-4">
      <img
        src="https://images.unsplash.com/photo-1494790108755-2616b612b586?w=100&h=100&fit=crop"
        alt="Avatar"
        className="w-16 h-16 rounded-full border-2 border-white"
      />
      <div>
        <h2 className="text-xl font-bold">Shail Shah</h2>
        <div className="flex items-center space-x-1 text-sm">
          <Shield className="w-4 h-4 text-blue-200" />
          <span>DID Verified</span>
          <CheckCircle className="w-4 h-4 text-green-400 ml-1" />
        </div>
      </div>
    </div>
    <button
      onClick={onCreateClick}
      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg"
    >
      + New Subscription
    </button>
  </div>
);

export default UserProfile;
