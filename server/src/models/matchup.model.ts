import { pool } from '../config/database';
import { MatchupStatus } from '../types';

export interface Matchup {
  id: string;
  bracket_id: string;
  round_number: number;
  matchup_position: number;
  episode1_id?: string;
  episode2_id?: string;
  winner_episode_id?: string;
  status: MatchupStatus;
  vote_count_ep1: number;
  vote_count_ep2: number;
  created_at: Date;
}

export interface MatchupWithEpisodes extends Matchup {
  episode1?: {
    id: string;
    title: string;
    season_number: number;
    episode_number: number;
  };
  episode2?: {
    id: string;
    title: string;
    season_number: number;
    episode_number: number;
  };
  winner_episode?: {
    id: string;
    title: string;
    season_number: number;
    episode_number: number;
  };
}

export const MatchupModel = {
  async create(
    bracketId: string,
    roundNumber: number,
    matchupPosition: number,
    episode1Id?: string,
    episode2Id?: string
  ): Promise<Matchup> {
    const result = await pool.query(
      `INSERT INTO bracket_matchups (bracket_id, round_number, matchup_position, episode1_id, episode2_id, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [bracketId, roundNumber, matchupPosition, episode1Id, episode2Id]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<Matchup | null> {
    const result = await pool.query(
      'SELECT * FROM bracket_matchups WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByIdWithEpisodes(id: string): Promise<MatchupWithEpisodes | null> {
    const result = await pool.query(
      `SELECT
        m.*,
        e1.id as episode1_id, e1.title as episode1_title,
        e1.season_number as episode1_season, e1.episode_number as episode1_number,
        e2.id as episode2_id, e2.title as episode2_title,
        e2.season_number as episode2_season, e2.episode_number as episode2_number,
        w.id as winner_id, w.title as winner_title,
        w.season_number as winner_season, w.episode_number as winner_number
       FROM bracket_matchups m
       LEFT JOIN episodes e1 ON m.episode1_id = e1.id
       LEFT JOIN episodes e2 ON m.episode2_id = e2.id
       LEFT JOIN episodes w ON m.winner_episode_id = w.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      bracket_id: row.bracket_id,
      round_number: row.round_number,
      matchup_position: row.matchup_position,
      episode1_id: row.episode1_id,
      episode2_id: row.episode2_id,
      winner_episode_id: row.winner_episode_id,
      status: row.status,
      vote_count_ep1: row.vote_count_ep1,
      vote_count_ep2: row.vote_count_ep2,
      created_at: row.created_at,
      episode1: row.episode1_id ? {
        id: row.episode1_id,
        title: row.episode1_title,
        season_number: row.episode1_season,
        episode_number: row.episode1_number,
      } : undefined,
      episode2: row.episode2_id ? {
        id: row.episode2_id,
        title: row.episode2_title,
        season_number: row.episode2_season,
        episode_number: row.episode2_number,
      } : undefined,
      winner_episode: row.winner_id ? {
        id: row.winner_id,
        title: row.winner_title,
        season_number: row.winner_season,
        episode_number: row.winner_number,
      } : undefined,
    };
  },

  async findByBracket(bracketId: string): Promise<MatchupWithEpisodes[]> {
    const result = await pool.query(
      `SELECT
        m.*,
        e1.id as episode1_id, e1.title as episode1_title,
        e1.season_number as episode1_season, e1.episode_number as episode1_number,
        e2.id as episode2_id, e2.title as episode2_title,
        e2.season_number as episode2_season, e2.episode_number as episode2_number,
        w.id as winner_id, w.title as winner_title,
        w.season_number as winner_season, w.episode_number as winner_number
       FROM bracket_matchups m
       LEFT JOIN episodes e1 ON m.episode1_id = e1.id
       LEFT JOIN episodes e2 ON m.episode2_id = e2.id
       LEFT JOIN episodes w ON m.winner_episode_id = w.id
       WHERE m.bracket_id = $1
       ORDER BY m.round_number, m.matchup_position`,
      [bracketId]
    );

    return result.rows.map(row => ({
      id: row.id,
      bracket_id: row.bracket_id,
      round_number: row.round_number,
      matchup_position: row.matchup_position,
      episode1_id: row.episode1_id,
      episode2_id: row.episode2_id,
      winner_episode_id: row.winner_episode_id,
      status: row.status,
      vote_count_ep1: row.vote_count_ep1,
      vote_count_ep2: row.vote_count_ep2,
      created_at: row.created_at,
      episode1: row.episode1_id ? {
        id: row.episode1_id,
        title: row.episode1_title,
        season_number: row.episode1_season,
        episode_number: row.episode1_number,
      } : undefined,
      episode2: row.episode2_id ? {
        id: row.episode2_id,
        title: row.episode2_title,
        season_number: row.episode2_season,
        episode_number: row.episode2_number,
      } : undefined,
      winner_episode: row.winner_id ? {
        id: row.winner_id,
        title: row.winner_title,
        season_number: row.winner_season,
        episode_number: row.winner_number,
      } : undefined,
    }));
  },

  async findByBracketAndRound(
    bracketId: string,
    roundNumber: number
  ): Promise<MatchupWithEpisodes[]> {
    const result = await pool.query(
      `SELECT
        m.*,
        e1.id as episode1_id, e1.title as episode1_title,
        e1.season_number as episode1_season, e1.episode_number as episode1_number,
        e2.id as episode2_id, e2.title as episode2_title,
        e2.season_number as episode2_season, e2.episode_number as episode2_number,
        w.id as winner_id, w.title as winner_title,
        w.season_number as winner_season, w.episode_number as winner_number
       FROM bracket_matchups m
       LEFT JOIN episodes e1 ON m.episode1_id = e1.id
       LEFT JOIN episodes e2 ON m.episode2_id = e2.id
       LEFT JOIN episodes w ON m.winner_episode_id = w.id
       WHERE m.bracket_id = $1 AND m.round_number = $2
       ORDER BY m.matchup_position`,
      [bracketId, roundNumber]
    );

    return result.rows.map(row => ({
      id: row.id,
      bracket_id: row.bracket_id,
      round_number: row.round_number,
      matchup_position: row.matchup_position,
      episode1_id: row.episode1_id,
      episode2_id: row.episode2_id,
      winner_episode_id: row.winner_episode_id,
      status: row.status,
      vote_count_ep1: row.vote_count_ep1,
      vote_count_ep2: row.vote_count_ep2,
      created_at: row.created_at,
      episode1: row.episode1_id ? {
        id: row.episode1_id,
        title: row.episode1_title,
        season_number: row.episode1_season,
        episode_number: row.episode1_number,
      } : undefined,
      episode2: row.episode2_id ? {
        id: row.episode2_id,
        title: row.episode2_title,
        season_number: row.episode2_season,
        episode_number: row.episode2_number,
      } : undefined,
      winner_episode: row.winner_id ? {
        id: row.winner_id,
        title: row.winner_title,
        season_number: row.winner_season,
        episode_number: row.winner_number,
      } : undefined,
    }));
  },

  async updateStatus(id: string, status: MatchupStatus): Promise<void> {
    await pool.query(
      'UPDATE bracket_matchups SET status = $1 WHERE id = $2',
      [status, id]
    );
  },

  async updateVoteCounts(id: string, voteCountEp1: number, voteCountEp2: number): Promise<void> {
    await pool.query(
      'UPDATE bracket_matchups SET vote_count_ep1 = $1, vote_count_ep2 = $2 WHERE id = $3',
      [voteCountEp1, voteCountEp2, id]
    );
  },

  async setWinner(id: string, winnerEpisodeId: string): Promise<void> {
    await pool.query(
      "UPDATE bracket_matchups SET winner_episode_id = $1, status = 'completed' WHERE id = $2",
      [winnerEpisodeId, id]
    );
  },
};
