import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ofpService } from '@/services/ofp';
import { formatDate } from '@/utils/date';
import { getOFPFieldName, getOFPUnit } from '@/utils/ofp';
import Card from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface OFPProgressChartProps {
  childId: string;
  field: string;
  title?: string;
}

const OFPProgressChart = ({ childId, field, title }: OFPProgressChartProps) => {
  const [data, setData] = useState<Array<{ date: string; value: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [childId, field]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const progressData = await ofpService.getProgressData(childId, field);
      setData(progressData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="h-64 skeleton rounded-lg" />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card title={title || getOFPFieldName(field)}>
        <div className="h-64 flex items-center justify-center">
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            Нет данных для отображения
          </p>
        </div>
      </Card>
    );
  }

  // Форматировать данные для графика
  const chartData = data.map((item) => ({
    date: formatDate(item.date, 'dd.MM.yy'),
    value: item.value,
  }));

  // Вычислить прогресс (разница между первым и последним значением)
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const difference = lastValue - firstValue;

  // Для бега меньше = лучше, для остальных больше = лучше
  const isRunning = field.includes('run') || field === 'shuttleRun';
  const isImproved = isRunning ? difference < 0 : difference > 0;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
            {title || getOFPFieldName(field)}
          </h3>
          <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
            Динамика изменений
          </p>
        </div>

        {/* Индикатор прогресса */}
        {data.length >= 2 && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
            isImproved
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            <TrendingUp className={`w-4 h-4 ${!isImproved && 'rotate-180'}`} />
            <span className="text-sm font-semibold">
              {isRunning && '-'}{Math.abs(difference).toFixed(2)} {getOFPUnit(field)}
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-vityaz-gray-200 dark:stroke-vityaz-gray-700" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'currentColor' }}
            className="text-vityaz-gray-600 dark:text-vityaz-gray-400 text-xs"
          />
          <YAxis
            tick={{ fill: 'currentColor' }}
            className="text-vityaz-gray-600 dark:text-vityaz-gray-400 text-xs"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              border: '1px solid var(--tooltip-border)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'var(--tooltip-text)' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#DC2626"
            strokeWidth={2}
            name={getOFPUnit(field)}
            dot={{ fill: '#DC2626', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default OFPProgressChart;
