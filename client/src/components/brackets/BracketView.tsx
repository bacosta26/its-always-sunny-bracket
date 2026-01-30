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
  const [matchupsByRound, setMatchupsByRound] = useState<Record<number, MatchupType[]>>({});
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

      // Get ALL matchups with votes in one query
      const data = await bracketService.getAllMatchupsWithVotes(targetBracket.id);

      setBracket(data.bracket);

      // Group matchups by round
      const byRound: Record<number, MatchupType[]> = {};
      data.matchups.forEach((matchup: MatchupType) => {
        if (!byRound[matchup.roundNumber]) {
          byRound[matchup.roundNumber] = [];
        }
        byRound[matchup.roundNumber].push(matchup);
      });

      setMatchupsByRound(byRound);
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
  const rounds = Object.keys(matchupsByRound).map(Number).sort((a, b) => a - b);
  const maxRound = Math.max(...rounds);
  const finalMatchup = matchupsByRound[maxRound]?.[0];
  const champion = isComplete && finalMatchup ? finalMatchup.winnerEpisode : null;

  // Determine round names
  const getRoundName = (roundNum: number, totalRounds: number) => {
    if (roundNum === totalRounds) return 'Championship';
    if (roundNum === totalRounds - 1) return 'Semi-Finals';
    if (roundNum === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNum}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #1a0f08 100%)' }}>
      <div className="py-8">
        {/* Paddy's Pub Header */}
        <div className="container-custom mb-8">
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
              {isComplete ? '🏆 CHAMPION CROWNED 🏆' : `🍻 ${getRoundName(bracket.currentRound, maxRound)} - DRINK UP! 🍻`}
            </div>
          </div>
        </div>

        {/* Champion Display */}
        {champion && (
          <div className="container-custom mb-8">
            <div className="p-8 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 rounded-lg shadow-2xl border-4 border-yellow-700 transform hover:scale-105 transition-transform">
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
          </div>
        )}

        {/* Login Prompt */}
        {!user && bracket.status === 'active' && (
          <div className="container-custom mb-8">
            <div className="p-6 bg-amber-900 border-4 border-yellow-600 rounded-lg shadow-xl">
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
          </div>
        )}

        {/* Tournament Bracket Tree */}
        {rounds.length > 0 ? (
          <div className="overflow-x-auto pb-8">
            <div className="min-w-max px-8">
              <div className="flex gap-12 justify-center items-start">
                {rounds.map((roundNum) => {
                  const matchups = matchupsByRound[roundNum];
                  const isCurrentRound = roundNum === bracket.currentRound;

                  return (
                    <div key={roundNum} className="flex flex-col">
                      {/* Round Header */}
                      <div className="text-center mb-6 sticky top-0 z-10 bg-gradient-to-b from-stone-900 to-transparent pb-4">
                        <div className={`inline-block px-4 py-2 rounded-lg border-2 ${
                          isCurrentRound
                            ? 'bg-yellow-600 border-yellow-500 text-gray-900 font-bold shadow-lg'
                            : 'bg-stone-800 border-stone-600 text-yellow-300'
                        }`}>
                          {getRoundName(roundNum, maxRound)}
                        </div>
                        <p className="text-yellow-200 text-xs mt-1">
                          {matchups.filter(m => m.status === 'active').length > 0 && '🔴 LIVE'}
                        </p>
                      </div>

                      {/* Matchups for this round */}
                      <div className="flex flex-col gap-8" style={{
                        // Add spacing between matchups to create bracket tree effect
                        paddingTop: roundNum > 1 ? `${(Math.pow(2, roundNum - 1) - 1) * 2}rem` : 0,
                      }}>
                        {matchups.map((matchup, idx) => (
                          <div
                            key={matchup.id}
                            style={{
                              marginBottom: roundNum > 1 ? `${Math.pow(2, roundNum) * 2}rem` : '0',
                            }}
                          >
                            <Matchup
                              matchup={matchup}
                              onVoteCast={handleVoteCast}
                              hideVotes={!user?.isAdmin && matchup.status !== 'completed'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="container-custom">
            <div className="p-8 bg-amber-900 border-2 border-yellow-600 rounded-lg text-center">
              <p className="text-yellow-200 text-lg">🍺 No matchups brewing yet... Check back soon! 🍺</p>
            </div>
          </div>
        )}

        {/* Polling Indicator */}
        {!isComplete && (
          <div className="container-custom mt-8">
            <div className="text-center">
              <div className="inline-block px-6 py-3 bg-amber-900 border-2 border-yellow-700 rounded-lg">
                <p className="text-yellow-200 text-sm">
                  🍻 Vote counts update every 10 seconds • Grab a drink while you wait! 🍻
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
