import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { lookupTranslationOverride } from '@/tests/utils/test-utilities';

const TRANSLATIONS: Record<string, string> = {
  last_updated: 'Last updated',
  refresh: 'Refresh',
};

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: (_namespace: string, overrides?: Record<string, unknown>) => ({
    t: (key: string, vars?: Record<string, unknown>, fallback?: string) => {
      const template =
        lookupTranslationOverride(overrides, key) ?? TRANSLATIONS[key] ?? fallback ?? key;
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
        lastUpdatedAt={new Date('2026-06-30T11:59:10Z')}
        tickIntervalMs={1000}
        onRefresh={vi.fn()}
      />,
    );
    expect(screen.getByText(/just now/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(screen.getByText(/1 minute 5 sec ago/i)).toBeInTheDocument();
  });

  it('exposes a status role for assistive tech', () => {
    render(<RefreshIndicator isStale onRefresh={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  describe('disabled prop', () => {
    it('disables the refresh button when disabled is true, even if data is stale', () => {
      render(<RefreshIndicator isStale disabled onRefresh={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    });

    it('does not call onRefresh when disabled is true', () => {
      const onRefresh = vi.fn();
      render(<RefreshIndicator isStale disabled onRefresh={onRefresh} />);
      fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
      expect(onRefresh).not.toHaveBeenCalled();
    });

    it('enables the refresh button when disabled is false and data is stale', () => {
      render(<RefreshIndicator isStale disabled={false} onRefresh={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
    });

    it('shows a custom forbidden message from customMessages when the button is disabled', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(
        <RefreshIndicator
          isStale
          disabled
          customMessages={{ common: { error: { forbidden: 'You need read access to refresh' } } }}
          onRefresh={vi.fn()}
        />,
      );

      await user.hover(screen.getByRole('button', { name: 'Refresh' }));

      await waitFor(() => {
        expect(
          screen.getByRole('tooltip', { name: 'You need read access to refresh' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('pagination and refetch jitter', () => {
    it('stays visible during pagination when lastUpdatedAt is temporarily reset', () => {
      const { rerender } = render(
        <RefreshIndicator
          isStale
          lastUpdatedAt={new Date('2026-06-30T11:58:00Z')}
          onRefresh={vi.fn()}
        />,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(
        <RefreshIndicator isStale isFetching lastUpdatedAt={undefined} onRefresh={vi.fn()} />,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    });

    it('stays visible during a manual refresh when lastUpdatedAt remains valid', () => {
      const lastUpdatedAt = new Date('2026-06-30T11:58:00Z');
      const { rerender } = render(
        <RefreshIndicator isStale lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />,
      );

      rerender(
        <RefreshIndicator isStale isFetching lastUpdatedAt={lastUpdatedAt} onRefresh={vi.fn()} />,
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled();
    });
  });
});
