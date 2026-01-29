import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/drafts - Create a new draft league
router.post('/', authMiddleware, async (req, res) => {
  // TODO: Implement league creation
  res.json({ message: 'Create draft league' });
});

// GET /api/drafts/:id - Get draft league details
router.get('/:id', authMiddleware, async (req, res) => {
  // TODO: Implement get league details
  res.json({ message: `Get draft league ${req.params.id}` });
});

// POST /api/drafts/:id/join - Join a draft league
router.post('/:id/join', authMiddleware, async (req, res) => {
  // TODO: Implement join league
  res.json({ message: `Join draft league ${req.params.id}` });
});

// POST /api/drafts/:id/pick - Make a draft pick
router.post('/:id/pick', authMiddleware, async (req, res) => {
  // TODO: Implement draft pick with snake draft logic
  res.json({ message: `Make pick in draft ${req.params.id}` });
});

// GET /api/drafts/:id/current - Get current draft state (for polling)
router.get('/:id/current', authMiddleware, async (req, res) => {
  // TODO: Implement current draft state for polling
  res.json({ message: `Get current state for draft ${req.params.id}` });
});

export default router;
