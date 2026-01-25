import bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import prisma from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../config/jwt';
import { AppError } from '../middleware/errorHandler';
import { notificationsService } from './notifications.service';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: Role;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Регистрация нового пользователя
  static async register(data: RegisterData): Promise<AuthResponse> {
    // Проверка существования email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Пользователь с таким email уже существует', 409, 'USER_EXISTS');
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || Role.PARENT,
      },
    });

    // Генерация токенов
    const payload = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Сохранение refresh token в БД
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      id: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // Убираем пароль из ответа
    const { password, ...userWithoutPassword } = user;

    // Отправить приветственное email (асинхронно, не блокирует ответ)
    notificationsService.sendWelcomeEmail(user.id).catch((error) => {
      console.error('Ошибка отправки приветственного email:', error);
    });

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  // Вход в систему
  static async login(data: LoginData): Promise<AuthResponse> {
    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Неверный email или пароль', 401, 'INVALID_CREDENTIALS');
    }

    // Генерация токенов
    const payload = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Сохранение refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      id: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    // Убираем пароль
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  // Обновление access token с помощью refresh token
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Проверка refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Проверка существования токена в БД
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord) {
        throw new AppError('Недействительный refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Проверка срока действия
      if (tokenRecord.expiresAt < new Date()) {
        // Удаление истекшего токена
        await prisma.refreshToken.delete({
          where: { token: refreshToken },
        });
        throw new AppError('Refresh token истек', 401, 'EXPIRED_REFRESH_TOKEN');
      }

      // Генерация нового access token
      const payload = {
        userId: tokenRecord.user.id,
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
      };

      const accessToken = generateAccessToken(payload);

      return { accessToken };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Ошибка обновления токена', 401, 'REFRESH_TOKEN_ERROR');
    }
  }

  // Выход из системы (удаление refresh token)
  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Получение текущего пользователя
  static async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        children: true,
        trainer: true,
      },
    });

    if (!user) {
      throw new AppError('Пользователь не найден', 404, 'USER_NOT_FOUND');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Очистка истекших refresh токенов (для cron job)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }
}
