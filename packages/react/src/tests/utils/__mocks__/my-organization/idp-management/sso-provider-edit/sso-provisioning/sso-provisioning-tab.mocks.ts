import { vi } from 'vitest';

export const mockOnCreateProvisioning = vi.fn();
export const mockOnDeleteProvisioning = vi.fn();
export const mockOnListScimTokens = vi.fn();
export const mockOnCreateScimToken = vi.fn();
export const mockOnDeleteScimToken = vi.fn();
export const mockFetchProvisioning = vi.fn();

export const mockProvider = {
  id: 'test-provider-id',
  name: 'Test Provider',
  is_enabled: true,
  strategy: 'waad' as const,
  options: {},
};

export const SsoProvisioningProps = {
  provider: mockProvider,
  provisioningConfig: null,
  isProvisioningLoading: false,
  isProvisioningUpdating: false,
  isProvisioningDeleting: false,
  isScimTokensLoading: false,
  isScimTokenCreating: false,
  isScimTokenDeleting: false,
  onCreateProvisioning: mockOnCreateProvisioning,
  onDeleteProvisioning: mockOnDeleteProvisioning,
  onListScimTokens: mockOnListScimTokens,
  onCreateScimToken: mockOnCreateScimToken,
  onDeleteScimToken: mockOnDeleteScimToken,
  fetchProvisioning: mockFetchProvisioning,
  styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
  customMessages: {},
};
