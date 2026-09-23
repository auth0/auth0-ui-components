import type { Domain, IdpKnownResponse } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type { UseSsoDomainTabReturn } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

export const createMockSsoDomain = (overrides?: Partial<Domain>): Domain => ({
  id: 'domain-1',
  org_id: 'organization-1',
  domain: 'example.com',
  status: 'pending',
  verification_txt: 'auth0-domain-verification=test-token',
  verification_host: '_auth0-challenge.example.com',
  ...overrides,
});

export const createMockVerifiedSsoDomain = (overrides?: Partial<Domain>): Domain =>
  createMockSsoDomain({
    status: 'verified',
    ...overrides,
  });

export const createMockSsoProvider = (overrides?: Partial<IdpKnownResponse>): IdpKnownResponse =>
  ({
    id: 'provider-1',
    name: 'Test Provider',
    strategy: 'oidc',
    options: {
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      issuer: 'https://example.com',
      discovery_url: 'https://example.com/.well-known/openid_configuration',
    },
    ...overrides,
  }) as IdpKnownResponse;

export function createMockSsoDomainTabReturn(
  overrides: Partial<UseSsoDomainTabReturn> = {},
): UseSsoDomainTabReturn {
  return {
    domainsList: [],
    isLoading: false,
    isRefetchingDomains: false,
    isDomainsStale: false,
    domainsUpdatedAt: 0,
    showCreateModal: false,
    isCreating: false,
    selectedDomain: null,
    showVerifyModal: false,
    showDeleteModal: false,
    isVerifying: false,
    verifyError: undefined,
    isDeleting: false,
    idpDomains: [],
    isUpdating: false,
    isUpdatingId: null,
    pagination: {
      pageSize: 10,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    setShowCreateModal: vi.fn(),
    refetchDomains: vi.fn(),
    handleCreate: vi.fn(),
    handleCloseVerifyModal: vi.fn(),
    handleVerify: vi.fn(),
    handleDeleteClick: vi.fn(),
    setShowDeleteModal: vi.fn(),
    handleDelete: vi.fn(),
    handleVerifyActionColumn: vi.fn(),
    handleToggleSwitch: vi.fn(),
    handleNextPage: vi.fn(),
    handlePreviousPage: vi.fn(),
    handlePageSizeChange: vi.fn(),
    ...overrides,
  };
}
