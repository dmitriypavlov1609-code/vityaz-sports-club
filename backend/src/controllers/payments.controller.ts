import { Request, Response } from 'express';
import { paymentsService } from '../services/payments.service';
import { AppError } from '../middleware/errorHandler';

export const paymentsController = {
  // Получить тарифные планы
  getTariffs: async (req: Request, res: Response) => {
    const tariffs = paymentsService.getTariffs();
    res.json({ success: true, data: tariffs });
  },

  // Создать платеж
  createPayment: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { tariffId, childId } = req.body;

    if (!tariffId) {
      throw new AppError('tariffId обязателен', 400);
    }

    if (!childId) {
      throw new AppError('childId обязателен', 400);
    }

    const payment = await paymentsService.createPayment(userId, tariffId, childId);
    res.json({ success: true, data: payment });
  },

  // Webhook от ЮKassa
  handleWebhook: async (req: Request, res: Response) => {
    const event = req.body;

    await paymentsService.handleWebhook(event);
    res.json({ success: true });
  },

  // Получить платеж по ID
  getPaymentById: async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const payment = await paymentsService.getPaymentById(id, userId);
    res.json({ success: true, data: payment });
  },

  // Получить историю платежей
  getUserPayments: async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const payments = await paymentsService.getUserPayments(userId);
    res.json({ success: true, data: payments });
  },
};
