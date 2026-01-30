import { pool } from '../config/database';
import {
  DraftLeagueModel,
  DraftTeamModel,
  DraftPickModel,
} from '../models/draft.model';
import { ScoringType } from '../types';

export const DraftService = {
  /**
   * Create a new draft league
   */
  async createLeague(
    userId: string,
    name: string,
    maxTeams: number = 8,
    episodesPerTeam: number = 10,
    scoringType: ScoringType = 'bracket_based'
  ) {
    const league = await DraftLeagueModel.create(
      name,
      userId,
      maxTeams,
      episodesPerTeam,
      scoringType
    );

    return league;
  },

  /**
   * Join a league by creating a team
   */
  async joinLeague(leagueId: string, userId: string, teamName: string, teamFlag: string = 'red-wine') {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const league = await DraftLeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      if (league.status !== 'setup') {
        throw new Error('League is no longer accepting new teams');
      }

      // Check if user already has a team in this league
      const existingTeam = await DraftTeamModel.findByUserAndLeague(userId, leagueId);
      if (existingTeam) {
        throw new Error('You already have a team in this league');
      }

      // Check if league is full
      const teamCount = await DraftTeamModel.count(leagueId);
      if (teamCount >= league.max_teams) {
        throw new Error('League is full');
      }

      // Create team with next draft position
      const draftPosition = teamCount + 1;
      const team = await DraftTeamModel.create(leagueId, userId, teamName, teamFlag, draftPosition);

      await client.query('COMMIT');

      return team;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Start the draft (requires all teams to be filled)
   */
  async startDraft(leagueId: string, userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const league = await DraftLeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      if (league.created_by !== userId) {
        throw new Error('Only league creator can start the draft');
      }

      if (league.status !== 'setup') {
        throw new Error('Draft has already started or completed');
      }

      const teamCount = await DraftTeamModel.count(leagueId);
      if (teamCount < 2) {
        throw new Error('Need at least 2 teams to start draft');
      }

      // Start draft at pick 1
      await DraftLeagueModel.updateStatus(leagueId, 'drafting');
      await DraftLeagueModel.updateCurrentPick(leagueId, 1);

      await client.query('COMMIT');

      return { message: 'Draft started successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Calculate which team picks at a given pick number (snake draft)
   */
  getPickingTeam(pickNumber: number, teams: any[]): any {
    const numTeams = teams.length;
    const roundNumber = Math.ceil(pickNumber / numTeams);
    const positionInRound = ((pickNumber - 1) % numTeams) + 1;

    // Snake draft: odd rounds go 1->N, even rounds go N->1
    const isOddRound = roundNumber % 2 === 1;
    const draftPosition = isOddRound
      ? positionInRound
      : numTeams - positionInRound + 1;

    return teams.find(t => t.draft_position === draftPosition);
  },

  /**
   * Make a draft pick
   */
  async makePick(leagueId: string, userId: string, episodeId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const league = await DraftLeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      if (league.status !== 'drafting') {
        throw new Error('Draft is not currently active');
      }

      const teams = await DraftTeamModel.findByLeague(leagueId);
      const userTeam = teams.find(t => t.user_id === userId);

      if (!userTeam) {
        throw new Error('You are not in this league');
      }

      // Check if it's this team's turn
      const currentPick = league.current_draft_pick || 1;
      const pickingTeam = this.getPickingTeam(currentPick, teams);

      if (pickingTeam.id !== userTeam.id) {
        throw new Error('It is not your turn to pick');
      }

      // Check if episode is available
      const isAlreadyPicked = await DraftPickModel.isEpisodePicked(leagueId, episodeId);
      if (isAlreadyPicked) {
        throw new Error('Episode has already been drafted');
      }

      // Calculate round number
      const roundNumber = Math.ceil(currentPick / teams.length);

      // Create the pick
      await DraftPickModel.create(
        leagueId,
        userTeam.id,
        episodeId,
        currentPick,
        roundNumber
      );

      // Calculate total picks that should be made
      const totalPicks = teams.length * league.episodes_per_team;

      if (currentPick >= totalPicks) {
        // Draft is complete!
        await DraftLeagueModel.updateStatus(leagueId, 'active');
        await DraftLeagueModel.updateCurrentPick(leagueId, 0);
      } else {
        // Move to next pick
        await DraftLeagueModel.updateCurrentPick(leagueId, currentPick + 1);
      }

      await client.query('COMMIT');

      return {
        pickNumber: currentPick,
        roundNumber,
        nextPick: currentPick < totalPicks ? currentPick + 1 : null,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get league details with teams and picks
   */
  async getLeagueDetails(leagueId: string) {
    const league = await DraftLeagueModel.findById(leagueId);
    if (!league) {
      throw new Error('League not found');
    }

    const teams = await DraftTeamModel.findByLeague(leagueId);
    const picks = await DraftPickModel.findByLeague(leagueId);

    // Get current picking team if draft is active
    let currentPickingTeam = null;
    if (league.status === 'drafting' && league.current_draft_pick) {
      currentPickingTeam = this.getPickingTeam(league.current_draft_pick, teams);
    }

    // Get available episodes
    const availableEpisodeIds = await DraftPickModel.getAvailableEpisodes(leagueId);

    return {
      league,
      teams,
      picks,
      currentPickingTeam,
      availableEpisodeCount: availableEpisodeIds.length,
    };
  },

  /**
   * Get team roster
   */
  async getTeamRoster(teamId: string) {
    const team = await DraftTeamModel.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const picks = await DraftPickModel.findByTeam(teamId);

    return {
      team,
      picks,
    };
  },

  /**
   * Calculate scores based on bracket results
   * Points system:
   * - Round 1 win: 1 point
   * - Round 2 win: 2 points
   * - Round 3 win: 4 points
   * - Round 4 win: 8 points
   * - Champion: 16 points (total 31 points for winning all rounds)
   */
  async calculateScores(leagueId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const league = await DraftLeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      if (league.scoring_type !== 'bracket_based') {
        throw new Error('This league does not use bracket-based scoring');
      }

      const teams = await DraftTeamModel.findByLeague(leagueId);

      for (const team of teams) {
        const picks = await DraftPickModel.findByTeam(team.id);
        let totalScore = 0;

        // Calculate score for each picked episode
        for (const pick of picks) {
          const episodeScore = await this.calculateEpisodeScore(pick.episode_id);
          totalScore += episodeScore;
        }

        // Update team score
        await DraftTeamModel.updateScore(team.id, totalScore);
      }

      await client.query('COMMIT');

      const updatedTeams = await DraftTeamModel.findByLeague(leagueId);
      return {
        message: 'Scores calculated successfully',
        teams: updatedTeams,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Calculate score for a single episode based on bracket performance
   */
  async calculateEpisodeScore(episodeId: string): Promise<number> {
    const result = await pool.query(
      `SELECT
        m.round_number,
        m.winner_episode_id,
        b.status as bracket_status
       FROM bracket_matchups m
       JOIN brackets b ON m.bracket_id = b.id
       WHERE (m.episode1_id = $1 OR m.episode2_id = $1)
         AND m.status = 'completed'
       ORDER BY m.round_number DESC`,
      [episodeId]
    );

    let score = 0;

    for (const row of result.rows) {
      // Check if this episode won the matchup
      if (row.winner_episode_id === episodeId) {
        // Points double each round: 1, 2, 4, 8, 16
        const roundPoints = Math.pow(2, row.round_number - 1);
        score += roundPoints;
      }
    }

    return score;
  },
};
