import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { adminService } from '@/services/admin';

const trainerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.coerce.number().int().min(0).optional(),
  bio: z.string().optional(),
  certifications: z.string().optional(),
});

type TrainerFormData = z.infer<typeof trainerSchema>;

interface AddTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddTrainerModal = ({ isOpen, onClose, onSuccess }: AddTrainerModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
  });

  const onSubmit = async (data: TrainerFormData) => {
    try {
      setIsLoading(true);
      await adminService.createUser({
        ...data,
        role: 'TRAINER',
      });
      toast.success(`Тренер ${data.firstName} ${data.lastName} успешно добавлен!`);
      reset();
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating trainer:', error);
      toast.error(error.response?.data?.message || 'Ошибка при добавлении тренера');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить тренера" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ФИО */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Имя *"
            {...register('firstName')}
            error={errors.firstName?.message}
            placeholder="Иван"
          />

          <Input
            label="Фамилия *"
            {...register('lastName')}
            error={errors.lastName?.message}
            placeholder="Иванов"
          />
        </div>

        {/* Контакты */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email *"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="trainer@vityazteam.ru"
          />

          <Input
            label="Телефон"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+7 (999) 123-45-67"
          />
        </div>

        {/* Пароль */}
        <Input
          label="Пароль *"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="Минимум 6 символов"
        />

        {/* Профессиональная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Специализация"
            {...register('specialization')}
            error={errors.specialization?.message}
            placeholder="Борьба, бокс, ОФП"
            helperText="Например: Борьба, бокс, кикбоксинг"
          />

          <Input
            label="Опыт работы (лет)"
            type="number"
            {...register('experience')}
            error={errors.experience?.message}
            placeholder="5"
          />
        </div>

        {/* Биография */}
        <div>
          <label className="label">Биография</label>
          <textarea
            {...register('bio')}
            rows={3}
            className="input resize-none"
            placeholder="Краткая информация о тренере, достижения, опыт работы..."
          />
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>

        {/* Сертификаты */}
        <div>
          <label className="label">Сертификаты и квалификация</label>
          <textarea
            {...register('certifications')}
            rows={2}
            className="input resize-none"
            placeholder="Список сертификатов, квалификаций, наград..."
          />
          {errors.certifications && (
            <p className="mt-1 text-sm text-red-600">{errors.certifications.message}</p>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Добавить тренера
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTrainerModal;
