import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvisioningDeleteTokenModalContent } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-delete-token/provisioning-delete-token-modal-content';
import type { ProvisioningDeleteTokenModalContentProps } from '@/types/my-organization/idp-management/sso-provisioning/provisioning-token-types';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, param: ProvisioningDeleteTokenModalContentProps) =>
      key + (param?.tokenId ? ` ${param.tokenId}` : ''),
  }),
}));

describe('ProvisioningDeleteTokenModalContent', () => {
  const defaultProps = {
    tokenId: 'token-id-456',
  };

  it('renders the delete confirmation message', () => {
    render(<ProvisioningDeleteTokenModalContent {...defaultProps} />);
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('displays the tokenId in the content', () => {
    render(<ProvisioningDeleteTokenModalContent {...defaultProps} />);
    expect(screen.getByText(/token-id-456/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ProvisioningDeleteTokenModalContent {...defaultProps} className="custom-delete-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-delete-class');
  });
});
