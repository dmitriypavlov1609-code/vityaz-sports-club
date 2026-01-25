import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  headerActions,
  ...props
}) => {
  return (
    <div className={cn('card', className)} {...props}>
      {(title || subtitle || headerActions) && (
        <div className="mb-4 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-vityaz-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
