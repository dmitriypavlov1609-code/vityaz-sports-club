import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { analyticsService, DashboardKPI } from '@/services/analytics';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard } from 'lucide-react';
import { cn } from '@/utils/cn';

const RevenueAnalytics = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getDashboardKPI();
      setKpi(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !kpi) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
            <div className="h-96 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Хедер */}
        <div className="mb-8">
          <Button variant="secondary" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к панели
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                Аналитика выручки
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Детальная информация о финансах клуба
              </p>
            </div>
          </div>
        </div>

        {/* KPI карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Выручка за месяц */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Текущий месяц
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.revenue.thisMonth.toLocaleString()} ₽
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {kpi.revenue.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      kpi.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {kpi.revenue.change >= 0 ? '+' : ''}
                    {kpi.revenue.change}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Прошлый месяц */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Прошлый месяц
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.revenue.lastMonth.toLocaleString()} ₽
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Количество платежей */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Платежей в месяц
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.revenue.paymentsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          {/* Средний чек */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Средний чек
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.revenue.paymentsCount > 0
                    ? Math.round(kpi.revenue.thisMonth / kpi.revenue.paymentsCount).toLocaleString()
                    : 0}{' '}
                  ₽
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Детальная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Динамика выручки */}
          <Card>
            <h3 className="text-lg font-bold mb-6 text-vityaz-gray-900 dark:text-white">
              Сравнение с прошлым месяцем
            </h3>

            <div className="space-y-6">
              {/* Выручка */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Текущий месяц
                  </span>
                  <span className="text-lg font-bold text-vityaz-gray-900 dark:text-white">
                    {kpi.revenue.thisMonth.toLocaleString()} ₽
                  </span>
                </div>
                <div className="w-full bg-vityaz-gray-200 dark:bg-vityaz-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        kpi.revenue.lastMonth > 0
                          ? Math.min((kpi.revenue.thisMonth / kpi.revenue.lastMonth) * 100, 100)
                          : 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Прошлый месяц
                  </span>
                  <span className="text-lg font-bold text-vityaz-gray-900 dark:text-white">
                    {kpi.revenue.lastMonth.toLocaleString()} ₽
                  </span>
                </div>
                <div className="w-full bg-vityaz-gray-200 dark:bg-vityaz-gray-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Разница */}
              <div className="pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Разница
                  </span>
                  <div className="flex items-center gap-2">
                    {kpi.revenue.change >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={cn(
                        'text-xl font-bold',
                        kpi.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {kpi.revenue.change >= 0 ? '+' : ''}
                      {(kpi.revenue.thisMonth - kpi.revenue.lastMonth).toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Статистика платежей */}
          <Card>
            <h3 className="text-lg font-bold mb-6 text-vityaz-gray-900 dark:text-white">
              Статистика платежей
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-vityaz-gray-50 dark:bg-vityaz-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Всего платежей
                  </p>
                  <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                    {kpi.revenue.paymentsCount}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-vityaz-red" />
              </div>

              <div className="flex items-center justify-between p-4 bg-vityaz-gray-50 dark:bg-vityaz-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Средний чек
                  </p>
                  <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                    {kpi.revenue.paymentsCount > 0
                      ? Math.round(
                          kpi.revenue.thisMonth / kpi.revenue.paymentsCount
                        ).toLocaleString()
                      : 0}{' '}
                    ₽
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-vityaz-red" />
              </div>

              <div className="flex items-center justify-between p-4 bg-vityaz-gray-50 dark:bg-vityaz-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Рост выручки
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      kpi.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {kpi.revenue.change >= 0 ? '+' : ''}
                    {kpi.revenue.change}%
                  </p>
                </div>
                {kpi.revenue.change >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
