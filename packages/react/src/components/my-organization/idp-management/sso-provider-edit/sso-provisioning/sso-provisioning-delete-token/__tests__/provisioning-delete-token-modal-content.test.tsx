import type { ProvisioningDeleteTokenModalContentProps } from '@react/types/my-org/idp-management/sso-provisioning/provisioning-token-types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvisioningDeleteTokenModalContent } from '../provisioning-delete-token-modal-content';

vi.mock('../../../../../../../hooks/use-translator', () => ({
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
