import { Router } from 'express';
import { SessionsController } from '../controllers/sessions.controller';
import { authenticate, trainerOnly, trainerOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createSessionSchema, markAttendanceSchema } from '../utils/validation.schemas';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticate);

// Получить статистику тренера
router.get('/stats', trainerOnly, SessionsController.getTrainerStats);

// Получить тренировки на сегодня
router.get('/today', trainerOnly, SessionsController.getTodaySessions);

// Получить список тренировок
router.get('/', SessionsController.getSessions);

// Получить тренировку по ID
router.get('/:id', SessionsController.getSessionById);

// Создать тренировку (только тренер)
router.post('/', trainerOnly, validate(createSessionSchema), SessionsController.createSession);

// Отметить посещение (только тренер)
router.put(
  '/:id/attendance',
  trainerOnly,
  validate(markAttendanceSchema),
  SessionsController.markAttendance
);

// Удалить тренировку (только тренер и админ)
router.delete('/:id', trainerOrAdmin, SessionsController.deleteSession);

export default router;
