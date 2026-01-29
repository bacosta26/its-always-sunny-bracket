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
  // TODO: Implement bracket creation with matchup generation
  res.json({ message: 'Create bracket' });
});

// POST /api/admin/brackets/:id/reset - Reset a bracket
router.post('/brackets/:id/reset', async (req, res) => {
  // TODO: Implement bracket reset
  res.json({ message: 'Reset bracket' });
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
