import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /api/brackets - Get all brackets
router.get('/', async (req, res) => {
  // TODO: Implement bracket listing
  res.json({ message: 'Get all brackets' });
});

// GET /api/brackets/:id - Get bracket by ID
router.get('/:id', async (req, res) => {
  // TODO: Implement get bracket details with matchups
  res.json({ message: `Get bracket ${req.params.id}` });
});

// GET /api/brackets/:id/matchups - Get bracket matchups
router.get('/:id/matchups', async (req, res) => {
  // TODO: Implement get bracket matchups
  res.json({ message: `Get matchups for bracket ${req.params.id}` });
});

// GET /api/brackets/:id/status - Get bracket status (for polling)
router.get('/:id/status', async (req, res) => {
  // TODO: Implement bracket status for real-time updates
  res.json({ message: `Get status for bracket ${req.params.id}` });
});

export default router;
