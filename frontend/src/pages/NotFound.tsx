import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 flex items-center justify-center p-6">
      <Card>
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-vityaz-red">404</h1>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
            Страница не найдена
          </h2>
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-8">
            К сожалению, запрашиваемая страница не существует или была удалена.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <Button variant="primary" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
