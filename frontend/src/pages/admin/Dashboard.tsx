import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { analyticsService, DashboardKPI } from '@/services/analytics';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  LogOut,
  Users,
  UserCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart,
  User,
  Settings
} from 'lucide-react';
import { cn } from '@/utils/cn';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKPI();
  }, []);

  const loadKPI = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getDashboardKPI();
      setKpi(data);
    } catch (error) {
      console.error('Error loading KPI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading || !kpi) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Хедер */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
              Панель администратора
            </h1>
            <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
              Добро пожаловать, {user?.firstName}!
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => navigate('/admin/assignments')}>
              <Settings className="w-4 h-4 mr-2" />
              Распределение детей
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        {/* KPI Карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Родители */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/parents')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Родителей
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.users.totalParents}
                </p>
                <p className="text-xs text-vityaz-gray-500 mt-1">
                  +{kpi.users.newParentsThisMonth} в этом месяце
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Тренеры */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/trainers')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Тренеров
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.users.totalTrainers}
                </p>
                <p className="text-xs text-vityaz-gray-500 mt-1">
                  Всего
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          {/* Дети */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/children')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Детей
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {kpi.users.totalChildren}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <UserCheck className="w-3 h-3 inline mr-1" />
                  {kpi.users.activeChildren} активных
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Выручка */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/revenue')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Выручка (месяц)
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
                    {kpi.revenue.change >= 0 ? '+' : ''}{kpi.revenue.change}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Две колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Посещаемость */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
                  Посещаемость
                </h3>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  За текущий месяц
                </p>
              </div>
              <BarChart className="w-5 h-5 text-vityaz-red" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-vityaz-gray-900 dark:text-white">
                    {kpi.attendance.thisMonth}
                  </span>
                  <span className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    тренировок
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {kpi.attendance.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      kpi.attendance.change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {kpi.attendance.change >= 0 ? '+' : ''}{kpi.attendance.change}% vs прошлый месяц
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Прошлый месяц: <strong>{kpi.attendance.lastMonth}</strong> тренировок
                </p>
              </div>
            </div>
          </Card>

          {/* Платежи */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
                  Платежи
                </h3>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  За текущий месяц
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-vityaz-red" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-vityaz-gray-900 dark:text-white">
                    {kpi.revenue.paymentsCount}
                  </span>
                  <span className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    платежей
                  </span>
                </div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  На сумму <strong>{kpi.revenue.thisMonth.toLocaleString()} ₽</strong>
                </p>
              </div>

              <div className="pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Прошлый месяц: <strong>{kpi.revenue.lastMonth.toLocaleString()} ₽</strong>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
