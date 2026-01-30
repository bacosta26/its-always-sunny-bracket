import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { DraftController } from '../controllers/draft.controller';

const router = Router();

// GET /api/drafts - Get all leagues
router.get('/', DraftController.getAllLeagues);

// GET /api/drafts/user - Get user's leagues
router.get('/user', authMiddleware, DraftController.getUserLeagues);

// POST /api/drafts - Create a new draft league
router.post('/', authMiddleware, DraftController.createLeague);

// GET /api/drafts/:id - Get draft league details
router.get('/:id', authMiddleware, DraftController.getLeague);

// POST /api/drafts/:id/join - Join a draft league
router.post('/:id/join', authMiddleware, DraftController.joinLeague);

// POST /api/drafts/:id/start - Start the draft
router.post('/:id/start', authMiddleware, DraftController.startDraft);

// POST /api/drafts/:id/pick - Make a draft pick
router.post('/:id/pick', authMiddleware, DraftController.makePick);

// GET /api/drafts/:id/current - Get current draft state (for polling)
router.get('/:id/current', DraftController.getCurrentState);

// GET /api/drafts/teams/:teamId - Get team roster
router.get('/teams/:teamId', DraftController.getTeamRoster);

// POST /api/drafts/:id/calculate-scores - Calculate scores for league
router.post('/:id/calculate-scores', authMiddleware, DraftController.calculateScores);

export default router;
