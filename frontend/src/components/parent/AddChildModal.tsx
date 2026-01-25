import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Gender, CreateChildForm } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useChildrenStore } from '@/store/children.store';

const childSchema = z.object({
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Дата рождения обязательна'),
  gender: z.nativeEnum(Gender),
  weight: z.coerce.number().positive('Вес должен быть положительным числом').optional(),
  emergencyContact: z.string().optional(),
  medicalNotes: z.string().optional(),
});

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddChildModal = ({ isOpen, onClose }: AddChildModalProps) => {
  const { createChild } = useChildrenStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateChildForm>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      gender: Gender.MALE,
    },
  });

  const onSubmit = async (data: CreateChildForm) => {
    try {
      setIsLoading(true);
      await createChild(data);
      toast.success(`Ребенок ${data.firstName} ${data.lastName} успешно добавлен!`);
      reset();
      onClose();
    } catch (error: any) {
      console.error('Error creating child:', error);
      toast.error(error.response?.data?.message || 'Ошибка при добавлении ребенка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить ребенка" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ФИО */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Имя *"
            {...register('firstName')}
            error={errors.firstName?.message}
            placeholder="Александр"
          />

          <Input
            label="Фамилия *"
            {...register('lastName')}
            error={errors.lastName?.message}
            placeholder="Иванов"
          />

          <Input
            label="Отчество"
            {...register('middleName')}
            error={errors.middleName?.message}
            placeholder="Петрович"
          />
        </div>

        {/* Дата рождения и пол */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Дата рождения *"
            type="date"
            {...register('dateOfBirth')}
            error={errors.dateOfBirth?.message}
          />

          <div>
            <label className="label">Пол *</label>
            <select
              {...register('gender')}
              className="input"
            >
              <option value={Gender.MALE}>Мальчик</option>
              <option value={Gender.FEMALE}>Девочка</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Вес */}
        <Input
          label="Вес (кг)"
          type="number"
          step="0.1"
          {...register('weight')}
          error={errors.weight?.message}
          placeholder="25.5"
          helperText="Текущий вес ребенка"
        />

        {/* Контакт для экстренной связи */}
        <Input
          label="Контакт для экстренной связи"
          {...register('emergencyContact')}
          error={errors.emergencyContact?.message}
          placeholder="+7 (999) 123-45-67"
          helperText="Номер телефона или другой способ связи"
        />

        {/* Медицинские особенности */}
        <div>
          <label className="label">Медицинские особенности</label>
          <textarea
            {...register('medicalNotes')}
            rows={3}
            className="input resize-none"
            placeholder="Аллергии, хронические заболевания, ограничения по физическим нагрузкам..."
          />
          {errors.medicalNotes && (
            <p className="mt-1 text-sm text-red-600">{errors.medicalNotes.message}</p>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Добавить ребенка
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddChildModal;
