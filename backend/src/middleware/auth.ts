import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../config/jwt';
import { Role } from '@prisma/client';

// Расширяем тип Request для включения user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Middleware для проверки JWT токена
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Токен не предоставлен',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.substring(7); // Убираем "Bearer "

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        error: 'Недействительный или истекший токен',
        code: 'INVALID_TOKEN',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Ошибка аутентификации',
      code: 'AUTH_ERROR',
    });
  }
};

// Middleware для проверки роли пользователя
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Пользователь не аутентифицирован',
        code: 'NOT_AUTHENTICATED',
      });
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Недостаточно прав для выполнения этого действия',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        userRole: userRole,
      });
    }

    next();
  };
};

// Комбинированный middleware: аутентификация + авторизация
export const authenticateAndAuthorize = (...allowedRoles: Role[]) => {
  return [authenticate, authorize(...allowedRoles)];
};

// Middleware только для родителей
export const parentOnly = authenticateAndAuthorize(Role.PARENT);

// Middleware только для тренеров
export const trainerOnly = authenticateAndAuthorize(Role.TRAINER);

// Middleware только для админов
export const adminOnly = authenticateAndAuthorize(Role.ADMIN);

// Middleware для тренеров и админов
export const trainerOrAdmin = authenticateAndAuthorize(Role.TRAINER, Role.ADMIN);

// Middleware для всех аутентифицированных пользователей
export const authenticated = authenticate;
export const auth = authenticate; // Alias для удобства
