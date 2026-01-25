import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

// Создание axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Response interceptor (обработка ошибок и обновление токена)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Обработка 401 (попытка обновить токен)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;

          // Сохранение нового токена
          localStorage.setItem('accessToken', accessToken);

          // Повтор оригинального запроса
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если обновление токена не удалось - выход
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Показ ошибок пользователю
    const errorMessage = error.response?.data?.error || 'Произошла ошибка';

    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;
