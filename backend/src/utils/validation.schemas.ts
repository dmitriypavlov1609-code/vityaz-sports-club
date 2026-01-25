import { z } from 'zod';
import { Role, Gender } from '@prisma/client';

// Схемы для аутентификации
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Некорректный email'),
    password: z
      .string()
      .min(6, 'Пароль должен содержать минимум 6 символов')
      .max(100, 'Пароль слишком длинный'),
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа').max(50),
    phone: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Пароль обязателен'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token обязателен'),
  }),
});

// Схемы для детей
export const createChildSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    middleName: z.string().optional(),
    dateOfBirth: z.string().datetime('Некорректная дата рождения'),
    gender: z.nativeEnum(Gender),
    emergencyContact: z.string().optional(),
    medicalNotes: z.string().optional(),
  }),
});

export const updateChildSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    middleName: z.string().optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.nativeEnum(Gender).optional(),
    emergencyContact: z.string().optional(),
    medicalNotes: z.string().optional(),
  }),
});

// Схемы для ОФП
export const createOFPResultSchema = z.object({
  body: z.object({
    childId: z.string().uuid(),
    testDate: z.string().datetime(),
    run30m: z.number().positive().optional(),
    run60m: z.number().positive().optional(),
    run100m: z.number().positive().optional(),
    shuttleRun: z.number().positive().optional(),
    pullUps: z.number().int().nonnegative().optional(),
    pushUps: z.number().int().nonnegative().optional(),
    press30s: z.number().int().nonnegative().optional(),
    longJump: z.number().int().positive().optional(),
    highJump: z.number().int().positive().optional(),
    flexibility: z.number().int().optional(),
    ballThrow: z.number().positive().optional(),
    notes: z.string().optional(),
  }),
});

// Схемы для платежей
export const createPaymentSchema = z.object({
  body: z.object({
    childId: z.string().uuid().optional(),
    amount: z.number().positive('Сумма должна быть положительной'),
    sessionsCount: z.number().int().positive('Количество тренировок должно быть положительным'),
    packageName: z.string().optional(),
  }),
});

// Схемы для сессий/тренировок
export const createSessionSchema = z.object({
  body: z.object({
    childId: z.string().uuid(),
    date: z.string().datetime(),
    duration: z.number().int().positive().optional().default(60),
    notes: z.string().optional(),
  }),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    attended: z.boolean(),
    notes: z.string().optional(),
  }),
});
