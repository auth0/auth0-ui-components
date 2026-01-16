import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  mockProvider,
  SsoProvisioningProps,
  mockOnCreateProvisioning,
  mockOnDeleteProvisioning,
  mockOnListScimTokens,
  mockOnCreateScimToken,
  mockOnDeleteScimToken,
  mockFetchProvisioning,
} from '../../../../../../internals';
import { SsoProvisioningTab } from '../sso-provisioning-tab';

// Mock hooks
const mockUseTranslator = vi.fn(() => ({
  t: (key: string) => key,
}));

const mockUseSsoProviderEdit = vi.fn(() => ({
  provisioningConfig: null as { id: string } | null,
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
}));

vi.mock('../../../../../../hooks/use-translator', () => ({
  useTranslator: () => mockUseTranslator(),
}));

vi.mock('../../../../../../hooks/my-organization/idp-management/use-sso-provider-edit', () => ({
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

  describe('Tooltip Functionality', () => {
    it('should show provider disabled tooltip when provider is disabled', async () => {
      vi.useFakeTimers();
      renderComponent({ provider: { ...mockProvider, is_enabled: false } });

      const switchElement = screen.getByRole('switch');

      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      const tooltips = screen.getAllByText('header.provider_disabled_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should show disable provisioning tooltip when provider is enabled and provisioning is enabled', async () => {
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
        provisioningConfig: { id: 'provisioning_123' },
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
      });
      renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      const switchElement = screen.getByRole('switch');

      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      const tooltips = screen.getAllByText('header.disable_provisioning_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should show enable provisioning tooltip when provider is enabled and provisioning is disabled', async () => {
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
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
      });
      renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      const switchElement = screen.getByRole('switch');

      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      const tooltips = screen.getAllByText('header.enable_provisioning_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should show correct tooltip based on provider and provisioning state', async () => {
      // State 1: Provider disabled
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
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
      });
      const { unmount: unmount1 } = renderComponent({
        provider: { ...mockProvider, is_enabled: false },
      });

      let switchElement = screen.getByRole('switch');
      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      let tooltips = screen.getAllByText('header.provider_disabled_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
      vi.useRealTimers();
      unmount1();

      // State 2: Provider enabled, provisioning enabled
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
        provisioningConfig: { id: 'provisioning_123' },
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
      });
      const { unmount: unmount2 } = renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      switchElement = screen.getByRole('switch');
      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      tooltips = screen.getAllByText('header.disable_provisioning_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
      vi.useRealTimers();
      unmount2();

      // State 3: Provider enabled, provisioning disabled
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
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
      });
      renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      switchElement = screen.getByRole('switch');
      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      tooltips = screen.getAllByText('header.enable_provisioning_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);
      vi.useRealTimers();
    });

    it('should not show tooltip when loading spinner is displayed', async () => {
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
        provisioningConfig: null,
        isProvisioningLoading: true,
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
      });
      renderComponent();

      // When loading, spinner is shown instead of switch
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();

      vi.useRealTimers();
    });

    it('should show tooltip on keyboard focus', async () => {
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
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
      });
      renderComponent({
        provider: { ...mockProvider, is_enabled: true },
      });

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });

      const tooltips = screen.getAllByText('header.enable_provisioning_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });

    it('should show provider disabled tooltip even when switch is disabled', async () => {
      vi.useFakeTimers();
      mockUseSsoProviderEdit.mockReturnValueOnce({
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
      });
      renderComponent({ provider: { ...mockProvider, is_enabled: false, id: '' } });

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();

      await act(async () => {
        fireEvent.pointerEnter(switchElement);
        fireEvent.pointerMove(switchElement);
        await vi.advanceTimersByTimeAsync(800);
      });

      const tooltips = screen.getAllByText('header.provider_disabled_tooltip');
      expect(tooltips.length).toBeGreaterThan(0);

      vi.useRealTimers();
    });
  });
});
