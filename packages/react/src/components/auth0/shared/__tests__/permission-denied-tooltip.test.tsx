import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PermissionDeniedTooltip } from '@/components/auth0/shared/permission-denied-tooltip';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
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
      expect(screen.getAllByText('errors.forbidden').length).toBeGreaterThan(0);
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
      expect(screen.getAllByText('Ask an admin for access').length).toBeGreaterThan(0);
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
