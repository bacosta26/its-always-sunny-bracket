import { useState, useEffect } from 'react';
import { bracketService } from '../../services/bracket.service';
import api from '../../services/api';
import { Bracket } from '../../types';
import toast from 'react-hot-toast';

export const BracketManager = () => {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<'early' | 'late' | null>(null);

  useEffect(() => {
    fetchBrackets();
  }, []);

  const fetchBrackets = async () => {
    try {
      const data = await bracketService.getAllBrackets();
      setBrackets(data);
    } catch (error) {
      toast.error('Failed to load brackets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBracket = async (bracketGroup: 'early' | 'late') => {
    setCreating(bracketGroup);
    try {
      await api.post('/admin/brackets', { bracketGroup });
      toast.success(`${bracketGroup === 'early' ? 'Seasons 1-8' : 'Seasons 9-16'} bracket created!`);
      await fetchBrackets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create bracket');
    } finally {
      setCreating(null);
    }
  };

  const handleResetBracket = async (bracketId: string) => {
    if (!confirm('Are you sure you want to reset this bracket? This will delete all votes!')) {
      return;
    }

    try {
      await api.post(`/admin/brackets/${bracketId}/reset`);
      toast.success('Bracket reset successfully');
      await fetchBrackets();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset bracket');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading brackets...</div>;
  }

  const earlyBracket = brackets.find(b => b.bracketGroup === 'early');
  const lateBracket = brackets.find(b => b.bracketGroup === 'late');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Bracket Management</h2>
        <p className="text-gray-600 mb-6">
          Create and manage tournament brackets for episode voting.
        </p>
      </div>

      {/* Early Bracket (Seasons 1-8) */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Seasons 1-8 Bracket</h3>
            <p className="text-sm text-gray-600">The Classic Era</p>
          </div>
          {earlyBracket && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                earlyBracket.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {earlyBracket.status === 'active' ? 'Active' : 'Completed'}
            </span>
          )}
        </div>

        {earlyBracket ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Current Round: {earlyBracket.currentRound}</p>
              <p className="text-sm text-gray-600">Status: {earlyBracket.status}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`/brackets/early`, '_blank')}
                className="btn-secondary"
              >
                View Bracket
              </button>
              <button
                onClick={() => handleResetBracket(earlyBracket.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Reset Bracket
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleCreateBracket('early')}
            disabled={creating === 'early'}
            className="btn-primary w-full"
          >
            {creating === 'early' ? 'Creating...' : 'Create Seasons 1-8 Bracket'}
          </button>
        )}
      </div>

      {/* Late Bracket (Seasons 9-16) */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold">Seasons 9-16 Bracket</h3>
            <p className="text-sm text-gray-600">The Modern Era</p>
          </div>
          {lateBracket && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                lateBracket.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {lateBracket.status === 'active' ? 'Active' : 'Completed'}
            </span>
          )}
        </div>

        {lateBracket ? (
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Current Round: {lateBracket.currentRound}</p>
              <p className="text-sm text-gray-600">Status: {lateBracket.status}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`/brackets/late`, '_blank')}
                className="btn-secondary"
              >
                View Bracket
              </button>
              <button
                onClick={() => handleResetBracket(lateBracket.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
              >
                Reset Bracket
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => handleCreateBracket('late')}
            disabled={creating === 'late'}
            className="btn-primary w-full"
          >
            {creating === 'late' ? 'Creating...' : 'Create Seasons 9-16 Bracket'}
          </button>
        )}
      </div>

      <div className="card bg-blue-50 border-2 border-blue-200">
        <h3 className="font-bold mb-2">ℹ️ How Brackets Work</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Episodes are randomly seeded into a tournament bracket</li>
          <li>• Users vote for their favorite episode in each matchup</li>
          <li>• Winners automatically advance to the next round</li>
          <li>• The last episode standing becomes the champion!</li>
        </ul>
      </div>
    </div>
  );
};
