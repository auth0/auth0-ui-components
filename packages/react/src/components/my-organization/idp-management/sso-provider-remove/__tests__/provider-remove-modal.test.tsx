import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../../hooks/use-core-client';
import { createMockSsoProvider, mockCore, renderWithProviders } from '../../../../../internals';
import type { SsoProviderRemoveFromOrganizationModalProps } from '../../../../../types/my-organization/idp-management/sso-provider/sso-provider-delete-types';
import { SsoProviderRemoveFromOrganizationModal } from '../provider-remove-modal';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockRemoveModal = (
  overrides?: Partial<SsoProviderRemoveFromOrganizationModalProps>,
): SsoProviderRemoveFromOrganizationModalProps => ({
  isOpen: true,
  provider: createMockSsoProvider(),
  organizationName: 'Test Organization',
  isLoading: false,
  customMessages: {},
  onRemove: vi.fn(),
  onClose: vi.fn(),
  ...overrides,
});

// ===== Tests =====

describe('SsoProviderRemoveFromOrganizationModal', () => {
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
          <SsoProviderRemoveFromOrganizationModal {...createMockRemoveModal({ isOpen: false })} />,
        );

        expect(screen.queryByText(/modal.title/i)).not.toBeInTheDocument();
      });
    });

    describe('when open', () => {
      it('should render modal with provider name and organization name', () => {
        const provider = createMockSsoProvider({ name: 'test-provider' });
        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, organizationName: 'Test Organization 1' })}
          />,
        );

        expect(screen.getByText(/modal.title/i)).toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    describe('when using a custom message on modal title', () => {
      it('should override modal title', async () => {
        const customMessages = {
          modal: {
            title: 'Remove SSO Provider from Organization',
            content: {
              field: {},
            },
          },
        };

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal {...createMockRemoveModal({ customMessages })} />,
        );

        expect(screen.getByText('Remove SSO Provider from Organization')).toBeInTheDocument();
      });
    });

    describe('when using a custom message on description', () => {
      it('should override modal description', async () => {
        const customMessages = {
          modal: {
            description: 'Are you sure you want to remove this provider from the organization?',
            content: {
              field: {},
            },
          },
        };

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal {...createMockRemoveModal({ customMessages })} />,
        );

        expect(
          screen.getByText('Are you sure you want to remove this provider from the organization?'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is false', () => {
      it('should enable remove button if confirmation text matches', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, isLoading: false })}
          />,
        );

        // Type the provider name
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        const removeButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        expect(removeButton).not.toBeDisabled();
      });
    });
  });

  describe('confirmation text validation', () => {
    describe('when confirmation text does not match provider name', () => {
      it('should disable remove button', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal {...createMockRemoveModal({ provider })} />,
        );

        // Type incorrect text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'wrong-name');

        const removeButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        expect(removeButton).toBeDisabled();
      });
    });

    describe('when confirmation text matches provider name', () => {
      it('should enable remove button', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal {...createMockRemoveModal({ provider })} />,
        );

        // Type correct text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        const removeButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        expect(removeButton).not.toBeDisabled();
      });
    });
  });

  describe('handleRemove', () => {
    describe('when user clicks remove button with valid confirmation', () => {
      it('should call onRemove with provider', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const mockOnRemove = vi.fn();

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, onRemove: mockOnRemove })}
          />,
        );

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Click remove
        const removeButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        await user.click(removeButton);

        expect(mockOnRemove).toHaveBeenCalledWith(provider);
      });

      it('should call onClose after remove', async () => {
        const user = userEvent.setup();
        const provider = createMockSsoProvider({ name: 'test-provider' });
        const mockOnClose = vi.fn();

        renderWithProviders(
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, onClose: mockOnClose })}
          />,
        );

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Click remove
        const removeButton = screen.getByRole('button', {
          name: /modal.actions.remove_button_text/i,
        });
        await user.click(removeButton);

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
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ onClose: mockOnClose })}
          />,
        );

        // Click cancel
        const cancelButton = screen.getByRole('button', {
          name: /modal.actions.cancel_button_text/i,
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
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, isOpen: true })}
          />,
        );

        // Type confirmation text
        const textField = screen.getByPlaceholderText('field.placeholder');
        await user.type(textField, 'test-provider');

        // Close modal
        rerender(
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, isOpen: false })}
          />,
        );

        // Reopen modal
        rerender(
          <SsoProviderRemoveFromOrganizationModal
            {...createMockRemoveModal({ provider, isOpen: true })}
          />,
        );

        // Confirmation text should be cleared
        const newTextField = screen.getByPlaceholderText('field.placeholder');
        expect(newTextField).toHaveValue('');
      });
    });
  });
});
