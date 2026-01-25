import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Страницы
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ParentDashboard from '@/pages/parent/Dashboard';
import PaymentSuccess from '@/pages/parent/PaymentSuccess';
import TrainerLayout from '@/pages/trainer/TrainerLayout';
import AdminLayout from '@/pages/admin/AdminLayout';
import NotFound from '@/pages/NotFound';

// Компонент защищенного роута
import { Role } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Редирект на соответствующий дашборд в зависимости от роли
  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) {
      return '/login';
    }

    switch (user.role) {
      case Role.PARENT:
        return '/parent';
      case Role.TRAINER:
        return '/trainer';
      case Role.ADMIN:
        return '/admin';
      default:
        return '/login';
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900">
        <Routes>
          {/* Публичные роуты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Защищенные роуты - Родитель */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={[Role.PARENT]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/success"
            element={
              <ProtectedRoute allowedRoles={[Role.PARENT]}>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />

          {/* Защищенные роуты - Тренер */}
          <Route
            path="/trainer/*"
            element={
              <ProtectedRoute allowedRoles={[Role.TRAINER]}>
                <TrainerLayout />
              </ProtectedRoute>
            }
          />

          {/* Защищенные роуты - Админ */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* Редирект на дефолтный роут */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
