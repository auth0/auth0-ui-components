import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  mockProvider,
  SsoProvisioningProps,
  mockOnCreateProvisioning,
  mockOnDeleteProvisioning,
  mockOnListScimTokens,
  renderWithProviders,
} from '../../../../../../internals';
import { SsoProvisioningTab } from '../sso-provisioning-tab';

// Mock hooks
const mockUseSsoProviderEdit = vi.fn();

vi.mock('../../../../../../hooks/my-organization/idp-management/use-sso-provider-edit', () => ({
  useSsoProviderEdit: () => mockUseSsoProviderEdit(),
}));

describe('SsoProvisioningTab', () => {
  const renderComponent = (props = {}) => {
    return renderWithProviders(<SsoProvisioningTab {...SsoProvisioningProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the hook mock to return default values
    mockUseSsoProviderEdit.mockReturnValue({
      provisioningConfig: null,
      isProvisioningLoading: false,
      isProvisioningUpdating: false,
      isProvisioningDeleting: false,
      isScimTokensLoading: false,
      isScimTokenCreating: false,
      isScimTokenDeleting: false,
      fetchProvisioning: vi.fn(),
      createProvisioning: mockOnCreateProvisioning,
      deleteProvisioning: mockOnDeleteProvisioning,
      listScimTokens: mockOnListScimTokens,
      createScimToken: vi.fn(),
      deleteScimToken: vi.fn(),
    });

    mockOnCreateProvisioning.mockResolvedValue(undefined);
    mockOnDeleteProvisioning.mockResolvedValue(undefined);
    mockOnListScimTokens.mockResolvedValue({ scim_tokens: [] });
  });

  it('should render toggle switch', () => {
    renderComponent();

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should show unchecked switch when provisioning is disabled', () => {
    renderComponent();

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should disable switch when provider id is missing', () => {
    renderComponent({ provider: { ...mockProvider, id: '' } });

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('should render loading state', () => {
    renderComponent({ isProvisioningLoading: true });

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should render with null provisioningConfig', () => {
    renderComponent({ provisioningConfig: null });

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should render with undefined provisioningConfig', () => {
    renderComponent({ provisioningConfig: undefined });

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should handle provisioning error state', () => {
    renderComponent({ isProvisioningError: true });

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should render with oidc strategy provider', () => {
    const oidcProvider = {
      ...mockProvider,
      strategy: 'oidc' as const,
    };

    renderComponent({ provider: oidcProvider });

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should render with adfs strategy provider', () => {
    const adfsProvider = {
      ...mockProvider,
      strategy: 'adfs' as const,
    };

    renderComponent({ provider: adfsProvider });

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('should render when provider is disabled', () => {
    renderComponent({ provider: { ...mockProvider, is_enabled: false } });

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should not call onProvisioningUpdate when switch is disabled', async () => {
    const onProvisioningUpdate = vi.fn();
    renderComponent({
      provider: { ...mockProvider, id: '' },
      onProvisioningUpdate,
    });

    const switchElement = screen.getByRole('switch');
    await userEvent.click(switchElement);

    expect(onProvisioningUpdate).not.toHaveBeenCalled();
  });
});
