import { pool } from '../config/database';
import { BracketGroup, BracketStatus } from '../types';

export interface Bracket {
  id: string;
  name: string;
  bracket_group: BracketGroup;
  status: BracketStatus;
  current_round: number;
  created_at: Date;
  updated_at: Date;
}

export const BracketModel = {
  async findById(id: string): Promise<Bracket | null> {
    const result = await pool.query(
      'SELECT * FROM brackets WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(): Promise<Bracket[]> {
    const result = await pool.query(
      'SELECT * FROM brackets ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findByGroup(bracketGroup: BracketGroup): Promise<Bracket | null> {
    const result = await pool.query(
      'SELECT * FROM brackets WHERE bracket_group = $1 ORDER BY created_at DESC LIMIT 1',
      [bracketGroup]
    );
    return result.rows[0] || null;
  },

  async findActive(): Promise<Bracket[]> {
    const result = await pool.query(
      "SELECT * FROM brackets WHERE status = 'active' ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async updateStatus(id: string, status: BracketStatus): Promise<void> {
    await pool.query(
      'UPDATE brackets SET status = $1 WHERE id = $2',
      [status, id]
    );
  },

  async updateRound(id: string, round: number): Promise<void> {
    await pool.query(
      'UPDATE brackets SET current_round = $1 WHERE id = $2',
      [round, id]
    );
  },

  async create(name: string, bracketGroup: BracketGroup): Promise<Bracket> {
    const result = await pool.query(
      `INSERT INTO brackets (name, bracket_group, status, current_round)
       VALUES ($1, $2, 'active', 1)
       RETURNING *`,
      [name, bracketGroup]
    );
    return result.rows[0];
  },
};
