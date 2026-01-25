import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { notificationsService } from './notifications.service';

// Инициализация YooKassa клиента
const checkout = new YooCheckout({
  shopId: process.env.UKASSA_SHOP_ID || '',
  secretKey: process.env.UKASSA_SECRET_KEY || '',
});

// Тарифные планы
export interface TariffPlan {
  id: string;
  name: string;
  description: string;
  sessionsCount: number;
  price: number; // в рублях
  pricePerSession: number;
  popular?: boolean;
}

export const TARIFF_PLANS: TariffPlan[] = [
  {
    id: 'trial',
    name: 'Пробное занятие',
    description: 'Первое знакомство с клубом',
    sessionsCount: 1,
    price: 500,
    pricePerSession: 500,
  },
  {
    id: 'single',
    name: 'Разовое посещение',
    description: 'Одна тренировка',
    sessionsCount: 1,
    price: 800,
    pricePerSession: 800,
  },
  {
    id: 'package_8',
    name: 'Абонемент 8 занятий',
    description: 'Выгодный пакет на месяц',
    sessionsCount: 8,
    price: 5600,
    pricePerSession: 700,
    popular: true,
  },
  {
    id: 'package_12',
    name: 'Абонемент 12 занятий',
    description: 'Максимальная экономия',
    sessionsCount: 12,
    price: 7800,
    pricePerSession: 650,
  },
  {
    id: 'unlimited',
    name: 'Безлимит месяц',
    description: 'Неограниченное количество тренировок',
    sessionsCount: 30, // для учета баланса
    price: 12000,
    pricePerSession: 400,
  },
];

export const paymentsService = {
  // Получить тарифы
  getTariffs(): TariffPlan[] {
    return TARIFF_PLANS;
  },

  // Создать платеж
  async createPayment(userId: string, tariffId: string, childId?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    const tariff = TARIFF_PLANS.find((t) => t.id === tariffId);
    if (!tariff) {
      throw new AppError('Тариф не найден', 404);
    }

    // Проверить, что ребенок принадлежит родителю
    if (childId) {
      const child = await prisma.child.findFirst({
        where: { id: childId, parentId: userId },
      });
      if (!child) {
        throw new AppError('Ребенок не найден', 404);
      }
    }

    // Создать запись о платеже в БД
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: tariff.price,
        currency: 'RUB',
        sessionsCount: tariff.sessionsCount,
        status: 'PENDING',
        paymentMethod: 'yookassa',
        metadata: {
          tariffId,
          childId,
        },
      },
    });

    // Создать платеж в ЮKassa
    const idempotenceKey = uuidv4();
    const returnUrl = `${process.env.FRONTEND_URL}/payments/success?paymentId=${payment.id}`;

    const createPayload: ICreatePayment = {
      amount: {
        value: tariff.price.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: returnUrl,
      },
      capture: true,
      description: `${tariff.name} для ${user.firstName} ${user.lastName}`,
      metadata: {
        paymentId: payment.id,
        userId,
        tariffId,
        childId: childId || '',
      },
    };

    try {
      const yooPayment = await checkout.createPayment(createPayload, idempotenceKey);

      // Обновить payment с externalId
      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: yooPayment.id },
      });

      return {
        paymentId: payment.id,
        confirmationUrl: yooPayment.confirmation.confirmation_url,
        amount: tariff.price,
        sessionsCount: tariff.sessionsCount,
      };
    } catch (error: any) {
      console.error('YooKassa error:', error);

      // Обновить статус на FAILED
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      throw new AppError('Ошибка создания платежа', 500);
    }
  },

  // Обработка webhook от ЮKassa
  async handleWebhook(event: any) {
    const { type, object } = event;

    if (type !== 'payment.succeeded' && type !== 'payment.canceled') {
      return { received: true };
    }

    const externalId = object.id;
    const payment = await prisma.payment.findFirst({
      where: { externalId },
    });

    if (!payment) {
      console.error('Payment not found for externalId:', externalId);
      return { received: true };
    }

    if (type === 'payment.succeeded') {
      // Получить childId из metadata платежа
      const childId = (payment.metadata as any)?.childId;

      if (!childId) {
        throw new AppError('childId не найден в metadata платежа', 400);
      }

      // Обновить платеж и баланс ребенка в транзакции
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' },
        }),
        prisma.child.update({
          where: { id: childId },
          data: {
            balance: {
              increment: payment.sessionsCount,
            },
          },
        }),
      ]);

      console.log(
        `Payment ${payment.id} succeeded. Added ${payment.sessionsCount} sessions to child ${childId}`
      );

      // Отправить email уведомление об успешной оплате
      await notificationsService.sendPaymentSuccessEmail(payment.userId, payment.id);
    } else if (type === 'payment.canceled') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      console.log(`Payment ${payment.id} canceled`);
    }

    return { received: true };
  },

  // Получить платеж по ID
  async getPaymentById(paymentId: string, userId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { user: true },
    });

    if (!payment) {
      throw new AppError('Платеж не найден', 404);
    }

    return payment;
  },

  // Получить историю платежей пользователя
  async getUserPayments(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  },

  // Проверить статус платежа в ЮKassa
  async checkPaymentStatus(externalId: string) {
    try {
      const payment = await checkout.getPayment(externalId);
      return payment;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new AppError('Ошибка проверки статуса платежа', 500);
    }
  },
};
