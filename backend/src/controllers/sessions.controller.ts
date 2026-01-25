import { Request, Response } from 'express';
import { SessionsService } from '../services/sessions.service';
import { asyncHandler } from '../middleware/errorHandler';

export class SessionsController {
  // GET /api/sessions - Получить список тренировок
  static getSessions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const filters: any = {};

    if (req.query.childId) {
      filters.childId = req.query.childId as string;
    }

    if (req.query.trainerId) {
      filters.trainerId = req.query.trainerId as string;
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    if (req.query.attended !== undefined) {
      filters.attended = req.query.attended === 'true';
    }

    const sessions = await SessionsService.getSessions(
      req.user.userId,
      req.user.role,
      filters
    );

    res.status(200).json({
      success: true,
      data: sessions,
    });
  });

  // GET /api/sessions/:id - Получить тренировку по ID
  static getSessionById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    const session = await SessionsService.getSessionById(id, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      data: session,
    });
  });

  // POST /api/sessions - Создать тренировку
  static createSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const sessionData = {
      ...req.body,
      date: new Date(req.body.date),
    };

    const session = await SessionsService.createSession(req.user.userId, sessionData);

    res.status(201).json({
      success: true,
      message: 'Тренировка создана',
      data: session,
    });
  });

  // PUT /api/sessions/:id/attendance - Отметить посещение
  static markAttendance = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    const session = await SessionsService.markAttendance(id, req.user.userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Посещение отмечено',
      data: session,
    });
  });

  // DELETE /api/sessions/:id - Удалить тренировку
  static deleteSession = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    await SessionsService.deleteSession(id, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Тренировка удалена',
    });
  });

  // GET /api/sessions/stats - Получить статистику тренера
  static getTrainerStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const stats = await SessionsService.getTrainerStats(req.user.userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // GET /api/sessions/today - Получить тренировки на сегодня
  static getTodaySessions = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const sessions = await SessionsService.getTodaySessions(req.user.userId);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  });
}
