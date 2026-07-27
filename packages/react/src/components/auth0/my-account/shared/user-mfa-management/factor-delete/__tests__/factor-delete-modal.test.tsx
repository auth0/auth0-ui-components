import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

import { FactorDeleteModal } from '@/components/auth0/my-account/shared/user-mfa-management/factor-delete/factor-delete-modal';
import { createMockFactorDeleteModalProps } from '@/tests/utils/__mocks__/my-account/user-mfa-management/factor-delete/factor-delete-modal.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

// ===== Test Suite =====
describe('FactorDeleteModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Dialog visibility', () => {
    it('should render the dialog when open is true', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When dialog is open, should display the modal
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should display confirmation title when open is true', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When dialog is open, should show confirmation title
      expect(
        await screen.findByRole('heading', { name: 'remove_factor_dialog.title' }),
      ).toBeInTheDocument();
    });

    it('should not render the dialog when open is false', () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ open: false })} />,
      );

      // When dialog is closed, should not display modal
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display confirmation message for totp when factor type is provided', async () => {
    renderWithProviders(
      <FactorDeleteModal
        {...createMockFactorDeleteModalProps({
          factorToDelete: { id: '1', type: 'totp' },
        })}
      />,
    );

    // When factor type is totp, should show corresponding message
    expect(await screen.findByText('remove_factor_dialog.consent.totp')).toBeInTheDocument();
  });

  it('should call onCancel callback when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = vi.fn();

    renderWithProviders(
      <FactorDeleteModal {...createMockFactorDeleteModalProps({ onCancel: mockOnCancel })} />,
    );

    const cancelButton = await screen.findByRole('button', { name: 'actions.cancel_button_label' });

    // When cancel button is clicked, should trigger onCancel callback
    await user.click(cancelButton);

    // When onCancel is called, should be invoked exactly once
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm callback when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnConfirm = vi.fn();

    renderWithProviders(
      <FactorDeleteModal
        {...createMockFactorDeleteModalProps({
          onConfirm: mockOnConfirm,
          factorToDelete: { id: 'test-id-123', type: 'totp' },
        })}
      />,
    );

    const confirmButton = await screen.findByRole('button', {
      name: 'actions.confirm_button_label',
    });

    // When confirm button is clicked, should trigger onConfirm callback
    await user.click(confirmButton);

    // When onConfirm is called, should be invoked once
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  describe('Loading state during factor deletion', () => {
    it('should disable cancel button when isDeletingFactor is true', async () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ isDeletingFactor: true })} />,
      );

      const cancelButton = await screen.findByRole('button', {
        name: 'actions.cancel_button_label',
      });
      // When deleting, cancel button should be disabled
      expect(cancelButton).toBeDisabled();
    });

    it('should disable confirm button when isDeletingFactor is true', async () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ isDeletingFactor: true })} />,
      );

      const confirmButton = await screen.findByRole('button', {
        name: 'actions.confirm_button_label',
      });
      // When deleting, confirm button should be disabled
      expect(confirmButton).toBeDisabled();
    });

    it('should display deleting text on confirm button when isDeletingFactor is true', async () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ isDeletingFactor: true })} />,
      );

      // When deleting, should display deleting text
      expect(await screen.findByText('actions.deleting_button_text')).toBeInTheDocument();
    });

    it('should enable cancel button when isDeletingFactor is false', async () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ isDeletingFactor: false })} />,
      );

      const cancelButton = await screen.findByRole('button', {
        name: 'actions.cancel_button_label',
      });
      // When not deleting, cancel button should be enabled
      expect(cancelButton).not.toBeDisabled();
    });

    it('should enable confirm button when isDeletingFactor is false', async () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ isDeletingFactor: false })} />,
      );

      const confirmButton = await screen.findByRole('button', {
        name: 'actions.confirm_button_label',
      });
      // When not deleting, confirm button should be enabled
      expect(confirmButton).not.toBeDisabled();
    });

    it('should display confirm text on confirm button when isDeletingFactor is false', async () => {
      renderWithProviders(
        <FactorDeleteModal {...createMockFactorDeleteModalProps({ isDeletingFactor: false })} />,
      );

      // When not deleting, should display confirm text
      expect(await screen.findByText('actions.confirm_button_label')).toBeInTheDocument();
    });
  });

  describe('Action buttons rendering', () => {
    it('should display cancel button when dialog is rendered', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When dialog is rendered, should display cancel button
      expect(
        await screen.findByRole('button', { name: 'actions.cancel_button_label' }),
      ).toBeInTheDocument();
    });

    it('should display confirm button when dialog is rendered', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When dialog is rendered, should display confirm button
      expect(
        await screen.findByRole('button', { name: 'actions.confirm_button_label' }),
      ).toBeInTheDocument();
    });
  });

  it('should render with custom messages when custom messages are provided', async () => {
    const customMessages = {
      remove_factor_dialog: { title: 'Custom Title' },
    };

    renderWithProviders(
      <FactorDeleteModal {...createMockFactorDeleteModalProps({ customMessages })} />,
    );

    // When custom messages are provided, should display custom title
    expect(await screen.findByRole('heading', { name: 'Custom Title' })).toBeInTheDocument();
  });

  describe('Accessibility features', () => {
    it('should have proper dialog semantics when modal is open', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When modal is open, should have dialog role
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible title when modal is open', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When modal is open, should display accessible title
      expect(
        await screen.findByRole('heading', { name: 'remove_factor_dialog.title' }),
      ).toBeInTheDocument();
    });

    it('should have accessible buttons with aria-labels when modal is open', async () => {
      renderWithProviders(<FactorDeleteModal {...createMockFactorDeleteModalProps()} />);

      // When modal is open, buttons should have aria-labels
      expect(
        await screen.findByRole('button', { name: 'actions.cancel_button_label' }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: 'actions.confirm_button_label' }),
      ).toBeInTheDocument();
    });
  });
});
