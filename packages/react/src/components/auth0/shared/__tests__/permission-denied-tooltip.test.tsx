import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';
import { lookupTranslationOverride } from '@/tests/utils/test-utilities';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: (_namespace: string, overrides?: Record<string, unknown>) => ({
    t: (key: string) => lookupTranslationOverride(overrides, key) ?? key,
  }),
}));

vi.mock('@/providers/portal-context', () => ({
  usePortalContainer: () => undefined,
}));

describe('PermissionDeniedTooltip', () => {
  it('renders its children', () => {
    render(
      <PermissionDeniedTooltip>
        <button type="button">Delete</button>
      </PermissionDeniedTooltip>,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows the standardized forbidden message on hover', async () => {
    const user = userEvent.setup();
    render(
      <PermissionDeniedTooltip>
        <button type="button" disabled>
          Delete
        </button>
      </PermissionDeniedTooltip>,
    );

    await user.hover(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip', { name: 'error.forbidden' })).toBeInTheDocument();
    });
  });

  it('shows a custom message when provided', async () => {
    const user = userEvent.setup();
    render(
      <PermissionDeniedTooltip customMessage="Ask an admin for access">
        <button type="button" disabled>
          Delete
        </button>
      </PermissionDeniedTooltip>,
    );

    await user.hover(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip', { name: 'Ask an admin for access' })).toBeInTheDocument();
    });
  });

  it('uses the consumer override from the common messages slice', async () => {
    const user = userEvent.setup();
    render(
      <PermissionDeniedTooltip
        customMessages={{ common: { error: { forbidden: 'Ask your admin for access' } } }}
      >
        <button type="button" disabled>
          Delete
        </button>
      </PermissionDeniedTooltip>,
    );

    await user.hover(screen.getByText('Delete'));

    await waitFor(() => {
      expect(
        screen.getByRole('tooltip', { name: 'Ask your admin for access' }),
      ).toBeInTheDocument();
    });
  });

  it('falls back to the bundled message when the slice omits it', async () => {
    const user = userEvent.setup();
    render(
      <PermissionDeniedTooltip customMessages={{ common: {} }}>
        <button type="button" disabled>
          Delete
        </button>
      </PermissionDeniedTooltip>,
    );

    await user.hover(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip', { name: 'error.forbidden' })).toBeInTheDocument();
    });
  });

  it('prefers an explicit customMessage over the messages slice', async () => {
    const user = userEvent.setup();
    render(
      <PermissionDeniedTooltip
        customMessage="Explicit wins"
        customMessages={{ common: { error: { forbidden: 'Slice loses' } } }}
      >
        <button type="button" disabled>
          Delete
        </button>
      </PermissionDeniedTooltip>,
    );

    await user.hover(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip', { name: 'Explicit wins' })).toBeInTheDocument();
    });
  });

  it('renders children without a tooltip trigger when disabled', () => {
    render(
      <PermissionDeniedTooltip enabled={false}>
        <button type="button">Delete</button>
      </PermissionDeniedTooltip>,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(document.querySelector('span[tabindex="0"]')).not.toBeInTheDocument();
  });
});
