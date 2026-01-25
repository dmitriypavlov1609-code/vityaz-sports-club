import { create } from 'zustand';
import { Child, CreateChildForm } from '@/types';
import { childrenService } from '@/services/children';
import toast from 'react-hot-toast';

interface ChildrenState {
  children: Child[];
  selectedChild: Child | null;
  isLoading: boolean;

  // Действия
  fetchChildren: () => Promise<void>;
  fetchChildById: (id: string) => Promise<void>;
  createChild: (data: CreateChildForm) => Promise<Child>;
  updateChild: (id: string, data: Partial<CreateChildForm>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  uploadPhoto: (id: string, file: File) => Promise<void>;
  selectChild: (child: Child | null) => void;
}

export const useChildrenStore = create<ChildrenState>((set, get) => ({
  children: [],
  selectedChild: null,
  isLoading: false,

  // Получить всех детей
  fetchChildren: async () => {
    try {
      set({ isLoading: true });
      const children = await childrenService.getChildren();
      set({ children, isLoading: false });

      // Автоматически выбрать первого ребенка, если есть
      if (children.length > 0 && !get().selectedChild) {
        set({ selectedChild: children[0] });
      }
    } catch (error: any) {
      set({ isLoading: false });
      toast.error('Ошибка загрузки списка детей');
      throw error;
    }
  },

  // Получить ребенка по ID
  fetchChildById: async (id: string) => {
    try {
      set({ isLoading: true });
      const child = await childrenService.getChildById(id);
      set({ selectedChild: child, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Создать ребенка
  createChild: async (data: CreateChildForm) => {
    try {
      set({ isLoading: true });
      const newChild = await childrenService.createChild(data);
      set((state) => ({
        children: [...state.children, newChild],
        selectedChild: newChild,
        isLoading: false,
      }));
      toast.success('Ребенок успешно добавлен');
      return newChild;
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Обновить ребенка
  updateChild: async (id: string, data: Partial<CreateChildForm>) => {
    try {
      set({ isLoading: true });
      const updatedChild = await childrenService.updateChild(id, data);
      set((state) => ({
        children: state.children.map((c) => (c.id === id ? updatedChild : c)),
        selectedChild: state.selectedChild?.id === id ? updatedChild : state.selectedChild,
        isLoading: false,
      }));
      toast.success('Данные ребенка обновлены');
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Удалить ребенка
  deleteChild: async (id: string) => {
    try {
      set({ isLoading: true });
      await childrenService.deleteChild(id);
      set((state) => ({
        children: state.children.filter((c) => c.id !== id),
        selectedChild: state.selectedChild?.id === id ? null : state.selectedChild,
        isLoading: false,
      }));
      toast.success('Ребенок удален');
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Загрузить фото
  uploadPhoto: async (id: string, file: File) => {
    try {
      set({ isLoading: true });
      const photoUrl = await childrenService.uploadPhoto(id, file);

      set((state) => ({
        children: state.children.map((c) => (c.id === id ? { ...c, photo: photoUrl } : c)),
        selectedChild:
          state.selectedChild?.id === id
            ? { ...state.selectedChild, photo: photoUrl }
            : state.selectedChild,
        isLoading: false,
      }));

      toast.success('Фото загружено');
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Выбрать ребенка
  selectChild: (child: Child | null) => {
    set({ selectedChild: child });
  },
}));
