import { BusinessError } from '@auth0/universal-components-core';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoDomainTab } from '../use-sso-domain-tab';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  mockCore,
  mockToast,
  createMockSsoDomain,
  createMockVerifiedSsoDomain,
  createMockSsoProvider,
  setupAllCommonMocks,
  setupMockUseCoreClientNull,
} from '@/tests/utils';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// Test data
const mockDomain = createMockSsoDomain();
const mockVerifiedDomain = createMockVerifiedSsoDomain();
const mockProvider = createMockSsoProvider();

describe('useSsoDomainTab', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockHandleError: ReturnType<typeof vi.fn>;

  // Mock functions for extended API methods that don't exist in the real client
  let mockDomainVerifyCreate: ReturnType<typeof vi.fn>;
  let mockDomainIdentityProvidersGet: ReturnType<typeof vi.fn>;
  let mockIdentityProviderDomainsCreate: ReturnType<typeof vi.fn>;
  let mockIdentityProviderDomainsDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    mockHandleError = vi.fn();

    const apiService = mockCoreClient.getMyOrganizationApiClient();

    // Mock existing API methods
    (apiService.organization.domains.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      organization_domains: [mockDomain],
    });
    (apiService.organization.domains.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDomain,
    );
    (apiService.organization.domains.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

    // Configure the nested API methods that already exist in the mock
    mockDomainVerifyCreate = apiService.organization.domains.verify.create as ReturnType<
      typeof vi.fn
    >;
    mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

    mockDomainIdentityProvidersGet = apiService.organization.domains.identityProviders
      .get as ReturnType<typeof vi.fn>;
    mockDomainIdentityProvidersGet.mockResolvedValue({
      identity_providers: [{ id: 'idp-1' }],
    });

    mockIdentityProviderDomainsCreate = apiService.organization.identityProviders.domains
      .create as ReturnType<typeof vi.fn>;
    mockIdentityProviderDomainsCreate.mockResolvedValue({});

    mockIdentityProviderDomainsDelete = apiService.organization.identityProviders.domains
      .delete as ReturnType<typeof vi.fn>;
    mockIdentityProviderDomainsDelete.mockResolvedValue({});

    // Setup all common hook mocks
    const { mockHandleError: setupMockHandleError } = setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });

    mockHandleError = setupMockHandleError;
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.domainsList).toEqual([]);
      expect(result.current.idpDomains).toEqual([]);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.selectedDomain).toBeNull();
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should fetch domains on mount', async () => {
      renderHook(() => useSsoDomainTab('idp-1'));

      await waitFor(() => {
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
        ).toHaveBeenCalledOnce();
      });
    });

    it('should not fetch domains if idpId is not provided', () => {
      renderHook(() => useSsoDomainTab(''));

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
      ).not.toHaveBeenCalled();
    });
  });

  describe('domain listing', () => {
    it('should fetch and set domains list successfully', async () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.domainsList).toEqual([mockDomain]);
      });
    });

    it('should handle domain listing error', async () => {
      const error = new Error('API Error');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'general_error',
        });
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should fetch provider domains and update idpDomains', async () => {
      mockDomainIdentityProvidersGet.mockResolvedValue({
        identity_providers: [{ id: 'idp-1' }],
      });

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await waitFor(() => {
        expect(result.current.idpDomains).toContain(mockDomain.id);
      });
    });

    it('should not add domain to idpDomains if provider not enabled', async () => {
      mockDomainIdentityProvidersGet.mockResolvedValue({
        identity_providers: [{ id: 'other-idp' }],
      });

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await waitFor(() => {
        expect(result.current.idpDomains).not.toContain(mockDomain.id);
      });
    });
  });

  describe('domain creation', () => {
    it('should create domain successfully', async () => {
      // Setup: Mock the API responses properly
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(mockDomain);

      // Mock listDomains to return empty array to simplify the async chain
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({
        organization_domains: [],
      });

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >,
      ).toHaveBeenCalledWith({
        domain: 'newdomain.com',
      });
      expect(result.current.isCreating).toBe(false);
    });

    it('should handle domain creation error', async () => {
      const error = new Error('Creation failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'domain_create.error',
        });
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should call onBefore callback and proceed if returns true', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(mockDomain);

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          domains: {
            createAction: { onBefore, onAfter },
          },
        }),
      );

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      await waitFor(() => {
        expect(onBefore).toHaveBeenCalled();
        expect(onAfter).toHaveBeenCalledWith(mockDomain);
        expect(
          mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
            typeof vi.fn
          >,
        ).toHaveBeenCalled();
      });
    });

    it('should call onBefore callback and stop if returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(mockDomain);

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          domains: {
            createAction: { onBefore },
          },
        }),
      );

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      await waitFor(() => {
        expect(onBefore).toHaveBeenCalled();
        expect(mockHandleError).toHaveBeenCalledWith(expect.any(BusinessError), expect.any(Object));
        expect(result.current.isCreating).toBe(false);
      });
    });
  });

  describe('domain verification', () => {
    it('should verify domain successfully', async () => {
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockDomainVerifyCreate).toHaveBeenCalledWith(mockDomain.id);
      expect(result.current.isVerifying).toBe(false);
    });

    it('should handle verification failure', async () => {
      const failedDomain = { ...mockDomain, status: 'failed' };
      mockDomainVerifyCreate.mockResolvedValue(failedDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.verifyError).toBe('domain_verify.verification_failed');
        expect(result.current.isVerifying).toBe(false);
      });
    });

    it('should handle verification error', async () => {
      const error = new Error('Verification failed');
      mockDomainVerifyCreate.mockRejectedValue(error);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'domain_verify.verification_failed',
        });
        expect(result.current.isVerifying).toBe(false);
      });
    });

    it('should call verification callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          domains: {
            verifyAction: { onBefore, onAfter },
          },
        }),
      );

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        expect(onBefore).toHaveBeenCalledWith(mockDomain);
        expect(onAfter).toHaveBeenCalledWith(mockDomain);
      });
    });

    it('should handle verification action column', async () => {
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleVerifyActionColumn(mockDomain);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should close verify modal and clear error', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      act(() => {
        result.current.handleCloseVerifyModal();
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
    });
  });

  describe('domain deletion', () => {
    it('should delete domain successfully', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({});

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete as ReturnType<
          typeof vi.fn
        >,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(result.current.isDeleting).toBe(false);
    });

    it('should handle deletion error', async () => {
      const error = new Error('Deletion failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'domain_delete.error',
        });
        expect(result.current.isDeleting).toBe(false);
      });
    });

    it('should handle delete click', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(true);
    });

    it('should call deletion callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue({});

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          domains: {
            deleteAction: { onBefore, onAfter },
          },
        }),
      );

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      await waitFor(() => {
        expect(onBefore).toHaveBeenCalledWith(mockDomain);
        expect(onAfter).toHaveBeenCalledWith(mockDomain);
      });
    });
  });

  describe('provider association', () => {
    it('should associate domain to provider successfully', async () => {
      mockIdentityProviderDomainsCreate.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          provider: mockProvider,
        }),
      );

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      expect(mockIdentityProviderDomainsCreate).toHaveBeenCalledWith('idp-1', {
        domain: mockDomain.domain,
      });
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should remove domain from provider successfully', async () => {
      mockIdentityProviderDomainsDelete.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          provider: mockProvider,
        }),
      );

      // First add domain to idpDomains
      act(() => {
        result.current.handleToggleSwitch(mockDomain, true);
      });

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      expect(mockIdentityProviderDomainsDelete).toHaveBeenCalledWith(
        mockProvider.id,
        mockDomain.domain,
      );
    });

    it('should handle provider association error', async () => {
      const error = new Error('Association failed');
      mockIdentityProviderDomainsCreate.mockRejectedValue(error);

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          provider: mockProvider,
        }),
      );

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'general_error',
        });
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('should call provider association callbacks', async () => {
      const onBefore = vi.fn().mockReturnValue(true);
      const onAfter = vi.fn();
      mockIdentityProviderDomainsCreate.mockResolvedValue({});

      const { result } = renderHook(() =>
        useSsoDomainTab('idp-1', {
          provider: mockProvider,
          domains: {
            associateToProviderAction: { onBefore, onAfter },
          },
        }),
      );

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      await waitFor(() => {
        expect(onBefore).toHaveBeenCalledWith(mockDomain, mockProvider);
        expect(onAfter).toHaveBeenCalledWith(mockDomain, mockProvider);
      });
    });
  });

  describe('modal state management', () => {
    it('should manage modal state correctly', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      // Test setShowCreateModal
      act(() => {
        result.current.setShowCreateModal(true);
      });
      expect(result.current.showCreateModal).toBe(true);

      act(() => {
        result.current.setShowCreateModal(false);
      });
      expect(result.current.showCreateModal).toBe(false);

      // Test setShowDeleteModal
      act(() => {
        result.current.setShowDeleteModal(true);
      });
      expect(result.current.showDeleteModal).toBe(true);

      act(() => {
        result.current.setShowDeleteModal(false);
      });
      expect(result.current.showDeleteModal).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle missing coreClient gracefully', () => {
      // Override the useCoreClient mock to return null coreClient
      setupMockUseCoreClientNull(useCoreClientModule);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      // When coreClient is null, loading starts but then the function returns early
      // so isLoading may still be true initially but no API calls are made
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list as ReturnType<
          typeof vi.fn
        >,
      ).not.toHaveBeenCalled();
      expect(result.current.domainsList).toEqual([]);
    });

    it('should handle missing provider when deleting from provider', async () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      // Should not crash and should complete the operation
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('when configuring custom messages', () => {
    it('should handle custom messages', () => {
      const customMessages = {
        'domain_create.success': 'Custom success message',
      };

      renderHook(() =>
        useSsoDomainTab('idp-1', {
          customMessages,
        }),
      );

      expect(useTranslatorModule.useTranslator).toHaveBeenCalledWith(
        'idp_management.notifications',
        customMessages,
      );
    });
  });

  describe('when handling complex domain state changes', () => {
    it('should update domain status in list after verification', async () => {
      mockDomainVerifyCreate.mockResolvedValue(mockVerifiedDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.domainsList).toEqual([mockDomain]);
      });

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        const updatedDomain = result.current.domainsList.find((d) => d.id === mockDomain.id);
        expect(updatedDomain?.status).toBe('verified');
      });
    });

    it('should prevent duplicate domains in idpDomains', async () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1'));

      // Wait for initial load which should add the domain
      await waitFor(() => {
        expect(result.current.idpDomains).toContain(mockDomain.id);
      });

      // Try to add the same domain again
      mockIdentityProviderDomainsCreate.mockResolvedValue({});

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      // Should not have duplicates
      const domainCount = result.current.idpDomains.filter((id) => id === mockDomain.id).length;
      expect(domainCount).toBe(1);
    });
  });
});
