import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

// Кастомный класс ошибок приложения
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Обработчик ошибок Prisma
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Уникальное ограничение нарушено
      const field = (error.meta?.target as string[])?.join(', ') || 'поле';
      return new AppError(
        `Запись с таким значением ${field} уже существует`,
        409,
        'DUPLICATE_ENTRY'
      );

    case 'P2025':
      // Запись не найдена
      return new AppError('Запись не найдена', 404, 'NOT_FOUND');

    case 'P2003':
      // Нарушение внешнего ключа
      return new AppError('Связанная запись не найдена', 400, 'FOREIGN_KEY_ERROR');

    case 'P2014':
      // Нарушение отношения
      return new AppError('Невозможно выполнить операцию из-за связанных записей', 400, 'RELATION_ERROR');

    default:
      return new AppError('Ошибка базы данных', 500, 'DATABASE_ERROR');
  }
};

// Обработчик ошибок Zod (валидация)
const handleZodError = (error: ZodError): AppError => {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return new AppError(
    JSON.stringify({ message: 'Ошибка валидации данных', errors }),
    400,
    'VALIDATION_ERROR'
  );
};

// Главный обработчик ошибок
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: AppError;

  // Обработка разных типов ошибок
  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof ZodError) {
    error = handleZodError(err);
  } else {
    error = new AppError(
      err.message || 'Внутренняя ошибка сервера',
      500,
      'INTERNAL_ERROR'
    );
  }

  // Логирование ошибок в development режиме
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
    });
  }

  // Отправка ответа
  res.status(error.statusCode).json({
    error: error.message,
    code: error.code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// Обработчик для async функций (для автоматической обработки ошибок)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Обработчик 404 (не найден endpoint)
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint не найден',
    code: 'NOT_FOUND',
    path: req.path,
  });
};
