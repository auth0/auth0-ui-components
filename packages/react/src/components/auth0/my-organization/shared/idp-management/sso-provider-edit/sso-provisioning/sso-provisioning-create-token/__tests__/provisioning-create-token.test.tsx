import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProvisioningCreateTokenModal } from '../provisioning-create-token-modal';
import { ProvisioningCreateTokenModalContent } from '../provisioning-create-token-modal-content';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (params?.tokenId) return `${key} ${params.tokenId}`;
      return key;
    },
  }),
}));

describe('ProvisioningCreateTokenModalContent', () => {
  const defaultProps = {
    token: 'test-token-value-123',
    tokenId: 'token-id-1',
  };

  it('renders the token description', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);

    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('renders the token field with label and tokenId', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);

    expect(screen.getByText(/field.label/)).toBeInTheDocument();
    expect(screen.getByText(/token-id-1/)).toBeInTheDocument();
  });

  it('renders the copyable text field with the token value', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test-token-value-123');
    expect(input).toHaveAttribute('readonly');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProvisioningCreateTokenModalContent {...defaultProps} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ProvisioningCreateTokenModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockClipboard = { writeText: vi.fn() };

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    createdToken: {
      token: 'created-token-123',
      token_id: 'token-id-1',
      created_at: '2024-01-01T00:00:00.000Z',
    },
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: mockClipboard });
  });

  it('renders the modal when open is true', () => {
    render(<ProvisioningCreateTokenModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render the modal when open is false', () => {
    render(<ProvisioningCreateTokenModal {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the copy and close button', () => {
    render(<ProvisioningCreateTokenModal {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /create_modal.copy_and_close_button_label/i }),
    ).toBeInTheDocument();
  });
});
