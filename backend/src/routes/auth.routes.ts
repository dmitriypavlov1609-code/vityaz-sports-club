import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.schemas';

const router = Router();

// Публичные маршруты
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);

// Защищенные маршруты
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
