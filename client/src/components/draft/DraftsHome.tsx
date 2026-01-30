import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { draftService, DraftLeague } from '../../services/draft.service';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

export const DraftsHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [leagues, setLeagues] = useState<DraftLeague[]>([]);
  const [userLeagues, setUserLeagues] = useState<DraftLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const [all, userOwned] = await Promise.all([
          draftService.getAllLeagues(),
          user ? draftService.getUserLeagues() : Promise.resolve([]),
        ]);

        setLeagues(all);
        setUserLeagues(userOwned);
      } catch (error) {
        toast.error('Failed to load leagues');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, [user]);

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to create a league');
      navigate('/login');
      return;
    }

    setCreating(true);
    try {
      const league = await draftService.createLeague(leagueName);
      toast.success('League created!');
      navigate(`/drafts/${league.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create league');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-custom py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Fantasy Draft</h1>
          <p className="text-gray-600">
            Draft episodes and compete against friends!
          </p>
        </div>

        {user && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Create League'}
          </button>
        )}
      </div>

      {/* Create League Form */}
      {showCreateForm && (
        <div className="card mb-8 bg-blue-50 border-2 border-blue-200">
          <h2 className="text-2xl font-bold mb-4">Create New League</h2>
          <form onSubmit={handleCreateLeague}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                League Name
              </label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                className="input-field"
                placeholder="e.g., The Gang's Draft League"
                required
                minLength={3}
              />
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Default settings: 8 teams, 10 episodes per team, bracket-based scoring
            </div>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary"
            >
              {creating ? 'Creating...' : 'Create League'}
            </button>
          </form>
        </div>
      )}

      {/* User's Leagues */}
      {user && userLeagues.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Your Leagues</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLeagues.map((league) => (
              <div key={league.id} className="card hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2">{league.name}</h3>
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      league.status === 'setup'
                        ? 'bg-gray-100 text-gray-800'
                        : league.status === 'drafting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : league.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {league.status === 'setup'
                      ? 'Setup'
                      : league.status === 'drafting'
                      ? 'Drafting Now!'
                      : league.status === 'active'
                      ? 'Active'
                      : 'Completed'}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/drafts/${league.id}`)}
                  className="btn-primary w-full"
                >
                  View League
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Public Leagues */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Leagues</h2>
        {leagues.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600">
              No leagues yet. {user ? 'Create one to get started!' : 'Login to create a league!'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues
              .filter(l => l.status === 'setup')
              .map((league) => (
                <div key={league.id} className="card hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold mb-2">{league.name}</h3>
                  <p className="text-gray-600 mb-2">
                    Max Teams: {league.maxTeams}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Episodes per Team: {league.episodesPerTeam}
                  </p>
                  <button
                    onClick={() => navigate(`/drafts/${league.id}`)}
                    className="btn-secondary w-full"
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="card max-w-2xl mx-auto mt-12 bg-gray-50">
        <h3 className="text-xl font-bold mb-4 text-center">How Fantasy Draft Works</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">1️⃣</span>
            <span>Create or join a draft league</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2️⃣</span>
            <span>Draft episodes in snake draft order</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3️⃣</span>
            <span>Episodes earn points based on bracket performance</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4️⃣</span>
            <span>Compete head-to-head against other teams</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">5️⃣</span>
            <span>Highest scoring team wins!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
