/**
 * Tailwind CSS utility functions.
 * @module utils
 * @internal
 */

import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Without this, e.g. `cn('text-primary-foreground', 'text-heading')` drops the color class.
 * Fix: register these as their own font-size group so they no longer conflict with text-color.
 */
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-page-header',
        'text-page-description',
        'text-heading',
        'text-title',
        'text-subtitle',
        'text-body',
        'text-paragraph',
        'text-label',
      ],
    },
  },
});

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * @param inputs - Input values to process
 * @returns The merged class name string
 * @internal
 */
export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
