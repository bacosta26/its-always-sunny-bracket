import { pool } from '../config/database';
import { LeagueStatus, ScoringType } from '../types';

export interface DraftLeague {
  id: string;
  name: string;
  created_by: string;
  status: LeagueStatus;
  max_teams: number;
  episodes_per_team: number;
  scoring_type: ScoringType;
  current_draft_pick?: number;
  created_at: Date;
}

export interface DraftTeam {
  id: string;
  league_id: string;
  user_id: string;
  team_name: string;
  team_flag: string;
  draft_position: number;
  total_score: number;
  created_at: Date;
}

export interface DraftPick {
  id: string;
  league_id: string;
  team_id: string;
  episode_id: string;
  pick_number: number;
  round_number: number;
  created_at: Date;
}

export interface DraftPickWithEpisode extends DraftPick {
  episode: {
    id: string;
    title: string;
    season_number: number;
    episode_number: number;
  };
}

export const DraftLeagueModel = {
  async create(
    name: string,
    createdBy: string,
    maxTeams: number = 8,
    episodesPerTeam: number = 10,
    scoringType: ScoringType = 'bracket_based'
  ): Promise<DraftLeague> {
    const result = await pool.query(
      `INSERT INTO draft_leagues (name, created_by, max_teams, episodes_per_team, scoring_type, status)
       VALUES ($1, $2, $3, $4, $5, 'setup')
       RETURNING *`,
      [name, createdBy, maxTeams, episodesPerTeam, scoringType]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<DraftLeague | null> {
    const result = await pool.query(
      'SELECT * FROM draft_leagues WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll(): Promise<DraftLeague[]> {
    const result = await pool.query(
      'SELECT * FROM draft_leagues ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findByUser(userId: string): Promise<DraftLeague[]> {
    const result = await pool.query(
      `SELECT DISTINCT l.* FROM draft_leagues l
       LEFT JOIN draft_teams t ON l.id = t.league_id
       WHERE l.created_by = $1 OR t.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async updateStatus(id: string, status: LeagueStatus): Promise<void> {
    await pool.query(
      'UPDATE draft_leagues SET status = $1 WHERE id = $2',
      [status, id]
    );
  },

  async updateCurrentPick(id: string, pickNumber: number): Promise<void> {
    await pool.query(
      'UPDATE draft_leagues SET current_draft_pick = $1 WHERE id = $2',
      [pickNumber, id]
    );
  },
};

export const DraftTeamModel = {
  async create(
    leagueId: string,
    userId: string,
    teamName: string,
    teamFlag: string,
    draftPosition: number
  ): Promise<DraftTeam> {
    const result = await pool.query(
      `INSERT INTO draft_teams (league_id, user_id, team_name, team_flag, draft_position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [leagueId, userId, teamName, teamFlag, draftPosition]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<DraftTeam | null> {
    const result = await pool.query(
      'SELECT * FROM draft_teams WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByLeague(leagueId: string): Promise<DraftTeam[]> {
    const result = await pool.query(
      'SELECT * FROM draft_teams WHERE league_id = $1 ORDER BY draft_position',
      [leagueId]
    );
    return result.rows;
  },

  async findByUserAndLeague(userId: string, leagueId: string): Promise<DraftTeam | null> {
    const result = await pool.query(
      'SELECT * FROM draft_teams WHERE user_id = $1 AND league_id = $2',
      [userId, leagueId]
    );
    return result.rows[0] || null;
  },

  async updateScore(id: string, score: number): Promise<void> {
    await pool.query(
      'UPDATE draft_teams SET total_score = $1 WHERE id = $2',
      [score, id]
    );
  },

  async count(leagueId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM draft_teams WHERE league_id = $1',
      [leagueId]
    );
    return parseInt(result.rows[0].count);
  },
};

export const DraftPickModel = {
  async create(
    leagueId: string,
    teamId: string,
    episodeId: string,
    pickNumber: number,
    roundNumber: number
  ): Promise<DraftPick> {
    const result = await pool.query(
      `INSERT INTO draft_picks (league_id, team_id, episode_id, pick_number, round_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [leagueId, teamId, episodeId, pickNumber, roundNumber]
    );
    return result.rows[0];
  },

  async findByLeague(leagueId: string): Promise<DraftPickWithEpisode[]> {
    const result = await pool.query(
      `SELECT
        p.*,
        e.id as episode_id, e.title as episode_title,
        e.season_number, e.episode_number
       FROM draft_picks p
       JOIN episodes e ON p.episode_id = e.id
       WHERE p.league_id = $1
       ORDER BY p.pick_number`,
      [leagueId]
    );

    return result.rows.map(row => ({
      id: row.id,
      league_id: row.league_id,
      team_id: row.team_id,
      episode_id: row.episode_id,
      pick_number: row.pick_number,
      round_number: row.round_number,
      created_at: row.created_at,
      episode: {
        id: row.episode_id,
        title: row.episode_title,
        season_number: row.season_number,
        episode_number: row.episode_number,
      },
    }));
  },

  async findByTeam(teamId: string): Promise<DraftPickWithEpisode[]> {
    const result = await pool.query(
      `SELECT
        p.*,
        e.id as episode_id, e.title as episode_title,
        e.season_number, e.episode_number
       FROM draft_picks p
       JOIN episodes e ON p.episode_id = e.id
       WHERE p.team_id = $1
       ORDER BY p.pick_number`,
      [teamId]
    );

    return result.rows.map(row => ({
      id: row.id,
      league_id: row.league_id,
      team_id: row.team_id,
      episode_id: row.episode_id,
      pick_number: row.pick_number,
      round_number: row.round_number,
      created_at: row.created_at,
      episode: {
        id: row.episode_id,
        title: row.episode_title,
        season_number: row.season_number,
        episode_number: row.episode_number,
      },
    }));
  },

  async isEpisodePicked(leagueId: string, episodeId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM draft_picks WHERE league_id = $1 AND episode_id = $2',
      [leagueId, episodeId]
    );
    return parseInt(result.rows[0].count) > 0;
  },

  async getAvailableEpisodes(leagueId: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT e.id FROM episodes e
       WHERE e.id NOT IN (
         SELECT episode_id FROM draft_picks WHERE league_id = $1
       )
       ORDER BY e.season_number, e.episode_number`,
      [leagueId]
    );
    return result.rows.map(row => row.id);
  },
};
