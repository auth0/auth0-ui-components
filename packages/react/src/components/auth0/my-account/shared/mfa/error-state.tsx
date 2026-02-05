import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title: string;
  description: string;
  className?: string;
}

export function MFAErrorState({ title, description, className }: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-4 space-y-2', className)}
      role="alert"
      aria-live="assertive"
    >
      <h1
        className="text-base font-medium text-center text-destructive-foreground"
        id="mfa-error-title"
      >
        {title}
      </h1>
      <p className="text-sm text-center text-destructive-foreground whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
