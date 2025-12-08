import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProvisioningDeleteTokenModal } from '../provisioning-delete-token-modal';
import { ProvisioningDeleteTokenModalContent } from '../provisioning-delete-token-modal-content';

vi.mock('../../../../../../../hooks/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params?.tokenId) return `${key} ${params.tokenId}`;
      return key;
    },
  }),
}));

describe('ProvisioningDeleteTokenModalContent', () => {
  const defaultProps = {
    tokenId: 'token-id-1',
  };

  it('renders the confirmation message with tokenId', () => {
    render(<ProvisioningDeleteTokenModalContent {...defaultProps} />);

    expect(screen.getByText(/confirmation/)).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ProvisioningDeleteTokenModalContent {...defaultProps} />);

    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProvisioningDeleteTokenModalContent {...defaultProps} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ProvisioningDeleteTokenModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    tokenId: 'token-id-1',
    onConfirm: mockOnConfirm,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when open is true', () => {
    render(<ProvisioningDeleteTokenModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render the modal when open is false', () => {
    render(<ProvisioningDeleteTokenModal {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders cancel and delete buttons', () => {
    render(<ProvisioningDeleteTokenModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel_button_label/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete_button_label/i })).toBeInTheDocument();
  });

  it('calls onOpenChange with false when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProvisioningDeleteTokenModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProvisioningDeleteTokenModal {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
    await user.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('disables buttons when isLoading is true', () => {
    render(<ProvisioningDeleteTokenModal {...defaultProps} isLoading={true} />);

    const cancelButton = screen.getByRole('button', { name: /delete_modal.cancel_button_label/i });
    const deleteButton = screen.getByRole('button', { name: /delete_modal.cancel_button_label/i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('handles null tokenId gracefully', () => {
    render(<ProvisioningDeleteTokenModal {...defaultProps} tokenId={null} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
