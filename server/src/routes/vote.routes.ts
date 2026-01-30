import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { VoteController } from '../controllers/vote.controller';

const router = Router();

// POST /api/votes - Cast a vote
router.post('/', authMiddleware, VoteController.castVote);

// GET /api/votes/user/:userId - Get user's votes
router.get('/user/:userId', authMiddleware, VoteController.getUserVotes);

// GET /api/votes/matchup/:matchupId - Get matchup vote details
router.get('/matchup/:matchupId', VoteController.getMatchupVotes);

export default router;
