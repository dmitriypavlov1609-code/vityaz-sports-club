import { useEffect, useState } from 'react';
import { sessionsService } from '@/services/sessions';
import Card from '@/components/ui/Card';
import { Users, Activity, Calendar, TrendingUp } from 'lucide-react';

const StatsCard = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalChildren: 0,
    todaySessions: 0,
    upcomingSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await sessionsService.getTrainerStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      icon: Users,
      label: 'Учеников',
      value: stats.totalChildren,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Activity,
      label: 'Всего тренировок',
      value: stats.totalSessions,
      color: 'text-vityaz-red',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      icon: Calendar,
      label: 'Сегодня',
      value: stats.todaySessions,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Предстоящих',
      value: stats.upcomingSessions,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <Card key={index}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-vityaz-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                  {item.label}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCard;
