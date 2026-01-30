import { pool } from '../config/database';

export interface Vote {
  id: string;
  user_id: string;
  matchup_id: string;
  episode_id: string;
  created_at: Date;
}

export const VoteModel = {
  async create(userId: string, matchupId: string, episodeId: string): Promise<Vote> {
    const result = await pool.query(
      `INSERT INTO votes (user_id, matchup_id, episode_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, matchupId, episodeId]
    );
    return result.rows[0];
  },

  async findByUserAndMatchup(userId: string, matchupId: string): Promise<Vote | null> {
    const result = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND matchup_id = $2',
      [userId, matchupId]
    );
    return result.rows[0] || null;
  },

  async findByUser(userId: string): Promise<Vote[]> {
    const result = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findByMatchup(matchupId: string): Promise<Vote[]> {
    const result = await pool.query(
      'SELECT * FROM votes WHERE matchup_id = $1',
      [matchupId]
    );
    return result.rows;
  },

  async countByMatchupAndEpisode(matchupId: string, episodeId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM votes WHERE matchup_id = $1 AND episode_id = $2',
      [matchupId, episodeId]
    );
    return parseInt(result.rows[0].count);
  },

  async delete(userId: string, matchupId: string): Promise<void> {
    await pool.query(
      'DELETE FROM votes WHERE user_id = $1 AND matchup_id = $2',
      [userId, matchupId]
    );
  },
};
