import { useEffect, useState } from 'react';
import { OFPResult } from '@/types';
import { ofpService } from '@/services/ofp';
import { formatDate } from '@/utils/date';
import { getOFPFieldName, getOFPUnit } from '@/utils/ofp';
import Card from '@/components/ui/Card';
import { ClipboardList, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

interface OFPResultsTableProps {
  childId: string;
}

const OFPResultsTable = ({ childId }: OFPResultsTableProps) => {
  const [results, setResults] = useState<OFPResult[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [resultsData, comparisonData] = await Promise.all([
        ofpService.getChildOFPResults(childId),
        ofpService.compareWithStandards(childId),
      ]);
      setResults(resultsData);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Error loading OFP data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto text-vityaz-gray-400 mb-3" />
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            Результаты ОФП пока не внесены
          </p>
          <p className="text-sm text-vityaz-gray-500 mt-2">
            Тренер добавит результаты после тестирования
          </p>
        </div>
      </Card>
    );
  }

  const latestResult = results[0];

  // Получить уровень для показателя
  const getLevel = (field: string) => {
    if (!comparison?.comparison) return null;
    return comparison.comparison[field];
  };

  // Получить цвет по уровню
  const getLevelColor = (level: string | null) => {
    if (!level) return 'text-vityaz-gray-600';
    switch (level) {
      case 'excellent':
        return 'text-green-600';
      case 'norm':
        return 'text-yellow-600';
      case 'below':
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-vityaz-gray-600';
    }
  };

  // Получить иконку изменения
  const getChangeIcon = (currentValue: number | null, field: string) => {
    if (results.length < 2 || !currentValue) return <Minus className="w-4 h-4 text-vityaz-gray-400" />;

    const previousResult = results[1];
    const previousValue = (previousResult as any)[field];

    if (!previousValue) return <Minus className="w-4 h-4 text-vityaz-gray-400" />;

    // Для бега меньше = лучше
    const isRunning = field.includes('run') || field === 'shuttleRun';
    const isImproved = isRunning
      ? currentValue < previousValue
      : currentValue > previousValue;

    return isImproved ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : currentValue === previousValue ? (
      <Minus className="w-4 h-4 text-vityaz-gray-400" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  // Поля для отображения
  const fields = [
    { key: 'run30m', category: 'Беговые' },
    { key: 'run60m', category: 'Беговые' },
    { key: 'run100m', category: 'Беговые' },
    { key: 'shuttleRun', category: 'Беговые' },
    { key: 'pullUps', category: 'Силовые' },
    { key: 'pushUps', category: 'Силовые' },
    { key: 'press30s', category: 'Силовые' },
    { key: 'longJump', category: 'Прыжки' },
    { key: 'highJump', category: 'Прыжки' },
    { key: 'flexibility', category: 'Другое' },
    { key: 'ballThrow', category: 'Другое' },
  ];

  // Группировать по категориям
  const groupedFields = fields.reduce((acc: any, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field.key);
    return acc;
  }, {});

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
          Последнее тестирование
        </h3>
        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
          {formatDate(latestResult.testDate)} • Тренер:{' '}
          {latestResult.trainer?.user.firstName} {latestResult.trainer?.user.lastName}
        </p>
      </div>

      {/* Таблица результатов */}
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([category, fieldKeys]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300 mb-2">
              {category}
            </h4>
            <div className="space-y-2">
              {(fieldKeys as string[]).map((field) => {
                const value = (latestResult as any)[field];
                if (value === null || value === undefined) return null;

                const level = getLevel(field);

                return (
                  <div
                    key={field}
                    className="flex items-center justify-between p-3 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      {getChangeIcon(value, field)}
                      <span className="text-sm text-vityaz-gray-900 dark:text-white">
                        {getOFPFieldName(field)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('font-semibold', getLevelColor(level))}>
                        {value} {getOFPUnit(field)}
                      </span>
                      {level && (
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs rounded-full',
                            level === 'excellent' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                            level === 'norm' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                            (level === 'below' || level === 'poor') && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          )}
                        >
                          {level === 'excellent' && 'Отлично'}
                          {level === 'norm' && 'Норма'}
                          {(level === 'below' || level === 'poor') && 'Ниже нормы'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Комментарии */}
      {latestResult.notes && (
        <div className="mt-6 pt-6 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
          <p className="text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300 mb-2">
            Комментарии тренера:
          </p>
          <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
            {latestResult.notes}
          </p>
        </div>
      )}

      {/* История */}
      {results.length > 1 && (
        <div className="mt-6 pt-6 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
          <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
            Всего тестирований: <strong>{results.length}</strong>
          </p>
        </div>
      )}
    </Card>
  );
};

export default OFPResultsTable;
