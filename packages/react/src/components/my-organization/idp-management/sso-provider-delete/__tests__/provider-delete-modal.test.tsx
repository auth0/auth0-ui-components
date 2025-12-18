import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../../hooks/use-core-client';
import { createMockSsoProvider, mockCore, renderWithProviders } from '../../../../../internals';
import type { SsoProviderDeleteModalProps } from '../../../../../types/my-org/idp-management/sso-provider/sso-provider-delete-types';
import { SsoProviderDeleteModal } from '../provider-delete-modal';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockDeleteModal = (
  overrides?: Partial<SsoProviderDeleteModalProps>,
): SsoProviderDeleteModalProps => ({
  isOpen: true,
  provider: createMockSsoProvider(),
  isLoading: false,
  customMessages: {},
  onDelete: vi.fn(),
  onClose: vi.fn(),
  ...overrides,
});

// ===== Tests =====

describe('SsoProviderDeleteModal', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize fresh mock client for each test
    mockCoreClient = initMockCoreClient();

    // Mock hooks
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('isOpen', () => {
    describe('when closed', () => {
      it('should not render anything', () => {
        renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ isOpen: false })} />,
        );

        expect(screen.queryByText(/modal.title/i)).not.toBeInTheDocument();
      });
    });

    describe('when open', () => {
      it('should render modal with provider name', () => {
        const provider = createMockSsoProvider({ name: 'test-provider' });
        renderWithProviders(<SsoProviderDeleteModal {...createMockDeleteModal({ provider })} />);

        expect(screen.getByText(/modal.title/i)).toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    describe('when using a custom message on modal title', () => {
      it('should override modal title', async () => {
        const customMessages = {
          modal: {
            title: 'Delete SSO Provider',
            content: {
              field: {},
            },
          },
        };

        renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ customMessages })} />,
        );

        expect(screen.getByText('Delete SSO Provider')).toBeInTheDocument();
      });
    });

    describe('when using a custom message on description', () => {
      it('should override modal description', async () => {
        const customMessages = {
          modal: {
            description: 'Are you sure you want to delete this provider?',
            content: {
              field: {},
            },
          },
        };

        renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ customMessages })} />,
        );

        expect(
          screen.getByText('Are you sure you want to delete this provider?'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is false', () => {
      it('should enable delete button if confirmation text matches', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ provider, isLoading: false })} />,
        );

        // Type the provider name
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        const deleteButton = screen.getByRole('button', {
          name: /modal.actions.delete_button_label/i,
        });
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });

  describe('confirmation text validation', () => {
    describe('when confirmation text does not match provider name', () => {
      it('should disable delete button', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(<SsoProviderDeleteModal {...createMockDeleteModal({ provider })} />);

        // Type incorrect text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'wrong-name');

        const deleteButton = screen.getByRole('button', {
          name: /modal.actions.delete_button_label/i,
        });
        expect(deleteButton).toBeDisabled();
      });
    });

    describe('when confirmation text matches provider name', () => {
      it('should enable delete button', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(<SsoProviderDeleteModal {...createMockDeleteModal({ provider })} />);

        // Type correct text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        const deleteButton = screen.getByRole('button', {
          name: /modal.actions.delete_button_label/i,
        });
        expect(deleteButton).not.toBeDisabled();
      });
    });
  });

  describe('handleDelete', () => {
    describe('when user clicks delete button with valid confirmation', () => {
      it('should call onDelete with provider', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const mockOnDelete = vi.fn();

        renderWithProviders(
          <SsoProviderDeleteModal
            {...createMockDeleteModal({ provider, onDelete: mockOnDelete })}
          />,
        );

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Click delete
        const deleteButton = screen.getByRole('button', {
          name: /modal.actions.delete_button_label/i,
        });
        await user.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalledWith(provider);
      });

      it('should call onClose after delete', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const mockOnClose = vi.fn();

        renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ provider, onClose: mockOnClose })} />,
        );

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Click delete
        const deleteButton = screen.getByRole('button', {
          name: /modal.actions.delete_button_label/i,
        });
        await user.click(deleteButton);

        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('handleClose', () => {
    describe('when user clicks cancel button', () => {
      it('calls onClose', async () => {
        const user = userEvent.setup();
        const mockOnClose = vi.fn();

        renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ onClose: mockOnClose })} />,
        );

        // Click cancel
        const cancelButton = screen.getByRole('button', {
          name: /modal.actions.cancel_button_label/i,
        });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('modal state reset', () => {
    describe('when modal is reopened', () => {
      it('should reset confirmation text', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const { rerender } = renderWithProviders(
          <SsoProviderDeleteModal {...createMockDeleteModal({ provider, isOpen: true })} />,
        );

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Close modal
        rerender(
          <SsoProviderDeleteModal {...createMockDeleteModal({ provider, isOpen: false })} />,
        );

        // Reopen modal
        rerender(<SsoProviderDeleteModal {...createMockDeleteModal({ provider, isOpen: true })} />);

        // Confirmation text should be cleared
        const newTextField = screen.getByPlaceholderText('field.placeholder');
        expect(newTextField).toHaveValue('');
      });
    });
  });
});
