import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { notificationsService } from './notifications.service';

interface CreateSessionData {
  childId: string;
  trainerId: string;
  date: Date;
  duration?: number;
  notes?: string;
}

interface MarkAttendanceData {
  attended: boolean;
  notes?: string;
}

export class SessionsService {
  // Получить список тренировок
  static async getSessions(
    userId: string,
    role: string,
    filters?: {
      childId?: string;
      trainerId?: string;
      startDate?: Date;
      endDate?: Date;
      attended?: boolean;
    }
  ) {
    let where: any = {};

    // Фильтры в зависимости от роли
    if (role === 'PARENT') {
      // Родитель видит только тренировки своих детей
      const children = await prisma.child.findMany({
        where: { parentId: userId },
        select: { id: true },
      });

      const childIds = children.map((c) => c.id);
      where.childId = { in: childIds };
    } else if (role === 'TRAINER') {
      // Тренер видит только свои тренировки
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer) {
        throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
      }

      where.trainerId = trainer.id;
    }

    // Дополнительные фильтры
    if (filters?.childId) {
      where.childId = filters.childId;
    }

    if (filters?.trainerId) {
      where.trainerId = filters.trainerId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    if (filters?.attended !== undefined) {
      where.attended = filters.attended;
    }

    return await prisma.session.findMany({
      where,
      include: {
        child: {
          include: {
            parent: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Получить тренировку по ID
  static async getSessionById(sessionId: string, userId: string, role: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        child: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Тренировка не найдена', 404, 'SESSION_NOT_FOUND');
    }

    // Проверка прав доступа
    if (role === 'PARENT' && session.child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || session.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }
    }

    return session;
  }

  // Создать тренировку (только тренер)
  static async createSession(userId: string, data: CreateSessionData) {
    // Получить профиль тренера
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
    }

    // Проверить, что ребенок существует
    const child = await prisma.child.findUnique({
      where: { id: data.childId },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Создать тренировку
    return await prisma.session.create({
      data: {
        childId: data.childId,
        trainerId: trainer.id,
        date: data.date,
        duration: data.duration || 60,
        notes: data.notes,
      },
      include: {
        child: true,
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  // Отметить посещение (только тренер)
  static async markAttendance(
    sessionId: string,
    userId: string,
    data: MarkAttendanceData
  ) {
    // Получить профиль тренера
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
    }

    // Получить тренировку
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { child: true },
    });

    if (!session) {
      throw new AppError('Тренировка не найдена', 404, 'SESSION_NOT_FOUND');
    }

    // Проверка, что это тренировка этого тренера
    if (session.trainerId !== trainer.id) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    // Если отмечаем посещение и раньше не было отмечено
    const shouldDeductBalance = data.attended && !session.attended;

    // Если снимаем отметку посещения
    const shouldRefundBalance = !data.attended && session.attended;

    // Транзакция: обновить тренировку и баланс ребенка
    const [updatedSession] = await prisma.$transaction([
      // Обновить тренировку
      prisma.session.update({
        where: { id: sessionId },
        data: {
          attended: data.attended,
          notes: data.notes,
          markedAt: new Date(),
        },
        include: {
          child: true,
          trainer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),

      // Списать или вернуть баланс
      ...(shouldDeductBalance
        ? [
            prisma.child.update({
              where: { id: session.childId },
              data: { balance: { decrement: 1 } },
            }),
          ]
        : []),

      ...(shouldRefundBalance
        ? [
            prisma.child.update({
              where: { id: session.childId },
              data: { balance: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    // Проверить баланс после списания и отправить email если низкий
    if (shouldDeductBalance) {
      const updatedChild = await prisma.child.findUnique({
        where: { id: session.childId },
      });

      if (updatedChild && updatedChild.balance <= 3 && updatedChild.balance > 0) {
        // Отправить email о низком балансе (асинхронно)
        notificationsService.sendLowBalanceEmail(updatedChild.id).catch((error) => {
          console.error('Ошибка отправки email о низком балансе:', error);
        });
      }
    }

    return updatedSession;
  }

  // Удалить тренировку (только тренер или админ)
  static async deleteSession(sessionId: string, userId: string, role: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError('Тренировка не найдена', 404, 'SESSION_NOT_FOUND');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || session.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }
    }

    // Если тренировка была отмечена, вернуть баланс
    if (session.attended) {
      await prisma.child.update({
        where: { id: session.childId },
        data: { balance: { increment: 1 } },
      });
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });
  }

  // Получить статистику тренера
  static async getTrainerStats(userId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
    }

    const [totalSessions, totalChildren, todaySessions, upcomingSessions] = await Promise.all([
      // Всего тренировок
      prisma.session.count({
        where: { trainerId: trainer.id },
      }),

      // Всего детей
      prisma.child.count({
        where: { trainerId: trainer.id },
      }),

      // Тренировки сегодня
      prisma.session.count({
        where: {
          trainerId: trainer.id,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),

      // Предстоящие тренировки (следующие 7 дней)
      prisma.session.count({
        where: {
          trainerId: trainer.id,
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalSessions,
      totalChildren,
      todaySessions,
      upcomingSessions,
    };
  }

  // Получить тренировки на сегодня для тренера
  static async getTodaySessions(userId: string) {
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.session.findMany({
      where: {
        trainerId: trainer.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        child: {
          include: {
            parent: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
