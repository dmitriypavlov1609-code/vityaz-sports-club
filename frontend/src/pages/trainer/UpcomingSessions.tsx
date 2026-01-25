import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Calendar, Clock, Users, AlertCircle } from 'lucide-react';

const UpcomingSessions = () => {
  const navigate = useNavigate();

  // This is a placeholder - in a real app, you would fetch scheduled sessions
  // For now, showing upcoming dates based on schedule
  const getUpcomingDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const upcomingDates = getUpcomingDates();

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
                Предстоящие тренировки
              </h1>
              <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                Расписание на ближайшую неделю
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                Система расписания
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Для полноценной работы с расписанием необходимо внедрить систему планирования тренировок.
                Сейчас отображаются плановые даты на основе стандартного графика.
              </p>
            </div>
          </div>
        </Card>

        {/* Upcoming Dates */}
        <div className="space-y-4">
          {upcomingDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayOfWeek = date.getDay();

            // Skip weekends for this example
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              return null;
            }

            return (
              <Card
                key={index}
                className={`transition-all ${
                  isToday ? 'border-2 border-vityaz-red' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Date */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-lg bg-vityaz-red/10 flex flex-col items-center justify-center">
                        <p className="text-2xl font-bold text-vityaz-red">
                          {date.getDate()}
                        </p>
                        <p className="text-xs text-vityaz-gray-600 dark:text-vityaz-gray-400">
                          {date.toLocaleDateString('ru-RU', { month: 'short' })}
                        </p>
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
                        {date.toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>17:00 - 18:30</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Группа: Начальная</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isToday ? (
                      <Button
                        variant="primary"
                        onClick={() => navigate('/trainer/sessions/today')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Отметить посещаемость
                      </Button>
                    ) : (
                      <span className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        Запланировано
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State for Weekends */}
        {upcomingDates.every((date) => date.getDay() === 0 || date.getDay() === 6) && (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-vityaz-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-vityaz-gray-900 dark:text-white mb-2">
              Нет тренировок
            </h3>
            <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
              На этой неделе тренировки не запланированы
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpcomingSessions;
