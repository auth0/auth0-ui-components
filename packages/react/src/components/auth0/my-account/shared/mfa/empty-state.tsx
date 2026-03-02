/**
 * MFA empty state display.
 * @module empty-state
 * @internal
 */

import { cn } from '@/lib/utils';

interface MFAEmptyStateProps {
  message: string;
  className?: string;
}

/**
 *
 * @param props - Component props.
 * @param props.message - The message to display
 * @param props.className - Optional CSS class name for styling
 * @returns JSX element
 */
export function MFAEmptyState({ message, className }: MFAEmptyStateProps) {
  return (
    <p
      className={cn(
        'text-sm text-(length:--font-size-paragraph) text-center text-muted-foreground',
        className,
      )}
    >
      {message}
    </p>
  );
}
