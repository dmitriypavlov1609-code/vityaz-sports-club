import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { childrenService } from '@/services/children';
import { Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  User,
  Calendar,
  Weight,
  Users,
  Phone,
  AlertCircle,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { calculateAge, formatDate } from '@/utils/date';

const ChildDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadChildData(id);
    }
  }, [id]);

  const loadChildData = async (childId: string) => {
    try {
      setIsLoading(true);
      const [childData, statsData] = await Promise.all([
        childrenService.getChildById(childId),
        childrenService.getChildStats(childId),
      ]);

      setChild(childData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading child:', error);
      toast.error('Ошибка загрузки данных ребенка');
      navigate('/admin/assignments');
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

  if (!child) {
    return null;
  }

  const age = calculateAge(child.dateOfBirth);

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
              <div className="w-20 h-20 rounded-full overflow-hidden bg-vityaz-gray-200 dark:bg-vityaz-gray-700 flex items-center justify-center">
                {child.photo ? (
                  <img
                    src={child.photo}
                    alt={`${child.firstName} ${child.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-vityaz-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {child.firstName} {child.lastName}
                </h1>
                {child.middleName && (
                  <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                    {child.middleName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Возраст */}
          <Card>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-vityaz-red" />
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Возраст</p>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
                </p>
                <p className="text-xs text-vityaz-gray-500 mt-1">
                  {formatDate(child.dateOfBirth)}
                </p>
              </div>
            </div>
          </Card>

          {/* Вес */}
          {child.weight && (
            <Card>
              <div className="flex items-center gap-3">
                <Weight className="w-8 h-8 text-vityaz-red" />
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Вес</p>
                  <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                    {child.weight} кг
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Баланс */}
          <Card>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-vityaz-red" />
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Баланс</p>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {child.balance}
                </p>
                <p className="text-xs text-vityaz-gray-500">тренировок</p>
              </div>
            </div>
          </Card>

          {/* Посещаемость */}
          {stats && (
            <Card>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-vityaz-red" />
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Посещаемость</p>
                  <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                    {stats.attendanceRate}%
                  </p>
                  <p className="text-xs text-vityaz-gray-500">
                    {stats.attendedSessions} из {stats.totalSessions}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Родитель и тренер */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Родитель */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Родитель
            </h3>
            {child.parent && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-vityaz-gray-500" />
                  <div>
                    <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">ФИО</p>
                    <p className="font-medium text-vityaz-gray-900 dark:text-white">
                      {child.parent.firstName} {child.parent.lastName}
                    </p>
                  </div>
                </div>
                {child.parent.email && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-vityaz-gray-500" />
                    <div>
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Email</p>
                      <p className="font-medium text-vityaz-gray-900 dark:text-white">
                        {child.parent.email}
                      </p>
                    </div>
                  </div>
                )}
                {child.parent.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-vityaz-gray-500" />
                    <div>
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Телефон</p>
                      <p className="font-medium text-vityaz-gray-900 dark:text-white">
                        {child.parent.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Тренер */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Тренер
            </h3>
            {child.trainer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-vityaz-gray-500" />
                  <div>
                    <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">ФИО</p>
                    <p className="font-medium text-vityaz-gray-900 dark:text-white">
                      {child.trainer.user.firstName} {child.trainer.user.lastName}
                    </p>
                  </div>
                </div>
                {child.trainer.specialization && (
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-vityaz-gray-500" />
                    <div>
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        Специализация
                      </p>
                      <p className="font-medium text-vityaz-gray-900 dark:text-white">
                        {child.trainer.specialization}
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/trainers/${child.trainer?.user.id}`)}
                  className="mt-2"
                >
                  Подробнее о тренере
                </Button>
              </div>
            ) : (
              <p className="text-vityaz-gray-500 py-4">Тренер не назначен</p>
            )}
          </Card>
        </div>

        {/* Контакты и медицинская информация */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Контакт для экстренных случаев */}
          {child.emergencyContact && (
            <Card>
              <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
                Контакт для экстренных случаев
              </h3>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-vityaz-red" />
                <p className="font-medium text-vityaz-gray-900 dark:text-white">
                  {child.emergencyContact}
                </p>
              </div>
            </Card>
          )}

          {/* Медицинские особенности */}
          {child.medicalNotes && (
            <Card>
              <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Медицинские особенности
              </h3>
              <p className="text-vityaz-gray-700 dark:text-vityaz-gray-300 whitespace-pre-wrap">
                {child.medicalNotes}
              </p>
            </Card>
          )}
        </div>

        {/* История посещений */}
        {child.sessions && child.sessions.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              История посещений ({child.sessions.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Дата
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Тренер
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Посещение
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Комментарий
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {child.sessions.slice(0, 10).map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700"
                    >
                      <td className="py-3 px-4 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                        {formatDate(session.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                        {session.trainer
                          ? `${session.trainer.user.firstName} ${session.trainer.user.lastName}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            session.attended
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {session.attended ? 'Присутствовал' : 'Отсутствовал'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                        {session.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChildDetail;
