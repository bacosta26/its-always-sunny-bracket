import { bracketService } from '../../services/bracket.service';
import toast from 'react-hot-toast';

interface VoteButtonProps {
  matchupId: string;
  episodeId: string;
  episodeTitle: string;
  isVoted: boolean;
  disabled?: boolean;
  onVote: () => Promise<void>;
}

export const VoteButton = ({
  matchupId,
  episodeId,
  episodeTitle,
  isVoted,
  disabled,
  onVote,
}: VoteButtonProps) => {
  const handleVote = async () => {
    try {
      await bracketService.castVote(matchupId, episodeId);
      toast.success(`Voted for "${episodeTitle}"!`);
      await onVote();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cast vote');
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={disabled}
      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
        isVoted
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isVoted ? '✓ Your Vote' : 'Vote for This Episode'}
    </button>
  );
};
