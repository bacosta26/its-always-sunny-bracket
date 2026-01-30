import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BracketManager } from './BracketManager';
import { UserManagement } from './UserManagement';

type Tab = 'brackets' | 'users' | 'episodes';

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<Tab>('brackets');
  const navigate = useNavigate();

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Home
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage brackets, episodes, and users</p>
          </div>
          <div className="text-2xl">⚙️</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('brackets')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'brackets'
                ? 'border-b-2 border-sunny-yellow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 Brackets
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-sunny-yellow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('episodes')}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === 'episodes'
                ? 'border-b-2 border-sunny-yellow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📺 Episodes
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'brackets' && <BracketManager />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'episodes' && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-bold mb-2">Episode Management</h2>
            <p className="text-gray-600">
              Coming Soon - CRUD interface for managing episodes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
