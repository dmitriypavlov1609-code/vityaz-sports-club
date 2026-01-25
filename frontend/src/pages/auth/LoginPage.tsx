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
const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('Вход выполнен успешно!');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Ошибка входа. Проверьте email и пароль.');
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
            Вход в систему
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="example@mail.com"
              autoComplete="email"
            />

            <Input
              label="Пароль"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Войти
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
              Нет аккаунта?{' '}
              <Link
                to="/register"
                className="text-vityaz-red hover:underline font-medium"
              >
                Зарегистрироваться
              </Link>
            </p>
          </div>

          {/* Демо аккаунты */}
          <div className="mt-6 pt-6 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
            <p className="text-xs text-vityaz-gray-500 dark:text-vityaz-gray-400 mb-2">
              Демо аккаунты:
            </p>
            <div className="space-y-1 text-xs text-vityaz-gray-600 dark:text-vityaz-gray-400">
              <p>👨‍👩‍👧 Родитель: parent@test.com / password123</p>
              <p>💪 Тренер: trainer@test.com / password123</p>
              <p>🔧 Админ: admin@vityazteam.ru / admin123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
