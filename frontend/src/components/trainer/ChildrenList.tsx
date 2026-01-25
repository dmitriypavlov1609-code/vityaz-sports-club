import { useState } from 'react';
import { Child } from '@/types';
import { calculateAge } from '@/utils/date';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import OFPInputForm from '@/components/trainer/OFPInputForm';
import { User, Phone, Mail, Ticket, Activity, ClipboardList } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChildrenListProps {
  children: Child[];
  onOFPAdded?: () => void;
}

const ChildrenList = ({ children, onOFPAdded }: ChildrenListProps) => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isOFPModalOpen, setIsOFPModalOpen] = useState(false);

  const handleAddOFP = (child: Child) => {
    setSelectedChild(child);
    setIsOFPModalOpen(true);
  };

  const handleOFPSuccess = () => {
    setIsOFPModalOpen(false);
    setSelectedChild(null);
    if (onOFPAdded) onOFPAdded();
  };

  if (children.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <User className="w-12 h-12 mx-auto text-vityaz-gray-400 mb-3" />
          <p className="text-vityaz-gray-600 dark:text-vityaz-gray-400">
            За вами пока не закреплены дети
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title={`Мои ученики (${children.length})`}>
      <div className="space-y-4">
        {children.map((child) => {
          const age = calculateAge(child.dateOfBirth);
          const attendedSessions = child.sessions?.filter((s) => s.attended).length || 0;
          const isLowBalance = child.balance <= 3;

          return (
            <div
              key={child.id}
              className="p-4 rounded-lg bg-vityaz-gray-50 dark:bg-vityaz-gray-700/50 hover:bg-vityaz-gray-100 dark:hover:bg-vityaz-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Аватар */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-vityaz-gray-200 dark:bg-vityaz-gray-600 flex items-center justify-center">
                    {child.photo ? (
                      <img
                        src={child.photo}
                        alt={child.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-vityaz-gray-400" />
                    )}
                  </div>
                </div>

                {/* Информация */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-vityaz-gray-900 dark:text-white">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'} • {child.gender === 'MALE' ? 'Мальчик' : 'Девочка'}
                      </p>
                    </div>

                    {/* Баланс */}
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Ticket
                          className={cn(
                            'w-4 h-4',
                            isLowBalance ? 'text-red-600' : 'text-green-600'
                          )}
                        />
                        <span
                          className={cn(
                            'font-bold',
                            isLowBalance
                              ? 'text-red-600'
                              : 'text-green-600'
                          )}
                        >
                          {child.balance}
                        </span>
                      </div>
                      <p className="text-xs text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        тренировок
                      </p>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-vityaz-red" />
                      <span className="text-vityaz-gray-700 dark:text-vityaz-gray-300">
                        Посещено: <strong>{attendedSessions}</strong>
                      </span>
                    </div>

                    {child.ofpResults && child.ofpResults.length > 0 && (
                      <div className="text-sm text-vityaz-gray-700 dark:text-vityaz-gray-300">
                        ОФП тестов: <strong>{child.ofpResults.length}</strong>
                      </div>
                    )}
                  </div>

                  {/* Контакты родителя */}
                  {child.parent && (
                    <div className="pt-3 border-t border-vityaz-gray-200 dark:border-vityaz-gray-600">
                      <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mb-1">
                        Родитель: {child.parent.firstName} {child.parent.lastName}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-vityaz-gray-600 dark:text-vityaz-gray-400">
                        {child.parent.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {child.parent.phone}
                          </div>
                        )}
                        {child.parent.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {child.parent.email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Медицинские заметки */}
                  {child.medicalNotes && (
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm text-yellow-800 dark:text-yellow-400">
                      ⚠️ {child.medicalNotes}
                    </div>
                  )}

                  {/* Кнопка добавления результатов ОФП */}
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddOFP(child)}
                      className="w-full"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Добавить результаты ОФП
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно для ввода ОФП */}
      {selectedChild && (
        <OFPInputForm
          isOpen={isOFPModalOpen}
          onClose={() => {
            setIsOFPModalOpen(false);
            setSelectedChild(null);
          }}
          child={selectedChild}
          onSuccess={handleOFPSuccess}
        />
      )}
    </Card>
  );
};

export default ChildrenList;
