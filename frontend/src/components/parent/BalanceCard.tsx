import { useState } from 'react';
import { Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PaymentModal from '@/components/parent/PaymentModal';
import { Ticket, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BalanceCardProps {
  child: Child;
  onBalanceUpdated?: () => void;
}

const BalanceCard = ({ child, onBalanceUpdated }: BalanceCardProps) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const balance = child.balance;
  const isLowBalance = balance <= 3;
  const isZeroBalance = balance === 0;

  const handlePaymentClose = () => {
    setIsPaymentModalOpen(false);
    if (onBalanceUpdated) onBalanceUpdated();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
          Баланс тренировок
        </h3>
        <Ticket className="w-5 h-5 text-vityaz-red" />
      </div>

      {/* Баланс */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-5xl font-bold',
              isZeroBalance
                ? 'text-red-600'
                : isLowBalance
                ? 'text-yellow-600'
                : 'text-green-600'
            )}
          >
            {balance}
          </span>
          <span className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            {balance === 1
              ? 'тренировка'
              : balance < 5
              ? 'тренировки'
              : 'тренировок'}
          </span>
        </div>
      </div>

      {/* Предупреждение */}
      {isLowBalance && (
        <div
          className={cn(
            'flex items-start gap-2 p-3 rounded-lg mb-4',
            isZeroBalance
              ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
              : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400'
          )}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            {isZeroBalance
              ? 'Баланс исчерпан. Необходимо пополнить для продолжения занятий.'
              : 'Баланс заканчивается. Рекомендуем пополнить заранее.'}
          </p>
        </div>
      )}

      {/* Кнопка пополнения */}
      <Button
        variant="primary"
        className="w-full"
        onClick={() => setIsPaymentModalOpen(true)}
      >
        Пополнить баланс
      </Button>

      {/* Дополнительная информация */}
      <div className="mt-4 pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
          1 тренировка списывается автоматически при отметке посещения тренером
        </p>
      </div>

      {/* Модальное окно оплаты */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentClose}
        child={child}
      />
    </Card>
  );
};

export default BalanceCard;
