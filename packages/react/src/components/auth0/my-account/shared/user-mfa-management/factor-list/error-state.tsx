/**
 * MFA error state display.
 * @module error-state
 * @internal
 */

import { cn } from '@/lib/utils';

/** Props for MFAErrorState component. */
export interface ErrorStateProps {
  title: string;
  description: string;
  className?: string;
}

/**
 * Displays an error state for MFA operations.
 *
 * @param props - Component props.
 * @param props.title - Error title text.
 * @param props.description - Error description text.
 * @param props.className - Additional CSS class names.
 * @returns Error state component.
 * @internal
 */
export function MFAErrorState({ title, description, className }: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-4 space-y-2', className)}
      role="alert"
      aria-live="assertive"
    >
      <p className="text-base font-medium text-center text-destructive-foreground">{title}</p>
      <p className="text-sm text-center text-destructive-foreground whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
