import express from 'express';
import { adminController } from '../controllers/admin.controller';
import { adminOnly } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Все роуты только для админов
router.use(...adminOnly);

// Управление пользователями
router.get('/users', asyncHandler(adminController.getUsers));
router.post('/users', asyncHandler(adminController.createUser));

// Платежи пользователя (должен быть перед /users/:id чтобы не было конфликта)
router.get('/users/:userId/payments', asyncHandler(adminController.getUserPayments));

// Обновление и удаление пользователя
router.put('/users/:id', asyncHandler(adminController.updateUser));
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

// Закрепления детей за тренерами
router.get('/assignments', asyncHandler(adminController.getAssignments));
router.post('/assignments', asyncHandler(adminController.assignChildToTrainer));
router.delete('/assignments/:childId', asyncHandler(adminController.unassignChildFromTrainer));

export default router;
