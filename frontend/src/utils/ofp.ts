import { Gender, OFPStandard } from '@/types';

// Определение уровня результата (ниже нормы / норма / отлично)
export type OFPLevel = 'below' | 'norm' | 'excellent';

interface EvaluationResult {
  level: OFPLevel;
  color: string;
  label: string;
}

// Оценка результата бега (меньше = лучше)
export const evaluateRunResult = (
  value: number | undefined,
  standard: OFPStandard,
  field: 'run30m' | 'run60m' | 'run100m' | 'shuttleRun'
): EvaluationResult | null => {
  if (!value) return null;

  const min = standard[`${field}_min` as keyof OFPStandard] as number | undefined;
  const norm = standard[`${field}_norm` as keyof OFPStandard] as number | undefined;
  const excel = standard[`${field}_excel` as keyof OFPStandard] as number | undefined;

  if (!min || !norm || !excel) return null;

  if (value <= excel) {
    return { level: 'excellent', color: 'text-green-600', label: 'Отлично' };
  } else if (value <= norm) {
    return { level: 'norm', color: 'text-yellow-600', label: 'Норма' };
  } else {
    return { level: 'below', color: 'text-red-600', label: 'Ниже нормы' };
  }
};

// Оценка силовых/прыжковых результатов (больше = лучше)
export const evaluateStrengthResult = (
  value: number | undefined,
  standard: OFPStandard,
  field: 'pullUps' | 'pushUps' | 'press30s' | 'longJump' | 'highJump' | 'flexibility' | 'ballThrow'
): EvaluationResult | null => {
  if (value === undefined) return null;

  const min = standard[`${field}_min` as keyof OFPStandard] as number | undefined;
  const norm = standard[`${field}_norm` as keyof OFPStandard] as number | undefined;
  const excel = standard[`${field}_excel` as keyof OFPStandard] as number | undefined;

  if (min === undefined || norm === undefined || excel === undefined) return null;

  if (value >= excel) {
    return { level: 'excellent', color: 'text-green-600', label: 'Отлично' };
  } else if (value >= norm) {
    return { level: 'norm', color: 'text-yellow-600', label: 'Норма' };
  } else {
    return { level: 'below', color: 'text-red-600', label: 'Ниже нормы' };
  }
};

// Цвет для графика по уровню
export const getLevelColor = (level: OFPLevel): string => {
  switch (level) {
    case 'excellent':
      return '#10b981'; // green-500
    case 'norm':
      return '#f59e0b'; // yellow-500
    case 'below':
      return '#ef4444'; // red-500
  }
};

// Получить название показателя по-русски
export const getOFPFieldName = (field: string): string => {
  const names: Record<string, string> = {
    run30m: 'Бег 30м',
    run60m: 'Бег 60м',
    run100m: 'Бег 100м',
    shuttleRun: 'Челночный бег',
    pullUps: 'Подтягивания',
    pushUps: 'Отжимания',
    press30s: 'Пресс 30с',
    longJump: 'Прыжок в длину',
    highJump: 'Прыжок в высоту',
    flexibility: 'Гибкость',
    ballThrow: 'Метание мяча',
  };
  return names[field] || field;
};

// Единицы измерения
export const getOFPUnit = (field: string): string => {
  const units: Record<string, string> = {
    run30m: 'сек',
    run60m: 'сек',
    run100m: 'сек',
    shuttleRun: 'сек',
    pullUps: 'раз',
    pushUps: 'раз',
    press30s: 'раз',
    longJump: 'см',
    highJump: 'см',
    flexibility: 'см',
    ballThrow: 'м',
  };
  return units[field] || '';
};
