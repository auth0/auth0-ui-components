import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';

const TRANSLATIONS: Record<string, string> = {
  last_updated: 'Last updated',
  refresh: 'Refresh',
};

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, vars?: Record<string, unknown>, fallback?: string) => {
      const template = TRANSLATIONS[key] ?? fallback ?? key;
      if (!vars) return template;
      return template.replace(/\$\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
    },
  }),
}));

describe('RefreshIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('enables the refresh button when data is stale', () => {
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  });

  it('disables the refresh button while a refetch is in flight', () => {
    render(<RefreshIndicator isStale isFetching lastUpdatedAt={new Date()} onRefresh={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('hides the indicator during an initial load, before any data has been fetched', () => {
    render(<RefreshIndicator isStale isFetching onRefresh={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows "Just now" instead of the stale time while a refetch is in flight', () => {
    const lastUpdatedAt = new Date('2026-06-30T11:55:00Z'); // 5 min ago
    render(
      <RefreshIndicator isStale isFetching lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />,
    );
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
    expect(screen.queryByText(/ago/i)).not.toBeInTheDocument();
  });

  it('shows a disabled button and a "Just now" label when data is fresh', () => {
    render(<RefreshIndicator isStale={false} lastUpdatedAt={new Date()} onRefresh={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    expect(screen.getByText('Last updated', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it('calls onRefresh when the button is clicked', () => {
    const onRefresh = vi.fn();
    render(<RefreshIndicator isStale onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not call onRefresh when the button is disabled', () => {
    const onRefresh = vi.fn();
    render(
      <RefreshIndicator isStale isFetching lastUpdatedAt={new Date()} onRefresh={onRefresh} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('renders a relative "last updated" label', () => {
    const lastUpdatedAt = new Date('2026-06-30T11:59:30Z'); // 30s ago -> under a minute
    render(<RefreshIndicator isStale lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />);
    expect(screen.getByText('Last updated', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it('renders a minute-granular label once a minute has elapsed', () => {
    const lastUpdatedAt = new Date('2026-06-30T11:58:30Z'); // 1 min 30 sec ago
    render(<RefreshIndicator isStale lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />);
    expect(screen.getByText(/1 minute 30 sec ago/i)).toBeInTheDocument();
  });

  it('omits the timestamp label when lastUpdatedAt is missing', () => {
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.queryByText('Last updated', { exact: false })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('omits the timestamp label when lastUpdatedAt is invalid', () => {
    render(<RefreshIndicator isStale lastUpdatedAt="not-a-date" onRefresh={vi.fn()} />);
    expect(screen.queryByText('Last updated', { exact: false })).not.toBeInTheDocument();
  });

  it('re-renders the relative time on the configured tick interval', () => {
    render(
      <RefreshIndicator
        isStale
        lastUpdatedAt={new Date('2026-06-30T11:59:10Z')} // 50s ago -> under a minute
        tickIntervalMs={1000}
        onRefresh={vi.fn()}
      />,
    );
    expect(screen.getByText(/just now/i)).toBeInTheDocument();

    // Advance elapsed time past the minute boundary and fire the tick so the label recomputes.
    act(() => {
      vi.advanceTimersByTime(15_000); // now 1 min 5 sec ago
    });
    expect(screen.getByText(/1 minute 5 sec ago/i)).toBeInTheDocument();
  });

  it('exposes a status role for assistive tech', () => {
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
