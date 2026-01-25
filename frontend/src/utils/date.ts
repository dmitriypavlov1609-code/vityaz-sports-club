import { format, parseISO, differenceInYears } from 'date-fns';
import { ru } from 'date-fns/locale';

// Форматирование даты
export const formatDate = (date: string | Date, formatStr: string = 'dd.MM.yyyy'): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr, { locale: ru });
  } catch (error) {
    return '';
  }
};

// Форматирование даты и времени
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

// Вычисление возраста
export const calculateAge = (dateOfBirth: string | Date): number => {
  try {
    const birthDate = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
    return differenceInYears(new Date(), birthDate);
  } catch (error) {
    return 0;
  }
};

// Относительное время (например, "2 дня назад")
export const getRelativeTime = (date: string | Date): string => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'только что';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} мин назад`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ч назад`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} дн назад`;
    }

    return formatDate(parsedDate);
  } catch (error) {
    return '';
  }
};
