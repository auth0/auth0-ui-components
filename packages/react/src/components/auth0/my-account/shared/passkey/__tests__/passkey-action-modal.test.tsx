import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PasskeyActionModal } from '@/components/auth0/my-account/shared/passkey/passkey-action-modal';
import {
  renderWithProviders,
  TestProvider,
  createMockPasskeyActionModalProps,
} from '@/tests/utils';
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

  describe('revoke mode', () => {
    it('shows consent text in dialog', async () => {
      renderWithProviders(
        <PasskeyActionModal {...createMockPasskeyActionModalProps({ mode: 'revoke' })} />,
      );
      expect(await screen.findByText('consent')).toBeInTheDocument();
    });

    it('calls onConfirm without arguments on confirm click', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'revoke', onConfirm })}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'confirm' }));

      await waitFor(() => expect(onConfirm).toHaveBeenCalledWith());
    });

    it('calls onOpenChange(false) on cancel when not pending', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'revoke', onOpenChange })}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'cancel' }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not call onOpenChange on cancel when isPending', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'revoke', isPending: true, onOpenChange })}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'cancel' }));

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('shows loading state and disables cancel when isPending', async () => {
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'revoke', isPending: true })}
        />,
      );
      expect(await screen.findByRole('button', { name: 'cancel' })).toBeDisabled();
      expect(screen.queryByRole('button', { name: 'confirm' })).not.toBeInTheDocument();
    });

    it('does not close modal when onConfirm rejects', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockRejectedValue(new Error('network error'));
      const onOpenChange = vi.fn();
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'revoke', onConfirm, onOpenChange })}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'confirm' }));

      await waitFor(() => expect(onConfirm).toHaveBeenCalled());
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('rename mode', () => {
    it('shows name input pre-filled and update/cancel buttons', async () => {
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'rename', name: 'My Key' })}
        />,
      );
      expect(await screen.findByRole('textbox')).toHaveValue('My Key');
      expect(screen.getByRole('button', { name: 'update' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument();
    });

    it('calls onConfirm with trimmed name on confirm click', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'rename', name: 'My Key', onConfirm })}
        />,
      );

      const input = await screen.findByRole('textbox');
      await user.clear(input);
      await user.type(input, '  Work Key  ');
      await user.click(screen.getByRole('button', { name: 'update' }));

      await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('Work Key'));
    });

    it('disables update button when name is empty', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode: 'rename', name: 'My Key' })}
        />,
      );

      await user.clear(await screen.findByRole('textbox'));

      expect(screen.getByRole('button', { name: 'update' })).toBeDisabled();
    });

    it('resets name input when modal re-opens', async () => {
      const user = userEvent.setup();
      const props = createMockPasskeyActionModalProps({ mode: 'rename', name: 'Original' });
      const { rerender } = renderWithProviders(<PasskeyActionModal {...props} />);

      await user.clear(await screen.findByRole('textbox'));
      await user.type(screen.getByRole('textbox'), 'Changed');

      rerender(
        <TestProvider>
          <PasskeyActionModal {...props} open={false} />
        </TestProvider>,
      );
      rerender(
        <TestProvider>
          <PasskeyActionModal {...props} open={true} />
        </TestProvider>,
      );

      expect(await screen.findByRole('textbox')).toHaveValue('Original');
    });

    it('disables input and cancel, hides update text when isPending', async () => {
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({
            mode: 'rename',
            isPending: true,
            name: 'My Key',
          })}
        />,
      );
      expect(await screen.findByRole('textbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'cancel' })).toBeDisabled();
      expect(screen.queryByRole('button', { name: 'update' })).not.toBeInTheDocument();
    });
  });

  describe('custom messages', () => {
    it.each([
      ['revoke', 'Custom Revoke Title'],
      ['rename', 'Custom Rename Title'],
    ] as const)('uses custom title for %s mode', async (mode, title) => {
      renderWithProviders(
        <PasskeyActionModal
          {...createMockPasskeyActionModalProps({ mode, customMessages: { title } })}
        />,
      );
      expect(await screen.findByText(title)).toBeInTheDocument();
    });
  });
});
