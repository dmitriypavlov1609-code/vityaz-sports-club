import api from './api';
import { APIResponse } from '@/types';

export interface DashboardKPI {
  users: {
    totalParents: number;
    totalTrainers: number;
    totalChildren: number;
    activeChildren: number;
    newParentsThisMonth: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    change: number;
    paymentsCount: number;
  };
  attendance: {
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
}

export interface RevenueAnalytics {
  months: Array<{
    month: string;
    revenue: number;
    payments: number;
  }>;
  summary: {
    totalRevenue: number;
    totalPayments: number;
    averageCheck: number;
  };
}

export interface AttendanceStats {
  daily: Array<{
    date: string;
    attended: number;
    total: number;
    rate: number;
  }>;
  summary: {
    totalSessions: number;
    attendedSessions: number;
    missedSessions: number;
    attendanceRate: number;
  };
}

export interface TrainerRating {
  trainerId: string;
  trainerName: string;
  specialization?: string;
  experience?: number;
  studentsCount: number;
  attendedSessions: number;
  ofpTestsCount: number;
}

export interface OFPStatistics {
  totalTests: number;
  byGender: {
    male: number;
    female: number;
  };
  averages: Record<string, number>;
  testsPerMonth: number;
}

export const analyticsService = {
  // Dashboard KPI
  async getDashboardKPI(): Promise<DashboardKPI> {
    const response = await api.get<APIResponse<DashboardKPI>>('/analytics/dashboard');
    return response.data.data!;
  },

  // Финансовая аналитика
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    const response = await api.get<APIResponse<RevenueAnalytics>>('/analytics/revenue');
    return response.data.data!;
  },

  // Статистика посещаемости
  async getAttendanceStats(): Promise<AttendanceStats> {
    const response = await api.get<APIResponse<AttendanceStats>>('/analytics/attendance');
    return response.data.data!;
  },

  // Рейтинг тренеров
  async getTrainersRating(): Promise<TrainerRating[]> {
    const response = await api.get<APIResponse<TrainerRating[]>>('/analytics/trainers');
    return response.data.data || [];
  },

  // Статистика ОФП
  async getOFPStatistics(): Promise<OFPStatistics> {
    const response = await api.get<APIResponse<OFPStatistics>>('/analytics/ofp');
    return response.data.data!;
  },

  // Детальная аналитика
  async getDetailedAnalytics(startDate: string, endDate: string): Promise<any> {
    const response = await api.get('/analytics/detailed', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};
