import api from './api';
import { Session, APIResponse } from '@/types';

export const sessionsService = {
  // Получить список тренировок
  async getSessions(filters?: {
    childId?: string;
    trainerId?: string;
    startDate?: string;
    endDate?: string;
    attended?: boolean;
  }): Promise<Session[]> {
    const params = new URLSearchParams();

    if (filters?.childId) params.append('childId', filters.childId);
    if (filters?.trainerId) params.append('trainerId', filters.trainerId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.attended !== undefined) params.append('attended', String(filters.attended));

    const response = await api.get<APIResponse<Session[]>>(
      `/sessions?${params.toString()}`
    );
    return response.data.data || [];
  },

  // Получить тренировку по ID
  async getSessionById(id: string): Promise<Session> {
    const response = await api.get<APIResponse<Session>>(`/sessions/${id}`);
    return response.data.data!;
  },

  // Создать тренировку
  async createSession(data: {
    childId: string;
    date: string;
    duration?: number;
    notes?: string;
  }): Promise<Session> {
    const response = await api.post<APIResponse<Session>>('/sessions', data);
    return response.data.data!;
  },

  // Отметить посещение
  async markAttendance(
    id: string,
    data: { attended: boolean; notes?: string }
  ): Promise<Session> {
    const response = await api.put<APIResponse<Session>>(`/sessions/${id}/attendance`, data);
    return response.data.data!;
  },

  // Удалить тренировку
  async deleteSession(id: string): Promise<void> {
    await api.delete(`/sessions/${id}`);
  },

  // Получить статистику тренера
  async getTrainerStats(): Promise<{
    totalSessions: number;
    totalChildren: number;
    todaySessions: number;
    upcomingSessions: number;
  }> {
    const response = await api.get('/sessions/stats');
    return response.data.data;
  },

  // Получить тренировки на сегодня
  async getTodaySessions(): Promise<Session[]> {
    const response = await api.get<APIResponse<Session[]>>('/sessions/today');
    return response.data.data || [];
  },

  // Получить все тренировки тренера (alias for getSessions without filters)
  async getAllSessions(): Promise<Session[]> {
    const response = await api.get<APIResponse<Session[]>>('/sessions');
    return response.data.data || [];
  },

  // Получить тренировки конкретного ребенка
  async getChildSessions(childId: string): Promise<Session[]> {
    const response = await api.get<APIResponse<Session[]>>(`/sessions?childId=${childId}`);
    return response.data.data || [];
  },
};
