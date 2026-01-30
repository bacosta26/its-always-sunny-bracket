import { useState } from 'react';
import { Matchup as MatchupType } from '../../types';
import { VoteButton } from './VoteButton';

interface MatchupProps {
  matchup: MatchupType;
  onVoteCast: () => void;
}

export const Matchup = ({ matchup, onVoteCast }: MatchupProps) => {
  const [voting, setVoting] = useState(false);

  const episode1 = matchup.episode1;
  const episode2 = matchup.episode2;

  if (!episode1 || !episode2) {
    return (
      <div className="card opacity-50">
        <p className="text-gray-500 text-center">TBD</p>
      </div>
    );
  }

  const isComplete = matchup.status === 'completed';
  const totalVotes = matchup.voteCountEp1 + matchup.voteCountEp2;
  const ep1Percentage = totalVotes > 0 ? Math.round((matchup.voteCountEp1 / totalVotes) * 100) : 0;
  const ep2Percentage = totalVotes > 0 ? Math.round((matchup.voteCountEp2 / totalVotes) * 100) : 0;

  const isEp1Winner = isComplete && matchup.winnerEpisode?.id === episode1.id;
  const isEp2Winner = isComplete && matchup.winnerEpisode?.id === episode2.id;

  return (
    <div className="card">
      <div className="space-y-3">
        {/* Episode 1 */}
        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            isEp1Winner
              ? 'border-sunny-yellow bg-yellow-50'
              : matchup.userVote === episode1.id
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{episode1.title}</h3>
              <p className="text-sm text-gray-600">
                Season {episode1.seasonNumber}, Episode {episode1.episodeNumber}
              </p>
            </div>
            {isEp1Winner && (
              <span className="text-2xl ml-2">🏆</span>
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

          {totalVotes > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{matchup.voteCountEp1} votes</span>
                <span>{ep1Percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${ep1Percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 font-bold">VS</div>

        {/* Episode 2 */}
        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            isEp2Winner
              ? 'border-sunny-yellow bg-yellow-50'
              : matchup.userVote === episode2.id
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{episode2.title}</h3>
              <p className="text-sm text-gray-600">
                Season {episode2.seasonNumber}, Episode {episode2.episodeNumber}
              </p>
            </div>
            {isEp2Winner && (
              <span className="text-2xl ml-2">🏆</span>
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

          {totalVotes > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{matchup.voteCountEp2} votes</span>
                <span>{ep2Percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${ep2Percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {isComplete && (
          <div className="text-center text-green-600 font-semibold">
            Voting Closed
          </div>
        )}
      </div>
    </div>
  );
};
