import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { childrenService } from '@/services/children';
import { sessionsService } from '@/services/sessions';
import { ofpService } from '@/services/ofp';
import { Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  User,
  Calendar,
  Activity,
  Phone,
  Mail,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Session {
  id: string;
  date: string;
  duration: number;
  attended: boolean;
  notes?: string;
}

interface OFPResult {
  id: string;
  testDate: string;
  run30m?: number;
  run60m?: number;
  pullUps?: number;
  pushUps?: number;
  longJump?: number;
  notes?: string;
}

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ofpResults, setOfpResults] = useState<OFPResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const loadStudentData = async () => {
    try {
      setIsLoading(true);
      const [studentData, sessionsData, ofpData] = await Promise.all([
        childrenService.getChildById(id!),
        sessionsService.getChildSessions(id!),
        ofpService.getChildResults(id!),
      ]);

      setStudent(studentData);
      setSessions(sessionsData);
      setOfpResults(ofpData);
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Ошибка загрузки данных ученика');
    } finally {
      setIsLoading(false);
    }
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const attendanceRate =
    sessions.length > 0
      ? Math.round((sessions.filter((s) => s.attended).length / sessions.length) * 100)
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-vityaz-gray-900 dark:text-white mb-2">
              Ученик не найден
            </h3>
            <Button variant="primary" onClick={() => navigate('/trainer/students')} className="mt-4">
              Вернуться к списку
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="secondary" onClick={() => navigate('/trainer/students')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>

        {/* Student Profile */}
        <Card className="mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-vityaz-red/10 flex items-center justify-center flex-shrink-0">
              {student.photo ? (
                <img
                  src={student.photo}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-vityaz-red" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-vityaz-gray-900 dark:text-white mb-2">
                    {student.lastName} {student.firstName} {student.middleName}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getAge(student.dateOfBirth)} лет</span>
                      <span className="text-xs">
                        ({new Date(student.dateOfBirth).toLocaleDateString('ru-RU')})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Пол: {student.gender === 'MALE' ? 'Мужской' : 'Женский'}</span>
                    </div>
                    {student.weight && (
                      <div className="flex items-center gap-1">
                        <span>Вес: {student.weight} кг</span>
                      </div>
                    )}
                  </div>
                </div>

                {student.balance === 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="font-semibold text-red-600 dark:text-red-400">Нет оплаты</span>
                  </div>
                )}
              </div>

              {/* Parent Info */}
              {student.parent && (
                <div className="mt-4 pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
                  <h3 className="text-sm font-semibold text-vityaz-gray-900 dark:text-white mb-2">
                    Родитель:
                  </h3>
                  <div className="flex gap-4 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>
                        {student.parent.lastName} {student.parent.firstName}
                      </span>
                    </div>
                    {student.parent.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{student.parent.email}</span>
                      </div>
                    )}
                    {student.parent.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{student.parent.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                {student.balance}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Баланс тренировок
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {sessions.length}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Всего тренировок
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {attendanceRate}%
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Посещаемость
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {ofpResults.length}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Тестов ОФП
              </p>
            </div>
          </Card>
        </div>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sessions */}
          <Card>
            <h2 className="text-xl font-bold text-vityaz-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-vityaz-red" />
              Последние тренировки
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-center py-8 text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Тренировок пока нет
                </p>
              ) : (
                sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      {session.attended ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                          {new Date(session.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          {session.duration} минут
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        session.attended
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {session.attended ? 'Присутствовал' : 'Отсутствовал'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* OFP Results */}
          <Card>
            <h2 className="text-xl font-bold text-vityaz-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-vityaz-red" />
              Результаты ОФП
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ofpResults.length === 0 ? (
                <p className="text-center py-8 text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  Тестов ОФП пока нет
                </p>
              ) : (
                ofpResults.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="p-3 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-800"
                  >
                    <p className="font-semibold text-vityaz-gray-900 dark:text-white mb-2">
                      {new Date(result.testDate).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {result.run30m && (
                        <div className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          Бег 30м: <span className="font-semibold">{result.run30m}с</span>
                        </div>
                      )}
                      {result.pullUps !== undefined && (
                        <div className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          Подтягивания: <span className="font-semibold">{result.pullUps}</span>
                        </div>
                      )}
                      {result.pushUps !== undefined && (
                        <div className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          Отжимания: <span className="font-semibold">{result.pushUps}</span>
                        </div>
                      )}
                      {result.longJump && (
                        <div className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          Прыжок: <span className="font-semibold">{result.longJump}см</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
