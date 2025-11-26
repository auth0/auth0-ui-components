import type { ActionButton as CoreActionButton } from '@auth0/web-ui-components-core';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/theme-utils';

import { Button } from './button';
import { Spinner } from './spinner';
import { Switch } from './switch';

export interface BaseActionProps extends Omit<CoreActionButton, 'icon' | 'onClick'> {
  icon?: LucideIcon;
  className?: string;
}

export interface ButtonActionProps extends BaseActionProps {
  type: 'button';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface SwitchActionProps extends Omit<BaseActionProps, 'type' | 'label'> {
  type: 'switch';
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  'aria-label'?: string;
}

export type ActionProps = ButtonActionProps | SwitchActionProps;

export interface HeaderProps {
  title?: string;
  description?: string;
  backButton?: {
    text?: string;
    icon?: LucideIcon;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  actions?: ActionProps[];
  isLoading?: boolean;
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

const SwitchAction: React.FC<SwitchActionProps> = ({
  className,
  'aria-label': ariaLabel,
  checked,
  onCheckedChange,
  disabled,
}) => (
  <div className={cn('flex items-center gap-2', className)}>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel}
    />
  </div>
);

export const Header = React.forwardRef<
  HTMLDivElement,
  HeaderProps & React.HTMLAttributes<HTMLDivElement>
>(({ title, description, backButton, actions, isLoading, className, ...props }, ref) => {
  const BackIcon = backButton?.icon || ArrowLeft;

  const renderAction = (action: ActionProps, index: number) => {
    const key = `action-${index}`;
    if (isLoading) {
      return <Spinner className="w-4 h-4" />;
    }
    return action.type === 'switch' ? (
      <SwitchAction key={key} {...action} />
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
                'text-xl sm:text-2xl text-primary md:text-4xl font-bold leading-tight break-words text-left text-(length:--font-size-page-header) mb-0',
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
