/**
 * Refresh Indicator component.
 * @module refresh-indicator
 * @internal
 */

import { RefreshCw } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_REFRESH_INDICATOR_TICK_MS } from '@/lib/constants/common-constants';
import { cn } from '@/lib/utils';
import { getRelativeTimeLabel } from '@/lib/utils/shared/helper-utils';

export interface RefreshIndicatorProps {
  lastUpdatedAt?: Date | number | string | null;
  isStale?: boolean;
  isFetching?: boolean;
  className?: string;
  tickIntervalMs?: number;
  onRefresh: () => void;
}

/**
 * Renders a stale-data indicator with a manual refresh button.
 * @param props - {@link RefreshIndicatorProps}
 * @returns The rendered indicator, or `null` when it should be hidden.
 */
export function RefreshIndicator({
  lastUpdatedAt,
  isStale = false,
  isFetching = false,
  className,
  onRefresh,
  tickIntervalMs = DEFAULT_REFRESH_INDICATOR_TICK_MS,
}: RefreshIndicatorProps): React.JSX.Element | null {
  const { t } = useTranslator('common');
  const visible = isStale && !isFetching;
  const timestampMs = lastUpdatedAt == null ? null : new Date(lastUpdatedAt).getTime();
  const hasValidTimestamp = timestampMs != null && !Number.isNaN(timestampMs);

  const [, forceTick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!visible || !hasValidTimestamp || tickIntervalMs <= 0) return;
    const id = setInterval(forceTick, tickIntervalMs);
    return () => clearInterval(id);
  }, [visible, hasValidTimestamp, timestampMs, tickIntervalMs]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn('flex items-center gap-3 text-sm text-muted-foreground', className)}
      role="status"
    >
      {hasValidTimestamp && (
        <span aria-live="off">
          {t('last_updated')}
          {': '}
          {getRelativeTimeLabel(timestampMs, t)}
        </span>
      )}
      <Button type="button" variant="outline" size="default" onClick={onRefresh}>
        <RefreshCw aria-hidden="true" />
        {t('refresh')}
      </Button>
    </div>
  );
}
