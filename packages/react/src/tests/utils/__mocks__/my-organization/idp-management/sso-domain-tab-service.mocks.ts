import { vi } from 'vitest';

import { createMockSsoDomain } from './sso-domain.mocks';

import type { UseSsoDomainTabServiceReturn } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

export function mockSsoDomainTabService(
  overrides: Partial<UseSsoDomainTabServiceReturn> = {},
): UseSsoDomainTabServiceReturn {
  return {
    domainsList: [createMockSsoDomain()],
    isLoading: false,
    idpDomains: [createMockSsoDomain().id],
    isCreating: false,
    isVerifying: false,
    isDeleting: false,
    createDomain: vi.fn(),
    verifyDomain: vi.fn(),
    deleteDomain: vi.fn(),
    associateToProvider: vi.fn(),
    deleteFromProvider: vi.fn(),
    ...overrides,
  };
}
