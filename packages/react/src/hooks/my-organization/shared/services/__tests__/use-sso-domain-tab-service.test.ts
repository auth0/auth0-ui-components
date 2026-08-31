import { BusinessError, ssoDomainQueryKeys, type Domain } from '@auth0/universal-components-core';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

    it('should return domains list after successful load', async () => {
      const { result } = await renderService('idp-1');

      expect(result.current.isLoading).toBe(false);
      expect(result.current.domainsList).toEqual([mockDomain]);
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

    it('should derive idpDomains from provider prop', async () => {
      const { result } = await renderService('idp-1', {
        provider: { ...mockProvider, domains: [mockDomain.domain] },
      });

      expect(result.current.idpDomains).toContain(mockDomain.id);
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
      const { result } = await renderService('idp-1', {
        customMessages,
      });

      expect(result.current.domainsList).toEqual([mockDomain]);
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
      const providerWithDuplicates = {
        ...mockProvider,
        domains: ['example.com', 'example.com'],
      };

      const { result } = await renderService('idp-1', {
        provider: providerWithDuplicates,
      });

      const uniqueIds = new Set(result.current.idpDomains);
      expect(result.current.idpDomains.length).toBe(uniqueIds.size);
    });

    it('should only include domains that exist in domainsList', async () => {
      const providerWithNonExistent = {
        ...mockProvider,
        domains: ['example.com', 'nonexistent.com'],
      };

      const { result } = await renderService('idp-1', {
        provider: providerWithNonExistent,
      });

      expect(result.current.idpDomains).toEqual([mockDomain.id]);
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
