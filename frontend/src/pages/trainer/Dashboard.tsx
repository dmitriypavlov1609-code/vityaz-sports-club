import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { sessionsService } from '@/services/sessions';
import { childrenService } from '@/services/children';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { LogOut, Users, Activity, Calendar, TrendingUp } from 'lucide-react';

const TrainerDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalChildren: 0,
    todaySessions: 0,
    upcomingSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData] = await Promise.all([
        sessionsService.getTrainerStats(),
      ]);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
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
              Добро пожаловать, {user?.firstName}!
            </h1>
            <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
              Панель тренера
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>

        {/* Статистика - кликабельные карточки */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Ученики */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/trainer/students')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {stats.totalChildren}
                </p>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Учеников
                </p>
              </div>
            </div>
          </Card>

          {/* Всего тренировок */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/trainer/sessions')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Activity className="w-6 h-6 text-vityaz-red" />
              </div>
              <div>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {stats.totalSessions}
                </p>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Всего тренировок
                </p>
              </div>
            </div>
          </Card>

          {/* Сегодня */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/trainer/sessions/today')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {stats.todaySessions}
                </p>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Сегодня
                </p>
              </div>
            </div>
          </Card>

          {/* Предстоящих */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/trainer/sessions/upcoming')}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {stats.upcomingSessions}
                </p>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Предстоящих
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Краткий обзор */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Быстрые действия
            </h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => navigate('/trainer/sessions/today')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Отметить посещаемость сегодня
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => navigate('/trainer/students')}
              >
                <Users className="w-4 h-4 mr-2" />
                Просмотреть всех учеников
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Информация
            </h3>
            <div className="space-y-3 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
              <p>• Нажмите на карточки выше для детального просмотра</p>
              <p>• В разделе "Сегодня" вы можете отметить учеников и сделать фото группы</p>
              <p>• Ученики без оплаты отмечены специальной меткой</p>
              <p>• Все тренировки сохраняются в хронологии</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
