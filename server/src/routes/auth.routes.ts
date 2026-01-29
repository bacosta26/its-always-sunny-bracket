import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate, schemas } from '../middleware/validator';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(schemas.register), AuthController.register);
router.post('/login', validate(schemas.login), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authMiddleware, AuthController.me);

export default router;
