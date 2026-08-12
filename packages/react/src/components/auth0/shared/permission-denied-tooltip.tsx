/**
 * Tooltip shown on controls the user lacks permission to use.
 * @module permission-denied-tooltip
 * @internal
 */

'use client';

import * as React from 'react';

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';

/** Props for {@link PermissionDeniedTooltip}. */
export interface PermissionDeniedTooltipProps {
  children: React.ReactNode;
  enabled?: boolean;
  customMessage?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Wraps a disabled control with a standardized permission-denied tooltip.
 * @param props - {@link PermissionDeniedTooltipProps}
 * @returns The wrapped control, with a tooltip when `enabled`.
 * @internal
 */
export function PermissionDeniedTooltip({
  children,
  enabled = true,
  customMessage,
  side = 'top',
  className,
}: PermissionDeniedTooltipProps): React.JSX.Element {
  const { t } = useTranslator('common');

  if (!enabled) {
    return <>{children}</>;
  }

  const message = customMessage ?? t('error.forbidden');

  return (
    <Tooltip>
      <TooltipTrigger>
        <span className={cn('inline-flex', className)} tabIndex={0}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} role="tooltip">
        {message}
      </TooltipContent>
    </Tooltip>
  );
}
