import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { Child, User } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AddTrainerModal from '@/components/admin/AddTrainerModal';
import { ArrowLeft, UserPlus, UserMinus, Users, Trash2, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';

const Assignments = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAddTrainerModalOpen, setIsAddTrainerModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [assignmentsData, usersData] = await Promise.all([
        adminService.getAssignments(),
        adminService.getUsers(),
      ]);

      setChildren(assignmentsData);
      setTrainers(usersData.filter((u) => u.role === 'TRAINER'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (childId: string, trainerId: string) => {
    try {
      setProcessingId(childId);
      await adminService.assignChildToTrainer(childId, trainerId);
      toast.success('Тренер успешно назначен');
      await loadData();
    } catch (error: any) {
      console.error('Error assigning trainer:', error);
      toast.error(error.response?.data?.message || 'Ошибка назначения тренера');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnassign = async (childId: string) => {
    try {
      setProcessingId(childId);
      await adminService.unassignChildFromTrainer(childId);
      toast.success('Тренер откреплен');
      await loadData();
    } catch (error: any) {
      console.error('Error unassigning trainer:', error);
      toast.error(error.response?.data?.message || 'Ошибка откр епления тренера');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteTrainer = async (trainerId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого тренера? Все закрепленные за ним дети будут откреплены.')) {
      return;
    }

    try {
      await adminService.deleteUser(trainerId);
      toast.success('Тренер удален');
      await loadData();
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

  const unassignedChildren = children.filter((c) => !c.trainerId);
  const assignedChildren = children.filter((c) => c.trainerId);

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Хедер */}
        <div className="mb-8">
          <Button variant="secondary" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к дашборду
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                Распределение детей по тренерам
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Назначайте и управляйте закреплениями
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="primary" onClick={() => setIsAddTrainerModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить тренера
              </Button>
              <div className="text-right">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Всего детей
                </p>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {children.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Тренеров
                </p>
                <p className="text-2xl font-bold text-vityaz-red">
                  {trainers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Закреплено
                </p>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {assignedChildren.length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Без тренера
                </p>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {unassignedChildren.length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  На одного тренера
                </p>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {trainers.length > 0 ? Math.round(assignedChildren.length / trainers.length) : 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Таблица детей */}
        <Card>
          <h2 className="text-xl font-bold mb-6 text-vityaz-gray-900 dark:text-white">
            Все дети ({children.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Ребенок
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Родитель
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Текущий тренер
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Назначить тренера
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {children.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-vityaz-gray-500">
                      Нет детей в системе
                    </td>
                  </tr>
                ) : (
                  children.map((child) => (
                    <tr
                      key={child.id}
                      className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:bg-vityaz-gray-50 dark:hover:bg-vityaz-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-vityaz-gray-900 dark:text-white">
                            {child.firstName} {child.lastName}
                          </p>
                          <p className="text-sm text-vityaz-gray-500">
                            {new Date(child.dateOfBirth).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                          {(child as any).parent ? `${(child as any).parent.firstName} ${(child as any).parent.lastName}` : '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        {child.trainer ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-vityaz-red/10 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-vityaz-red" />
                            </div>
                            <div>
                              <p className="font-medium text-vityaz-gray-900 dark:text-white text-sm">
                                {(child.trainer as any).user?.firstName} {(child.trainer as any).user?.lastName}
                              </p>
                              {(child.trainer as any).specialization && (
                                <p className="text-xs text-vityaz-gray-500">
                                  {(child.trainer as any).specialization}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                            Не назначен
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          className="input text-sm"
                          value={child.trainerId || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(child.id, e.target.value);
                            }
                          }}
                          disabled={processingId === child.id}
                        >
                          <option value="">Выберите тренера...</option>
                          {trainers.map((trainer) => (
                            <option key={trainer.id} value={trainer.trainer?.id}>
                              {trainer.firstName} {trainer.lastName}
                              {trainer.trainer?.specialization && ` - ${trainer.trainer.specialization}`}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/children/${child.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Подробнее
                          </Button>
                          {child.trainerId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnassign(child.id)}
                              disabled={processingId === child.id}
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              Открепить
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Распределение по тренерам */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trainers.map((trainer) => {
            const trainerChildren = children.filter((c) => c.trainerId === trainer.trainer?.id);

            return (
              <Card key={trainer.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-vityaz-red/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-vityaz-red" />
                    </div>
                    <div>
                      <h3 className="font-bold text-vityaz-gray-900 dark:text-white">
                        {trainer.firstName} {trainer.lastName}
                      </h3>
                      {trainer.trainer?.specialization && (
                        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          {trainer.trainer.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                        {trainerChildren.length}
                      </p>
                      <p className="text-xs text-vityaz-gray-500">детей</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTrainer(trainer.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>

                {trainerChildren.length > 0 ? (
                  <div className="space-y-2">
                    {trainerChildren.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2 bg-vityaz-gray-50 dark:bg-vityaz-gray-800 rounded-lg"
                      >
                        <span className="text-sm text-vityaz-gray-900 dark:text-white">
                          {child.firstName} {child.lastName}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnassign(child.id)}
                          disabled={processingId === child.id}
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-vityaz-gray-500 text-center py-4">
                    Нет закрепленных детей
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* Модальное окно добавления тренера */}
        <AddTrainerModal
          isOpen={isAddTrainerModalOpen}
          onClose={() => setIsAddTrainerModalOpen(false)}
          onSuccess={loadData}
        />
      </div>
    </div>
  );
};

export default Assignments;
