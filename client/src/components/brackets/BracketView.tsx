import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bracketService } from '../../services/bracket.service';
import { Bracket, Matchup as MatchupType } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../context/AuthContext';
import { bracketService as voteService } from '../../services/bracket.service';

interface BracketMatchupProps {
  matchup: MatchupType;
  hideVotes: boolean;
  onVote: (matchupId: string, episodeId: string) => void;
}

const BracketMatchup = ({ matchup, hideVotes, onVote }: BracketMatchupProps) => {
  const [voting, setVoting] = useState(false);
  const episode1 = matchup.episode1;
  const episode2 = matchup.episode2;

  if (!episode1 || !episode2) {
    return (
      <div className="w-64 p-3 bg-stone-800 bg-opacity-50 border-2 border-stone-600 rounded text-center text-yellow-200 text-sm">
        🍺 TBD 🍺
      </div>
    );
  }

  const isComplete = matchup.status === 'completed';
  const isActive = matchup.status === 'active';
  const totalVotes = matchup.voteCountEp1 + matchup.voteCountEp2;
  const showVotes = !hideVotes;

  const isEp1Winner = isComplete && matchup.winnerEpisode?.id === episode1.id;
  const isEp2Winner = isComplete && matchup.winnerEpisode?.id === episode2.id;

  const handleVote = async (episodeId: string) => {
    if (voting || !isActive) return;
    setVoting(true);
    try {
      await onVote(matchup.id, episodeId);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="w-64 bg-gradient-to-br from-amber-900 to-stone-900 border-2 border-yellow-700 rounded-lg overflow-hidden">
      {/* Episode 1 */}
      <div
        className={`p-2 border-b-2 transition-all cursor-pointer ${
          isEp1Winner
            ? 'bg-yellow-500 bg-opacity-40 border-yellow-400'
            : matchup.userVote === episode1.id
            ? 'bg-blue-500 bg-opacity-20 border-blue-400'
            : 'border-stone-600 hover:bg-stone-800'
        }`}
        onClick={() => handleVote(episode1.id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="text-yellow-100 font-semibold text-sm truncate">{episode1.title}</p>
            <p className="text-yellow-200 text-xs opacity-80">
              S{episode1.seasonNumber}E{episode1.episodeNumber}
            </p>
          </div>
          {isEp1Winner && <span className="text-xl ml-1">🏆</span>}
        </div>
        {showVotes && totalVotes > 0 && (
          <div className="mt-1 text-yellow-200 text-xs font-semibold">
            {matchup.voteCountEp1} votes
          </div>
        )}
      </div>

      {/* VS Divider */}
      <div className="bg-stone-900 py-1 text-center">
        <span className="text-yellow-400 font-bold text-xs">VS</span>
      </div>

      {/* Episode 2 */}
      <div
        className={`p-2 border-t-2 transition-all cursor-pointer ${
          isEp2Winner
            ? 'bg-yellow-500 bg-opacity-40 border-yellow-400'
            : matchup.userVote === episode2.id
            ? 'bg-blue-500 bg-opacity-20 border-blue-400'
            : 'border-stone-600 hover:bg-stone-800'
        }`}
        onClick={() => handleVote(episode2.id)}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="text-yellow-100 font-semibold text-sm truncate">{episode2.title}</p>
            <p className="text-yellow-200 text-xs opacity-80">
              S{episode2.seasonNumber}E{episode2.episodeNumber}
            </p>
          </div>
          {isEp2Winner && <span className="text-xl ml-1">🏆</span>}
        </div>
        {showVotes && totalVotes > 0 && (
          <div className="mt-1 text-yellow-200 text-xs font-semibold">
            {matchup.voteCountEp2} votes
          </div>
        )}
      </div>

      {!showVotes && isActive && (
        <div className="bg-stone-900 p-2 text-center">
          <p className="text-yellow-300 text-xs">🔒 Votes hidden</p>
        </div>
      )}
    </div>
  );
};

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
      const allBrackets = await bracketService.getAllBrackets();
      const targetBracket = allBrackets.find(b => b.bracketGroup === group);

      if (!targetBracket) {
        setError(`No ${group === 'early' ? 'Seasons 1-8' : 'Seasons 9-16'} bracket found`);
        setLoading(false);
        return;
      }

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

  useEffect(() => {
    fetchBracketData();
  }, [fetchBracketData]);

  usePolling(fetchBracketData, 10000, !!bracket && bracket.status === 'active');

  const handleVote = async (matchupId: string, episodeId: string) => {
    try {
      await voteService.castVote(matchupId, episodeId);
      await fetchBracketData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cast vote');
    }
  };

  if (loading) return <LoadingSpinner />;

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

  const getRoundName = (roundNum: number, totalRounds: number) => {
    if (roundNum === totalRounds) return 'Championship';
    if (roundNum === totalRounds - 1) return 'Semi-Finals';
    if (roundNum === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNum}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #2c1810 0%, #3d2817 50%, #1a0f08 100%)' }}>
      <div className="py-8">
        {/* Header */}
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
            <div className="p-8 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 rounded-lg shadow-2xl border-4 border-yellow-700">
              <div className="text-center">
                <h2 className="text-4xl font-black mb-4 text-gray-900">🏆 PADDY'S PUB CHAMPION! 🏆</h2>
                <div className="bg-gray-900 bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-3xl font-bold mb-2 text-gray-900">{champion.title}</h3>
                  <p className="text-xl text-gray-800 font-semibold">
                    Season {champion.seasonNumber}, Episode {champion.episodeNumber}
                  </p>
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
                <a href="/login" className="font-bold underline hover:text-yellow-300">Login</a>
                {' or '}
                <a href="/register" className="font-bold underline hover:text-yellow-300">sign up</a>
                {' to cast your vote!'}
              </p>
            </div>
          </div>
        )}

        {/* Tournament Bracket Tree - HORIZONTAL LAYOUT */}
        {rounds.length > 0 ? (
          <div className="overflow-x-auto overflow-y-hidden pb-8">
            <div className="inline-flex gap-8 px-8 min-w-full justify-center">
              {rounds.map((roundNum) => {
                const matchups = matchupsByRound[roundNum];
                const isCurrentRound = roundNum === bracket.currentRound;
                // Calculate spacing to create bracket tree effect
                const matchupHeight = 140; // approximate height of each matchup
                const gapBetweenMatchups = Math.pow(2, roundNum - 1) * matchupHeight;

                return (
                  <div key={roundNum} className="flex flex-col items-center">
                    {/* Round Header */}
                    <div className="mb-4 sticky top-0 z-10">
                      <div className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${
                        isCurrentRound
                          ? 'bg-yellow-600 border-yellow-500 text-gray-900 shadow-lg'
                          : 'bg-stone-800 border-stone-600 text-yellow-300'
                      }`}>
                        {getRoundName(roundNum, maxRound)}
                      </div>
                    </div>

                    {/* Matchups Column */}
                    <div className="flex flex-col justify-around h-full" style={{ gap: `${gapBetweenMatchups}px` }}>
                      {matchups.map((matchup) => (
                        <div key={matchup.id} className="relative">
                          <BracketMatchup
                            matchup={matchup}
                            hideVotes={!user?.isAdmin && matchup.status !== 'completed'}
                            onVote={handleVote}
                          />
                          {/* Connector line to next round */}
                          {roundNum < maxRound && matchup.status === 'completed' && (
                            <div className="absolute left-full top-1/2 w-8 border-t-2 border-yellow-600"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
