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
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/brackets')}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Brackets
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{bracket.name}</h1>
            <p className="text-gray-600">
              {group === 'early' ? 'Seasons 1-8' : 'Seasons 9-16'}
            </p>
          </div>

          <div className="text-right">
            <div
              className={`inline-block px-4 py-2 rounded-full font-semibold ${
                isComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isComplete ? 'Complete' : `Round ${bracket.currentRound}`}
            </div>
          </div>
        </div>
      </div>

      {/* Champion Display */}
      {champion && (
        <div className="card bg-gradient-to-r from-yellow-100 to-yellow-200 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">🏆 Champion! 🏆</h2>
            <h3 className="text-2xl font-semibold mb-1">{champion.title}</h3>
            <p className="text-gray-700">
              Season {champion.seasonNumber}, Episode {champion.episodeNumber}
            </p>
          </div>
        </div>
      )}

      {/* Login Prompt */}
      {!user && bracket.status === 'active' && (
        <div className="card bg-blue-50 border-2 border-blue-200 mb-8">
          <p className="text-center text-blue-900">
            <a href="/login" className="font-semibold underline">
              Login
            </a>{' '}
            or{' '}
            <a href="/register" className="font-semibold underline">
              sign up
            </a>{' '}
            to vote in the bracket!
          </p>
        </div>
      )}

      {/* Matchups Grid */}
      {matchups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchups.map((matchup) => (
            <Matchup key={matchup.id} matchup={matchup} onVoteCast={handleVoteCast} />
          ))}
        </div>
      ) : (
        <div className="card text-center">
          <p className="text-gray-600">No matchups available for this round.</p>
        </div>
      )}

      {/* Polling Indicator */}
      {!isComplete && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Vote counts update automatically every 10 seconds</p>
        </div>
      )}
    </div>
  );
};
