/**
 * Refresh Indicator component.
 * @module refresh-indicator
 * @internal
 */

import {
  formatRelativeTime,
  DEFAULT_REFRESH_INDICATOR_TICK_MS,
} from '@auth0/universal-components-core';
import { RefreshCw } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface RefreshIndicatorLabels {
  lastUpdated: string;
  refresh: string;
}

export const defaultRefreshIndicatorLabels: RefreshIndicatorLabels = {
  lastUpdated: 'Last updated',
  refresh: 'Refresh',
};

export interface RefreshIndicatorProps {
  lastUpdatedAt?: Date | number | string | null;
  isStale?: boolean;
  isFetching?: boolean;
  onRefresh: () => void;
  labels?: Partial<RefreshIndicatorLabels>;
  tickIntervalMs?: number;
  className?: string;
}

/**
 * Renders a stale-data indicator with a manual refresh button.
 * @param props - {@link RefreshIndicatorProps}
 * @returns The rendered indicator, or `null` when it should be hidden.
 */
export function RefreshIndicator({
  lastUpdatedAt,
  isStale = true,
  isFetching = false,
  onRefresh,
  labels,
  tickIntervalMs = DEFAULT_REFRESH_INDICATOR_TICK_MS,
  className,
}: RefreshIndicatorProps): React.JSX.Element | null {
  const resolvedLabels = { ...defaultRefreshIndicatorLabels, ...labels };
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
        <span>
          {resolvedLabels.lastUpdated}
          {': '}
          {formatRelativeTime(timestampMs, Date.now())}
        </span>
      )}
      <Button type="button" variant="outline" size="default" onClick={onRefresh}>
        <RefreshCw aria-hidden="true" />
        {resolvedLabels.refresh}
      </Button>
    </div>
  );
}
