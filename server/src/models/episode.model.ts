import { pool } from '../config/database';
import { BracketGroup } from '../types';

export interface Episode {
  id: string;
  title: string;
  season_number: number;
  episode_number: number;
  description?: string;
  air_date?: Date;
  bracket_group: BracketGroup;
  created_at: Date;
}

export const EpisodeModel = {
  async findById(id: string): Promise<Episode | null> {
    const result = await pool.query(
      'SELECT * FROM episodes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(): Promise<Episode[]> {
    const result = await pool.query(
      'SELECT * FROM episodes ORDER BY season_number, episode_number'
    );
    return result.rows;
  },

  async findByBracketGroup(bracketGroup: BracketGroup): Promise<Episode[]> {
    const result = await pool.query(
      'SELECT * FROM episodes WHERE bracket_group = $1 ORDER BY season_number, episode_number',
      [bracketGroup]
    );
    return result.rows;
  },

  async findBySeason(seasonNumber: number): Promise<Episode[]> {
    const result = await pool.query(
      'SELECT * FROM episodes WHERE season_number = $1 ORDER BY episode_number',
      [seasonNumber]
    );
    return result.rows;
  },

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM episodes');
    return parseInt(result.rows[0].count);
  },

  async countByBracketGroup(bracketGroup: BracketGroup): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM episodes WHERE bracket_group = $1',
      [bracketGroup]
    );
    return parseInt(result.rows[0].count);
  },
};
