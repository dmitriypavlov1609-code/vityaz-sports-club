import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { User } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AddTrainerModal from '@/components/admin/AddTrainerModal';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Award,
  Briefcase,
  Eye,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { formatDate } from '@/utils/date';

const TrainersList = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadTrainers();
  }, []);

  const loadTrainers = async () => {
    try {
      setIsLoading(true);
      const users = await adminService.getUsers();
      const trainerUsers = users.filter((u) => u.role === 'TRAINER');
      setTrainers(trainerUsers);
    } catch (error) {
      console.error('Error loading trainers:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (trainerId: string) => {
    if (
      !confirm(
        'Вы уверены, что хотите удалить этого тренера? Все закрепленные за ним дети будут откреплены.'
      )
    ) {
      return;
    }

    try {
      await adminService.deleteUser(trainerId);
      toast.success('Тренер удален');
      await loadTrainers();
    } catch (error: any) {
      console.error('Error deleting trainer:', error);
      toast.error(error.response?.data?.message || 'Ошибка удаления тренера');
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
                Все тренеры
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Управление тренерами и их специализациями
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить тренера
              </Button>
              <div className="text-right">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Всего тренеров
                </p>
                <p className="text-4xl font-bold text-vityaz-gray-900 dark:text-white">
                  {trainers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица тренеров */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    ФИО
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Специализация
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Опыт
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Контакты
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
                {trainers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-vityaz-gray-500">
                      Нет тренеров в системе
                    </td>
                  </tr>
                ) : (
                  trainers.map((trainer) => (
                    <tr
                      key={trainer.id}
                      className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:bg-vityaz-gray-50 dark:hover:bg-vityaz-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-vityaz-gray-900 dark:text-white">
                              {trainer.firstName} {trainer.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                          <Award className="w-4 h-4 text-vityaz-gray-400" />
                          {trainer.trainer?.specialization || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                          <Briefcase className="w-4 h-4 text-vityaz-gray-400" />
                          {trainer.trainer?.experience ? `${trainer.trainer.experience} лет` : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            <Mail className="w-3 h-3 text-vityaz-gray-400" />
                            {trainer.email}
                          </div>
                          {trainer.phone && (
                            <div className="flex items-center gap-2 text-xs text-vityaz-gray-700 dark:text-vityaz-gray-300">
                              <Phone className="w-3 h-3 text-vityaz-gray-400" />
                              {trainer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                          {formatDate(trainer.createdAt)}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Подробнее
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(trainer.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Модальное окно добавления тренера */}
        <AddTrainerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadTrainers}
        />
      </div>
    </div>
  );
};

export default TrainersList;
