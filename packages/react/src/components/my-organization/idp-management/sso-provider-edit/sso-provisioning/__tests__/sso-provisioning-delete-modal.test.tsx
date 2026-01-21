import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createMockI18nService } from '../../../../../../internals/__mocks__/core/i18n-service.mocks';
import { SsoProvisioningDeleteModal } from '../sso-provisioning-delete-modal';

describe('SsoProvisioningDeleteModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onConfirm: mockOnConfirm,
    isLoading: false,
  };

  // Mock hooks
  vi.mock('../../../../../../hooks/use-translator', () => ({
    useTranslator: () => ({
      t: createMockI18nService().translator('idp_management.sso_provisioning.delete_modal'),
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: 'en',
    }),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal with correct title and description', () => {
    render(<SsoProvisioningDeleteModal {...defaultProps} />);

    expect(screen.getByText('modal.title')).toBeInTheDocument();
    expect(screen.getByText('modal.content.description')).toBeInTheDocument();
  });

  it('should render cancel and delete buttons', () => {
    render(<SsoProvisioningDeleteModal {...defaultProps} />);

    expect(screen.getByText('modal.actions.cancel_button_label')).toBeInTheDocument();
    expect(screen.getByText('modal.actions.delete_button_label')).toBeInTheDocument();
  });

  it('should call onOpenChange with false when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<SsoProvisioningDeleteModal {...defaultProps} />);

    const cancelButton = screen.getByText('modal.actions.cancel_button_label');

    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should call onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<SsoProvisioningDeleteModal {...defaultProps} />);

    const deleteButton = screen.getByText('modal.actions.delete_button_label');

    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('should disable buttons when isLoading is true', () => {
    render(<SsoProvisioningDeleteModal {...defaultProps} isLoading={true} />);

    const cancelButton = screen.getByText('modal.actions.cancel_button_label');
    expect(cancelButton).toBeDisabled();
  });

  it('should not render modal when open is false', () => {
    render(<SsoProvisioningDeleteModal {...defaultProps} open={false} />);
    expect(screen.queryByText('modal.title')).not.toBeInTheDocument();
  });
});
