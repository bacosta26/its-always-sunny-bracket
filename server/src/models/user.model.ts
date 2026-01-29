import { pool } from '../config/database';

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password_hash: string;
}

export const UserModel = {
  async create(data: CreateUserDTO): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.username, data.password_hash]
    );
    return result.rows[0];
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  },

  async getAll(): Promise<Omit<User, 'password_hash'>[]> {
    const result = await pool.query(
      'SELECT id, email, username, is_admin, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async updateAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
    await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2',
      [isAdmin, userId]
    );
  },
};
