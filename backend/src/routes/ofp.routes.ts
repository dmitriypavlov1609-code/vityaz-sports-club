import { Router } from 'express';
import { OFPController } from '../controllers/ofp.controller';
import { authenticate, trainerOnly, trainerOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createOFPResultSchema } from '../utils/validation.schemas';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticate);

// Получить нормативы (доступно всем)
router.get('/standards', OFPController.getOFPStandards);

// Сравнить с нормативами
router.get('/compare/:childId', OFPController.compareWithStandards);

// Получить динамику прогресса
router.get('/progress/:childId/:field', OFPController.getProgressData);

// Получить результаты ОФП ребенка
router.get('/child/:childId', OFPController.getChildOFPResults);

// Получить результат по ID
router.get('/:id', OFPController.getOFPResultById);

// Создать результат ОФП (только тренер)
router.post('/', trainerOnly, validate(createOFPResultSchema), OFPController.createOFPResult);

// Обновить результат ОФП (только тренер)
router.put('/:id', trainerOnly, OFPController.updateOFPResult);

// Удалить результат ОФП (только тренер и админ)
router.delete('/:id', trainerOrAdmin, OFPController.deleteOFPResult);

export default router;
