/**
 * Section header with actions.
 * @module header
 * @internal
 */

import type { ActionButton as CoreActionButton } from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode | string;
}

export interface WithTooltipProps {
  trigger: React.ReactNode | string;
  tooltip: TooltipProps;
}

export interface BaseActionProps extends Omit<CoreActionButton, 'icon' | 'onClick'> {
  icon?: LucideIcon;
  className?: string;
  hidden?: boolean;
  tooltip?: TooltipProps;
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
  /** Arbitrary action node rendered in the actions region. Used by compound
   * composition to host a host-replaceable action (e.g. `CreateAction`). */
  actionSlot?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  /**
   * Heading level for the title. Defaults to `2`: this is a section header
   * embedded in a host page, so it must not emit an `<h1>` (the host owns the
   * single page-level `<h1>`). Hosts can override to fit their heading outline.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

const WithTooltip: React.FC<WithTooltipProps> = ({ trigger, tooltip }) => (
  <>
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{trigger}</div>
      </TooltipTrigger>
      <TooltipContent>{tooltip.content}</TooltipContent>
    </Tooltip>
  </>
);

const ButtonAction: React.FC<ButtonActionProps & { busy?: boolean }> = ({
  icon: Icon,
  className,
  label,
  onClick,
  disabled,
  variant,
  size,
  busy,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled || busy}
    aria-busy={busy || undefined}
    variant={variant}
    size={size}
    className={cn('flex items-center gap-2 w-full sm:w-auto sm:min-w-fit', className)}
    aria-label={label}
  >
    {busy ? (
      <Spinner className="h-4 w-4 flex-shrink-0" />
    ) : (
      Icon && <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
    )}
    <span className="truncate">{label}</span>
  </Button>
);

const SwitchAction: React.FC<SwitchActionProps & { busy?: boolean }> = ({
  className,
  'aria-label': ariaLabel,
  checked,
  onCheckedChange,
  disabled,
  busy,
}) => (
  <div className={cn('flex items-center gap-2', className)}>
    {busy && <Spinner className="h-4 w-4 flex-shrink-0" />}
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      aria-label={ariaLabel}
    />
  </div>
);

export const Header = React.forwardRef<
  HTMLDivElement,
  HeaderProps & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      title,
      description,
      backButton,
      actions,
      actionSlot,
      isLoading,
      className,
      headingLevel = 2,
      ...props
    },
    ref,
  ) => {
    const BackIcon = backButton?.icon || ArrowLeft;
    const HeadingTag = `h${headingLevel}` as React.ElementType;

    const renderAction = (action: ActionProps, index: number) => {
      const key = `action-${index}`;
      if (action.hidden) {
        return null;
      }
      // While loading, keep the control mounted and mark it busy/disabled rather
      // than swapping it for a bare spinner — swapping unmounts a focused control
      // (focus is lost to <body>) and never announces the busy state.
      const busy = Boolean(isLoading);
      const actionElement =
        action.type === 'switch' ? (
          <SwitchAction key={key} {...action} busy={busy} />
        ) : (
          <ButtonAction key={key} {...action} busy={busy} />
        );
      if (action.tooltip) {
        return (
          <WithTooltip key={`tooltip-${key}`} trigger={actionElement} tooltip={action.tooltip} />
        );
      }
      return actionElement;
    };

    return (
      // Intentionally not a `banner` landmark: this is a section header embedded
      // in a host page, and `banner` must be reserved for the app shell (one per
      // page). The heading below provides the navigable structure.
      <div ref={ref} className={cn('w-full mb-8', className)} {...props}>
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
              <HeadingTag
                className={cn(
                  'text-primary font-bold leading-tight break-words text-left text-page-header mb-0',
                )}
              >
                {title}
              </HeadingTag>
            )}
            {description && (
              <p
                className={cn(
                  'text-muted-foreground leading-relaxed break-words text-left text-page-description mt-2',
                )}
              >
                {description}
              </p>
            )}
          </div>

          {((actions && actions.length > 0) || actionSlot) && (
            <div className="flex-shrink-0 flex items-start gap-2 mt-1">
              {actions?.map(renderAction)}
              {actionSlot}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Header.displayName = 'Header';
