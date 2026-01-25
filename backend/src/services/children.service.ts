import { Child, Gender } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface CreateChildData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: Gender;
  parentId: string;
  weight?: number;
  emergencyContact?: string;
  medicalNotes?: string;
}

interface UpdateChildData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  weight?: number;
  emergencyContact?: string;
  medicalNotes?: string;
  photo?: string;
  trainerId?: string;
}

export class ChildrenService {
  // Получить всех детей (для родителя или тренера)
  static async getChildren(userId: string, role: string) {
    if (role === 'PARENT') {
      return await prisma.child.findMany({
        where: { parentId: userId },
        include: {
          trainer: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          sessions: {
            where: { attended: true },
            orderBy: { date: 'desc' },
            take: 5,
          },
          ofpResults: {
            orderBy: { testDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else if (role === 'TRAINER') {
      // Найти профиль тренера
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer) {
        throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
      }

      return await prisma.child.findMany({
        where: { trainerId: trainer.id },
        include: {
          parent: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          sessions: {
            where: { attended: true },
            orderBy: { date: 'desc' },
            take: 5,
          },
          ofpResults: {
            orderBy: { testDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastName: 'asc' },
      });
    } else {
      // Админ видит всех детей
      return await prisma.child.findMany({
        include: {
          parent: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
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
        orderBy: { createdAt: 'desc' },
      });
    }
  }

  // Получить ребенка по ID
  static async getChildById(childId: string, userId: string, role: string) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
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
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        sessions: {
          orderBy: { date: 'desc' },
          take: 20,
          include: {
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
        },
        ofpResults: {
          orderBy: { testDate: 'desc' },
          include: {
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
        },
        metrics: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        achievements: {
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Проверка прав доступа
    if (role === 'PARENT' && child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || child.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }
    }

    return child;
  }

  // Создать ребенка (только родитель)
  static async createChild(data: CreateChildData): Promise<Child> {
    // Проверка, что пользователь существует и является родителем
    const parent = await prisma.user.findUnique({
      where: { id: data.parentId },
    });

    if (!parent) {
      throw new AppError('Родитель не найден', 404, 'PARENT_NOT_FOUND');
    }

    if (parent.role !== 'PARENT') {
      throw new AppError('Только родители могут добавлять детей', 403, 'FORBIDDEN');
    }

    return await prisma.child.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        parentId: data.parentId,
        weight: data.weight,
        emergencyContact: data.emergencyContact,
        medicalNotes: data.medicalNotes,
      },
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
    });
  }

  // Обновить ребенка
  static async updateChild(
    childId: string,
    userId: string,
    role: string,
    data: UpdateChildData
  ): Promise<Child> {
    // Проверка существования ребенка
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Проверка прав доступа
    if (role === 'PARENT' && child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || child.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }

      // Тренер может обновлять только некоторые поля
      const allowedFields: UpdateChildData = {};
      if (data.medicalNotes !== undefined) allowedFields.medicalNotes = data.medicalNotes;
      data = allowedFields;
    }

    return await prisma.child.update({
      where: { id: childId },
      data,
      include: {
        parent: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Удалить ребенка (только родитель)
  static async deleteChild(childId: string, userId: string, role: string): Promise<void> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Только родитель может удалить своего ребенка
    if (role !== 'ADMIN' && child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    await prisma.child.delete({
      where: { id: childId },
    });
  }

  // Обновить фото ребенка
  static async updatePhoto(
    childId: string,
    userId: string,
    role: string,
    photoUrl: string
  ): Promise<Child> {
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Проверка прав доступа
    if (role === 'PARENT' && child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    return await prisma.child.update({
      where: { id: childId },
      data: { photo: photoUrl },
    });
  }

  // Получить статистику по ребенку
  static async getChildStats(childId: string) {
    const [totalSessions, attendedSessions, ofpResultsCount, lastOFPTest] = await Promise.all([
      prisma.session.count({
        where: { childId },
      }),
      prisma.session.count({
        where: { childId, attended: true },
      }),
      prisma.oFPResult.count({
        where: { childId },
      }),
      prisma.oFPResult.findFirst({
        where: { childId },
        orderBy: { testDate: 'desc' },
      }),
    ]);

    const attendanceRate =
      totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    return {
      totalSessions,
      attendedSessions,
      attendanceRate,
      ofpResultsCount,
      lastOFPTest: lastOFPTest?.testDate || null,
    };
  }
}
