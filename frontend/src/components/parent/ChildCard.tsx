import { Child } from '@/types';
import { calculateAge, formatDate } from '@/utils/date';
import Card from '@/components/ui/Card';
import { User, Calendar, Phone, Activity, Trophy, Weight } from 'lucide-react';

interface ChildCardProps {
  child: Child;
}

const ChildCard = ({ child }: ChildCardProps) => {
  const age = calculateAge(child.dateOfBirth);
  const attendedSessions = child.sessions?.filter((s) => s.attended).length || 0;

  return (
    <Card>
      <div className="flex items-start gap-6">
        {/* Фото */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-vityaz-gray-200 dark:bg-vityaz-gray-700 flex items-center justify-center">
            {child.photo ? (
              <img
                src={child.photo}
                alt={`${child.firstName} ${child.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-vityaz-gray-400" />
            )}
          </div>
        </div>

        {/* Информация */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-vityaz-gray-900 dark:text-white mb-1">
            {child.firstName} {child.lastName}
          </h3>
          {child.middleName && (
            <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-3">
              {child.middleName}
            </p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Возраст */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-vityaz-red" />
              <div>
                <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">Возраст</p>
                <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                  {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
                </p>
              </div>
            </div>

            {/* Баланс */}
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-vityaz-red" />
              <div>
                <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">Баланс</p>
                <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                  {child.balance} тренировок
                </p>
              </div>
            </div>

            {/* Посещено */}
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-vityaz-red" />
              <div>
                <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">Посещено</p>
                <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                  {attendedSessions} тренировок
                </p>
              </div>
            </div>

            {/* Вес */}
            {child.weight && (
              <div className="flex items-center gap-2 text-sm">
                <Weight className="w-4 h-4 text-vityaz-red" />
                <div>
                  <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">Вес</p>
                  <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                    {child.weight} кг
                  </p>
                </div>
              </div>
            )}

            {/* Тренер */}
            {child.trainer && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-vityaz-red" />
                <div>
                  <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">Тренер</p>
                  <p className="font-semibold text-vityaz-gray-900 dark:text-white">
                    {child.trainer.user.firstName} {child.trainer.user.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Контакты тренера */}
          {child.trainer && (
            <div className="mt-4 pt-4 border-t border-vityaz-gray-200 dark:border-vityaz-gray-700">
              <div className="flex items-center gap-2 text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                <Phone className="w-4 h-4" />
                <span>{child.trainer.user.phone || child.trainer.user.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ChildCard;
