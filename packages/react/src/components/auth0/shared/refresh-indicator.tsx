/**
 * Refresh Indicator component.
 * @module refresh-indicator
 * @internal
 */

import type { SharedMessages } from '@auth0/universal-components-core';
import { RefreshCw } from 'lucide-react';
import * as React from 'react';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_REFRESH_INDICATOR_TICK_MS } from '@/lib/constants/common-constants';
import { cn } from '@/lib/utils';
import { getRelativeTimeLabel } from '@/lib/utils/shared/helper-utils';

export interface RefreshIndicatorProps {
  lastUpdatedAt?: Date | number | string | null;
  isStale?: boolean;
  isFetching?: boolean;
  disabled?: boolean;
  className?: string;
  tickIntervalMs?: number;
  onRefresh: () => void;
  customMessages?: SharedMessages;
}

/**
 * Renders a last-updated indicator with a manual refresh button.
 * @param props - {@link RefreshIndicatorProps}
 * @returns The rendered indicator
 */
export function RefreshIndicator({
  lastUpdatedAt,
  isStale = false,
  isFetching = false,
  disabled = false,
  className,
  onRefresh,
  customMessages,
  tickIntervalMs = DEFAULT_REFRESH_INDICATOR_TICK_MS,
}: RefreshIndicatorProps): React.JSX.Element | null {
  const { t } = useTranslator('common', customMessages?.common);
  const timestampMs = lastUpdatedAt == null ? null : new Date(lastUpdatedAt).getTime();
  const hasValidTimestamp = timestampMs != null && !Number.isNaN(timestampMs);

  const hasEverHadData = React.useRef(hasValidTimestamp);
  if (hasValidTimestamp) hasEverHadData.current = true;

  const isInitialLoad = isFetching && !hasEverHadData.current;

  const showStaleLabel = isStale && !isFetching;
  const label = showStaleLabel
    ? hasValidTimestamp
      ? getRelativeTimeLabel(timestampMs, t)
      : null
    : t('time.just_now', undefined, 'Just now');

  const shouldTick = showStaleLabel && hasValidTimestamp;
  const [, forceTick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!shouldTick || tickIntervalMs <= 0) return;
    const id = setInterval(forceTick, tickIntervalMs);
    return () => clearInterval(id);
  }, [shouldTick, timestampMs, tickIntervalMs]);

  if (isInitialLoad) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center gap-3 text-sm text-muted-foreground', className)}
      role="status"
    >
      {label != null && (
        <span aria-live="off">
          {t('last_updated')}
          {': '}
          {label}
        </span>
      )}
      <PermissionDeniedTooltip enabled={disabled} customMessages={customMessages}>
        <Button
          type="button"
          variant="outline"
          size="default"
          disabled={disabled || !isStale || isFetching}
          onClick={onRefresh}
        >
          <RefreshCw aria-hidden="true" />
          {t('refresh')}
        </Button>
      </PermissionDeniedTooltip>
    </div>
  );
}
