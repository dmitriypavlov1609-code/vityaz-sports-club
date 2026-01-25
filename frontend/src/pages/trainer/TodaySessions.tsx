import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { childrenService } from '@/services/children';
import { sessionsService } from '@/services/sessions';
import { Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Camera, AlertCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const TodaySessions = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await childrenService.getChildren();
      setStudents(data);

      // Initialize attendance state
      const initialAttendance: Record<string, boolean> = {};
      data.forEach((student) => {
        initialAttendance[student.id] = false;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Ошибка загрузки учеников');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);

      const attendedStudents = Object.entries(attendance)
        .filter(([_, attended]) => attended)
        .map(([studentId]) => studentId);

      if (attendedStudents.length === 0) {
        toast.error('Отметьте хотя бы одного ученика');
        return;
      }

      // Create session for each attended student and immediately mark as attended
      const today = new Date();
      const promises = attendedStudents.map(async (studentId) => {
        const session = await sessionsService.createSession({
          childId: studentId,
          date: today.toISOString(),
          duration: 60, // Default 60 minutes
          notes: 'Тренировка отмечена через панель тренера',
        });

        // Mark attendance to trigger balance deduction
        await sessionsService.markAttendance(session.id, {
          attended: true,
          notes: 'Присутствовал на тренировке',
        });

        return session;
      });

      await Promise.all(promises);

      toast.success(`Посещаемость сохранена для ${attendedStudents.length} учеников`);

      // Reset attendance
      const resetAttendance: Record<string, boolean> = {};
      students.forEach((student) => {
        resetAttendance[student.id] = false;
      });
      setAttendance(resetAttendance);

      // Reload students to update balances
      await loadStudents();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Ошибка сохранения посещаемости');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTakePhoto = () => {
    toast.success('Функция фотографии будет реализована в следующей версии');
    // TODO: Implement camera/upload functionality
  };

  const attendedCount = Object.values(attendance).filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
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
                Посещаемость сегодня
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                {new Date().toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleTakePhoto}>
              <Camera className="w-4 h-4 mr-2" />
              Фото группы
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveAttendance}
              disabled={attendedCount === 0 || isSaving}
            >
              <Check className="w-4 h-4 mr-2" />
              Сохранить ({attendedCount})
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-vityaz-gray-900 dark:text-white">
                {students.length}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Всего учеников
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {attendedCount}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Отмечено
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {students.filter((s) => s.balance === 0).length}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Без оплаты
              </p>
            </div>
          </Card>
        </div>

        {/* Attendance List */}
        <Card>
          <h2 className="text-xl font-bold text-vityaz-gray-900 dark:text-white mb-4">
            Отметить посещаемость
          </h2>
          <div className="space-y-2">
            {students.length === 0 ? (
              <div className="text-center py-8 text-vityaz-gray-600 dark:text-vityaz-gray-400">
                За вами не закреплены ученики
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    attendance[student.id]
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:border-vityaz-gray-300 dark:hover:border-vityaz-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        attendance[student.id]
                          ? 'bg-green-500 border-green-500'
                          : 'border-vityaz-gray-300 dark:border-vityaz-gray-600 hover:border-green-500'
                      }`}
                    >
                      {attendance[student.id] && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    {/* Student Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                          {student.lastName} {student.firstName} {student.middleName}
                        </p>
                        {student.balance === 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                              Нет оплаты
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        Баланс: {student.balance} {student.balance === 1 ? 'тренировка' : 'тренировок'}
                      </p>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div>
                    {attendance[student.id] ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="font-semibold">Присутствует</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-vityaz-gray-400">
                        <X className="w-5 h-5" />
                        <span>Не отмечен</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Warning for students without payment */}
        {students.some((s) => s.balance === 0 && attendance[s.id]) && (
          <Card className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  Внимание!
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                  Вы отметили учеников без оплаченных тренировок. После сохранения их баланс станет отрицательным.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TodaySessions;
