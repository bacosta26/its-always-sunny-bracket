import { useState } from 'react';
import { Matchup as MatchupType } from '../../types';
import { VoteButton } from './VoteButton';

interface MatchupProps {
  matchup: MatchupType;
  onVoteCast: () => void;
  hideVotes?: boolean;
}

export const Matchup = ({ matchup, onVoteCast, hideVotes = false }: MatchupProps) => {
  const [voting, setVoting] = useState(false);

  const episode1 = matchup.episode1;
  const episode2 = matchup.episode2;

  if (!episode1 || !episode2) {
    return (
      <div className="p-6 bg-stone-800 bg-opacity-50 border-2 border-stone-600 rounded-lg">
        <p className="text-yellow-200 text-center">🍺 TBD - Stay tuned! 🍺</p>
      </div>
    );
  }

  const isComplete = matchup.status === 'completed';
  const totalVotes = matchup.voteCountEp1 + matchup.voteCountEp2;
  const ep1Percentage = totalVotes > 0 ? Math.round((matchup.voteCountEp1 / totalVotes) * 100) : 0;
  const ep2Percentage = totalVotes > 0 ? Math.round((matchup.voteCountEp2 / totalVotes) * 100) : 0;

  const isEp1Winner = isComplete && matchup.winnerEpisode?.id === episode1.id;
  const isEp2Winner = isComplete && matchup.winnerEpisode?.id === episode2.id;

  const showVotes = !hideVotes;

  // Beer glass indicators based on vote percentage
  const getBeerGlasses = (percentage: number) => {
    if (!showVotes || totalVotes === 0) return '';
    const fullGlasses = Math.floor(percentage / 20); // 5 possible glasses (20% each)
    return '🍺'.repeat(fullGlasses);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-amber-900 to-stone-900 border-4 border-yellow-700 rounded-lg shadow-xl hover:shadow-2xl transition-all">
      <div className="space-y-3">
        {/* Matchup Number */}
        <div className="text-center">
          <span className="px-3 py-1 bg-yellow-600 text-gray-900 rounded-full text-xs font-bold">
            Matchup #{matchup.matchupPosition + 1}
          </span>
        </div>

        {/* Episode 1 */}
        <div
          className={`p-4 rounded-lg border-3 transition-all backdrop-blur-sm ${
            isEp1Winner
              ? 'border-yellow-400 bg-yellow-500 bg-opacity-30 shadow-lg shadow-yellow-500/50'
              : matchup.userVote === episode1.id
              ? 'border-blue-400 bg-blue-500 bg-opacity-20'
              : 'border-stone-600 bg-stone-800 bg-opacity-40'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-yellow-100">{episode1.title}</h3>
              <p className="text-sm text-yellow-200 opacity-80">
                S{episode1.seasonNumber}E{episode1.episodeNumber}
              </p>
            </div>
            {isEp1Winner && (
              <span className="text-3xl ml-2 animate-bounce">🏆</span>
            )}
          </div>

          {matchup.status === 'active' && (
            <VoteButton
              matchupId={matchup.id}
              episodeId={episode1.id}
              episodeTitle={episode1.title}
              isVoted={matchup.userVote === episode1.id}
              disabled={voting}
              onVote={async () => {
                setVoting(true);
                try {
                  await onVoteCast();
                } finally {
                  setVoting(false);
                }
              }}
            />
          )}

          {showVotes && totalVotes > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1 text-yellow-200">
                <span className="font-semibold">{matchup.voteCountEp1} votes</span>
                <span className="font-bold">{ep1Percentage}%</span>
              </div>
              <div className="w-full bg-stone-700 rounded-full h-3 border border-stone-600">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-amber-400 h-3 rounded-full transition-all shadow-inner"
                  style={{ width: `${ep1Percentage}%` }}
                />
              </div>
              <div className="text-2xl mt-1">{getBeerGlasses(ep1Percentage)}</div>
            </div>
          )}

          {!showVotes && matchup.status === 'active' && (
            <div className="mt-3 text-center">
              <p className="text-yellow-300 text-sm italic">🔒 Votes hidden until round ends</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <span className="text-yellow-400 font-black text-2xl tracking-wider">⚔️ VS ⚔️</span>
        </div>

        {/* Episode 2 */}
        <div
          className={`p-4 rounded-lg border-3 transition-all backdrop-blur-sm ${
            isEp2Winner
              ? 'border-yellow-400 bg-yellow-500 bg-opacity-30 shadow-lg shadow-yellow-500/50'
              : matchup.userVote === episode2.id
              ? 'border-blue-400 bg-blue-500 bg-opacity-20'
              : 'border-stone-600 bg-stone-800 bg-opacity-40'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-yellow-100">{episode2.title}</h3>
              <p className="text-sm text-yellow-200 opacity-80">
                S{episode2.seasonNumber}E{episode2.episodeNumber}
              </p>
            </div>
            {isEp2Winner && (
              <span className="text-3xl ml-2 animate-bounce">🏆</span>
            )}
          </div>

          {matchup.status === 'active' && (
            <VoteButton
              matchupId={matchup.id}
              episodeId={episode2.id}
              episodeTitle={episode2.title}
              isVoted={matchup.userVote === episode2.id}
              disabled={voting}
              onVote={async () => {
                setVoting(true);
                try {
                  await onVoteCast();
                } finally {
                  setVoting(false);
                }
              }}
            />
          )}

          {showVotes && totalVotes > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1 text-yellow-200">
                <span className="font-semibold">{matchup.voteCountEp2} votes</span>
                <span className="font-bold">{ep2Percentage}%</span>
              </div>
              <div className="w-full bg-stone-700 rounded-full h-3 border border-stone-600">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-3 rounded-full transition-all shadow-inner"
                  style={{ width: `${ep2Percentage}%` }}
                />
              </div>
              <div className="text-2xl mt-1">{getBeerGlasses(ep2Percentage)}</div>
            </div>
          )}

          {!showVotes && matchup.status === 'active' && (
            <div className="mt-3 text-center">
              <p className="text-yellow-300 text-sm italic">🔒 Votes hidden until round ends</p>
            </div>
          )}
        </div>

        {isComplete && (
          <div className="text-center py-2 bg-green-800 bg-opacity-50 rounded-lg border-2 border-green-600">
            <span className="text-green-300 font-bold">🔒 Voting Closed</span>
          </div>
        )}

        {!isComplete && totalVotes > 0 && showVotes && (
          <div className="text-center text-yellow-200 text-sm">
            <span className="font-semibold">{totalVotes} total drinks poured 🍺</span>
          </div>
        )}
      </div>
    </div>
  );
};
