import { Component, ErrorInfo, ReactNode } from 'react';
import Card from './Card';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 flex items-center justify-center p-6">
          <Card>
            <div className="text-center py-12 max-w-md mx-auto">
              <AlertTriangle className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-vityaz-gray-900 dark:text-white">
                Что-то пошло не так
              </h2>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-6">
                Произошла непредвиденная ошибка. Пожалуйста, попробуйте перезагрузить страницу.
              </p>

              {(import.meta as any).env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                  <p className="text-sm text-red-800 dark:text-red-400 font-mono">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={() => window.location.reload()}>
                  Перезагрузить страницу
                </Button>
                <Button variant="primary" onClick={this.handleReset}>
                  Вернуться на главную
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
