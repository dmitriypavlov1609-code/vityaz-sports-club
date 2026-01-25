import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-vityaz-gray-800 rounded-xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto custom-scrollbar',
          'animate-fadeIn',
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-vityaz-gray-800 border-b border-vityaz-gray-200 dark:border-vityaz-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-vityaz-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-vityaz-gray-100 dark:hover:bg-vityaz-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
