import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DomainDiscoveryModal } from '@/components/auth0/my-organization/shared/domain-management/domain-discovery/domain-discovery-modal';
import { createMockDomain } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { DomainDiscoveryModalProps } from '@/types/my-organization/domain-management/domain-discovery-types';

const createProps = (
  overrides: Partial<DomainDiscoveryModalProps> = {},
): DomainDiscoveryModalProps => ({
  domain: createMockDomain({ domain: 'test.com', status: 'verified' }),
  isOpen: true,
  isLoading: false,
  onClose: vi.fn(),
  onEnable: vi.fn(),
  ...overrides,
});

describe('DomainDiscoveryModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the question and both choices', () => {
    renderWithProviders(<DomainDiscoveryModal {...createProps()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.use_button_text' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.not_now_button_text' })).toBeInTheDocument();
  });

  it('is a dialog with a name and a description for assistive technology', () => {
    renderWithProviders(<DomainDiscoveryModal {...createProps()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('title');
    expect(dialog).toHaveAccessibleDescription('description');
  });

  it('does not render when closed', () => {
    renderWithProviders(<DomainDiscoveryModal {...createProps({ isOpen: false })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('passes the verified domain to onEnable when the user opts in', async () => {
    const user = userEvent.setup();
    const props = createProps();
    renderWithProviders(<DomainDiscoveryModal {...props} />);

    await user.click(screen.getByRole('button', { name: 'actions.use_button_text' }));

    expect(props.onEnable).toHaveBeenCalledTimes(1);
    expect(props.onEnable).toHaveBeenCalledWith(props.domain);
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('closes without changing anything on "Not now"', async () => {
    const user = userEvent.setup();
    const props = createProps();
    renderWithProviders(<DomainDiscoveryModal {...props} />);

    await user.click(screen.getByRole('button', { name: 'actions.not_now_button_text' }));

    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onEnable).not.toHaveBeenCalled();
  });

  it('does not call onEnable without a domain', async () => {
    const user = userEvent.setup();
    const props = createProps({ domain: null });
    renderWithProviders(<DomainDiscoveryModal {...props} />);

    await user.click(screen.getByRole('button', { name: 'actions.use_button_text' }));

    expect(props.onEnable).not.toHaveBeenCalled();
  });
});
