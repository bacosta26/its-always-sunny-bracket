import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { BracketController } from '../controllers/bracket.controller';

const router = Router();

// GET /api/brackets - Get all brackets
router.get('/', BracketController.getAllBrackets);

// GET /api/brackets/:id - Get bracket by ID with all matchups
router.get('/:id', BracketController.getBracket);

// GET /api/brackets/:id/current - Get current round matchups
router.get('/:id/current', BracketController.getCurrentRound);

// GET /api/brackets/:id/status - Get bracket status (for polling)
router.get('/:id/status', BracketController.getBracketStatus);

export default router;
