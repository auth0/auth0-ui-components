import {
  BusinessError,
  domainQueryKeys,
  ssoDomainQueryKeys,
  ssoProviderQueryKeys,
  type Domain,
} from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';

import { useSsoDomainTabService } from '@/hooks/my-organization/shared/services/use-sso-domain-tab-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  createMockSsoDomain,
  createMockVerifiedSsoDomain,
  createMockSsoProvider,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';
import { setupAllCommonMocks, setupMockUseCoreClientNull } from '@/tests/utils/test-utilities';

const { initMockCoreClient } = mockCore();

const mockDomain = createMockSsoDomain();
const mockVerifiedDomain = createMockVerifiedSsoDomain();
const mockProvider = createMockSsoProvider();

describe('useSsoDomainTabService', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockHandleError: ReturnType<typeof vi.fn>;

  let mockDomainVerifyCreate: ReturnType<typeof vi.fn>;
  let mockIdentityProviderDomainsCreate: ReturnType<typeof vi.fn>;
  let mockIdentityProviderDomainsDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    mockHandleError = vi.fn();

    const apiService = mockCoreClient.getMyOrganizationApiClient();

    (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      response: { organization_domains: [mockDomain] },
    });
    (apiService.organization.domains.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDomain,
    );
    (apiService.organization.domains.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

    mockDomainVerifyCreate = apiService.organization.domains.verify.create as ReturnType<
      typeof vi.fn
    >;
    mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

    mockIdentityProviderDomainsCreate = apiService.organization.identityProviders.domains
      .create as ReturnType<typeof vi.fn>;
    mockIdentityProviderDomainsCreate.mockResolvedValue({});

    mockIdentityProviderDomainsDelete = apiService.organization.identityProviders.domains
      .delete as ReturnType<typeof vi.fn>;
    mockIdentityProviderDomainsDelete.mockResolvedValue({});

    const { mockHandleError: setupMockHandleError } = setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });

    mockHandleError = setupMockHandleError;
  });

  const defaultProvider = { ...mockProvider, domains: [mockDomain.domain] };

  const mockDomainsList = (organizationDomains: Domain[]) =>
    (
      mockCoreClient.getMyOrganizationApiClient().organization.domains.list as ReturnType<
        typeof vi.fn
      >
    ).mockResolvedValue({ response: { organization_domains: organizationDomains } });

  const renderService = async (
    idpId: string,
    options?: Parameters<typeof useSsoDomainTabService>[1],
  ) => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    const mergedOptions = { provider: defaultProvider, ...options };
    const hook = renderHook(() => useSsoDomainTabService(idpId, mergedOptions), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
    return { queryClient, ...hook };
  };

  describe('domain listing', () => {
    it('should fetch domains on mount', async () => {
      await renderService('idp-1');

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
      ).toHaveBeenCalledOnce();
    });

    it('should return only the verified domains assigned to the provider', async () => {
      const other = createMockVerifiedSsoDomain({ id: 'domain-2', domain: 'other.com' });
      const pendingAssigned = createMockSsoDomain({ id: 'domain-3', domain: 'pending.com' });
      mockDomainsList([mockVerifiedDomain, other, pendingAssigned]);

      const { result } = await renderService('idp-1', {
        provider: { ...mockProvider, domains: [mockVerifiedDomain.domain, pendingAssigned.domain] },
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.domainsList).toEqual([mockVerifiedDomain]);
    });

    it('should keep the full domain record, including its id', async () => {
      mockDomainsList([mockVerifiedDomain]);

      const { result } = await renderService('idp-1');

      expect(result.current.domainsList[0]).toEqual(mockVerifiedDomain);
      expect(result.current.idpDomains).toEqual([mockVerifiedDomain.id]);
    });

    it('should list nothing when the provider has no domains', async () => {
      mockDomainsList([mockVerifiedDomain]);

      const { result } = await renderService('idp-1', {
        provider: { ...mockProvider, domains: [] },
      });

      expect(result.current.domainsList).toEqual([]);
    });

    it('should handle domain listing error', async () => {
      const error = new Error('API Error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      const { wrapper } = createTestQueryClientWrapper();
      renderHook(() => useSsoDomainTabService('idp-1'), { wrapper });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'general_error',
        });
      });
    });

    it('should report freshness for the refresh indicator and refetch the domains', async () => {
      const { result } = await renderService('idp-1');
      const list = mockCoreClient.getMyOrganizationApiClient().organization.domains
        .list as ReturnType<typeof vi.fn>;
      const callsBefore = list.mock.calls.length;

      expect(result.current.domainsUpdatedAt).toBeGreaterThan(0);
      await act(async () => {
        await result.current.refetchDomains();
      });

      expect(list.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('should not fetch domains if idpId is not provided', () => {
      const { wrapper } = createTestQueryClientWrapper();
      renderHook(() => useSsoDomainTabService(''), { wrapper });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
      ).not.toHaveBeenCalled();
    });
  });

  describe('domain creation', () => {
    it('should create domain successfully', async () => {
      const { result } = await renderService('idp-1');

      await act(async () => {
        await result.current.createDomain({ domain: 'newdomain.com' });
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).toHaveBeenCalledWith({ domain: 'newdomain.com' });
    });

    it('should call onBefore and proceed if returns true', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = await renderService('idp-1', {
        domains: { createAction: { onBefore, onAfter } },
      });

      await act(async () => {
        await result.current.createDomain({ domain: 'newdomain.com' });
      });

      expect(onBefore).toHaveBeenCalled();
      expect(onAfter).toHaveBeenCalledWith(mockDomain);
    });

    it('should throw BusinessError if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = await renderService('idp-1', {
        domains: { createAction: { onBefore } },
      });

      await expect(
        act(async () => {
          await result.current.createDomain({ domain: 'newdomain.com' });
        }),
      ).rejects.toThrow(BusinessError);
    });

    it('should reject when coreClient is unavailable', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { wrapper } = createTestQueryClientWrapper();
      const { result } = renderHook(() => useSsoDomainTabService('idp-1'), { wrapper });

      await expect(
        act(async () => {
          await result.current.createDomain({ domain: 'newdomain.com' });
        }),
      ).rejects.toThrow(BusinessError);
    });
  });

  describe('domain verification', () => {
    it('should verify domain successfully', async () => {
      const { result } = await renderService('idp-1');

      let verifyResult: { isVerified: boolean } | undefined;
      await act(async () => {
        verifyResult = await result.current.verifyDomain(mockDomain);
      });

      expect(mockDomainVerifyCreate).toHaveBeenCalledWith(mockDomain.id);
      expect(verifyResult?.isVerified).toBe(true);
    });

    it('should call verification callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = await renderService('idp-1', {
        domains: { verifyAction: { onBefore, onAfter } },
      });

      await act(async () => {
        await result.current.verifyDomain(mockDomain);
      });

      expect(onBefore).toHaveBeenCalledWith(mockDomain);
      expect(onAfter).toHaveBeenCalledWith(mockVerifiedDomain);
    });
  });

  describe('domain deletion', () => {
    it('should delete domain successfully', async () => {
      const { result } = await renderService('idp-1');

      await act(async () => {
        await result.current.deleteDomain(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
      ).toHaveBeenCalledWith(mockDomain.id);
    });

    it('should call deletion callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = await renderService('idp-1', {
        domains: { deleteAction: { onBefore, onAfter } },
      });

      await act(async () => {
        await result.current.deleteDomain(mockDomain);
      });

      expect(onBefore).toHaveBeenCalledWith(mockDomain);
      expect(onAfter).toHaveBeenCalledWith(mockDomain);
    });
  });

  describe('provider association', () => {
    it('should associate domain to provider', async () => {
      const { result } = await renderService('idp-1', {
        provider: mockProvider,
      });

      await act(async () => {
        await result.current.associateToProvider(mockDomain);
      });

      expect(mockIdentityProviderDomainsCreate).toHaveBeenCalledWith('idp-1', {
        domain: mockDomain.domain,
      });
    });

    it('should delete domain from provider', async () => {
      const { result } = await renderService('idp-1', {
        provider: mockProvider,
      });

      await act(async () => {
        await result.current.deleteFromProvider(mockDomain);
      });

      expect(mockIdentityProviderDomainsDelete).toHaveBeenCalledWith(
        mockProvider.id,
        mockDomain.domain,
      );
    });

    it('should call provider association callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = await renderService('idp-1', {
        provider: mockProvider,
        domains: { associateToProviderAction: { onBefore, onAfter } },
      });

      await act(async () => {
        await result.current.associateToProvider(mockDomain);
      });

      expect(onBefore).toHaveBeenCalledWith(mockDomain, mockProvider);
      expect(onAfter).toHaveBeenCalledWith(mockDomain, mockProvider);
    });
  });

  describe('custom messages', () => {
    it('should pass custom messages to translator', async () => {
      const customMessages = { general_error: 'Custom error message' };
      mockDomainsList([mockVerifiedDomain]);
      const { result } = await renderService('idp-1', { customMessages });

      expect(result.current.domainsList).toEqual([mockVerifiedDomain]);
    });
  });

  describe('domain status update after verification', () => {
    it('should update domain status in cache after successful verification', async () => {
      const { result, queryClient } = await renderService('idp-1');

      await act(async () => {
        await result.current.verifyDomain(mockDomain);
      });

      const cachedData = queryClient.getQueryData<{ domains: Domain[]; next: string | null }>(
        ssoDomainQueryKeys.list('idp-1', { pageSize: undefined, fromToken: undefined }),
      );

      expect(cachedData).toBeDefined();
      expect(cachedData!.domains[0]!.status).toBe('verified');
    });
  });

  describe('prevent duplicate idpDomains', () => {
    it('should not include duplicate domain IDs in idpDomains', async () => {
      mockDomainsList([mockVerifiedDomain]);

      const { result } = await renderService('idp-1', {
        provider: { ...mockProvider, domains: ['example.com', 'example.com'] },
      });

      const uniqueIds = new Set(result.current.idpDomains);
      expect(result.current.idpDomains.length).toBe(uniqueIds.size);
    });

    it('should only include domains that exist in the organization', async () => {
      mockDomainsList([mockVerifiedDomain]);

      const { result } = await renderService('idp-1', {
        provider: { ...mockProvider, domains: ['example.com', 'nonexistent.com'] },
      });

      expect(result.current.idpDomains).toEqual([mockVerifiedDomain.id]);
    });
  });

  describe('available domains', () => {
    const available = (id: string, domain: string, overrides: Partial<Domain> = {}) =>
      createMockVerifiedSsoDomain({ id, domain, assignment_state: 'available', ...overrides });

    const renderWithAvailable = (options?: Parameters<typeof useSsoDomainTabService>[1]) =>
      renderService('idp-1', options);

    it('should return only verified domains that no identity provider holds', async () => {
      const free = available('domain-2', 'free.com');
      mockDomainsList([
        free,
        available('domain-3', 'taken.com', { assignment_state: 'assigned' }),
        createMockSsoDomain({
          id: 'domain-4',
          domain: 'pending.com',
          assignment_state: 'available',
        }),
        createMockVerifiedSsoDomain({ id: 'domain-5', domain: 'unknown.com' }),
      ]);

      const { result } = await renderWithAvailable();

      expect(result.current.availableDomains).toEqual([free]);
    });

    it('should not offer a domain the provider already holds', async () => {
      mockDomainsList([available('domain-2', 'held.com')]);

      const { result } = await renderWithAvailable({
        provider: { ...mockProvider, domains: ['held.com'] },
      });

      expect(result.current.availableDomains).toEqual([]);
    });

    it('should ask for up to 100 domains per page and follow the cursor', async () => {
      const first = available('domain-2', 'first.com');
      const second = available('domain-3', 'second.com');
      const list = mockCoreClient.getMyOrganizationApiClient().organization.domains
        .list as ReturnType<typeof vi.fn>;
      list
        .mockResolvedValueOnce({ response: { organization_domains: [first], next: 'token-2' } })
        .mockResolvedValueOnce({ response: { organization_domains: [second] } });

      const { result } = await renderWithAvailable();

      expect(list).toHaveBeenCalledTimes(2);
      expect(list).toHaveBeenNthCalledWith(1, { take: 100, from: undefined });
      expect(list).toHaveBeenNthCalledWith(2, { take: 100, from: 'token-2' });
      expect(result.current.availableDomains).toEqual([first, second]);
    });

    it('should stop after 5 pages', async () => {
      const list = mockCoreClient.getMyOrganizationApiClient().organization.domains
        .list as ReturnType<typeof vi.fn>;
      list.mockResolvedValue({ response: { organization_domains: [], next: 'again' } });

      await renderWithAvailable();

      expect(list).toHaveBeenCalledTimes(5);
    });

    it('should report an error when the domains cannot be read', async () => {
      const error = new Error('API Error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      await renderService('idp-1');

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' });
      });
    });
  });

  describe('cache refresh after changing assignments', () => {
    const expectRefreshed = async (
      invalidateSpy: MockInstance<QueryClient['invalidateQueries']>,
      idpId: string,
    ) => {
      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ssoProviderQueryKeys.detail(idpId),
        });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ssoDomainQueryKeys.lists() });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: domainQueryKeys.all });
      });
    };

    it('should refresh the provider, SSO domain lists and domain management after associating', async () => {
      const { result, queryClient } = await renderService('idp-1');
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await act(async () => {
        await result.current.associateToProvider(mockVerifiedDomain);
      });

      await expectRefreshed(invalidateSpy, 'idp-1');
    });

    it('should refresh the provider, SSO domain lists and domain management after dissociating', async () => {
      const { result, queryClient } = await renderService('idp-1');
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await act(async () => {
        await result.current.deleteFromProvider(mockVerifiedDomain);
      });

      await expectRefreshed(invalidateSpy, 'idp-1');
    });
  });

  describe('edge cases', () => {
    it('should handle missing coreClient gracefully', () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { wrapper } = createTestQueryClientWrapper();
      const { result } = renderHook(() => useSsoDomainTabService('idp-1'), { wrapper });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
      ).not.toHaveBeenCalled();
      expect(result.current.domainsList).toEqual([]);
    });

    it('should return domain without calling API when provider has no id', async () => {
      const { result } = await renderService('idp-1', {
        provider: { ...mockProvider, id: undefined } as unknown as typeof mockProvider,
      });

      const returnedDomain = await act(async () => {
        return result.current.deleteFromProvider(mockDomain);
      });

      expect(mockIdentityProviderDomainsDelete).not.toHaveBeenCalled();
      expect(returnedDomain).toEqual(mockDomain);
    });
  });
});
