import { cn } from '../../../lib/utils';

interface MFAEmptyStateProps {
  message: string;
  className?: string;
}

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
