import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '@/services/admin';
import { User, Payment } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, User as UserIcon, Mail, Phone, Calendar, Users, Eye, DollarSign, CreditCard, Activity } from 'lucide-react';
import { formatDate, calculateAge } from '@/utils/date';

const ParentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parent, setParent] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadParentData(id);
    }
  }, [id]);

  const loadParentData = async (parentId: string) => {
    try {
      setIsLoading(true);
      const [users, paymentsData] = await Promise.all([
        adminService.getUsers(),
        adminService.getUserPayments(parentId),
      ]);

      const parentUser = users.find((u) => u.id === parentId && u.role === 'PARENT');

      if (!parentUser) {
        toast.error('Родитель не найден');
        navigate('/admin/parents');
        return;
      }

      setParent(parentUser);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading parent:', error);
      toast.error('Ошибка загрузки данных родителя');
      navigate('/admin/parents');
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

  if (!parent) {
    return null;
  }

  const totalBalance = parent.children?.reduce((sum, child) => sum + child.balance, 0) || 0;
  const completedPayments = payments.filter((p) => p.status === 'COMPLETED');
  const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalSessionsPurchased = completedPayments.reduce((sum, p) => sum + p.sessionsCount, 0);

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Хедер */}
        <div className="mb-8">
          <Button variant="secondary" onClick={() => navigate('/admin/parents')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку родителей
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {parent.firstName} {parent.lastName}
                </h1>
                <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                  Родитель
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Финансовая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Баланс тренировок */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Баланс тренировок
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {totalBalance}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Всего потрачено */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Всего потрачено
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {totalSpent.toLocaleString()} ₽
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Куплено тренировок */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Куплено тренировок
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {totalSessionsPurchased}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          {/* Количество платежей */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                  Платежей
                </p>
                <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                  {completedPayments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
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
                  <p className="font-medium text-vityaz-gray-900 dark:text-white">{parent.email}</p>
                </div>
              </div>
              {parent.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-vityaz-gray-500" />
                  <div>
                    <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Телефон</p>
                    <p className="font-medium text-vityaz-gray-900 dark:text-white">{parent.phone}</p>
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
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Детей</p>
                  <p className="font-medium text-vityaz-gray-900 dark:text-white">
                    {parent.children?.length || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-vityaz-gray-500" />
                <div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Дата регистрации
                  </p>
                  <p className="font-medium text-vityaz-gray-900 dark:text-white">
                    {formatDate(parent.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Настройки уведомлений */}
          <Card>
            <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
              Настройки уведомлений
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                  Email уведомления
                </span>
                <span
                  className={`text-sm font-semibold ${
                    parent.emailNotifications ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {parent.emailNotifications ? 'Включены' : 'Выключены'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                  Push уведомления
                </span>
                <span
                  className={`text-sm font-semibold ${
                    parent.pushNotifications ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {parent.pushNotifications ? 'Включены' : 'Выключены'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Дети */}
        <Card>
          <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
            Дети ({parent.children?.length || 0})
          </h3>

          {!parent.children || parent.children.length === 0 ? (
            <p className="text-center py-8 text-vityaz-gray-500">
              У родителя пока нет детей в системе
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
                      Тренер
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
                  {parent.children.map((child) => {
                    const age = calculateAge(child.dateOfBirth);
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
                            {child.trainer
                              ? `${child.trainer.user?.firstName} ${child.trainer.user?.lastName}`
                              : 'Не назначен'}
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
                            <Eye className="w-4 h-4 mr-1" />
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

        {/* История платежей */}
        <Card className="mt-8">
          <h3 className="text-lg font-bold mb-4 text-vityaz-gray-900 dark:text-white">
            История платежей ({payments.length})
          </h3>

          {payments.length === 0 ? (
            <p className="text-center py-8 text-vityaz-gray-500">
              У родителя пока нет платежей
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Дата
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Пакет
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Тренировок
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Сумма
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Способ оплаты
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-vityaz-gray-700 dark:text-vityaz-gray-300">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:bg-vityaz-gray-50 dark:hover:bg-vityaz-gray-800/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                          <Calendar className="w-4 h-4 text-vityaz-gray-400" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-medium text-vityaz-gray-900 dark:text-white">
                          {payment.packageName || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-vityaz-gray-400" />
                          <span className="text-sm font-semibold text-vityaz-gray-900 dark:text-white">
                            {payment.sessionsCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-vityaz-gray-400" />
                          <span className="text-sm font-bold text-vityaz-gray-900 dark:text-white">
                            {payment.amount.toLocaleString()} ₽
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                          {payment.paymentMethod === 'ukassa' ? 'ЮKassa' : payment.paymentMethod || '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : payment.status === 'FAILED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}
                        >
                          {payment.status === 'COMPLETED'
                            ? 'Оплачен'
                            : payment.status === 'PENDING'
                            ? 'Ожидает'
                            : payment.status === 'FAILED'
                            ? 'Ошибка'
                            : payment.status === 'REFUNDED'
                            ? 'Возврат'
                            : payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ParentDetail;
