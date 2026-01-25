import { Request, Response } from 'express';
import { ChildrenService } from '../services/children.service';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadImage } from '../config/cloudinary';

export class ChildrenController {
  // GET /api/children - Получить список детей
  static getChildren = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const children = await ChildrenService.getChildren(req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      data: children,
    });
  });

  // GET /api/children/:id - Получить ребенка по ID
  static getChildById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    const child = await ChildrenService.getChildById(id, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      data: child,
    });
  });

  // POST /api/children - Создать ребенка
  static createChild = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    console.log('Creating child with data:', req.body);

    // Валидация и подготовка данных
    const childData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      middleName: req.body.middleName,
      dateOfBirth: new Date(req.body.dateOfBirth),
      gender: req.body.gender,
      parentId: req.user.userId, // Берем из токена
      weight: req.body.weight ? parseFloat(req.body.weight) : undefined,
      emergencyContact: req.body.emergencyContact,
      medicalNotes: req.body.medicalNotes,
    };

    console.log('Processed child data:', childData);

    const child = await ChildrenService.createChild(childData);

    res.status(201).json({
      success: true,
      message: 'Ребенок успешно добавлен',
      data: child,
    });
  });

  // PUT /api/children/:id - Обновить ребенка
  static updateChild = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    const updateData = { ...req.body };

    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const child = await ChildrenService.updateChild(
      id,
      req.user.userId,
      req.user.role,
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Данные ребенка обновлены',
      data: child,
    });
  });

  // DELETE /api/children/:id - Удалить ребенка
  static deleteChild = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    const id = req.params.id as string;
    await ChildrenService.deleteChild(id, req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Ребенок успешно удален',
    });
  });

  // POST /api/children/:id/photo - Загрузить фото
  static uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не аутентифицирован',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Файл не предоставлен',
        code: 'NO_FILE',
      });
    }

    const id = req.params.id as string;

    // Загрузка в Cloudinary
    const photoUrl = await uploadImage(req.file.buffer, 'vityaz-club/children');

    // Обновление URL в БД
    const child = await ChildrenService.updatePhoto(
      id,
      req.user.userId,
      req.user.role,
      photoUrl
    );

    res.status(200).json({
      success: true,
      message: 'Фото успешно загружено',
      data: {
        id: child.id,
        photo: child.photo,
      },
    });
  });

  // GET /api/children/:id/stats - Получить статистику ребенка
  static getChildStats = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const stats = await ChildrenService.getChildStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}
