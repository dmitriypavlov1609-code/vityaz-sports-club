import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { createMockAdapter } from './mockApi';

const API_URL = (import.meta as any).env.VITE_API_URL || '';
const isDemoMode = !API_URL;

// Создание axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // В демо-режиме подменяем HTTP-адаптер на мок
  ...(isDemoMode ? { adapter: createMockAdapter() as any } : {}),
});

if (isDemoMode) {
  console.log('%c[DEMO] Мок-данные активны — бэкенд не подключён', 'color: #f59e0b; font-weight: bold');
}

// Request interceptor (добавление токена)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor (обработка ошибок) — только в реальном режиме
if (!isDemoMode) {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<any>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');

          if (refreshToken) {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      const errorMessage = error.response?.data?.error || 'Произошла ошибка';
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }

      return Promise.reject(error);
    }
  );
}

export default api;
