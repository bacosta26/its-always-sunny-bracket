import { Request, Response } from 'express';
import { BracketService } from '../services/bracket.service';
import { BracketModel } from '../models/bracket.model';

export const BracketController = {
  async getAllBrackets(req: Request, res: Response): Promise<void> {
    try {
      const brackets = await BracketModel.findAll();
      res.json({ brackets });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch brackets',
      });
    }
  },

  async getBracket(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await BracketService.getBracketDetails(id);
      res.json(data);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Bracket not found',
      });
    }
  },

  async getCurrentRound(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await BracketService.getCurrentRoundMatchups(id);
      res.json(data);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Bracket not found',
      });
    }
  },

  async getBracketStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bracket = await BracketModel.findById(id);

      if (!bracket) {
        res.status(404).json({ error: 'Bracket not found' });
        return;
      }

      res.json({
        id: bracket.id,
        status: bracket.status,
        currentRound: bracket.current_round,
        updatedAt: bracket.updated_at,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch status',
      });
    }
  },

  async initializeBracket(req: Request, res: Response): Promise<void> {
    try {
      const { bracketGroup } = req.body;

      if (!bracketGroup || !['early', 'late'].includes(bracketGroup)) {
        res.status(400).json({ error: 'Invalid bracket group' });
        return;
      }

      const bracketId = await BracketService.initializeBracket(bracketGroup);
      res.status(201).json({ bracketId, message: 'Bracket initialized successfully' });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to initialize bracket',
      });
    }
  },

  async getCurrentRoundWithVotes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Get userId from auth middleware if authenticated
      const userId = (req as any).user?.userId;

      const data = await BracketService.getCurrentRoundWithVotes(id, userId);
      res.json(data);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Bracket not found',
      });
    }
  },
};
