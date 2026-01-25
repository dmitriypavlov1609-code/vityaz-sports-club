import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

export const adminController = {
  // Получить всех пользователей
  getUsers: async (req: Request, res: Response) => {
    const users = await adminService.getUsers();
    res.json({ success: true, data: users });
  },

  // Создать пользователя
  createUser: async (req: Request, res: Response) => {
    const user = await adminService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  },

  // Обновить пользователя
  updateUser: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await adminService.updateUser(id, req.body);
    res.json({ success: true, data: user });
  },

  // Удалить пользователя
  deleteUser: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await adminService.deleteUser(id);
    res.json({ success: true, data: result });
  },

  // Закрепить ребенка за тренером
  assignChildToTrainer: async (req: Request, res: Response) => {
    const { childId, trainerId } = req.body;
    const child = await adminService.assignChildToTrainer(childId, trainerId);
    res.json({ success: true, data: child });
  },

  // Открепить ребенка от тренера
  unassignChildFromTrainer: async (req: Request, res: Response) => {
    const childId = req.params.childId as string;
    const child = await adminService.unassignChildFromTrainer(childId);
    res.json({ success: true, data: child });
  },

  // Получить все закрепления
  getAssignments: async (req: Request, res: Response) => {
    const assignments = await adminService.getAssignments();
    res.json({ success: true, data: assignments });
  },

  // Получить платежи пользователя
  getUserPayments: async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const payments = await adminService.getUserPayments(userId);
    res.json({ success: true, data: payments });
  },
};
