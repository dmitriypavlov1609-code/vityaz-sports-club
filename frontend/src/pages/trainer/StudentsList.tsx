import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { childrenService } from '@/services/children';
import { Child } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, User, Calendar, Activity, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentsList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await childrenService.getChildren();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Ошибка загрузки учеников');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vityaz-gray-50 dark:bg-vityaz-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-vityaz-gray-200 dark:bg-vityaz-gray-800 rounded-xl" />
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
                Мои ученики
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Всего учеников: {students.length}
              </p>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {students.length === 0 ? (
            <Card className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-vityaz-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-vityaz-gray-900 dark:text-white mb-2">
                Нет учеников
              </h3>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
                За вами пока не закреплены ученики
              </p>
            </Card>
          ) : (
            students.map((student) => (
              <Card
                key={student.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/trainer/students/${student.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-vityaz-red/10 flex items-center justify-center">
                      {student.photo ? (
                        <img
                          src={student.photo}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-vityaz-red" />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-vityaz-gray-900 dark:text-white">
                          {student.lastName} {student.firstName} {student.middleName}
                        </h3>
                        {student.balance === 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                              Нет оплаты
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getAge(student.dateOfBirth)} лет</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>
                            Баланс: {student.balance} {student.balance === 1 ? 'тренировка' : 'тренировок'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance Indicator */}
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        student.balance > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {student.balance}
                    </div>
                    <p className="text-xs text-vityaz-gray-600 dark:text-vityaz-gray-400">
                      тренировок
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
