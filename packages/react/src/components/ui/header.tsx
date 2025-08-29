import * as React from 'react';
import { ActionButton as CoreActionButton } from '@auth0-web-ui-components/core';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/theme-utils';

export interface ActionButtonProps extends Omit<CoreActionButton, 'icon' | 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface HeaderProps {
  title?: string;
  description?: string;
  backButton?: {
    text?: string;
    icon?: LucideIcon;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  actions?: ActionButtonProps[];
  className?: string;
}

export const Header = React.forwardRef<
  HTMLDivElement,
  HeaderProps & React.HTMLAttributes<HTMLDivElement>
>(({ title, description, backButton, actions, className, ...props }, ref) => {
  const BackIcon = backButton?.icon || ArrowLeft;

  return (
    <div
      ref={ref}
      className={cn('w-full p-4 sm:p-0 mb-8', className)}
      role="banner"
      aria-label={`${title} header`}
      {...props}
    >
      {backButton && (
        <Button
          variant="link"
          onClick={backButton.onClick}
          size="default"
          className="flex items-center text-sm mb-3"
          aria-label={backButton.text || 'Go back'}
        >
          <BackIcon className="h-4 w-4" aria-hidden="true" />
          {backButton.text && <span>{backButton.text}</span>}
        </Button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col space-y-2 min-w-0 flex-1">
          {title && (
            <h1
              className={cn(
                'text-xl sm:text-2xl md:text-4xl  text-(length:--font-size-page-header) font-bold text-foreground leading-tight break-words text-left',
              )}
            >
              {title}
            </h1>
          )}

          {description && (
            <p
              className={cn(
                'text-base text-(length:--font-size-page-description) text-muted-foreground leading-relaxed break-words text-left',
              )}
            >
              {description}
            </p>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-2">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  size={action.size}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="flex items-center gap-2 w-full sm:w-auto sm:min-w-fit"
                  aria-label={action.label}
                >
                  {ActionIcon && (
                    <ActionIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{action.label}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

Header.displayName = 'Header';
