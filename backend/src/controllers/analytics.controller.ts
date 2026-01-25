import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export const analyticsController = {
  // Dashboard KPI
  getDashboardKPI: async (req: Request, res: Response) => {
    const kpi = await analyticsService.getDashboardKPI();
    res.json({ success: true, data: kpi });
  },

  // Финансовая аналитика
  getRevenueAnalytics: async (req: Request, res: Response) => {
    const analytics = await analyticsService.getRevenueAnalytics();
    res.json({ success: true, data: analytics });
  },

  // Статистика посещаемости
  getAttendanceStats: async (req: Request, res: Response) => {
    const stats = await analyticsService.getAttendanceStats();
    res.json({ success: true, data: stats });
  },

  // Рейтинг тренеров
  getTrainersRating: async (req: Request, res: Response) => {
    const rating = await analyticsService.getTrainersRating();
    res.json({ success: true, data: rating });
  },

  // Статистика ОФП
  getOFPStatistics: async (req: Request, res: Response) => {
    const stats = await analyticsService.getOFPStatistics();
    res.json({ success: true, data: stats });
  },

  // Детальная аналитика по периоду
  getDetailedAnalytics: async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate и endDate обязательны',
      });
    }

    const analytics = await analyticsService.getDetailedAnalytics(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({ success: true, data: analytics });
  },
};
