import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';

export class AuthController {
  // POST /api/auth/register
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: result,
    });
  });

  // POST /api/auth/login
  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      data: result,
    });
  });

  // POST /api/auth/refresh
  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token не предоставлен',
        code: 'NO_REFRESH_TOKEN',
      });
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Токен обновлен',
      data: result,
    });
  });

  // POST /api/auth/logout
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Выход выполнен успешно',
    });
  });

  // GET /api/auth/me
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
        code: 'NOT_AUTHENTICATED',
      });
    }

    const user = await AuthService.getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });
}
