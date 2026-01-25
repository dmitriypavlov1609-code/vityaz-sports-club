import { useEffect, useState } from 'react';
import { paymentsService } from '@/services/payments';
import { Payment } from '@/types';
import Card from '@/components/ui/Card';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

const PaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const data = await paymentsService.getUserPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-vityaz-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Оплачено';
      case 'PENDING':
        return 'В обработке';
      case 'FAILED':
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'FAILED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-vityaz-gray-100 dark:bg-vityaz-gray-800 text-vityaz-gray-700 dark:text-vityaz-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card title="История платежей">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card title="История платежей">
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 mx-auto text-vityaz-gray-400 mb-3" />
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            У вас пока нет платежей
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`История платежей (${payments.length})`}>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="p-4 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 hover:bg-vityaz-gray-100 dark:hover:bg-vityaz-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-vityaz-gray-900 dark:text-white">
                      {payment.amount} {payment.currency}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        getStatusColor(payment.status)
                      )}
                    >
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    {payment.sessionsCount}{' '}
                    {payment.sessionsCount === 1
                      ? 'тренировка'
                      : payment.sessionsCount < 5
                      ? 'тренировки'
                      : 'тренировок'}
                  </p>
                  <p className="text-xs text-vityaz-gray-500 dark:text-vityaz-gray-500 mt-1">
                    {new Date(payment.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PaymentHistory;
