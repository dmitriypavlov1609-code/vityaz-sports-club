import { create } from 'zustand';
import { User, LoginForm, RegisterForm } from '@/types';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Действия
  login: (data: LoginForm) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getStoredUser(),
  isLoading: false,
  isAuthenticated: authService.isAuthenticated(),

  // Вход
  login: async (data: LoginForm) => {
    try {
      set({ isLoading: true });
      const authData = await authService.login(data);
      set({
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Добро пожаловать!');
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Регистрация
  register: async (data: RegisterForm) => {
    try {
      set({ isLoading: true });
      const authData = await authService.register(data);
      set({
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Регистрация успешна!');
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Выход
  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      toast.success('Вы вышли из системы');
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Получение текущего пользователя
  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  // Установка пользователя
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
