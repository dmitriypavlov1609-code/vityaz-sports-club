import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { User } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, User as UserIcon, Mail, Phone, Users, Calendar, Eye, Activity } from 'lucide-react';
import { formatDate } from '@/utils/date';

const ParentsList = () => {
  const navigate = useNavigate();
  const [parents, setParents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setIsLoading(true);
      const users = await adminService.getUsers();
      const parentUsers = users.filter((u) => u.role === 'PARENT');
      setParents(parentUsers);
    } catch (error) {
      console.error('Error loading parents:', error);
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
                Все родители
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Управление родителями и их детьми
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                Всего родителей
              </p>
              <p className="text-4xl font-bold text-vityaz-gray-900 dark:text-white">
                {parents.length}
              </p>
            </div>
          </div>
        </div>

        {/* Таблица родителей */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    ФИО
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Телефон
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Детей
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Баланс тренировок
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Дата регистрации
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-vityaz-gray-500">
                      Нет родителей в системе
                    </td>
                  </tr>
                ) : (
                  parents.map((parent) => {
                    const totalBalance = parent.children?.reduce((sum, child) => sum + child.balance, 0) || 0;
                    return (
                      <tr
                        key={parent.id}
                        className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:bg-vityaz-gray-50 dark:hover:bg-vityaz-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-vityaz-gray-900 dark:text-white">
                                {parent.firstName} {parent.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            <Mail className="w-4 h-4 text-vityaz-gray-400" />
                            {parent.email}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            <Phone className="w-4 h-4 text-vityaz-gray-400" />
                            {parent.phone || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-vityaz-gray-400" />
                            <span className="font-medium text-vityaz-gray-900 dark:text-white">
                              {parent.children?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-vityaz-gray-400" />
                            <span
                              className={`text-sm font-semibold ${
                                totalBalance > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {totalBalance} тренировок
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            <Calendar className="w-4 h-4 text-vityaz-gray-400" />
                            {formatDate(parent.createdAt)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/parents/${parent.id}`)}
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

export default ParentsList;
