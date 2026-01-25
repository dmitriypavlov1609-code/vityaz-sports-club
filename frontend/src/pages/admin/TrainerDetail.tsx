import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { User, Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, User as UserIcon, Mail, Phone, Award, Briefcase, Users, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/date';

const TrainerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTrainerData(id);
    }
  }, [id]);

  const loadTrainerData = async (trainerId: string) => {
    try {
      setIsLoading(true);
      const [usersData, assignmentsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getAssignments(),
      ]);

      const trainerUser = usersData.find((u) => u.id === trainerId);
      if (!trainerUser || trainerUser.role !== 'TRAINER') {
        toast.error('Тренер не найден');
        navigate('/admin/assignments');
        return;
      }

      setTrainer(trainerUser);

      // Фильтруем детей, закрепленных за этим тренером
      const trainerChildren = assignmentsData.filter(
        (child) => child.trainerId === trainerUser.trainer?.id
      );
      setChildren(trainerChildren);
    } catch (error) {
      console.error('Error loading trainer:', error);
      toast.error('Ошибка загрузки данных тренера');
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
            <div className="h-64 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Хедер */}
        <div className="mb-8">
          <Button variant="secondary" onClick={() => navigate('/admin/assignments')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к распределению
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-vityaz-red/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-vityaz-red" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {trainer.firstName} {trainer.lastName}
                </h1>
                <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                  Тренер
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Контактная информация */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Контактная информация
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-vityaz-gray-500" />
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Email</p>
                  <p className="font-medium text-vityaz-gray-900 dark:text-white">{trainer.email}</p>
                </div>
              </div>
              {trainer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-vityaz-gray-500" />
                  <div>
                    <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Телефон</p>
                    <p className="font-medium text-vityaz-gray-900 dark:text-white">{trainer.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Профессиональная информация */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Профессиональная информация
            </h3>
            <div className="space-y-3">
              {trainer.trainer?.specialization && (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-vityaz-gray-500" />
                  <div>
                    <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Специализация</p>
                    <p className="font-medium text-vityaz-gray-900 dark:text-white">
                      {trainer.trainer.specialization}
                    </p>
                  </div>
                </div>
              )}
              {trainer.trainer?.experience && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-vityaz-gray-500" />
                  <div>
                    <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Опыт работы</p>
                    <p className="font-medium text-vityaz-gray-900 dark:text-white">
                      {trainer.trainer.experience} лет
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Статистика */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Статистика
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-vityaz-gray-500" />
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Закрепленных детей</p>
                  <p className="font-medium text-vityaz-gray-900 dark:text-white">{children.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-vityaz-gray-500" />
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Дата регистрации</p>
                  <p className="font-medium text-vityaz-gray-900 dark:text-white">
                    {formatDate(trainer.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Биография */}
        {trainer.trainer?.bio && (
          <Card className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              О тренере
            </h3>
            <p className="text-vityaz-gray-700 dark:text-vityaz-gray-300 whitespace-pre-wrap">
              {trainer.trainer.bio}
            </p>
          </Card>
        )}

        {/* Сертификаты */}
        {trainer.trainer?.certifications && (
          <Card className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Сертификаты и квалификация
            </h3>
            <p className="text-vityaz-gray-700 dark:text-vityaz-gray-300 whitespace-pre-wrap">
              {trainer.trainer.certifications}
            </p>
          </Card>
        )}

        {/* Закрепленные дети */}
        <Card>
          <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
            Закрепленные дети ({children.length})
          </h3>

          {children.length === 0 ? (
            <p className="text-center py-8 text-vityaz-gray-500">
              Нет закрепленных детей
            </p>
          ) : (
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
                      Родитель
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Баланс
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child) => {
                    const age = Math.floor(
                      (new Date().getTime() - new Date(child.dateOfBirth).getTime()) /
                        (1000 * 60 * 60 * 24 * 365)
                    );
                    return (
                      <tr
                        key={child.id}
                        className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:bg-vityaz-gray-50 dark:hover:bg-vityaz-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-vityaz-gray-900 dark:text-white">
                            {child.firstName} {child.lastName}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            {(child as any).parent
                              ? `${(child as any).parent.firstName} ${(child as any).parent.lastName}`
                              : '-'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                            {child.balance} тренировок
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/children/${child.id}`)}
                          >
                            Подробнее
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TrainerDetail;
