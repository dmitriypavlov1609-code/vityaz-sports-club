import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentsService } from '@/services/payments';
import { Payment } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!paymentId) {
      setError('ID платежа не найден');
      setIsLoading(false);
      return;
    }

    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    if (!paymentId) return;

    try {
      setIsLoading(true);
      const data = await paymentsService.getPaymentById(paymentId);
      setPayment(data);
    } catch (error) {
      console.error('Error loading payment:', error);
      setError('Ошибка загрузки информации о платеже');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 flex items-center justify-center p-6">
        <Card>
          <div className="text-center py-12">
            <Loader className="w-12 h-12 mx-auto text-vityaz-red animate-spin mb-4" />
            <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
              Проверяем статус платежа...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 flex items-center justify-center p-6">
        <Card>
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
              Ошибка
            </h2>
            <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-6">
              {error || 'Платеж не найден'}
            </p>
            <Button variant="primary" onClick={() => navigate('/parent/dashboard')}>
              Вернуться на главную
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isCompleted = payment.status === 'COMPLETED';
  const isPending = payment.status === 'PENDING';

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 flex items-center justify-center p-6">
      <Card>
        <div className="text-center py-12 max-w-md mx-auto">
          {isCompleted ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
                Оплата успешна!
              </h2>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-6">
                Баланс тренировок пополнен на <strong>{payment.sessionsCount}</strong>{' '}
                {payment.sessionsCount === 1
                  ? 'тренировку'
                  : payment.sessionsCount < 5
                  ? 'тренировки'
                  : 'тренировок'}
              </p>
            </>
          ) : isPending ? (
            <>
              <Loader className="w-16 h-16 mx-auto text-yellow-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
                Обработка платежа
              </h2>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-6">
                Платеж в процессе обработки. Это может занять несколько минут.
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
                Платеж отклонен
              </h2>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-6">
                Платеж не был завершен. Попробуйте еще раз или свяжитесь с поддержкой.
              </p>
            </>
          )}

          {/* Детали платежа */}
          <div className="bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                Сумма:
              </span>
              <span className="text-sm font-semibold text-vityaz-gray-900 dark:text-white">
                {payment.amount} {payment.currency}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                Тренировок:
              </span>
              <span className="text-sm font-semibold text-vityaz-gray-900 dark:text-white">
                {payment.sessionsCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                Дата:
              </span>
              <span className="text-sm font-semibold text-vityaz-gray-900 dark:text-white">
                {new Date(payment.createdAt).toLocaleString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/parent/dashboard')}>
              На главную
            </Button>
            {isPending && (
              <Button variant="primary" onClick={loadPayment}>
                Обновить статус
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
