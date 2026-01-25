import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateOFPResultForm, Child } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ofpService } from '@/services/ofp';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';

const ofpSchema = z.object({
  childId: z.string(),
  testDate: z.string().min(1, 'Дата обязательна'),
  run30m: z.number().positive().optional().or(z.nan()),
  run60m: z.number().positive().optional().or(z.nan()),
  run100m: z.number().positive().optional().or(z.nan()),
  shuttleRun: z.number().positive().optional().or(z.nan()),
  pullUps: z.number().int().nonnegative().optional().or(z.nan()),
  pushUps: z.number().int().nonnegative().optional().or(z.nan()),
  press30s: z.number().int().nonnegative().optional().or(z.nan()),
  longJump: z.number().int().positive().optional().or(z.nan()),
  highJump: z.number().int().positive().optional().or(z.nan()),
  flexibility: z.number().int().optional().or(z.nan()),
  ballThrow: z.number().positive().optional().or(z.nan()),
  notes: z.string().optional(),
});

interface OFPInputFormProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child;
  onSuccess?: () => void;
}

const OFPInputForm = ({ isOpen, onClose, child, onSuccess }: OFPInputFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOFPResultForm>({
    resolver: zodResolver(ofpSchema),
    defaultValues: {
      childId: child.id,
      testDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: CreateOFPResultForm) => {
    try {
      setIsLoading(true);

      // Очистить NaN значения
      const cleanData: any = { ...data };
      Object.keys(cleanData).forEach((key) => {
        if (typeof cleanData[key] === 'number' && isNaN(cleanData[key])) {
          cleanData[key] = undefined;
        }
      });

      await ofpService.createOFPResult(cleanData);
      toast.success('Результаты ОФП добавлены');
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating OFP result:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Результаты ОФП" size="xl">
      <div className="mb-4 p-3 bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 rounded-lg">
        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
          Тестирование для: <span className="font-semibold text-vityaz-gray-900 dark:text-white">
            {child.firstName} {child.lastName}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Дата тестирования */}
        <Input
          label="Дата тестирования *"
          type="date"
          {...register('testDate')}
          error={errors.testDate?.message}
        />

        {/* Беговые нормативы */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-vityaz-gray-900 dark:text-white">
            <Activity className="w-5 h-5 text-vityaz-red" />
            Беговые нормативы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Бег 30м (секунды)"
              type="number"
              step="0.01"
              {...register('run30m', { valueAsNumber: true })}
              error={errors.run30m?.message}
              placeholder="6.5"
            />
            <Input
              label="Бег 60м (секунды)"
              type="number"
              step="0.01"
              {...register('run60m', { valueAsNumber: true })}
              error={errors.run60m?.message}
              placeholder="11.2"
            />
            <Input
              label="Бег 100м (секунды)"
              type="number"
              step="0.01"
              {...register('run100m', { valueAsNumber: true })}
              error={errors.run100m?.message}
              placeholder="16.5"
            />
            <Input
              label="Челночный бег 3х10м (секунды)"
              type="number"
              step="0.01"
              {...register('shuttleRun', { valueAsNumber: true })}
              error={errors.shuttleRun?.message}
              placeholder="10.0"
            />
          </div>
        </div>

        {/* Силовые нормативы */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-vityaz-gray-900 dark:text-white">
            💪 Силовые нормативы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Подтягивания (количество)"
              type="number"
              {...register('pullUps', { valueAsNumber: true })}
              error={errors.pullUps?.message}
              placeholder="5"
            />
            <Input
              label="Отжимания (количество)"
              type="number"
              {...register('pushUps', { valueAsNumber: true })}
              error={errors.pushUps?.message}
              placeholder="20"
            />
            <Input
              label="Пресс за 30 сек (количество)"
              type="number"
              {...register('press30s', { valueAsNumber: true })}
              error={errors.press30s?.message}
              placeholder="25"
            />
          </div>
        </div>

        {/* Прыжковые нормативы */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-vityaz-gray-900 dark:text-white">
            🦘 Прыжковые нормативы
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Прыжок в длину (см)"
              type="number"
              {...register('longJump', { valueAsNumber: true })}
              error={errors.longJump?.message}
              placeholder="150"
            />
            <Input
              label="Прыжок в высоту (см)"
              type="number"
              {...register('highJump', { valueAsNumber: true })}
              error={errors.highJump?.message}
              placeholder="65"
            />
          </div>
        </div>

        {/* Другие показатели */}
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-vityaz-gray-900 dark:text-white">
            📏 Другие показатели
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Гибкость: наклон (см)"
              type="number"
              {...register('flexibility', { valueAsNumber: true })}
              error={errors.flexibility?.message}
              placeholder="5"
              helperText="Положительное число - достает ниже стоп"
            />
            <Input
              label="Метание мяча (метры)"
              type="number"
              step="0.1"
              {...register('ballThrow', { valueAsNumber: true })}
              error={errors.ballThrow?.message}
              placeholder="15.5"
            />
          </div>
        </div>

        {/* Комментарии */}
        <div>
          <label className="label">Комментарии</label>
          <textarea
            {...register('notes')}
            rows={3}
            className="input resize-none"
            placeholder="Особенности тестирования, рекомендации..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 justify-end pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Сохранить результаты
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OFPInputForm;
