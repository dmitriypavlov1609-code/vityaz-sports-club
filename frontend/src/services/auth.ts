import api from './api';
import { User, LoginForm, RegisterForm, APIResponse } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Регистрация
  async register(data: RegisterForm): Promise<AuthResponse> {
    const response = await api.post<APIResponse<AuthResponse>>('/auth/register', data);
    const authData = response.data.data!;

    // Сохранение токенов
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));

    return authData;
  },

  // Вход
  async login(data: LoginForm): Promise<AuthResponse> {
    const response = await api.post<APIResponse<AuthResponse>>('/auth/login', data);
    const authData = response.data.data!;

    // Сохранение токенов
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));

    return authData;
  },

  // Выход
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Игнорируем ошибки при выходе
    }

    // Очистка localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Получение текущего пользователя
  async getCurrentUser(): Promise<User> {
    const response = await api.get<APIResponse<User>>('/auth/me');
    return response.data.data!;
  },

  // Обновление токена
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<APIResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  },

  // Проверка аутентификации
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  // Получение пользователя из localStorage
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
