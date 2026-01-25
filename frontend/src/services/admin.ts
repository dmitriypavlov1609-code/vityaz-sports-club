import api from './api';
import { User, Child, Payment, APIResponse } from '@/types';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'PARENT' | 'TRAINER' | 'ADMIN';
  specialization?: string;
  experience?: number;
  bio?: string;
  certifications?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'PARENT' | 'TRAINER' | 'ADMIN';
  password?: string;
}

export const adminService = {
  // Получить всех пользователей
  async getUsers(): Promise<User[]> {
    const response = await api.get<APIResponse<User[]>>('/admin/users');
    return response.data.data || [];
  },

  // Создать пользователя
  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post<APIResponse<User>>('/admin/users', data);
    return response.data.data!;
  },

  // Обновить пользователя
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.put<APIResponse<User>>(`/admin/users/${id}`, data);
    return response.data.data!;
  },

  // Удалить пользователя
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  // Получить все закрепления
  async getAssignments(): Promise<Child[]> {
    const response = await api.get<APIResponse<Child[]>>('/admin/assignments');
    return response.data.data || [];
  },

  // Закрепить ребенка за тренером
  async assignChildToTrainer(childId: string, trainerId: string): Promise<Child> {
    const response = await api.post<APIResponse<Child>>('/admin/assignments', {
      childId,
      trainerId,
    });
    return response.data.data!;
  },

  // Открепить ребенка от тренера
  async unassignChildFromTrainer(childId: string): Promise<Child> {
    const response = await api.delete<APIResponse<Child>>(`/admin/assignments/${childId}`);
    return response.data.data!;
  },

  // Получить платежи пользователя
  async getUserPayments(userId: string): Promise<Payment[]> {
    const response = await api.get<APIResponse<Payment[]>>(`/admin/users/${userId}/payments`);
    return response.data.data || [];
  },
};
