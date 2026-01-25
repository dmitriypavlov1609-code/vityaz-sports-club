import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Схема валидации
const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
  phone: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);
      toast.success('Регистрация успешна! Добро пожаловать!');
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-vityaz-gray-50 to-vityaz-gray-100 dark:from-vityaz-gray-900 dark:to-black">
      <div className="w-full max-w-md">
        {/* Лого */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-vityaz-red mb-2">Витязь</h1>
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            Спортивный клуб
          </p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-center mb-6 text-vityaz-gray-900 dark:text-white">
            Регистрация
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Имя"
                {...register('firstName')}
                error={errors.firstName?.message}
                placeholder="Иван"
              />

              <Input
                label="Фамилия"
                {...register('lastName')}
                error={errors.lastName?.message}
                placeholder="Иванов"
              />
            </div>

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="example@mail.com"
              autoComplete="email"
            />

            <Input
              label="Телефон"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+7 (999) 123-45-67"
              autoComplete="tel"
            />

            <Input
              label="Пароль"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              autoComplete="new-password"
              helperText="Минимум 6 символов"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Зарегистрироваться
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
              Уже есть аккаунт?{' '}
              <Link
                to="/login"
                className="text-vityaz-red hover:underline font-medium"
              >
                Войти
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
