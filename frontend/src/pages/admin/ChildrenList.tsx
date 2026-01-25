import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, User, Users, Activity, Weight, Eye, Calendar } from 'lucide-react';
import { calculateAge, formatDate } from '@/utils/date';

const ChildrenList = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAssignments();
      setChildren(data);
    } catch (error) {
      console.error('Error loading children:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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

  const activeChildren = children.filter((c) => c.balance > 0);

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
                Все дети
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Управление профилями детей
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Всего детей
                </p>
                <p className="text-4xl font-bold text-vityaz-gray-900 dark:text-white">
                  {children.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Активных
                </p>
                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {activeChildren.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица детей */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Ребенок
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Возраст
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Вес
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Родитель
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Тренер
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Баланс
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Дата создания
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {children.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-vityaz-gray-500">
                      Нет детей в системе
                    </td>
                  </tr>
                ) : (
                  children.map((child) => {
                    const age = calculateAge(child.dateOfBirth);
                    return (
                      <tr
                        key={child.id}
                        className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:bg-vityaz-gray-50 dark:hover:bg-vityaz-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-vityaz-gray-200 dark:bg-vityaz-gray-700 flex items-center justify-center">
                              {child.photo ? (
                                <img
                                  src={child.photo}
                                  alt={child.firstName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-vityaz-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-vityaz-gray-900 dark:text-white">
                                {child.firstName} {child.lastName}
                              </p>
                              <p className="text-xs text-vityaz-gray-500">
                                {child.gender === 'MALE' ? 'Мальчик' : 'Девочка'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            <Calendar className="w-4 h-4 text-vityaz-gray-400" />
                            {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            <Weight className="w-4 h-4 text-vityaz-gray-400" />
                            {child.weight ? `${child.weight} кг` : '-'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            {(child as any).parent
                              ? `${(child as any).parent.firstName} ${(child as any).parent.lastName}`
                              : '-'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {child.trainer ? (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-vityaz-red" />
                              <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                                {(child.trainer as any).user?.firstName}{' '}
                                {(child.trainer as any).user?.lastName}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-yellow-600 dark:text-yellow-400">
                              Не назначен
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-vityaz-gray-400" />
                            <span
                              className={`text-sm font-semibold ${
                                child.balance > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {child.balance}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            {formatDate(child.createdAt)}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/children/${child.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Подробнее
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChildrenList;
