import { Router } from 'express';
import multer from 'multer';
import { ChildrenController } from '../controllers/children.controller';
import { authenticate, parentOnly, trainerOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createChildSchema, updateChildSchema } from '../utils/validation.schemas';

const router = Router();

// Настройка multer для загрузки фото (в память)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Только изображения
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'));
    }
  },
});

// Все роуты требуют аутентификации
router.use(authenticate);

// Получить список детей (для родителя - своих, для тренера - закрепленных)
router.get('/', ChildrenController.getChildren);

// Получить ребенка по ID
router.get('/:id', ChildrenController.getChildById);

// Создать ребенка (только родитель)
router.post('/', parentOnly, validate(createChildSchema), ChildrenController.createChild);

// Обновить ребенка
router.put('/:id', validate(updateChildSchema), ChildrenController.updateChild);

// Удалить ребенка (только родитель и админ)
router.delete('/:id', ChildrenController.deleteChild);

// Загрузить фото ребенка
router.post('/:id/photo', upload.single('photo'), ChildrenController.uploadPhoto);

// Получить статистику ребенка
router.get('/:id/stats', ChildrenController.getChildStats);

export default router;
