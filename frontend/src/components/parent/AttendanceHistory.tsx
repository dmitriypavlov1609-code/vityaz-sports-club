import { Child } from '@/types';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/utils/date';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';

interface AttendanceHistoryProps {
  child: Child;
}

const AttendanceHistory = ({ child }: AttendanceHistoryProps) => {
  const sessions = child.sessions || [];
  const recentSessions = sessions.slice(0, 10);

  if (recentSessions.length === 0) {
    return (
      <Card title="История посещений">
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-vityaz-gray-400 mb-3" />
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            Пока нет записей о посещениях
          </p>
        </div>
      </Card>
    );
  }

  // Статистика
  const totalSessions = sessions.length;
  const attendedSessions = sessions.filter((s) => s.attended).length;
  const attendanceRate = totalSessions > 0
    ? Math.round((attendedSessions / totalSessions) * 100)
    : 0;

  return (
    <Card title="История посещений">
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
            {totalSessions}
          </p>
          <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Всего</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {attendedSessions}
          </p>
          <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Посещено</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-vityaz-red">
            {attendanceRate}%
          </p>
          <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">Процент</p>
        </div>
      </div>

      {/* Список тренировок */}
      <div className="space-y-3">
        {recentSessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50"
          >
            <div className="flex items-center gap-3">
              {/* Иконка статуса */}
              {session.attended ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}

              {/* Информация */}
              <div>
                <p className="font-medium text-vityaz-gray-900 dark:text-white">
                  {formatDateTime(session.date)}
                </p>
                {session.trainer && (
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    Тренер: {session.trainer.user.firstName} {session.trainer.user.lastName}
                  </p>
                )}
                {session.notes && (
                  <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                    {session.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Длительность */}
            <div className="text-right">
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                {session.duration} мин
              </p>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-vityaz-red hover:underline">
            Показать все ({sessions.length})
          </button>
        </div>
      )}
    </Card>
  );
};

export default AttendanceHistory;
