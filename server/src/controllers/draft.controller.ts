import { Response } from 'express';
import { DraftService } from '../services/draft.service';
import { DraftLeagueModel } from '../models/draft.model';
import { AuthRequest } from '../types';

export const DraftController = {
  async createLeague(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { name, maxTeams, episodesPerTeam, scoringType } = req.body;

      if (!name) {
        res.status(400).json({ error: 'League name is required' });
        return;
      }

      const league = await DraftService.createLeague(
        req.user.userId,
        name,
        maxTeams,
        episodesPerTeam,
        scoringType
      );

      res.status(201).json({ league });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create league',
      });
    }
  },

  async getAllLeagues(req: AuthRequest, res: Response): Promise<void> {
    try {
      const leagues = await DraftLeagueModel.findAll();
      res.json({ leagues });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch leagues',
      });
    }
  },

  async getUserLeagues(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const leagues = await DraftLeagueModel.findByUser(req.user.userId);
      res.json({ leagues });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch leagues',
      });
    }
  },

  async getLeague(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await DraftService.getLeagueDetails(id);
      res.json(data);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'League not found',
      });
    }
  },

  async joinLeague(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { teamName } = req.body;

      if (!teamName) {
        res.status(400).json({ error: 'Team name is required' });
        return;
      }

      const teamFlag = req.body.teamFlag || 'red-wine';
      const team = await DraftService.joinLeague(id, req.user.userId, teamName, teamFlag);

      res.status(201).json({ team, message: 'Successfully joined league' });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to join league',
      });
    }
  },

  async startDraft(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const result = await DraftService.startDraft(id, req.user.userId);

      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to start draft',
      });
    }
  },

  async makePick(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const { episodeId } = req.body;

      if (!episodeId) {
        res.status(400).json({ error: 'Episode ID is required' });
        return;
      }

      const result = await DraftService.makePick(id, req.user.userId, episodeId);

      res.json({
        message: 'Pick made successfully',
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to make pick',
      });
    }
  },

  async getCurrentState(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await DraftService.getLeagueDetails(id);

      // Return minimal data for polling
      res.json({
        status: data.league.status,
        currentPick: data.league.current_draft_pick,
        currentPickingTeam: data.currentPickingTeam,
        pickCount: data.picks.length,
      });
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'League not found',
      });
    }
  },

  async getTeamRoster(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const data = await DraftService.getTeamRoster(teamId);
      res.json(data);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Team not found',
      });
    }
  },

  async calculateScores(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await DraftService.calculateScores(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to calculate scores',
      });
    }
  },
};
