import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../../hooks/use-core-client';
import { mockCore, renderWithProviders } from '../../../../../internals';
import type { OrgDeleteModalProps } from '../../../../../types/index';
import { OrgDeleteModal } from '../org-delete-modal';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockOrgDeleteModal = (
  overrides?: Partial<OrgDeleteModalProps>,
): OrgDeleteModalProps => ({
  isOpen: true,
  organizationName: 'New Organization',
  isLoading: false,
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  customMessages: {},
  onDelete: vi.fn(),
  onClose: vi.fn(),
  ...overrides,
});

// ===== Tests =====

describe('OrgDeleteModal', () => {
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
    describe('when close', () => {
      it('should not render anything', () => {
        renderWithProviders(<OrgDeleteModal {...createMockOrgDeleteModal({ isOpen: false })} />);

        expect(screen.queryByText(/modal_title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('customMessages', () => {
    describe('when using a custom message on modal title', () => {
      it('should override modal title', async () => {
        const customMessages = {
          modal_title: 'Delete organization',
        };

        renderWithProviders(<OrgDeleteModal {...createMockOrgDeleteModal({ customMessages })} />);

        expect(screen.getByText('Delete organization')).toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when is true', () => {
      it('should disable delete button', () => {
        renderWithProviders(<OrgDeleteModal {...createMockOrgDeleteModal({ isLoading: true })} />);

        const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('handleConfirmDelete', () => {
    describe('when user clicks delete button and there is no text', () => {
      it('should render an error', async () => {
        const user = userEvent.setup();

        renderWithProviders(<OrgDeleteModal {...createMockOrgDeleteModal()} />);

        // Click delete
        const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
        await user.click(deleteButton);

        expect(screen.getByText('org_name_field_error')).toBeInTheDocument();
      });
    });

    describe('when user clicks delete button and they wrote org name', () => {
      it('should call onDelete', async () => {
        const user = userEvent.setup();

        const mockOnDelete = vi.fn();

        renderWithProviders(
          <OrgDeleteModal {...createMockOrgDeleteModal({ onDelete: mockOnDelete })} />,
        );

        // Write text
        const textField = screen.getByPlaceholderText(/org_name_field_placeholder/i);
        await user.type(textField, 'New Organization');

        // Click delete
        const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
        await user.click(deleteButton);

        expect(mockOnDelete).toHaveBeenCalled();
      });
    });
  });

  describe('handleClose', () => {
    describe('when user clicks cancel button', () => {
      it('calls onClose', async () => {
        const user = userEvent.setup();

        const mockOnClose = vi.fn();

        renderWithProviders(
          <OrgDeleteModal {...createMockOrgDeleteModal({ onClose: mockOnClose })} />,
        );

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
        await user.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});
