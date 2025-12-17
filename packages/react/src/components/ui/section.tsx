import type { ActionButton as CoreActionButton } from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/theme-utils';

import { Button } from './button';
import { Toggle } from './toggle';

export interface BaseActionProps extends Omit<CoreActionButton, 'icon' | 'onClick'> {
  icon?: LucideIcon;
  className?: string;
}

export interface ButtonActionProps extends BaseActionProps {
  type: 'button';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ToggleActionProps extends Omit<BaseActionProps, 'type'> {
  type: 'toggle';
  pressed?: boolean;
  onPressedChange: (pressed: boolean) => void;
  'aria-label': string;
}

export type ActionProps = ButtonActionProps | ToggleActionProps;

interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
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

export function Section({
  title,
  description,
  children,
  actions,
  className,
}: SectionProps): React.JSX.Element {
  const renderAction = (action: ActionProps, index: number) => {
    const key = `action-${index}`;
    return action.type === 'toggle' ? (
      <ToggleAction key={key} {...action} />
    ) : (
      <ButtonAction key={key} {...action} />
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col min-w-0 flex-1 space-y-2">
          {title && (
            <h3
              className={cn(
                'text-lg text-foreground text-(length:--font-size-subtitle) font-semibold mb-1 text-left',
              )}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className={cn(
                'text-sm text-muted-foreground text-left text-(length:--font-size-paragraph)',
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

      <div className="space-y-6">{children}</div>
    </div>
  );
}
