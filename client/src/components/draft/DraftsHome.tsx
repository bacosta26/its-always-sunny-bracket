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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #2d0000 100%)' }}>
      <div className="container-custom py-12">
        {/* Dramatic Header */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <div className="inline-block px-8 py-6 bg-gradient-to-br from-red-900 via-red-800 to-black rounded-lg shadow-2xl border-4 border-yellow-600 transform -rotate-1 mb-4">
              <h1 className="text-5xl font-black text-yellow-300 tracking-wider mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
                🍷 CHARDEE MACDENNIS 🍷
              </h1>
              <p className="text-xl font-bold text-red-200 italic">
                The Game of Games: Episode Draft Edition
              </p>
            </div>
            <div className="text-red-200 text-sm max-w-2xl mx-auto">
              <p className="font-semibold italic">
                "The thrill of victory. The agony of defeat. The rules are sacred."
              </p>
            </div>
          </div>

          {user && (
            <div className="text-center">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-black rounded-lg shadow-xl border-2 border-yellow-500 transition-all transform hover:scale-105"
              >
                {showCreateForm ? '❌ CANCEL' : '⚔️ CREATE NEW GAME'}
              </button>
            </div>
          )}
        </div>

        {/* Create League Form */}
        {showCreateForm && (
          <div className="p-8 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-600 rounded-lg shadow-2xl mb-8">
            <div className="border-b-2 border-yellow-600 pb-4 mb-6">
              <h2 className="text-3xl font-black text-yellow-300 text-center">
                📜 ESTABLISH NEW GAME 📜
              </h2>
              <p className="text-red-200 text-center text-sm mt-2 italic">
                Write your name in the sacred record
              </p>
            </div>
            <form onSubmit={handleCreateLeague}>
              <div className="mb-6">
                <label className="block text-yellow-300 font-bold mb-3 text-lg">
                  🏆 GAME NAME
                </label>
                <input
                  type="text"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="w-full px-4 py-3 bg-black border-2 border-yellow-700 rounded-lg text-yellow-100 font-semibold focus:border-yellow-400 focus:outline-none"
                  placeholder="e.g., The Gang's Ultimate Challenge"
                  required
                  minLength={3}
                />
              </div>
              <div className="text-sm text-red-200 mb-6 p-4 bg-red-950 bg-opacity-50 rounded border-l-4 border-yellow-600">
                <p className="font-bold mb-2">⚠️ GAME RULES ⚠️</p>
                <p>• 8 Players Maximum</p>
                <p>• 10 Episodes Per Player</p>
                <p>• Scoring Based on Bracket Performance</p>
                <p className="italic mt-2">The rules cannot be questioned.</p>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-black text-yellow-300 font-black text-lg rounded-lg shadow-xl border-2 border-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {creating ? 'ESTABLISHING GAME...' : '🍷 BEGIN THE GAME 🍷'}
              </button>
            </form>
          </div>
        )}

        {/* User's Leagues - "Your Active Games" */}
        {user && userLeagues.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-yellow-300 inline-block px-6 py-3 bg-black bg-opacity-60 rounded-lg border-2 border-yellow-600">
                ⚔️ YOUR ACTIVE GAMES ⚔️
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userLeagues.map((league) => (
                <div
                  key={league.id}
                  className="p-6 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-700 rounded-lg shadow-2xl hover:border-yellow-500 transition-all transform hover:scale-105"
                >
                  <h3 className="text-xl font-black text-yellow-300 mb-3">{league.name}</h3>
                  <div className="mb-4">
                    <span
                      className={`inline-block px-4 py-2 rounded-lg text-sm font-black border-2 ${
                        league.status === 'setup'
                          ? 'bg-gray-800 text-gray-300 border-gray-600'
                          : league.status === 'drafting'
                          ? 'bg-yellow-700 text-black border-yellow-500 animate-pulse'
                          : league.status === 'active'
                          ? 'bg-red-700 text-yellow-300 border-red-500'
                          : 'bg-green-900 text-green-300 border-green-700'
                      }`}
                    >
                      {league.status === 'setup'
                        ? '📋 LEVEL 1: SETUP'
                        : league.status === 'drafting'
                        ? '🍷 LEVEL 2: DRAFTING!'
                        : league.status === 'active'
                        ? '⚔️ LEVEL 3: BATTLE'
                        : '🏆 COMPLETED'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/drafts/${league.id}`)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-black rounded-lg shadow-lg transition-all"
                  >
                    ENTER GAME
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Public Leagues - "Available Games" */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-yellow-300 inline-block px-6 py-3 bg-black bg-opacity-60 rounded-lg border-2 border-yellow-600">
              🎲 AVAILABLE GAMES 🎲
            </h2>
          </div>
          {leagues.length === 0 ? (
            <div className="p-8 bg-gradient-to-br from-red-950 to-black border-4 border-yellow-700 rounded-lg text-center">
              <p className="text-red-200 text-lg">
                {user ? '⚔️ No games yet. Create one to begin!' : '🔒 Login to create a game!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues
                .filter(l => l.status === 'setup')
                .map((league) => (
                  <div
                    key={league.id}
                    className="p-6 bg-gradient-to-br from-black to-red-950 border-4 border-red-800 rounded-lg shadow-2xl hover:border-yellow-600 transition-all transform hover:scale-105"
                  >
                    <h3 className="text-xl font-black text-red-300 mb-3">{league.name}</h3>
                    <div className="text-red-200 text-sm mb-4 space-y-1">
                      <p>🎯 Max Players: <span className="font-bold text-yellow-300">{league.maxTeams}</span></p>
                      <p>📺 Episodes Each: <span className="font-bold text-yellow-300">{league.episodesPerTeam}</span></p>
                    </div>
                    <button
                      onClick={() => navigate(`/drafts/${league.id}`)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-black text-yellow-300 font-black rounded-lg shadow-lg border-2 border-red-600 transition-all"
                    >
                      VIEW GAME
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Rules Section */}
        <div className="p-8 bg-gradient-to-br from-black via-red-950 to-black border-4 border-yellow-600 rounded-lg shadow-2xl max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-black text-yellow-300 mb-2">
              📜 THE SACRED RULES 📜
            </h3>
            <p className="text-red-300 italic text-sm">
              "Break the rules, face the consequences"
            </p>
          </div>

          <div className="space-y-6">
            {/* Level 1 */}
            <div className="border-l-4 border-yellow-600 pl-6 py-3 bg-red-950 bg-opacity-30">
              <h4 className="text-xl font-black text-yellow-400 mb-2">🎯 LEVEL 1: MIND</h4>
              <p className="text-red-200">Create or join a game. Assemble your team. Study the episodes.</p>
            </div>

            {/* Level 2 */}
            <div className="border-l-4 border-yellow-600 pl-6 py-3 bg-red-950 bg-opacity-30">
              <h4 className="text-xl font-black text-yellow-400 mb-2">🍷 LEVEL 2: BODY</h4>
              <p className="text-red-200">Draft episodes in snake order. Strategic picks earn victory. Each player selects their arsenal.</p>
            </div>

            {/* Level 3 */}
            <div className="border-l-4 border-yellow-600 pl-6 py-3 bg-red-950 bg-opacity-30">
              <h4 className="text-xl font-black text-yellow-400 mb-2">⚔️ LEVEL 3: SPIRIT</h4>
              <p className="text-red-200">Episodes battle in the bracket. Points awarded for victories. Compete head-to-head for supremacy.</p>
            </div>

            {/* Victory */}
            <div className="border-4 border-yellow-500 p-4 bg-gradient-to-r from-yellow-900 to-red-900">
              <p className="text-yellow-300 font-black text-center text-lg">
                🏆 HIGHEST SCORING TEAM CLAIMS VICTORY 🏆
              </p>
              <p className="text-center text-red-200 text-sm mt-2 italic">
                "No cheating. No mercy. No exceptions."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
