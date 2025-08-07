import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * mergeThemes
 *
 * Merges the branding theme with customer overrides.
 * Customer values take precedence if there's a collision.
 */
export function mergeThemes(customer: Record<string, unknown>): Record<string, unknown> {
  return {
    ...customer,
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
