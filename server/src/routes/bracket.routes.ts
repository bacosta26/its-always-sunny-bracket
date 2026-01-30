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

// GET /api/brackets/:id/current-with-votes - Get current round with all vote data (optimized, 1 query)
router.get('/:id/current-with-votes', (req, res, next) => {
  // Try to authenticate, but don't require it
  authMiddleware(req, res, (err) => {
    if (err) {
      // Continue without auth
      (req as any).user = undefined;
    }
    next();
  });
}, BracketController.getCurrentRoundWithVotes);

// GET /api/brackets/:id/status - Get bracket status (for polling)
router.get('/:id/status', BracketController.getBracketStatus);

export default router;
