import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useChildrenStore } from '@/store/children.store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ChildSelector from '@/components/parent/ChildSelector';
import ChildCard from '@/components/parent/ChildCard';
import BalanceCard from '@/components/parent/BalanceCard';
import AttendanceHistory from '@/components/parent/AttendanceHistory';
import AddChildModal from '@/components/parent/AddChildModal';
import OFPResultsTable from '@/components/parent/OFPResultsTable';
import OFPProgressChart from '@/components/parent/OFPProgressChart';
import PaymentHistory from '@/components/parent/PaymentHistory';
import { UserPlus, LogOut } from 'lucide-react';

const ParentDashboard = () => {
  const { user, logout } = useAuthStore();
  const { children, selectedChild, fetchChildren, selectChild } = useChildrenStore();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await fetchChildren();
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Skeleton loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
            <div className="h-64 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Нет детей - показываем приветственный экран
  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Хедер */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                Добро пожаловать, {user?.firstName}!
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Панель родителя
              </p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </Button>
          </div>

          {/* Приветственная карточка */}
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-vityaz-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-vityaz-red" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
                Добавьте вашего первого ребенка
              </h2>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-6 max-w-md mx-auto">
                Начните с добавления профиля ребенка. Вы сможете отслеживать посещения,
                результаты ОФП и управлять балансом тренировок.
              </p>
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить ребенка
              </Button>
            </div>
          </Card>

          <AddChildModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Хедер */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                Мои дети
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Управление профилями и отслеживание прогресса
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить ребенка
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>

          {/* Селектор детей */}
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={selectChild}
          />
        </div>

        {/* Контент для выбранного ребенка */}
        {selectedChild ? (
          <div className="space-y-6">
            {/* Карточка ребенка */}
            <ChildCard child={selectedChild} />

            {/* Три колонки */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Баланс */}
              <div className="lg:col-span-1">
                <BalanceCard child={selectedChild} onBalanceUpdated={loadData} />
              </div>

              {/* История посещений */}
              <div className="lg:col-span-2">
                <AttendanceHistory child={selectedChild} />
              </div>
            </div>

            {/* История платежей */}
            <PaymentHistory />

            {/* Результаты ОФП */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Таблица результатов */}
              <OFPResultsTable childId={selectedChild.id} />

              {/* Графики прогресса */}
              <div className="space-y-6">
                <OFPProgressChart childId={selectedChild.id} field="run30m" />
                <OFPProgressChart childId={selectedChild.id} field="pullUps" />
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                Выберите ребенка для просмотра информации
              </p>
            </div>
          </Card>
        )}

        <AddChildModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </div>
    </div>
  );
};

export default ParentDashboard;
