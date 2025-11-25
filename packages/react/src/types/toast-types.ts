import type { ReactNode } from 'react';
import type { ExternalToast } from 'sonner';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'info' | 'warning' | 'error';

/**
 * Toast position options for Sonner provider
 */
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

/**
 * Custom toast method signature
 */
export interface CustomToastMethod {
  (
    message: string,
    options?: {
      className?: string;
      icon?: ReactNode;
      duration?: number;
      dismissible?: boolean;
    } & Partial<ExternalToast>,
  ): string | number | void;
}

/**
 * Custom toast methods interface for overriding default toast behavior
 */
export interface CustomToastMethods {
  /** Show success toast notification */
  success?: CustomToastMethod;
  /** Show error toast notification */
  error?: CustomToastMethod;
  /** Show warning toast notification */
  warning?: CustomToastMethod;
  /** Show info toast notification */
  info?: CustomToastMethod;
  /** Dismiss toast by ID */
  dismiss?: (toastId?: string) => void;
}

/**
 * Toast provider configuration
 */
export interface ToastSettings {
  /** Toast provider type - 'sonner' for default, 'custom' for user-defined */
  provider?: 'sonner' | 'custom';
  /** Custom toast methods when using 'custom' provider */
  customMethods?: CustomToastMethods;
  /** Toast position (only applies to 'sonner' provider) */
  position?: ToastPosition;
  /** Maximum number of toasts to show simultaneously */
  maxToasts?: number;
  /** Default toast duration in milliseconds (used for individual toasts) */
  duration?: number;
  /** Whether toasts can be manually dismissed (used for individual toasts) */
  dismissible?: boolean;
  /** Whether to show close button on toasts (used for individual toasts) */
  closeButton?: boolean;
}

/**
 * Toast options for showToast function
 */
export interface ToastOptions {
  /** Type of toast notification */
  type: ToastType;
  /** Toast message content */
  message: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom icon element */
  icon?: ReactNode;
  /** Extended options (duration, dismissible, etc.) */
  data?: ExternalToast;
}

/**
 * Default toast settings used across the application
 */
export const DEFAULT_TOAST_SETTINGS: Pick<
  Required<ToastSettings>,
  'provider' | 'customMethods' | 'position'
> &
  Partial<ToastSettings> = {
  provider: 'sonner',
  customMethods: {},
  position: 'bottom-right',
} as const;
