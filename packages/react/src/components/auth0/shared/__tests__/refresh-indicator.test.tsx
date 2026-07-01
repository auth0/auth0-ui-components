import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';

describe('RefreshIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-30T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the refresh button when data is stale', () => {
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('hides the indicator while fetching', () => {
    render(<RefreshIndicator isStale isFetching onRefresh={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });

  it('hides the indicator when data is not stale', () => {
    render(<RefreshIndicator isStale={false} onRefresh={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Refresh' })).not.toBeInTheDocument();
  });

  it('calls onRefresh when the button is clicked', () => {
    const onRefresh = vi.fn();
    render(<RefreshIndicator isStale onRefresh={onRefresh} />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders a relative "last updated" label', () => {
    const lastUpdatedAt = new Date('2026-06-30T11:59:30Z'); // 30s ago
    render(<RefreshIndicator isStale lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />);
    expect(screen.getByText('Last updated', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/30 sec ago/i)).toBeInTheDocument();
  });

  it('keeps the seconds when a minute has already elapsed', () => {
    const lastUpdatedAt = new Date('2026-06-30T11:58:30Z'); // 1 min 30 sec ago
    render(<RefreshIndicator isStale lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />);
    expect(screen.getByText(/1 min 30 sec ago/i)).toBeInTheDocument();
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

  it('supports label overrides', () => {
    render(
      <RefreshIndicator
        isStale
        labels={{ refresh: 'Reload', lastUpdated: 'Updated' }}
        lastUpdatedAt={new Date('2026-06-30T11:59:30Z')}
        onRefresh={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
    expect(screen.getByText('Updated', { exact: false })).toBeInTheDocument();
  });

  it('re-renders the relative time on the configured tick interval', () => {
    render(
      <RefreshIndicator
        isStale
        lastUpdatedAt={new Date('2026-06-30T11:59:55Z')} // 5s ago
        tickIntervalMs={1000}
        onRefresh={vi.fn()}
      />,
    );
    expect(screen.getByText(/5 sec ago/i)).toBeInTheDocument();

    // Advance real elapsed time and fire the tick so the label recomputes.
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText(/15 sec ago/i)).toBeInTheDocument();
  });

  it('exposes a status role for assistive tech', () => {
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not mark the ticking label as a live region', () => {
    // The relative time updates on an interval; a live region would re-announce
    // it on every tick, which is undesirable noise for screen readers.
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.getByRole('status')).not.toHaveAttribute('aria-live');
  });
});
