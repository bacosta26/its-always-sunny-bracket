import { useState, useEffect } from 'react';
import { bracketService } from '../../services/bracket.service';

interface UserProgress {
  id: string;
  username: string;
  email: string;
  votesCast: number;
  votesRemaining: number;
  percentComplete: number;
}

interface VotingProgressData {
  totalMatchups: number;
  currentRound: number;
  users: UserProgress[];
}

interface VotingProgressProps {
  bracketId: string;
}

const BeerGlass = ({ percentComplete }: { percentComplete: number }) => {
  // Beer colors based on completion
  const getBeerColor = () => {
    if (percentComplete === 100) return '#FFD700'; // Golden for complete
    if (percentComplete >= 75) return '#F59E0B'; // Amber
    if (percentComplete >= 50) return '#FCD34D'; // Light amber
    if (percentComplete >= 25) return '#FEF3C7'; // Very light
    return '#F3F4F6'; // Almost empty (gray)
  };

  const beerColor = getBeerColor();
  const foamHeight = percentComplete === 100 ? 8 : 0;

  return (
    <div className="relative w-16 h-20 flex items-end justify-center">
      {/* Beer Glass SVG */}
      <svg width="48" height="72" viewBox="0 0 48 72" className="drop-shadow-md">
        {/* Glass outline */}
        <path
          d="M 8 8 L 12 68 L 36 68 L 40 8 Z"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Beer fill */}
        <path
          d={`M ${8 + (40-8) * (1 - percentComplete/100) * 0.08} ${8 + 60 * (1 - percentComplete/100)} L ${12 + 0.5} 68 L ${36 - 0.5} 68 L ${40 - (40-8) * (1 - percentComplete/100) * 0.08} ${8 + 60 * (1 - percentComplete/100)} Z`}
          fill={beerColor}
          opacity="0.9"
        />

        {/* Foam on top if 100% */}
        {foamHeight > 0 && (
          <>
            <ellipse cx="24" cy={8 + 60 * (1 - percentComplete/100) - 2} rx="16" ry={foamHeight} fill="#FFF8DC" opacity="0.9" />
            <ellipse cx="24" cy={8 + 60 * (1 - percentComplete/100) - 6} rx="14" ry={foamHeight - 2} fill="#FFFAF0" opacity="0.8" />
          </>
        )}

        {/* Glass shine effect */}
        <path
          d="M 10 12 L 14 64 L 16 64 L 12 12 Z"
          fill="white"
          opacity="0.15"
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute bottom-0 w-full text-center">
        <span className="text-xs font-bold text-yellow-300 drop-shadow-md">
          {percentComplete}%
        </span>
      </div>
    </div>
  );
};

export const VotingProgress = ({ bracketId }: VotingProgressProps) => {
  const [data, setData] = useState<VotingProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [bracketId]);

  const fetchProgress = async () => {
    try {
      const result = await bracketService.getVotingProgress(bracketId);
      setData(result);
    } catch (error) {
      console.error('Failed to load voting progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-amber-900 border-2 border-yellow-600 rounded-lg">
        <p className="text-yellow-200 text-center">Loading drinking progress...</p>
      </div>
    );
  }

  if (!data || data.users.length === 0) {
    return null;
  }

  // Filter out users who haven't voted at all (optional - shows everyone)
  const activeUsers = data.users;

  return (
    <div className="p-6 bg-gradient-to-br from-amber-900 to-amber-800 border-4 border-yellow-600 rounded-lg shadow-2xl">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-black text-yellow-300 mb-1">
          🍺 BAR ATTENDANCE 🍺
        </h3>
        <p className="text-yellow-200 text-sm">
          Who's keeping up at Paddy's? ({data.totalMatchups} drinks to finish!)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            className="flex flex-col items-center p-3 bg-stone-900 bg-opacity-40 rounded-lg border-2 border-stone-700 hover:border-yellow-500 transition"
          >
            <BeerGlass percentComplete={user.percentComplete} />

            <div className="mt-2 text-center w-full">
              <p className="text-yellow-100 font-bold text-sm truncate" title={user.username}>
                {user.username}
              </p>
              <p className="text-yellow-300 text-xs mt-1">
                {user.votesCast}/{data.totalMatchups}
              </p>
              {user.votesRemaining > 0 ? (
                <p className="text-red-300 text-xs">
                  {user.votesRemaining} left
                </p>
              ) : (
                <p className="text-green-300 text-xs font-bold">
                  ✓ Done!
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t-2 border-yellow-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-yellow-400 text-2xl font-bold">
              {activeUsers.filter(u => u.percentComplete === 100).length}
            </p>
            <p className="text-yellow-200 text-xs">Finished</p>
          </div>
          <div>
            <p className="text-yellow-400 text-2xl font-bold">
              {activeUsers.filter(u => u.percentComplete > 0 && u.percentComplete < 100).length}
            </p>
            <p className="text-yellow-200 text-xs">Drinking</p>
          </div>
          <div>
            <p className="text-yellow-400 text-2xl font-bold">
              {activeUsers.filter(u => u.percentComplete === 0).length}
            </p>
            <p className="text-yellow-200 text-xs">Not Started</p>
          </div>
        </div>
      </div>
    </div>
  );
};
