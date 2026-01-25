import { Request, Response } from 'express';
import { OFPService } from '../services/ofp.service';
import { asyncHandler } from '../middleware/errorHandler';

export class OFPController {
  // GET /api/ofp/child/:childId - Получить результаты ОФП ребенка
  static getChildOFPResults = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const childId = req.params.childId as string;
    const results = await OFPService.getChildOFPResults(
      childId,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      data: results,
    });
  });

  // GET /api/ofp/:id - Получить результат по ID
  static getOFPResultById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    const result = await OFPService.getOFPResultById(id, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  // POST /api/ofp - Создать результат ОФП
  static createOFPResult = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const resultData = {
      ...req.body,
      testDate: new Date(req.body.testDate),
    };

    const result = await OFPService.createOFPResult(req.user.userId, resultData);

    res.status(201).json({
      success: true,
      message: 'Результаты ОФП добавлены',
      data: result,
    });
  });

  // PUT /api/ofp/:id - Обновить результат ОФП
  static updateOFPResult = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    const updateData = { ...req.body };

    if (updateData.testDate) {
      updateData.testDate = new Date(updateData.testDate);
    }

    const result = await OFPService.updateOFPResult(id, req.user.userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Результаты ОФП обновлены',
      data: result,
    });
  });

  // DELETE /api/ofp/:id - Удалить результат ОФП
  static deleteOFPResult = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    await OFPService.deleteOFPResult(id, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Результат ОФП удален',
    });
  });

  // GET /api/ofp/standards - Получить нормативы
  static getOFPStandards = asyncHandler(async (req: Request, res: Response) => {
    const standards = await OFPService.getOFPStandards();

    res.status(200).json({
      success: true,
      data: standards,
    });
  });

  // GET /api/ofp/compare/:childId - Сравнить с нормативами
  static compareWithStandards = asyncHandler(async (req: Request, res: Response) => {
    const childId = req.params.childId as string;
    const { resultId } = req.query;

    const comparison = await OFPService.compareWithStandards(
      childId,
      resultId as string | undefined
    );

    res.status(200).json({
      success: true,
      data: comparison,
    });
  });

  // GET /api/ofp/progress/:childId/:field - Получить динамику прогресса
  static getProgressData = asyncHandler(async (req: Request, res: Response) => {
    const childId = req.params.childId as string;
    const field = req.params.field as string;

    const progressData = await OFPService.getProgressData(childId, field);

    res.status(200).json({
      success: true,
      data: progressData,
    });
  });
}
