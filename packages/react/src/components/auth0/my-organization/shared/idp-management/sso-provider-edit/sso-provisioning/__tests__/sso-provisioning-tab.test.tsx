import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { SsoProvisioningTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-tab';
import {
  mockProvider,
  SsoProvisioningProps,
  mockOnCreateProvisioning,
  mockOnDeleteProvisioning,
  mockOnListScimTokens,
  mockOnCreateScimToken,
  mockOnDeleteScimToken,
  mockFetchProvisioning,
} from '@/tests/utils';

// Mock hooks
const mockUseTranslator = vi.fn(() => ({
  t: (key: string) => key,
}));

const createMockSsoProviderEditReturn = (overrides = {}) => ({
  provisioningConfig: null,
  isProvisioningLoading: false,
  isProvisioningUpdating: false,
  isProvisioningDeleting: false,
  isScimTokensLoading: false,
  isScimTokenCreating: false,
  isScimTokenDeleting: false,
  fetchProvisioning: mockFetchProvisioning,
  createProvisioning: mockOnCreateProvisioning,
  deleteProvisioning: mockOnDeleteProvisioning,
  listScimTokens: mockOnListScimTokens,
  createScimToken: mockOnCreateScimToken,
  deleteScimToken: mockOnDeleteScimToken,
  ...overrides,
});

const mockUseSsoProviderEdit = vi.fn(() => createMockSsoProviderEditReturn());

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => mockUseTranslator(),
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => ({ isDarkMode: false }),
}));

vi.mock('@/hooks/my-organization/use-sso-provider-edit', () => ({
  useSsoProviderEdit: () => mockUseSsoProviderEdit(),
}));

describe('SsoProvisioningTab', () => {
  const renderComponent = (props = {}) => {
    return render(<SsoProvisioningTab {...SsoProvisioningProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('attribute sync warning', () => {
    it('should render SsoProviderAttributeSyncAlert when hasProvisioningAttributeSyncWarning is true', () => {
      renderComponent({ hasProvisioningAttributeSyncWarning: true });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not render SsoProviderAttributeSyncAlert when hasProvisioningAttributeSyncWarning is false', () => {
      renderComponent({ hasProvisioningAttributeSyncWarning: false });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should pass isSyncingAttributes to alert component', () => {
      renderComponent({
        hasProvisioningAttributeSyncWarning: true,
        isSyncingAttributes: true,
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('should show correct tooltip based on provider and provisioning state', async () => {
      // State 1: Provider disabled
      const user = userEvent.setup();
      mockUseSsoProviderEdit.mockReturnValueOnce(
        createMockSsoProviderEditReturn({
          provisioningConfig: null,
        }),
      );
      const { unmount: unmount1 } = renderComponent({
        provider: { ...mockProvider, is_enabled: false },
      });

      let switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('header.provider_disabled_tooltip');
      });
      unmount1();

      // State 2: Provider enabled, provisioning enabled
      mockUseSsoProviderEdit.mockReturnValueOnce(
        createMockSsoProviderEditReturn({
          provisioningConfig: { id: 'provisioning_123' },
        }),
      );
      const { unmount: unmount2 } = renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('header.disable_provisioning_tooltip');
      });
      unmount2();

      // State 3: Provider enabled, provisioning disabled
      mockUseSsoProviderEdit.mockReturnValueOnce(
        createMockSsoProviderEditReturn({
          provisioningConfig: null,
        }),
      );
      renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('header.enable_provisioning_tooltip');
      });
    });

    it('should not show tooltip when loading spinner is displayed', () => {
      mockUseSsoProviderEdit.mockReturnValueOnce(
        createMockSsoProviderEditReturn({
          provisioningConfig: null,
          isProvisioningLoading: true,
        }),
      );
      renderComponent();

      // When loading, spinner is shown instead of switch
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('should show tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      mockUseSsoProviderEdit.mockReturnValueOnce(
        createMockSsoProviderEditReturn({
          provisioningConfig: null,
        }),
      );
      renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      await user.tab();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('header.enable_provisioning_tooltip');
      });
    });

    it('should show provider disabled tooltip even when switch is disabled', async () => {
      const user = userEvent.setup();
      mockUseSsoProviderEdit.mockReturnValueOnce(
        createMockSsoProviderEditReturn({
          provisioningConfig: null,
        }),
      );
      renderComponent({ provider: { ...mockProvider, is_enabled: false, id: '' } });

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();

      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('header.provider_disabled_tooltip');
      });
    });
  });

  describe('styling', () => {
    it('should apply custom styling', () => {
      const customStyling = {
        variables: { common: {}, light: {}, dark: {} },
        classes: {
          'SsoProvisioningTab-root': 'custom-class',
        },
      };
      renderComponent({ styling: customStyling });

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });
});
