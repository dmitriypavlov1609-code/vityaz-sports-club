import express from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { auth, parentOnly } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Получить тарифы (доступно всем авторизованным)
router.get('/tariffs', auth, asyncHandler(paymentsController.getTariffs));

// Создать платеж (только родители)
router.post('/create', ...parentOnly, asyncHandler(paymentsController.createPayment));

// Webhook от ЮKassa (без авторизации)
router.post('/webhook', asyncHandler(paymentsController.handleWebhook));

// Получить платеж по ID (только родители)
router.get('/:id', ...parentOnly, asyncHandler(paymentsController.getPaymentById));

// История платежей (только родители)
router.get('/', ...parentOnly, asyncHandler(paymentsController.getUserPayments));

export default router;
