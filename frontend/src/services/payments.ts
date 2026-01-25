import api from './api';
import { Payment, APIResponse } from '@/types';

export interface TariffPlan {
  id: string;
  name: string;
  description: string;
  sessionsCount: number;
  price: number;
  pricePerSession: number;
  popular?: boolean;
}

export interface CreatePaymentResponse {
  paymentId: string;
  confirmationUrl: string;
  amount: number;
  sessionsCount: number;
}

export const paymentsService = {
  // Получить тарифы
  async getTariffs(): Promise<TariffPlan[]> {
    const response = await api.get<APIResponse<TariffPlan[]>>('/payments/tariffs');
    return response.data.data || [];
  },

  // Создать платеж
  async createPayment(tariffId: string, childId: string): Promise<CreatePaymentResponse> {
    const response = await api.post<APIResponse<CreatePaymentResponse>>('/payments/create', {
      tariffId,
      childId,
    });
    return response.data.data!;
  },

  // Получить платеж по ID
  async getPaymentById(id: string): Promise<Payment> {
    const response = await api.get<APIResponse<Payment>>(`/payments/${id}`);
    return response.data.data!;
  },

  // Получить историю платежей
  async getUserPayments(): Promise<Payment[]> {
    const response = await api.get<APIResponse<Payment[]>>('/payments');
    return response.data.data || [];
  },
};
