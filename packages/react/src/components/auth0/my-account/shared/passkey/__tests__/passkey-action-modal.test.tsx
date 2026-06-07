import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PasskeyActionModal } from '@/components/auth0/my-account/shared/passkey/passkey-action-modal';
import { renderWithProviders, createMockPasskeyActionModalProps } from '@/tests/utils';
import { mockToast } from '@/tests/utils/test-setup';

mockToast();

describe('PasskeyActionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders dialog when open is true', async () => {
      renderWithProviders(<PasskeyActionModal {...createMockPasskeyActionModalProps()} />);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('does not render dialog when open is false', () => {
      renderWithProviders(
        <PasskeyActionModal {...createMockPasskeyActionModalProps({ open: false })} />,
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows consent text in dialog', async () => {
    renderWithProviders(<PasskeyActionModal {...createMockPasskeyActionModalProps()} />);
    expect(await screen.findByText('consent')).toBeInTheDocument();
  });

  it('calls onConfirm without arguments on confirm click', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <PasskeyActionModal {...createMockPasskeyActionModalProps({ onConfirm })} />,
    );

    await user.click(await screen.findByRole('button', { name: 'confirm' }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  });

  it('calls onOpenChange(false) on cancel when not pending', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <PasskeyActionModal {...createMockPasskeyActionModalProps({ onOpenChange })} />,
    );

    await user.click(await screen.findByRole('button', { name: 'cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not call onOpenChange on cancel when isPending', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <PasskeyActionModal
        {...createMockPasskeyActionModalProps({ isPending: true, onOpenChange })}
      />,
    );

    await user.click(await screen.findByRole('button', { name: 'cancel' }));

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('shows loading state and disables cancel when isPending', async () => {
    renderWithProviders(
      <PasskeyActionModal {...createMockPasskeyActionModalProps({ isPending: true })} />,
    );
    expect(await screen.findByRole('button', { name: 'cancel' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'confirm' })).not.toBeInTheDocument();
  });

  describe('custom messages', () => {
    it('uses custom title', async () => {
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({
            customMessages: { title: 'Custom Revoke Title' },
          })}
        />,
      );
      expect(await screen.findByText('Custom Revoke Title')).toBeInTheDocument();
    });
  });
});
