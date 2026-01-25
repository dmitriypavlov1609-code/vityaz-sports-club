import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { paymentsService } from './payments.service';

export const adminService = {
  // Получить всех пользователей
  async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        children: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        trainer: {
          select: {
            id: true,
            specialization: true,
            experience: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Создать пользователя (админ может создавать любые роли)
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    // Дополнительные поля для тренера
    specialization?: string;
    experience?: number;
    bio?: string;
    certifications?: string;
  }) {
    // Проверка существования
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 409);
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Создание пользователя с тренером если роль TRAINER
    if (data.role === Role.TRAINER) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
          trainer: {
            create: {
              specialization: data.specialization,
              experience: data.experience,
              bio: data.bio,
              certifications: data.certifications,
            },
          },
        },
        include: {
          trainer: true,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    // Создание обычного пользователя
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Обновить пользователя
  async updateUser(
    userId: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      role?: Role;
      password?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    // Если меняется email, проверить уникальность
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError('Email уже используется', 409);
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
    };

    // Хэширование нового пароля
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        trainer: true,
        children: true,
      },
    });

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  },

  // Удалить пользователя (мягкое удаление - деактивация)
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Пользователь не найден', 404);
    }

    // В реальном проекте лучше использовать поле isActive вместо удаления
    // Пока просто удаляем
    await prisma.user.delete({ where: { id: userId } });

    return { message: 'Пользователь удален' };
  },

  // Закрепить ребенка за тренером
  async assignChildToTrainer(childId: string, trainerId: string) {
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      throw new AppError('Ребенок не найден', 404);
    }

    const trainer = await prisma.trainer.findUnique({ where: { id: trainerId } });
    if (!trainer) {
      throw new AppError('Тренер не найден', 404);
    }

    return await prisma.child.update({
      where: { id: childId },
      data: { trainerId },
      include: {
        parent: {
          select: {
            firstName: true,
            lastName: true,
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
    });
  },

  // Открепить ребенка от тренера
  async unassignChildFromTrainer(childId: string) {
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) {
      throw new AppError('Ребенок не найден', 404);
    }

    return await prisma.child.update({
      where: { id: childId },
      data: { trainerId: null },
    });
  },

  // Получить все закрепления
  async getAssignments() {
    return await prisma.child.findMany({
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        trainer: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  },

  // Получить платежи пользователя (для админа)
  async getUserPayments(userId: string) {
    return await paymentsService.getUserPayments(userId);
  },
};
