import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsService } from '@/services/sessions';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  date: string;
  duration: number;
  attended: boolean;
  notes?: string;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
  };
}

const AllSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionsService.getAllSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Ошибка загрузки тренировок');
    } finally {
      setIsLoading(false);
    }
  };

  const groupSessionsByDate = () => {
    const grouped: Record<string, Session[]> = {};

    sessions.forEach((session) => {
      const date = new Date(session.date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

  const groupedSessions = groupSessionsByDate();
  const totalSessions = sessions.length;
  const attendedSessions = sessions.filter((s) => s.attended).length;
  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={() => navigate('/trainer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                Все тренировки
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Полная хронология проведенных тренировок
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                {totalSessions}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Всего тренировок
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {attendedSessions}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Посещений
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(totalDuration / 60)}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Часов тренировок
              </p>
            </div>
          </Card>
        </div>

        {/* Sessions Timeline */}
        <div className="space-y-6">
          {Object.keys(groupedSessions).length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-vityaz-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-vityaz-gray-900 dark:text-white mb-2">
                Нет тренировок
              </h3>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                Тренировки еще не были проведены
              </p>
            </Card>
          ) : (
            Object.entries(groupedSessions)
              .sort((a, b) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime())
              .map(([date, dateSessions]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-vityaz-red" />
                    <h2 className="text-xl font-bold text-vityaz-gray-900 dark:text-white">
                      {date}
                    </h2>
                    <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                      ({dateSessions.length} {dateSessions.length === 1 ? 'тренировка' : 'тренировок'})
                    </span>
                  </div>

                  {/* Sessions for this date */}
                  <div className="space-y-3 ml-8">
                    {dateSessions.map((session) => (
                      <Card
                        key={session.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/trainer/students/${session.child.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                session.attended
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-red-100 dark:bg-red-900/30'
                              }`}
                            >
                              {session.attended ? (
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                              )}
                            </div>

                            {/* Session Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-vityaz-gray-600 dark:text-vityaz-gray-400" />
                                <h3 className="font-semibold text-vityaz-gray-900 dark:text-white">
                                  {session.child.lastName} {session.child.firstName} {session.child.middleName}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{session.duration} минут</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>
                                    {new Date(session.date).toLocaleTimeString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                              {session.notes && (
                                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-2">
                                  {session.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                                session.attended
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {session.attended ? 'Присутствовал' : 'Отсутствовал'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSessions;
