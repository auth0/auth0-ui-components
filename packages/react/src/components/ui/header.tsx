import * as React from 'react';
import { ActionButton as CoreActionButton } from '@auth0-web-ui-components/core';
import { ArrowLeft, LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toogle';
import { cn } from '@/lib/theme-utils';

export interface BaseActionProps extends Omit<CoreActionButton, 'icon' | 'onClick'> {
  icon?: LucideIcon;
  className?: string;
}

export interface ButtonActionProps extends BaseActionProps {
  type: 'button';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ToggleActionProps extends BaseActionProps {
  type: 'toggle';
  pressed?: boolean;
  onPressedChange: (pressed: boolean) => void;
  'aria-label': string;
}

export type ActionProps = ButtonActionProps | ToggleActionProps;

export interface HeaderProps {
  title?: string;
  description?: string;
  backButton?: {
    text?: string;
    icon?: LucideIcon;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  actions?: ActionProps[];
  className?: string;
}

const ButtonAction: React.FC<ButtonActionProps> = ({
  icon: Icon,
  className,
  label,
  onClick,
  disabled,
  variant,
  size,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    variant={variant}
    size={size}
    className={cn('flex items-center gap-2 w-full sm:w-auto sm:min-w-fit', className)}
    aria-label={label}
  >
    {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
    <span className="truncate">{label}</span>
  </Button>
);

const ToggleAction: React.FC<ToggleActionProps> = ({
  icon: Icon,
  className,
  label,
  'aria-label': ariaLabel,
  pressed,
  onPressedChange,
  disabled,
  variant,
  size,
}) => (
  <Toggle
    pressed={pressed}
    onPressedChange={onPressedChange}
    disabled={disabled}
    variant={variant === 'outline' ? 'outline' : 'default'}
    size={size === 'icon' || size === 'xs' ? 'sm' : size}
    className={cn('flex items-center gap-2', className)}
    aria-label={ariaLabel}
  >
    {Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
    {label && <span className="truncate">{label}</span>}
  </Toggle>
);

export const Header = React.forwardRef<
  HTMLDivElement,
  HeaderProps & React.HTMLAttributes<HTMLDivElement>
>(({ title, description, backButton, actions, className, ...props }, ref) => {
  const BackIcon = backButton?.icon || ArrowLeft;

  const renderAction = (action: ActionProps, index: number) => {
    const key = `action-${index}`;
    return action.type === 'toggle' ? (
      <ToggleAction key={key} {...action} />
    ) : (
      <ButtonAction key={key} {...action} />
    );
  };

  return (
    <div
      ref={ref}
      className={cn('w-full mb-8', className)}
      role="banner"
      aria-label={title ? `${title} header` : 'Header'}
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
        <div className="flex flex-col min-w-0 flex-1">
          {title && (
            <h1
              className={cn(
                'text-xl sm:text-2xl md:text-4xl font-bold leading-tight break-words text-left text-(length:--font-size-page-header) mb-0',
              )}
            >
              {title}
            </h1>
          )}
          {description && (
            <p
              className={cn(
                'text-base text-muted-foreground leading-relaxed break-words text-left text-(length:--font-size-page-description) mt-2',
              )}
            >
              {description}
            </p>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="flex-shrink-0 flex items-start gap-2 mt-1">
            {actions.map(renderAction)}
          </div>
        )}
      </div>
    </div>
  );
});

Header.displayName = 'Header';
