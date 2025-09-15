import { Flag } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast, type ExternalToast } from 'sonner';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastOptions {
  type: ToastType;
  message: string;
  className?: string;
  icon?: ReactNode;
  data?: ExternalToast;
}

const colorClasses = {
  success: 'text-success-foreground',
  error: 'text-destructive-foreground',
  warning: 'text-warning-foreground',
  info: 'text-info-foreground',
};

/**
 * Show a toast notification with default styling and icons
 *
 * @param options - Toast configuration options
 * @returns The toast instance
 */
export const showToast = ({ type, message, className, icon, data = {} }: ToastOptions) => {
  const colorClass = colorClasses[type];
  const defaultIcon = <Flag className={`h-4 w-4 ${colorClass}`} />;

  const styledMessage = <span className={colorClass}>{message}</span>;

  const toastOptions: ExternalToast = {
    className,
    icon: icon || defaultIcon,
    ...data,
  };

  return toast[type](styledMessage, toastOptions);
};
