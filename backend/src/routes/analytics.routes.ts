import express from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { adminOnly } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Все роуты только для админов
router.use(...adminOnly);

// Dashboard KPI
router.get('/dashboard', asyncHandler(analyticsController.getDashboardKPI));

// Финансовая аналитика
router.get('/revenue', asyncHandler(analyticsController.getRevenueAnalytics));

// Посещаемость
router.get('/attendance', asyncHandler(analyticsController.getAttendanceStats));

// Рейтинг тренеров
router.get('/trainers', asyncHandler(analyticsController.getTrainersRating));

// Статистика ОФП
router.get('/ofp', asyncHandler(analyticsController.getOFPStatistics));

// Детальная аналитика по периоду
router.get('/detailed', asyncHandler(analyticsController.getDetailedAnalytics));

export default router;
