import { useState, useEffect } from 'react';
import { bracketService } from '../../services/bracket.service';

interface Episode {
  id: string;
  title: string;
  seasonNumber: number;
  episodeNumber: number;
}

interface PreviousMatchup {
  id: string;
  roundNumber: number;
  matchupPosition: number;
  status: string;
  voteCountEp1: number;
  voteCountEp2: number;
  episode1?: Episode;
  episode2?: Episode;
  winnerEpisode?: Episode;
}

interface PreviousRoundData {
  previousRound: number;
  matchups: PreviousMatchup[];
  hasPreviousRound: boolean;
}

interface PreviousRoundProps {
  bracketId: string;
}

export const PreviousRound = ({ bracketId }: PreviousRoundProps) => {
  const [data, setData] = useState<PreviousRoundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchPreviousRound();
  }, [bracketId]);

  const fetchPreviousRound = async () => {
    try {
      const result = await bracketService.getPreviousRound(bracketId);
      setData(result);
    } catch (error) {
      console.error('Failed to load previous round:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-amber-900 border-2 border-yellow-600 rounded-lg">
        <p className="text-yellow-200 text-center">Loading last call results...</p>
      </div>
    );
  }

  if (!data || !data.hasPreviousRound || data.matchups.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 border-4 border-yellow-700 rounded-lg shadow-2xl overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-center hover:bg-stone-800 transition-colors"
      >
        <div className="flex items-center justify-center gap-3">
          <h3 className="text-2xl font-black text-yellow-300">
            📜 LAST ROUND RESULTS 📜
          </h3>
          <span className={`text-yellow-300 text-2xl transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
        <p className="text-yellow-200 text-sm mt-1">
          Round {data.previousRound} - {isExpanded ? 'The survivors and the fallen' : 'Click to view results'}
        </p>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.matchups.map((matchup) => {
          if (!matchup.episode1 || !matchup.episode2) return null;

          const isEp1Winner = matchup.winnerEpisode?.id === matchup.episode1.id;
          const isEp2Winner = matchup.winnerEpisode?.id === matchup.episode2.id;

          return (
            <div
              key={matchup.id}
              className="bg-amber-950 bg-opacity-60 border-2 border-stone-700 rounded-lg p-4 shadow-lg"
            >
              {/* Episode 1 */}
              <div
                className={`p-3 rounded-lg mb-2 border-2 ${
                  isEp1Winner
                    ? 'border-green-500 bg-green-900 bg-opacity-30'
                    : 'border-red-500 bg-red-900 bg-opacity-20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-yellow-100">
                      {isEp1Winner && '🍺 '}
                      {matchup.episode1.title}
                    </h4>
                    <p className="text-xs text-yellow-200 opacity-80">
                      S{matchup.episode1.seasonNumber}E{matchup.episode1.episodeNumber}
                    </p>
                  </div>
                  {isEp1Winner && (
                    <span className="text-2xl ml-2">🏆</span>
                  )}
                  {!isEp1Winner && (
                    <span className="text-2xl ml-2 opacity-40">💀</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-stone-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isEp1Winner ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${
                          matchup.voteCountEp1 + matchup.voteCountEp2 > 0
                            ? (matchup.voteCountEp1 / (matchup.voteCountEp1 + matchup.voteCountEp2)) * 100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-yellow-200 text-sm font-bold min-w-[2rem] text-right">
                    {matchup.voteCountEp1}
                  </span>
                </div>
              </div>

              {/* VS divider */}
              <div className="text-center text-yellow-400 font-bold text-xs mb-2">
                VS
              </div>

              {/* Episode 2 */}
              <div
                className={`p-3 rounded-lg border-2 ${
                  isEp2Winner
                    ? 'border-green-500 bg-green-900 bg-opacity-30'
                    : 'border-red-500 bg-red-900 bg-opacity-20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-yellow-100">
                      {isEp2Winner && '🍺 '}
                      {matchup.episode2.title}
                    </h4>
                    <p className="text-xs text-yellow-200 opacity-80">
                      S{matchup.episode2.seasonNumber}E{matchup.episode2.episodeNumber}
                    </p>
                  </div>
                  {isEp2Winner && (
                    <span className="text-2xl ml-2">🏆</span>
                  )}
                  {!isEp2Winner && (
                    <span className="text-2xl ml-2 opacity-40">💀</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-stone-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isEp2Winner ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${
                          matchup.voteCountEp1 + matchup.voteCountEp2 > 0
                            ? (matchup.voteCountEp2 / (matchup.voteCountEp1 + matchup.voteCountEp2)) * 100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-yellow-200 text-sm font-bold min-w-[2rem] text-right">
                    {matchup.voteCountEp2}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t-2 border-yellow-700 text-center">
            <p className="text-yellow-200 text-sm">
              <span className="font-bold">{data.matchups.length}</span> battles fought •{' '}
              <span className="font-bold">{data.matchups.length}</span> episodes advanced to the next round
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
