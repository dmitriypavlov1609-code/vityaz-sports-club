import { useState, useEffect } from 'react';
import { Session } from '@/types';
import { sessionsService } from '@/services/sessions';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
// import { formatDateTime } from '@/utils/date';
import { CheckCircle2, XCircle, Calendar, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const TodaySessionsCard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadTodaySessions();
  }, []);

  const loadTodaySessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionsService.getTodaySessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Ошибка загрузки тренировок');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async (sessionId: string, attended: boolean) => {
    try {
      setProcessingId(sessionId);
      const updatedSession = await sessionsService.markAttendance(sessionId, { attended });

      // Обновить список
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );

      toast.success(
        attended ? 'Посещение отмечено' : 'Отметка посещения снята'
      );
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card title="Тренировки сегодня">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card title="Тренировки сегодня">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-vityaz-gray-400 mb-3" />
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            На сегодня тренировок нет
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`Тренировки сегодня (${sessions.length})`}
      subtitle={`Отмечено: ${sessions.filter((s) => s.attended).length} из ${sessions.length}`}
    >
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 border-2 border-transparent hover:border-vityaz-gray-200 dark:hover:border-vityaz-gray-600 transition-all"
          >
            <div className="flex items-center justify-between">
              {/* Информация о тренировке */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {/* Время */}
                  <div className="flex items-center gap-1 text-sm font-medium text-vityaz-gray-900 dark:text-white">
                    <Clock className="w-4 h-4 text-vityaz-red" />
                    {new Date(session.date).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {/* Длительность */}
                  <span className="text-xs text-vityaz-gray-500 dark:text-vityaz-gray-400">
                    ({session.duration} мин)
                  </span>

                  {/* Статус */}
                  {session.attended && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      Отмечено
                    </span>
                  )}
                </div>

                {/* Ребенок */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-vityaz-gray-400" />
                  <span className="font-medium text-vityaz-gray-900 dark:text-white">
                    {session.child?.firstName} {session.child?.lastName}
                  </span>
                </div>

                {/* Баланс предупреждение */}
                {session.child && session.child.balance <= 1 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ Низкий баланс: {session.child.balance} тренировок
                  </div>
                )}

                {/* Заметки */}
                {session.notes && (
                  <p className="mt-2 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    {session.notes}
                  </p>
                )}
              </div>

              {/* Кнопки отметки */}
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant={session.attended ? 'primary' : 'outline'}
                  onClick={() => handleMarkAttendance(session.id, true)}
                  disabled={processingId === session.id || session.attended}
                  isLoading={processingId === session.id && session.attended === false}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant={!session.attended ? 'secondary' : 'outline'}
                  onClick={() => handleMarkAttendance(session.id, false)}
                  disabled={processingId === session.id || !session.attended}
                  isLoading={processingId === session.id && session.attended === true}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TodaySessionsCard;
