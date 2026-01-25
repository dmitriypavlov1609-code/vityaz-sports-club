import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { paymentsService, TariffPlan } from '@/services/payments';
import { Child } from '@/types';
import { CreditCard, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
}

const PaymentModal = ({ isOpen, onClose, child }: PaymentModalProps) => {
  const [tariffs, setTariffs] = useState<TariffPlan[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<TariffPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTariffs();
    }
  }, [isOpen]);

  const loadTariffs = async () => {
    try {
      setIsLoading(true);
      const data = await paymentsService.getTariffs();
      setTariffs(data);
      // Автоматически выбрать популярный тариф
      const popular = data.find((t) => t.popular);
      if (popular) setSelectedTariff(popular);
    } catch (error) {
      console.error('Error loading tariffs:', error);
      toast.error('Ошибка загрузки тарифов');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedTariff) {
      toast.error('Выберите тариф');
      return;
    }

    try {
      setIsProcessing(true);
      const payment = await paymentsService.createPayment(selectedTariff.id, child.id);

      // Перенаправить на страницу оплаты ЮKassa
      window.location.href = payment.confirmationUrl;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.response?.data?.message || 'Ошибка создания платежа');
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Пополнить баланс" size="xl">
      <div className="mb-4 p-3 bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 rounded-lg">
        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
          Пополнение для: <span className="font-semibold text-vityaz-gray-900 dark:text-white">
            {child.firstName} {child.lastName}
          </span>
        </p>
        <p className="text-xs text-vityaz-gray-500 dark:text-vityaz-gray-500 mt-1">
          Текущий баланс: <strong>{child.balance}</strong> {child.balance === 1 ? 'тренировка' : child.balance < 5 ? 'тренировки' : 'тренировок'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Тарифы */}
          <div className="space-y-3 mb-6">
            {tariffs.map((tariff) => {
              const isSelected = selectedTariff?.id === tariff.id;
              return (
                <button
                  key={tariff.id}
                  onClick={() => setSelectedTariff(tariff)}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 transition-all text-left relative',
                    isSelected
                      ? 'border-vityaz-red bg-red-50 dark:bg-red-900/20'
                      : 'border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:border-vityaz-gray-300 dark:hover:border-vityaz-gray-600'
                  )}
                >
                  {tariff.popular && (
                    <div className="absolute -top-2 right-4 px-2 py-0.5 bg-vityaz-red text-white text-xs font-semibold rounded-full">
                      Популярный
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-vityaz-gray-900 dark:text-white">
                          {tariff.name}
                        </h3>
                        {isSelected && <Check className="w-5 h-5 text-vityaz-red" />}
                      </div>
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-2">
                        {tariff.description}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-vityaz-gray-500 dark:text-vityaz-gray-500">
                          {tariff.sessionsCount} {tariff.sessionsCount === 1 ? 'тренировка' : tariff.sessionsCount < 5 ? 'тренировки' : 'тренировок'}
                        </span>
                        {tariff.sessionsCount > 1 && (
                          <span className="text-xs text-vityaz-gray-500 dark:text-vityaz-gray-500">
                            • {tariff.pricePerSession} ₽/занятие
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                        {tariff.price.toLocaleString()} ₽
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Информация об оплате */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💳 Безопасная оплата через ЮKassa. Принимаем карты Visa, MasterCard, МИР, СБП и другие способы оплаты.
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handlePayment}
              isLoading={isProcessing}
              disabled={!selectedTariff}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Перейти к оплате
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default PaymentModal;
