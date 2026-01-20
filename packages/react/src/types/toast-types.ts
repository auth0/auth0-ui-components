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
  (message: string): void;
}

/**
 * Custom toast methods interface for overriding default toast behavior
 */
export interface CustomToastMethods {
  success?: CustomToastMethod;
  error?: CustomToastMethod;
  warning?: CustomToastMethod;
  info?: CustomToastMethod;
  dismiss?: (toastId?: string) => void;
}

/**
 * Sonner-specific toast settings
 */
export interface SonnerSettings {
  position?: ToastPosition;
  maxToasts?: number;
  duration?: number;
  dismissible?: boolean;
  closeButton?: boolean;
}

/**
 * Toast provider configuration with type safety
 */
export type ToastSettings =
  | { provider?: 'sonner'; settings?: SonnerSettings }
  | { provider: 'custom'; methods: CustomToastMethods };

/**
 * Toast options for showToast function
 */
export interface ToastOptions {
  type: ToastType;
  message: string;
  className?: string;
  icon?: ReactNode;
  data?: ExternalToast;
}

/**
 * Default toast settings used across the application
 */
export const DEFAULT_TOAST_SETTINGS: ToastSettings = {
  provider: 'sonner',
  settings: {
    position: 'top-right',
    closeButton: true, // Enable close button by default for better UX
  },
} as const;
