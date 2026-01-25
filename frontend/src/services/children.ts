import api from './api';
import { Child, CreateChildForm, APIResponse } from '@/types';

export const childrenService = {
  // Получить список детей
  async getChildren(): Promise<Child[]> {
    const response = await api.get<APIResponse<Child[]>>('/children');
    return response.data.data || [];
  },

  // Получить ребенка по ID
  async getChildById(id: string): Promise<Child> {
    const response = await api.get<APIResponse<Child>>(`/children/${id}`);
    return response.data.data!;
  },

  // Создать ребенка
  async createChild(data: CreateChildForm): Promise<Child> {
    const response = await api.post<APIResponse<Child>>('/children', data);
    return response.data.data!;
  },

  // Обновить ребенка
  async updateChild(id: string, data: Partial<CreateChildForm>): Promise<Child> {
    const response = await api.put<APIResponse<Child>>(`/children/${id}`, data);
    return response.data.data!;
  },

  // Удалить ребенка
  async deleteChild(id: string): Promise<void> {
    await api.delete(`/children/${id}`);
  },

  // Загрузить фото
  async uploadPhoto(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<APIResponse<{ id: string; photo: string }>>(
      `/children/${id}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!.photo;
  },

  // Получить статистику ребенка
  async getChildStats(id: string): Promise<{
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
    ofpResultsCount: number;
    lastOFPTest: string | null;
  }> {
    const response = await api.get(`/children/${id}/stats`);
    return response.data.data;
  },
};
