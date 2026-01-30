import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { UserModel } from '../models/user.model';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/admin - Toggle admin status
router.patch('/users/:id/admin', async (req, res) => {
  try {
    const { isAdmin } = req.body;
    await UserModel.updateAdminStatus(req.params.id, isAdmin);
    res.json({ message: 'Admin status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// POST /api/admin/brackets - Create a new bracket
router.post('/brackets', async (req, res) => {
  const { BracketController } = require('../controllers/bracket.controller');
  await BracketController.initializeBracket(req, res);
});

// POST /api/admin/brackets/:id/reset - Reset a bracket
router.post('/brackets/:id/reset', async (req, res) => {
  try {
    const { BracketService } = require('../services/bracket.service');
    const result = await BracketService.resetBracket(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to reset bracket',
    });
  }
});

// POST /api/admin/episodes - Create episode
router.post('/episodes', async (req, res) => {
  // TODO: Implement episode creation
  res.json({ message: 'Create episode' });
});

// PUT /api/admin/episodes/:id - Update episode
router.put('/episodes/:id', async (req, res) => {
  // TODO: Implement episode update
  res.json({ message: 'Update episode' });
});

// DELETE /api/admin/episodes/:id - Delete episode
router.delete('/episodes/:id', async (req, res) => {
  // TODO: Implement episode deletion
  res.json({ message: 'Delete episode' });
});

export default router;
