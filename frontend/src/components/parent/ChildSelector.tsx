import { Child } from '@/types';
import { calculateAge } from '@/utils/date';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

interface ChildSelectorProps {
  children: Child[];
  selectedChild: Child | null;
  onSelect: (child: Child) => void;
}

const ChildSelector = ({ children, selectedChild, onSelect }: ChildSelectorProps) => {
  if (children.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
      {children.map((child) => {
        const age = calculateAge(child.dateOfBirth);
        const isSelected = selectedChild?.id === child.id;

        return (
          <button
            key={child.id}
            onClick={() => onSelect(child)}
            className={cn(
              'flex-shrink-0 flex items-center gap-3 p-4 rounded-xl transition-all duration-200',
              'border-2 min-w-[200px]',
              isSelected
                ? 'border-vityaz-red bg-red-50 dark:bg-red-950/20'
                : 'border-vityaz-gray-200 dark:border-vityaz-gray-700 hover:border-vityaz-gray-300 dark:hover:border-vityaz-gray-600'
            )}
          >
            {/* Аватар */}
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center overflow-hidden',
                isSelected
                  ? 'bg-vityaz-red text-white'
                  : 'bg-vityaz-gray-200 dark:bg-vityaz-gray-700 text-vityaz-gray-600 dark:text-vityaz-gray-400'
              )}
            >
              {child.photo ? (
                <img src={child.photo} alt={child.firstName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>

            {/* Инфо */}
            <div className="text-left">
              <p
                className={cn(
                  'font-semibold',
                  isSelected
                    ? 'text-vityaz-red'
                    : 'text-vityaz-gray-900 dark:text-white'
                )}
              >
                {child.firstName}
              </p>
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400">
                {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChildSelector;
