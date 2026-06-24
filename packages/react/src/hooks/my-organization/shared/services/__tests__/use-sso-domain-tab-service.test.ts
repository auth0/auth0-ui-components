import {
  BusinessError,
  ssoDomainQueryKeys,
  ssoProviderQueryKeys,
} from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSsoDomainTabService } from '@/hooks/my-organization/shared/services/use-sso-domain-tab-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import {
  createMockSsoDomain,
  createMockVerifiedSsoDomain,
  createMockSsoProvider,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import {
  setupMockUseCoreClient,
  setupMockUseCoreClientNull,
  setupMockUseTranslator,
} from '@/tests/utils/test-utilities';

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => vi.fn(),
}));

const mockDomain = createMockSsoDomain();
const mockVerifiedDomain = createMockVerifiedSsoDomain();
const mockProvider = createMockSsoProvider();

const renderService = (idpId: string, options?: Parameters<typeof useSsoDomainTabService>[1]) => {
  const { wrapper, queryClient } = createTestQueryClientWrapper();
  return {
    queryClient,
    ...renderHook(() => useSsoDomainTabService(idpId, options), { wrapper }),
  };
};

describe('useSsoDomainTabService', () => {
  const mockCoreClient = createMockCoreClient();
  const mockMyOrgClient = mockCoreClient.getMyOrganizationApiClient();

  let mockDomainVerifyCreate: ReturnType<typeof vi.fn>;
  let mockIdentityProviderDomainsCreate: ReturnType<typeof vi.fn>;
  let mockIdentityProviderDomainsDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    setupMockUseTranslator(useTranslatorModule);

    (mockMyOrgClient.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      response: { organization_domains: [mockDomain] },
    });
    (mockMyOrgClient.organization.domains.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDomain,
    );
    (mockMyOrgClient.organization.domains.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

    mockDomainVerifyCreate = mockMyOrgClient.organization.domains.verify.create as ReturnType<
      typeof vi.fn
    >;
    mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

    mockIdentityProviderDomainsCreate = mockMyOrgClient.organization.identityProviders.domains
      .create as ReturnType<typeof vi.fn>;
    mockIdentityProviderDomainsCreate.mockResolvedValue({});

    mockIdentityProviderDomainsDelete = mockMyOrgClient.organization.identityProviders.domains
      .delete as ReturnType<typeof vi.fn>;
    mockIdentityProviderDomainsDelete.mockResolvedValue({});
  });

  const defaultProvider = { ...mockProvider, domains: [mockDomain.domain] };

  describe('domain listing', () => {
    it('should fetch and return domains list', async () => {
      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.domainsList).toEqual([mockDomain]);
    });

    it('should not fetch domains if idpId is empty', () => {
      const { result } = renderService('', { provider: defaultProvider });

      expect(mockMyOrgClient.organization.domains.list).not.toHaveBeenCalled();
      expect(result.current.domainsList).toEqual([]);
    });

    it('should not fetch domains if coreClient is not available', () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderService('idp-1', { provider: defaultProvider });

      expect(mockMyOrgClient.organization.domains.list).not.toHaveBeenCalled();
      expect(result.current.domainsList).toEqual([]);
    });

    it('should derive idpDomains from provider domains', async () => {
      const { result } = renderService('idp-1', {
        provider: { ...mockProvider, domains: [mockDomain.domain] },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.idpDomains).toContain(mockDomain.id);
    });

    it('should return empty idpDomains when provider has no matching domains', async () => {
      const { result } = renderService('idp-1', {
        provider: { ...mockProvider, domains: [] },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.idpDomains).toEqual([]);
    });

    it('should prevent duplicate domains in idpDomains', async () => {
      const secondDomain = createMockSsoDomain({ id: 'domain-2', domain: 'other.com' });
      (mockMyOrgClient.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
        response: { organization_domains: [mockDomain, secondDomain] },
      });

      const { result } = renderService('idp-1', {
        provider: { ...mockProvider, domains: [mockDomain.domain] },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const domainCount = result.current.idpDomains.filter((id) => id === mockDomain.id).length;
      expect(domainCount).toBe(1);
    });
  });

  describe('createDomain', () => {
    it('should create domain successfully', async () => {
      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newDomain = await result.current.createDomain({ domain: 'newdomain.com' });

      expect(mockMyOrgClient.organization.domains.create).toHaveBeenCalledWith({
        domain: 'newdomain.com',
      });
      expect(newDomain).toEqual(mockDomain);
    });

    it('should call onBefore and stop if returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { createAction: { onBefore } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.createDomain({ domain: 'test.com' })).rejects.toThrow(
        BusinessError,
      );
      expect(mockMyOrgClient.organization.domains.create).not.toHaveBeenCalled();
    });

    it('should call onBefore and onAfter callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { createAction: { onBefore, onAfter } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createDomain({ domain: 'test.com' });

      expect(onBefore).toHaveBeenCalled();
      expect(onAfter).toHaveBeenCalledWith(mockDomain);
    });

    it('should invalidate queries on success', async () => {
      const { result, queryClient } = renderService('idp-1', { provider: defaultProvider });
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.createDomain({ domain: 'test.com' });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ssoDomainQueryKeys.list('idp-1'),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ssoProviderQueryKeys.detail('idp-1'),
      });
    });
  });

  describe('verifyDomain', () => {
    it('should verify domain and return isVerified true', async () => {
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const { isVerified } = await result.current.verifyDomain(mockDomain);

      expect(mockDomainVerifyCreate).toHaveBeenCalledWith(mockDomain.id);
      expect(isVerified).toBe(true);
    });

    it('should return isVerified false when status is not verified', async () => {
      mockDomainVerifyCreate.mockResolvedValue({ ...mockDomain, status: 'failed' });

      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const { isVerified } = await result.current.verifyDomain(mockDomain);

      expect(isVerified).toBe(false);
    });

    it('should update domain status in list after verification', async () => {
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.verifyDomain(mockDomain);

      await waitFor(() => {
        const updatedDomain = result.current.domainsList.find((d) => d.id === mockDomain.id);
        expect(updatedDomain?.status).toBe('verified');
      });
    });

    it('should call verification callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { verifyAction: { onBefore, onAfter } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.verifyDomain(mockDomain);

      expect(onBefore).toHaveBeenCalledWith(mockDomain);
      expect(onAfter).toHaveBeenCalledWith(mockDomain);
    });

    it('should throw if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { verifyAction: { onBefore } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.verifyDomain(mockDomain)).rejects.toThrow(BusinessError);
    });
  });

  describe('deleteDomain', () => {
    it('should delete domain successfully', async () => {
      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.deleteDomain(mockDomain);

      expect(mockMyOrgClient.organization.domains.delete).toHaveBeenCalledWith(mockDomain.id);
    });

    it('should call deletion callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { deleteAction: { onBefore, onAfter } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.deleteDomain(mockDomain);

      expect(onBefore).toHaveBeenCalledWith(mockDomain);
      expect(onAfter).toHaveBeenCalledWith(mockDomain);
    });

    it('should throw if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { deleteAction: { onBefore } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.deleteDomain(mockDomain)).rejects.toThrow(BusinessError);
    });
  });

  describe('associateToProvider', () => {
    it('should associate domain to provider successfully', async () => {
      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.associateToProvider(mockDomain);

      expect(mockIdentityProviderDomainsCreate).toHaveBeenCalledWith('idp-1', {
        domain: mockDomain.domain,
      });
    });

    it('should call association callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { associateToProviderAction: { onBefore, onAfter } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.associateToProvider(mockDomain);

      expect(onBefore).toHaveBeenCalledWith(mockDomain, defaultProvider);
      expect(onAfter).toHaveBeenCalledWith(mockDomain, defaultProvider);
    });

    it('should throw if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { associateToProviderAction: { onBefore } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.associateToProvider(mockDomain)).rejects.toThrow(BusinessError);
    });
  });

  describe('deleteFromProvider', () => {
    it('should delete domain from provider successfully', async () => {
      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.deleteFromProvider(mockDomain);

      expect(mockIdentityProviderDomainsDelete).toHaveBeenCalledWith(
        mockProvider.id,
        mockDomain.domain,
      );
    });

    it('should skip deletion when provider has no id', async () => {
      const providerWithoutId = { ...mockProvider, id: undefined };

      const { result } = renderService('idp-1', {
        provider: providerWithoutId as typeof mockProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const returnedDomain = await result.current.deleteFromProvider(mockDomain);

      expect(mockIdentityProviderDomainsDelete).not.toHaveBeenCalled();
      expect(returnedDomain).toEqual(mockDomain);
    });

    it('should call deletion from provider callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { deleteFromProviderAction: { onBefore, onAfter } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.deleteFromProvider(mockDomain);

      expect(onBefore).toHaveBeenCalledWith(mockDomain, defaultProvider);
      expect(onAfter).toHaveBeenCalledWith(mockDomain);
    });

    it('should throw if onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);

      const { result } = renderService('idp-1', {
        provider: defaultProvider,
        domains: { deleteFromProviderAction: { onBefore } },
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.deleteFromProvider(mockDomain)).rejects.toThrow(BusinessError);
    });
  });

  describe('custom messages', () => {
    it('should handle custom messages', async () => {
      const customMessages = {
        'domain_create.success': 'Custom create success',
      };

      renderService('idp-1', {
        provider: defaultProvider,
        customMessages,
      });

      expect(useTranslatorModule.useTranslator).toHaveBeenCalledWith(
        'idp_management.notifications',
        customMessages,
      );
    });
  });

  describe('loading states', () => {
    it('should report isCreating during creation', async () => {
      let resolveCreate: (value: unknown) => void;
      (mockMyOrgClient.organization.domains.create as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
      );

      const { result } = renderService('idp-1', { provider: defaultProvider });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const createPromise = result.current.createDomain({ domain: 'test.com' });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(true);
      });

      resolveCreate!(mockDomain);
      await createPromise;

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });
});
