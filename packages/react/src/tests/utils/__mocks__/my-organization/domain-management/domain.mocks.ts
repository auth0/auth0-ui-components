import type {
  ComponentAction,
  Domain,
  IdpKnownResponse,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { ALL_DOMAIN_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type {
  DomainTableProps,
  UseDomainTableReturn,
  UseDomainTableServiceOptions,
  UseDomainTableServiceReturn,
} from '@/types/my-organization/domain-management/domain-table-types';

export const createMockDomain = (overrides?: Partial<Domain>): Domain => ({
  id: 'domain_abc123xyz456',
  org_id: 'organization_abc123xyz456',
  domain: 'example.auth0.com',
  status: 'pending',
  verification_txt: 'auth0-domain-verification=abc123xyz456def789',
  verification_host: '_auth0-challenge.example.auth0.com',
  ...overrides,
});

export const createMockVerifiedDomain = (): Domain =>
  createMockDomain({
    status: 'verified',
  });

export const createMockFailedDomain = (): Domain =>
  createMockDomain({
    status: 'failed',
  });

export const createMockIdentityProvider = (
  overrides: Partial<IdpKnownResponse> = {},
): IdpKnownResponse => {
  const baseProvider = {
    id: 'con_abc123xyz456',
    name: 'mock-provider',
    display_name: 'Mock Provider',
    strategy: 'samlp' as const,
  };

  return {
    ...baseProvider,
    ...overrides,
  } as IdpKnownResponse;
};

export const createMockIdentityProviderAssociatedWithDomain = (
  overrides: Partial<IdentityProviderAssociatedWithDomain> = {},
): IdentityProviderAssociatedWithDomain => {
  const baseProvider = {
    id: 'con_test123',
    display_name: 'Test Provider',
    strategy: 'samlp',
    name: 'test-provider',
    is_associated: false,
  } as const;

  return {
    ...baseProvider,
    ...overrides,
  } as IdentityProviderAssociatedWithDomain;
};

export const createMockIdentityProviderWithoutProvisioning = (
  overrides: Partial<IdpKnownResponse> = {},
): IdpKnownResponse => {
  const baseProvider = {
    id: 'con_abc123xyz456',
    name: 'mock-provider-no-provisioning',
    display_name: 'Mock Provider Without Provisioning',
    strategy: 'oidc' as const,
  };

  return {
    ...baseProvider,
    ...overrides,
  } as IdpKnownResponse;
};

export const createMockDomainTableProps = (
  overrides?: Partial<DomainTableProps>,
): DomainTableProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader: false,
  readOnly: false,
  createAction: undefined,
  verifyAction: undefined,
  deleteAction: undefined,
  associateToProviderAction: undefined,
  deleteFromProviderAction: undefined,
  ...overrides,
});

export const createMockCreateAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

export const createMockVerifyAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

export const createMockDeleteAction = (): ComponentAction<Domain> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

export const createMockDomainTableReturn = (
  overrides: Partial<UseDomainTableReturn> = {},
): UseDomainTableReturn => ({
  permissions: ALL_DOMAIN_PERMISSIONS,
  domains: [createMockDomain(), createMockVerifiedDomain()],
  providers: [],
  isCreating: false,
  isVerifying: false,
  isFetching: false,
  isRefetchingDomains: false,
  isDomainsStale: false,
  domainsUpdatedAt: 0,
  isLoadingProviders: false,
  isDeleting: false,
  pagination: {
    pageSize: 10,
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  showCreateModal: false,
  showConfigureModal: false,
  showVerifyModal: false,
  showDeleteModal: false,
  verifyError: undefined,
  selectedDomain: null,
  setShowCreateModal: vi.fn(),
  setShowConfigureModal: vi.fn(),
  setShowVerifyModal: vi.fn(),
  setShowDeleteModal: vi.fn(),
  refetchDomains: vi.fn(),
  handleCreate: vi.fn(),
  handleVerify: vi.fn(),
  handleDelete: vi.fn(),
  handleToggleSwitch: vi.fn(),
  handleCloseVerifyModal: vi.fn(),
  handleCreateClick: vi.fn(),
  handleConfigureClick: vi.fn(),
  handleVerifyClick: vi.fn(),
  handleDeleteClick: vi.fn(),
  handleNextPage: vi.fn(),
  handlePreviousPage: vi.fn(),
  handlePageSizeChange: vi.fn(),
  ...overrides,
});

export const createMockDomainTableServiceOptions = (
  overrides?: Partial<UseDomainTableServiceOptions>,
): UseDomainTableServiceOptions => ({
  createAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  deleteAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  verifyAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  associateToProviderAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  deleteFromProviderAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  customMessages: {},
  ...overrides,
});

export const createMockDomainTableServiceReturn = (
  overrides: Partial<UseDomainTableServiceReturn> = {},
): UseDomainTableServiceReturn => ({
  domains: [],
  providers: [],
  nextToken: null,
  isFetching: false,
  isRefetchingDomains: false,
  isDomainsStale: false,
  domainsUpdatedAt: 0,
  isCreating: false,
  isDeleting: false,
  isVerifying: false,
  isLoadingProviders: false,
  refetchDomains: vi.fn(),
  fetchProviders: vi.fn(),
  fetchDomains: vi.fn(),
  onCreateDomain: vi.fn(),
  onVerifyDomain: vi.fn(),
  onDeleteDomain: vi.fn(),
  onAssociateToProvider: vi.fn(),
  onDeleteFromProvider: vi.fn(),
  ...overrides,
});
