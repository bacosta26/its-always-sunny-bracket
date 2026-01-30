import { Response } from 'express';
import { BracketService } from '../services/bracket.service';
import { VoteModel } from '../models/vote.model';
import { MatchupModel } from '../models/matchup.model';
import { AuthRequest } from '../types';

export const VoteController = {
  async castVote(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { matchupId, episodeId } = req.body;

      if (!matchupId || !episodeId) {
        res.status(400).json({ error: 'matchupId and episodeId are required' });
        return;
      }

      const result = await BracketService.castVote(req.user.userId, matchupId, episodeId);

      res.json({
        message: 'Vote cast successfully',
        voteCountEp1: result.voteCountEp1,
        voteCountEp2: result.voteCountEp2,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to cast vote',
      });
    }
  },

  async getUserVotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Users can only see their own votes (unless admin)
      if (req.user?.userId !== userId && !req.user?.isAdmin) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const votes = await VoteModel.findByUser(userId);
      res.json({ votes });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch votes',
      });
    }
  },

  async getMatchupVotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { matchupId } = req.params;

      const matchup = await MatchupModel.findByIdWithEpisodes(matchupId);
      if (!matchup) {
        res.status(404).json({ error: 'Matchup not found' });
        return;
      }

      // Check if user has voted
      let userVote = null;
      if (req.user) {
        const vote = await VoteModel.findByUserAndMatchup(req.user.userId, matchupId);
        userVote = vote ? vote.episode_id : null;
      }

      res.json({
        matchup: {
          id: matchup.id,
          episode1: matchup.episode1,
          episode2: matchup.episode2,
          voteCountEp1: matchup.vote_count_ep1,
          voteCountEp2: matchup.vote_count_ep2,
          status: matchup.status,
          winner: matchup.winner_episode,
        },
        userVote,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch matchup votes',
      });
    }
  },
};
