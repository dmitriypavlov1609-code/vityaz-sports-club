import api from './api';
import { OFPResult, OFPStandard, CreateOFPResultForm, APIResponse } from '@/types';

export const ofpService = {
  // Получить результаты ОФП ребенка
  async getChildOFPResults(childId: string): Promise<OFPResult[]> {
    const response = await api.get<APIResponse<OFPResult[]>>(`/ofp/child/${childId}`);
    return response.data.data || [];
  },

  // Получить результат по ID
  async getOFPResultById(id: string): Promise<OFPResult> {
    const response = await api.get<APIResponse<OFPResult>>(`/ofp/${id}`);
    return response.data.data!;
  },

  // Создать результат ОФП
  async createOFPResult(data: CreateOFPResultForm): Promise<OFPResult> {
    const response = await api.post<APIResponse<OFPResult>>('/ofp', data);
    return response.data.data!;
  },

  // Обновить результат ОФП
  async updateOFPResult(id: string, data: Partial<CreateOFPResultForm>): Promise<OFPResult> {
    const response = await api.put<APIResponse<OFPResult>>(`/ofp/${id}`, data);
    return response.data.data!;
  },

  // Удалить результат ОФП
  async deleteOFPResult(id: string): Promise<void> {
    await api.delete(`/ofp/${id}`);
  },

  // Получить нормативы
  async getOFPStandards(): Promise<OFPStandard[]> {
    const response = await api.get<APIResponse<OFPStandard[]>>('/ofp/standards');
    return response.data.data || [];
  },

  // Сравнить с нормативами
  async compareWithStandards(childId: string, resultId?: string): Promise<any> {
    const params = resultId ? `?resultId=${resultId}` : '';
    const response = await api.get(`/ofp/compare/${childId}${params}`);
    return response.data.data;
  },

  // Получить динамику прогресса
  async getProgressData(
    childId: string,
    field: string
  ): Promise<Array<{ date: string; value: number }>> {
    const response = await api.get(`/ofp/progress/${childId}/${field}`);
    return response.data.data || [];
  },

  // Alias for getChildOFPResults (for consistency)
  async getChildResults(childId: string): Promise<OFPResult[]> {
    return this.getChildOFPResults(childId);
  },
};
