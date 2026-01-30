import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bracketService } from '../../services/bracket.service';
import { Bracket, Matchup as MatchupType } from '../../types';
import { Matchup } from './Matchup';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../context/AuthContext';

export const BracketView = () => {
  const { group } = useParams<{ group: 'early' | 'late' }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [matchups, setMatchups] = useState<MatchupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBracketData = useCallback(async () => {
    try {
      // First find the bracket ID by group
      const allBrackets = await bracketService.getAllBrackets();
      const targetBracket = allBrackets.find(b => b.bracketGroup === group);

      if (!targetBracket) {
        setError(`No ${group === 'early' ? 'Seasons 1-8' : 'Seasons 9-16'} bracket found`);
        setLoading(false);
        return;
      }

      // Get all data in one optimized request (1 query instead of 30+)
      const data = await bracketService.getCurrentRoundWithVotes(targetBracket.id);

      setBracket(data.bracket);
      setMatchups(data.matchups);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load bracket');
    } finally {
      setLoading(false);
    }
  }, [group]);

  // Initial load
  useEffect(() => {
    fetchBracketData();
  }, [fetchBracketData]);

  // Poll for updates every 10 seconds
  usePolling(fetchBracketData, 10000, !!bracket && bracket.status === 'active');

  const handleVoteCast = async () => {
    await fetchBracketData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="card max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button onClick={() => navigate('/brackets')} className="btn-primary">
            Back to Brackets
          </button>
        </div>
      </div>
    );
  }

  if (!bracket) {
    return (
      <div className="container-custom py-12">
        <div className="card max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Bracket Not Found</h2>
          <p className="text-gray-700 mb-6">
            The {group === 'early' ? 'Seasons 1-8' : 'Seasons 9-16'} bracket hasn't been created yet.
          </p>
          <button onClick={() => navigate('/brackets')} className="btn-primary">
            Back to Brackets
          </button>
        </div>
      </div>
    );
  }

  const isComplete = bracket.status === 'completed';
  const champion = isComplete && matchups.length === 1 ? matchups[0].winnerEpisode : null;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #1a0f08 100%)' }}>
      <div className="container-custom py-8">
        {/* Paddy's Pub Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/brackets')}
            className="text-yellow-400 hover:text-yellow-300 mb-4 flex items-center gap-2"
          >
            ← Back to Brackets
          </button>

          <div className="text-center mb-6">
            <div className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-lg shadow-2xl border-4 border-yellow-700 transform -rotate-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                🍺 PADDY'S PUB PRESENTS 🍺
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400 mt-4">{bracket.name}</h2>
            <p className="text-yellow-200 text-lg">
              {group === 'early' ? 'Seasons 1-8: The Golden Years' : 'Seasons 9-16: The Wild Ride'}
            </p>
          </div>

          <div className="text-center">
            <div
              className={`inline-block px-6 py-3 rounded-lg font-bold text-lg border-2 ${
                isComplete
                  ? 'bg-green-800 text-yellow-300 border-green-600'
                  : 'bg-amber-900 text-yellow-200 border-amber-700'
              }`}
            >
              {isComplete ? '🏆 CHAMPION CROWNED 🏆' : `🍻 Round ${bracket.currentRound} - DRINK UP! 🍻`}
            </div>
          </div>
        </div>

        {/* Champion Display */}
        {champion && (
          <div className="mb-8 p-8 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 rounded-lg shadow-2xl border-4 border-yellow-700 transform hover:scale-105 transition-transform">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-4 text-gray-900" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                🏆 PADDY'S PUB CHAMPION! 🏆
              </h2>
              <div className="bg-gray-900 bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-2 text-gray-900">{champion.title}</h3>
                <p className="text-xl text-gray-800 font-semibold">
                  Season {champion.seasonNumber}, Episode {champion.episodeNumber}
                </p>
                <p className="text-lg text-gray-700 mt-2">The People's Choice! 🍺</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {!user && bracket.status === 'active' && (
          <div className="mb-8 p-6 bg-amber-900 border-4 border-yellow-600 rounded-lg shadow-xl">
            <p className="text-center text-yellow-200 text-lg">
              <span className="font-bold">🍺 Step up to the bar! 🍺</span>
              <br />
              <a href="/login" className="font-bold underline hover:text-yellow-300">
                Login
              </a>
              {' or '}
              <a href="/register" className="font-bold underline hover:text-yellow-300">
                sign up
              </a>
              {' to cast your vote!'}
            </p>
          </div>
        )}

        {/* Matchups - Tournament Bracket Style */}
        {matchups.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-yellow-400">
                ⚔️ Current Matchups ⚔️
              </h3>
              <p className="text-yellow-200 text-sm mt-2">
                {matchups.filter(m => m.status === 'active').length} matchups live •
                {matchups.filter(m => m.status === 'completed').length} complete
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchups.map((matchup) => (
                <Matchup
                  key={matchup.id}
                  matchup={matchup}
                  onVoteCast={handleVoteCast}
                  hideVotes={!user?.isAdmin && matchup.status !== 'completed'}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-amber-900 border-2 border-yellow-600 rounded-lg text-center">
            <p className="text-yellow-200 text-lg">🍺 No matchups brewing yet... Check back soon! 🍺</p>
          </div>
        )}

        {/* Polling Indicator */}
        {!isComplete && (
          <div className="mt-8 text-center">
            <div className="inline-block px-6 py-3 bg-amber-900 border-2 border-yellow-700 rounded-lg">
              <p className="text-yellow-200 text-sm">
                🍻 Vote counts update every 10 seconds • Grab a drink while you wait! 🍻
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
