import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvisioningCreateTokenModalContent } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-create-token/provisioning-create-token-modal-content';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

describe('ProvisioningCreateTokenModalContent', () => {
  const defaultProps = {
    token: 'test-token-value-12345',
    tokenId: 'token-id-123',
  };

  it('renders the description text', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('renders the token label with tokenId', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);
    expect(screen.getByText(/field.label/)).toBeInTheDocument();
    expect(screen.getByText(/token-id-123/)).toBeInTheDocument();
  });

  it('renders the copyable text field with the token value', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test-token-value-12345');
    expect(input).toHaveAttribute('readonly');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProvisioningCreateTokenModalContent {...defaultProps} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('sets correct aria-label on the input', () => {
    render(<ProvisioningCreateTokenModalContent {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'field.label token-id-123');
  });
});
