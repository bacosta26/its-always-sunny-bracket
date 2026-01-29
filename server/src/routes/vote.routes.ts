import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/votes - Cast a vote
router.post('/', authMiddleware, async (req, res) => {
  // TODO: Implement vote casting with validation
  // - Check user hasn't already voted in this matchup
  // - Update vote counts
  // - Check if round is complete, advance if needed
  res.json({ message: 'Vote cast' });
});

// GET /api/votes/user/:userId - Get user's votes
router.get('/user/:userId', authMiddleware, async (req, res) => {
  // TODO: Implement getting user's vote history
  res.json({ message: `Get votes for user ${req.params.userId}` });
});

export default router;
