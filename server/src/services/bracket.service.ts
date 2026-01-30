import { BracketModel } from '../models/bracket.model';
import { EpisodeModel } from '../models/episode.model';
import { MatchupModel } from '../models/matchup.model';
import { VoteModel } from '../models/vote.model';
import { BracketGroup } from '../types';
import { pool } from '../config/database';

export const BracketService = {
  /**
   * Initialize a new bracket with matchups for round 1
   */
  async initializeBracket(bracketGroup: BracketGroup): Promise<string> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get all episodes for this bracket group
      const episodes = await EpisodeModel.findByBracketGroup(bracketGroup);

      if (episodes.length === 0) {
        throw new Error('No episodes found for this bracket group');
      }

      // Shuffle episodes for random seeding
      const shuffled = [...episodes].sort(() => Math.random() - 0.5);

      // Find next power of 2
      const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
      const numFirstRoundMatchups = nextPowerOf2 / 2;

      // Create bracket
      const bracketName = bracketGroup === 'early'
        ? 'Seasons 1-8 Champion'
        : 'Seasons 9-16 Champion';

      const bracket = await BracketModel.create(bracketName, bracketGroup);

      // Create first round matchups
      for (let i = 0; i < numFirstRoundMatchups; i++) {
        const episode1 = shuffled[i * 2];
        const episode2 = shuffled[i * 2 + 1];

        await MatchupModel.create(
          bracket.id,
          1, // round 1
          i,
          episode1?.id,
          episode2?.id
        );
      }

      // Activate first round matchups that have both episodes
      await client.query(
        `UPDATE bracket_matchups
         SET status = 'active'
         WHERE bracket_id = $1
           AND round_number = 1
           AND episode1_id IS NOT NULL
           AND episode2_id IS NOT NULL`,
        [bracket.id]
      );

      await client.query('COMMIT');
      return bracket.id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get bracket with all matchups
   */
  async getBracketDetails(bracketId: string) {
    const bracket = await BracketModel.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }

    const matchups = await MatchupModel.findByBracket(bracketId);

    return {
      bracket,
      matchups,
    };
  },

  /**
   * Get current round matchups for a bracket
   */
  async getCurrentRoundMatchups(bracketId: string) {
    const bracket = await BracketModel.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }

    const matchups = await MatchupModel.findByBracketAndRound(
      bracketId,
      bracket.current_round
    );

    return {
      bracket,
      matchups,
    };
  },

  /**
   * Cast a vote in a matchup
   */
  async castVote(userId: string, matchupId: string, episodeId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if matchup exists and is active
      const matchup = await MatchupModel.findById(matchupId);
      if (!matchup) {
        throw new Error('Matchup not found');
      }

      if (matchup.status !== 'active') {
        throw new Error('Matchup is not active');
      }

      // Verify episode is in this matchup
      if (episodeId !== matchup.episode1_id && episodeId !== matchup.episode2_id) {
        throw new Error('Episode is not in this matchup');
      }

      // Check if user already voted
      const existingVote = await VoteModel.findByUserAndMatchup(userId, matchupId);
      if (existingVote) {
        // Allow changing vote - delete old one
        await VoteModel.delete(userId, matchupId);
      }

      // Create new vote
      await VoteModel.create(userId, matchupId, episodeId);

      // Update vote counts
      const votesEp1 = await VoteModel.countByMatchupAndEpisode(matchupId, matchup.episode1_id!);
      const votesEp2 = await VoteModel.countByMatchupAndEpisode(matchupId, matchup.episode2_id!);

      await MatchupModel.updateVoteCounts(matchupId, votesEp1, votesEp2);

      await client.query('COMMIT');

      return {
        voteCountEp1: votesEp1,
        voteCountEp2: votesEp2,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Check if a round is complete and advance if needed
   */
  async checkAndAdvanceRound(bracketId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const bracket = await BracketModel.findById(bracketId);
      if (!bracket) {
        throw new Error('Bracket not found');
      }

      const currentRoundMatchups = await MatchupModel.findByBracketAndRound(
        bracketId,
        bracket.current_round
      );

      // Check if all matchups in current round are complete
      const allComplete = currentRoundMatchups.every(m => m.status === 'completed');
      if (!allComplete) {
        await client.query('COMMIT');
        return { advanced: false };
      }

      // Determine winners for matchups without winners set
      for (const matchup of currentRoundMatchups) {
        if (!matchup.winner_episode_id && matchup.episode1_id && matchup.episode2_id) {
          const winnerId = matchup.vote_count_ep1 >= matchup.vote_count_ep2
            ? matchup.episode1_id
            : matchup.episode2_id;

          await MatchupModel.setWinner(matchup.id, winnerId);
        }
      }

      // Check if this was the final round
      if (currentRoundMatchups.length === 1) {
        // Bracket complete!
        await BracketModel.updateStatus(bracketId, 'completed');
        await client.query('COMMIT');
        return { advanced: false, completed: true };
      }

      // Create next round matchups
      const nextRound = bracket.current_round + 1;
      const winners = currentRoundMatchups
        .map(m => m.winner_episode_id)
        .filter(Boolean) as string[];

      const numNextRoundMatchups = Math.floor(winners.length / 2);

      for (let i = 0; i < numNextRoundMatchups; i++) {
        await MatchupModel.create(
          bracketId,
          nextRound,
          i,
          winners[i * 2],
          winners[i * 2 + 1]
        );
      }

      // Activate next round matchups
      await client.query(
        `UPDATE bracket_matchups
         SET status = 'active'
         WHERE bracket_id = $1 AND round_number = $2`,
        [bracketId, nextRound]
      );

      // Update bracket current round
      await BracketModel.updateRound(bracketId, nextRound);

      await client.query('COMMIT');

      return { advanced: true, nextRound };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Close voting on a matchup (admin action or time-based)
   */
  async closeMatchup(matchupId: string) {
    const matchup = await MatchupModel.findById(matchupId);
    if (!matchup) {
      throw new Error('Matchup not found');
    }

    if (!matchup.episode1_id || !matchup.episode2_id) {
      throw new Error('Matchup has missing episodes');
    }

    // Determine winner
    const winnerId = matchup.vote_count_ep1 >= matchup.vote_count_ep2
      ? matchup.episode1_id
      : matchup.episode2_id;

    await MatchupModel.setWinner(matchupId, winnerId);

    // Check if round is complete
    await this.checkAndAdvanceRound(matchup.bracket_id);
  },

  /**
   * Reset a bracket by deleting all votes, matchups, and the bracket itself
   */
  async resetBracket(bracketId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Delete all votes for matchups in this bracket
      await client.query(
        `DELETE FROM votes
         WHERE matchup_id IN (
           SELECT id FROM bracket_matchups WHERE bracket_id = $1
         )`,
        [bracketId]
      );

      // Delete all matchups for this bracket
      await client.query(
        'DELETE FROM bracket_matchups WHERE bracket_id = $1',
        [bracketId]
      );

      // Delete the bracket itself
      await client.query('DELETE FROM brackets WHERE id = $1', [bracketId]);

      await client.query('COMMIT');

      return { message: 'Bracket reset successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get current round matchups with all vote data in one query (optimized)
   */
  async getCurrentRoundWithVotes(bracketId: string, userId?: string) {
    const bracket = await BracketModel.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }

    // Get all matchups for current round with episodes and vote counts in one query
    const result = await pool.query(
      `SELECT
        m.id,
        m.bracket_id,
        m.round_number,
        m.matchup_position,
        m.status,
        m.vote_count_ep1,
        m.vote_count_ep2,
        m.winner_episode_id,
        e1.id as ep1_id,
        e1.title as ep1_title,
        e1.season_number as ep1_season,
        e1.episode_number as ep1_episode,
        e1.description as ep1_description,
        e1.bracket_group as ep1_bracket_group,
        e2.id as ep2_id,
        e2.title as ep2_title,
        e2.season_number as ep2_season,
        e2.episode_number as ep2_episode,
        e2.description as ep2_description,
        e2.bracket_group as ep2_bracket_group,
        winner.id as winner_id,
        winner.title as winner_title,
        winner.season_number as winner_season,
        winner.episode_number as winner_episode,
        CASE WHEN $2::uuid IS NOT NULL
          THEN (SELECT episode_id FROM votes WHERE user_id = $2 AND matchup_id = m.id)
          ELSE NULL
        END as user_vote
       FROM bracket_matchups m
       LEFT JOIN episodes e1 ON m.episode1_id = e1.id
       LEFT JOIN episodes e2 ON m.episode2_id = e2.id
       LEFT JOIN episodes winner ON m.winner_episode_id = winner.id
       WHERE m.bracket_id = $1 AND m.round_number = $3
       ORDER BY m.matchup_position`,
      [bracketId, userId || null, bracket.current_round]
    );

    // Transform the flat query results into structured matchup objects
    const matchups = result.rows.map(row => ({
      id: row.id,
      bracketId: row.bracket_id,
      roundNumber: row.round_number,
      matchupPosition: row.matchup_position,
      status: row.status,
      voteCountEp1: row.vote_count_ep1,
      voteCountEp2: row.vote_count_ep2,
      episode1: row.ep1_id ? {
        id: row.ep1_id,
        title: row.ep1_title,
        seasonNumber: row.ep1_season,
        episodeNumber: row.ep1_episode,
        description: row.ep1_description,
        bracketGroup: row.ep1_bracket_group,
      } : undefined,
      episode2: row.ep2_id ? {
        id: row.ep2_id,
        title: row.ep2_title,
        seasonNumber: row.ep2_season,
        episodeNumber: row.ep2_episode,
        description: row.ep2_description,
        bracketGroup: row.ep2_bracket_group,
      } : undefined,
      winnerEpisode: row.winner_id ? {
        id: row.winner_id,
        title: row.winner_title,
        seasonNumber: row.winner_season,
        episodeNumber: row.winner_episode,
      } : undefined,
      userVote: row.user_vote,
    }));

    return {
      bracket,
      matchups,
    };
  },

  /**
   * Get ALL bracket matchups with vote data (for tournament tree display)
   */
  async getAllMatchupsWithVotes(bracketId: string, userId?: string) {
    const bracket = await BracketModel.findById(bracketId);
    if (!bracket) {
      throw new Error('Bracket not found');
    }

    // Get ALL matchups with episodes and vote counts in one query
    const result = await pool.query(
      `SELECT
        m.id,
        m.bracket_id,
        m.round_number,
        m.matchup_position,
        m.status,
        m.vote_count_ep1,
        m.vote_count_ep2,
        m.winner_episode_id,
        e1.id as ep1_id,
        e1.title as ep1_title,
        e1.season_number as ep1_season,
        e1.episode_number as ep1_episode,
        e1.description as ep1_description,
        e1.bracket_group as ep1_bracket_group,
        e2.id as ep2_id,
        e2.title as ep2_title,
        e2.season_number as ep2_season,
        e2.episode_number as ep2_episode,
        e2.description as ep2_description,
        e2.bracket_group as ep2_bracket_group,
        winner.id as winner_id,
        winner.title as winner_title,
        winner.season_number as winner_season,
        winner.episode_number as winner_episode,
        CASE WHEN $2::uuid IS NOT NULL
          THEN (SELECT episode_id FROM votes WHERE user_id = $2 AND matchup_id = m.id)
          ELSE NULL
        END as user_vote
       FROM bracket_matchups m
       LEFT JOIN episodes e1 ON m.episode1_id = e1.id
       LEFT JOIN episodes e2 ON m.episode2_id = e2.id
       LEFT JOIN episodes winner ON m.winner_episode_id = winner.id
       WHERE m.bracket_id = $1
       ORDER BY m.round_number, m.matchup_position`,
      [bracketId, userId || null]
    );

    // Transform the flat query results into structured matchup objects
    const matchups = result.rows.map(row => ({
      id: row.id,
      bracketId: row.bracket_id,
      roundNumber: row.round_number,
      matchupPosition: row.matchup_position,
      status: row.status,
      voteCountEp1: row.vote_count_ep1,
      voteCountEp2: row.vote_count_ep2,
      episode1: row.ep1_id ? {
        id: row.ep1_id,
        title: row.ep1_title,
        seasonNumber: row.ep1_season,
        episodeNumber: row.ep1_episode,
        description: row.ep1_description,
        bracketGroup: row.ep1_bracket_group,
      } : undefined,
      episode2: row.ep2_id ? {
        id: row.ep2_id,
        title: row.ep2_title,
        seasonNumber: row.ep2_season,
        episodeNumber: row.ep2_episode,
        description: row.ep2_description,
        bracketGroup: row.ep2_bracket_group,
      } : undefined,
      winnerEpisode: row.winner_id ? {
        id: row.winner_id,
        title: row.winner_title,
        seasonNumber: row.winner_season,
        episodeNumber: row.winner_episode,
      } : undefined,
      userVote: row.user_vote,
    }));

    return {
      bracket,
      matchups,
    };
  },
};
