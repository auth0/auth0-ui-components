import { Flag } from 'lucide-react';
import type { ReactNode } from 'react';
import { toast, type ExternalToast } from 'sonner';

import { DEFAULT_TOAST_SETTINGS } from '../../types/toast-types';
import type { ToastOptions, ToastSettings, ToastType } from '../../types/toast-types';

const TOAST_COLOR_CLASSES: Record<ToastType, string> = {
  success: 'text-success-foreground',
  error: 'text-destructive-foreground',
  warning: 'text-warning-foreground',
  info: 'text-info-foreground',
} as const;

const VALID_TOAST_TYPES: ToastType[] = ['success', 'error', 'warning', 'info'] as const;

let globalToastSettings: ToastSettings = {
  ...DEFAULT_TOAST_SETTINGS,
};

/**
 * Sets global toast configuration. Called by Auth0ComponentProvider.
 * @internal
 */
export const setGlobalToastSettings = (settings?: ToastSettings): void => {
  if (!settings) {
    globalToastSettings = {
      ...DEFAULT_TOAST_SETTINGS,
    };
    return;
  }

  globalToastSettings = {
    ...DEFAULT_TOAST_SETTINGS,
    ...settings,
  };

  if (settings.provider === 'custom' && settings.customMethods) {
    const { customMethods } = settings;
    const availableMethods = Object.keys(customMethods);

    if (availableMethods.length === 0) {
      console.warn(
        'Auth0ComponentProvider: Custom toast provider specified but no custom methods provided',
      );
    }

    availableMethods.forEach((method) => {
      if (typeof customMethods[method as keyof typeof customMethods] !== 'function') {
        console.warn(`Auth0ComponentProvider: Custom toast method '${method}' is not a function`);
      }
    });
  }
};

/**
 * Gets the current global toast configuration.
 * @returns The current toast settings
 */
export const getGlobalToastSettings = (): ToastSettings => globalToastSettings;

/**
 * Creates a styled message element with appropriate color classes.
 * @param type - The toast type for styling
 * @param message - The message text to style
 * @returns A React element with styled text
 */
const createStyledMessage = (type: ToastType, message: string): ReactNode => {
  const colorClass = TOAST_COLOR_CLASSES[type];
  return <span className={colorClass}>{message}</span>;
};

/**
 * Creates a default icon for the toast based on its type.
 * @param type - The toast type to create an icon for
 * @returns A React element with a styled Flag icon
 */
const createDefaultIcon = (type: ToastType): ReactNode => {
  const colorClass = TOAST_COLOR_CLASSES[type];
  return <Flag className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />;
};

/**
 * Shows a toast notification using the configured provider.
 *
 * @param type - The type of toast ('success', 'error', 'info', 'warning', 'loading')
 * @param message - The message to display in the toast
 * @param className - Optional CSS class name for custom styling
 * @param icon - Optional custom icon to display
 * @param data - Additional options passed to the toast provider
 * @returns The toast instance ID or result from custom method
 */
export const showToast = ({
  type,
  message,
  className,
  icon,
  data = {},
}: ToastOptions): string | number | void => {
  if (!message?.trim()) {
    console.warn('showToast: Empty message provided');
    return;
  }

  if (!VALID_TOAST_TYPES.includes(type)) {
    console.error(
      `showToast: Invalid toast type '${type}'. Must be one of: ${VALID_TOAST_TYPES.join(', ')}`,
    );
    return;
  }

  if (globalToastSettings.provider === 'custom' && globalToastSettings.customMethods?.[type]) {
    try {
      return globalToastSettings.customMethods[type]!(message, {
        className,
        icon,
        ...data,
      });
    } catch (error) {
      console.error(`showToast: Error in custom ${type} method:`, error);
    }
  }

  const styledMessage = createStyledMessage(type, message);
  const defaultIcon = icon || createDefaultIcon(type);

  const toastOptions: ExternalToast = {
    className,
    icon: defaultIcon,
    ...data,
  };

  try {
    return toast[type](styledMessage, toastOptions);
  } catch (error) {
    console.error(`showToast: Error showing ${type} toast:`, error);
    return toast(message);
  }
};
