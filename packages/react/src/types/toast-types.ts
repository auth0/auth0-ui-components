/**
 * Toast notification types.
 * @module toast-types
 */

import type { ReactNode } from 'react';
import type { ExternalToast } from 'sonner';

/** Toast notification type. */
export type ToastType = 'success' | 'info' | 'warning' | 'error';

/** Toast position options. */
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

/** Custom toast method signature. */
export interface CustomToastMethod {
  (message: string): void;
}

/** Custom toast methods for overriding default behavior. */
export interface CustomToastMethods {
  success?: CustomToastMethod;
  error?: CustomToastMethod;
  warning?: CustomToastMethod;
  info?: CustomToastMethod;
  dismiss?: (toastId?: string) => void;
}

/** Sonner toast settings. */
export interface SonnerSettings {
  position?: ToastPosition;
  maxToasts?: number;
  duration?: number;
  dismissible?: boolean;
  closeButton?: boolean;
}

/** Toast provider configuration. */
export type ToastSettings =
  | { provider?: 'sonner'; settings?: SonnerSettings }
  | { provider: 'custom'; methods: CustomToastMethods };

/** Toast options for showToast. */
export interface ToastOptions {
  type: ToastType;
  message: string;
  className?: string;
  icon?: ReactNode;
  data?: ExternalToast;
}

/** Default toast settings. */
export const DEFAULT_TOAST_SETTINGS: ToastSettings = {
  provider: 'sonner',
  settings: {
    position: 'top-right',
    closeButton: true,
  },
} as const;
