import { cn } from '@/utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Loading = ({ size = 'md', className, text }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-vityaz-red border-t-transparent',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm text-vityaz-gray-600 dark:text-vityaz-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
