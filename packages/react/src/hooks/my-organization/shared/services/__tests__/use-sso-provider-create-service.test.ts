import {
  domainQueryKeys,
  ssoDomainQueryKeys,
  type CreateIdentityProviderRequestContentPrivate,
  type IdpKnownResponse,
} from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderCreateService } from '@/hooks/my-organization/shared/services/use-sso-provider-create-service';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MAX_ORG_DOMAINS } from '@/lib/constants/my-organization/domain-management/domain-management-constants';
import { createMockDomain } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { createMockUseIdpConfig } from '@/tests/utils/__mocks__/my-organization/idp-management/idp-config.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

vi.mock('@/hooks/shared/use-core-client');
vi.mock('@/hooks/shared/use-translator');
vi.mock('@/components/auth0/shared/toast');
vi.mock('@/hooks/shared/use-error-handler');
vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service');

describe('useSsoProviderCreateService', () => {
  const mockCreate = vi.fn();
  let mockHandleError: Mock;

  const mockIdentityProvider: IdpKnownResponse = {
    id: 'idp_123',
    name: 'test-provider',
    strategy: 'samlp',
    display_name: 'Test Provider',
    options: {},
    attributes: [],
  };

  const mockT = vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'notifications.provider_create_success') {
      return `Provider ${params?.providerName} created successfully`;
    }
    if (key === 'notifications.provider_create_duplicated_provider_error') {
      return `Provider ${params?.providerName} already exists`;
    }
    if (key === 'notifications.provider_create_discovery_failure') {
      return `${params?.domain} not found. Check the domain and try again.`;
    }
    if (key === 'notifications.general_error') {
      return 'An error occurred';
    }
    return key;
  });

  const mockList = vi.fn();

  const mockOrgClient = {
    organization: {
      identityProviders: {
        create: mockCreate,
      },
      domains: { list: mockList },
    },
  };
  const mockCoreClient = {
    getMyOrganizationApiClient: () => mockOrgClient,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useCoreClient as Mock).mockReturnValue({ coreClient: mockCoreClient });
    (useTranslator as Mock).mockReturnValue({ t: mockT });
    mockHandleError = vi.fn();
    (useErrorHandler as Mock).mockReturnValue(mockHandleError);
    vi.mocked(useIdpConfig).mockReturnValue(createMockUseIdpConfig());
    mockList.mockResolvedValue({ response: { organization_domains: [] } });
  });

  const renderUseSsoProviderCreateService = (
    ...args: Parameters<typeof useSsoProviderCreateService>
  ) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useSsoProviderCreateService(...args), { wrapper });
  };

  it('should initialize with isCreating as false', () => {
    const { result } = renderUseSsoProviderCreateService();

    expect(result.current.isCreating).toBe(false);
    expect(typeof result.current.createProvider).toBe('function');
  });

  it('should create a provider successfully', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockResolvedValue(mockIdentityProvider);

    const { result } = renderUseSsoProviderCreateService();

    await expect(result.current.createProvider(mockProviderData)).resolves.toEqual(
      mockIdentityProvider,
    );

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Provider test-provider created successfully',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  it('should set isCreating to true during creation', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockIdentityProvider), 100)),
    );

    const { result } = renderUseSsoProviderCreateService();

    const createPromise = result.current.createProvider(mockProviderData);

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
    });

    await createPromise;

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });

  it('should handle duplicate provider error (409)', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'duplicate-provider',
      display_name: 'Duplicate Provider',
      signingCert: 'cert123',
    };

    const error = {
      body: {
        status: 409,
        type: 'https://auth0.com/api-errors#A0E-409-0001',
      },
    };

    mockCreate.mockRejectedValue(error);

    const { result } = renderUseSsoProviderCreateService();

    await expect(result.current.createProvider(mockProviderData)).rejects.toBeDefined();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Provider duplicate-provider already exists',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('discovery failure errors', () => {
    const baseOktaProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'okta',
      name: 'test-okta-provider',
      display_name: 'Test Okta Provider',
      domain: 'test.okta.com',
      client_id: 'client123',
      client_secret: 'secret123',
    };

    it('should handle discovery failure error with domain from error detail', async () => {
      const error = {
        body: {
          status: 400,
          detail: 'discovery failure: invalid-domain.okta.com',
        },
      };

      mockCreate.mockRejectedValue(error);

      const { result } = renderUseSsoProviderCreateService();

      await expect(result.current.createProvider(baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'invalid-domain.okta.com not found. Check the domain and try again.',
        });
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should handle discovery failure error with uppercase detail', async () => {
      const error = {
        body: {
          status: 400,
          detail: 'Discovery Failure: test.okta.com',
        },
      };

      mockCreate.mockRejectedValue(error);

      const { result } = renderUseSsoProviderCreateService();

      await expect(result.current.createProvider(baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'test.okta.com not found. Check the domain and try again.',
        });
      });
    });

    it('should fall back to general error when detail does not contain discovery failure', async () => {
      const error = {
        body: {
          status: 400,
          detail: 'Some other error message',
        },
      };

      mockCreate.mockRejectedValue(error);

      const { result } = renderUseSsoProviderCreateService();

      await expect(result.current.createProvider(baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'An error occurred',
        });
      });
    });

    it('should fall back to general error when detail is missing', async () => {
      const error = {
        body: {
          status: 400,
        },
      };

      mockCreate.mockRejectedValue(error);

      const { result } = renderUseSsoProviderCreateService();

      await expect(result.current.createProvider(baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'An error occurred',
        });
      });
    });
  });

  it('should handle general errors', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockRejectedValue(new Error('Network error'));

    const { result } = renderUseSsoProviderCreateService();

    await expect(result.current.createProvider(mockProviderData)).rejects.toBeDefined();

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
        fallbackMessage: 'An error occurred',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  it('should call onBefore callback and proceed when it returns true', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onBefore = vi.fn().mockReturnValue(true);
    mockCreate.mockResolvedValue(mockIdentityProvider);

    const { result } = renderUseSsoProviderCreateService({
      createAction: { onBefore },
    });

    await expect(result.current.createProvider(mockProviderData)).resolves.toEqual(
      mockIdentityProvider,
    );

    await waitFor(() => {
      expect(onBefore).toHaveBeenCalledWith(mockProviderData);
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  it('should call onBefore callback and abort when it returns false', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onBefore = vi.fn().mockReturnValue(false);

    const { result } = renderUseSsoProviderCreateService({
      createAction: { onBefore },
    });

    await expect(result.current.createProvider(mockProviderData)).resolves.toBeUndefined();

    expect(onBefore).toHaveBeenCalledWith(mockProviderData);
    expect(mockCreate).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(showToast).not.toHaveBeenCalled();
    });
  });

  it('should call onAfter callback after successful creation', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onAfter = vi.fn();
    mockCreate.mockResolvedValue(mockIdentityProvider);

    const { result } = renderUseSsoProviderCreateService({
      createAction: { onAfter },
    });

    await expect(result.current.createProvider(mockProviderData)).resolves.toEqual(
      mockIdentityProvider,
    );

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProviderData, mockIdentityProvider);
    });
  });

  it('should not call onAfter callback when creation fails', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onAfter = vi.fn();
    mockCreate.mockRejectedValue(new Error('Creation failed'));

    const { result } = renderUseSsoProviderCreateService({
      createAction: { onAfter },
    });

    await expect(result.current.createProvider(mockProviderData)).rejects.toBeDefined();

    await waitFor(() => {
      expect(onAfter).not.toHaveBeenCalled();
    });
  });

  it('should return early if coreClient is not available', async () => {
    (useCoreClient as Mock).mockReturnValue({ coreClient: null });

    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const { result } = renderUseSsoProviderCreateService();

    await expect(result.current.createProvider(mockProviderData)).resolves.toBeUndefined();

    expect(mockCreate).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });
  });

  describe('show_as_button and assign_membership_on_login fields', () => {
    const baseProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    it('should pass show_as_button at top level, not in options', async () => {
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();

      await result.current.createProvider({ ...baseProviderData, show_as_button: true });

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            show_as_button: true,
          }),
        );
      });
    });

    it('should pass assign_membership_on_login at top level, not in options', async () => {
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();

      await result.current.createProvider({
        ...baseProviderData,
        assign_membership_on_login: true,
      });

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            assign_membership_on_login: true,
          }),
        );
      });
    });

    it('should pass both show_as_button and assign_membership_on_login at top level', async () => {
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();

      await result.current.createProvider({
        ...baseProviderData,
        show_as_button: false,
        assign_membership_on_login: true,
      });

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            show_as_button: false,
            assign_membership_on_login: true,
          }),
        );
      });
    });

    it('omits show_as_button and assign_membership_on_login when can_set_* is false', async () => {
      vi.mocked(useIdpConfig).mockReturnValue(
        createMockUseIdpConfig({
          idpConfig: {
            strategies: {},
            organization: {
              can_set_show_as_button: false,
              can_set_assign_membership_on_login: false,
            },
          } as never,
        }),
      );

      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();

      await result.current.createProvider({
        ...baseProviderData,
        show_as_button: false,
        assign_membership_on_login: false,
      });

      await waitFor(() => {
        const payload = mockCreate.mock.calls[0]![0];
        expect(payload).not.toHaveProperty('show_as_button');
        expect(payload).not.toHaveProperty('assign_membership_on_login');
      });
    });
  });
  describe('domains', () => {
    const providerData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
      domains: ['acme.com', 'initech.com'],
    };

    const withMode = (mode?: string) =>
      vi.mocked(useIdpConfig).mockReturnValue(
        createMockUseIdpConfig({
          idpConfig: {
            strategies: {},
            organization: {},
            ...(mode === undefined ? {} : { domain_aliases_config: { domain_verification: mode } }),
          } as never,
        }),
      );

    it.each(['optional', 'required'])('should send the domains in %s mode', async (mode) => {
      withMode(mode);
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();
      await result.current.createProvider(providerData);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({ domains: ['acme.com', 'initech.com'] }),
        );
      });
    });

    it.each([
      ['the mode is none', 'none'],
      ['the mode is not a known one', 'strict'],
      ['the configuration reports no mode', undefined],
    ])('should not send domains when %s', async (_label, mode) => {
      withMode(mode);
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();
      await result.current.createProvider(providerData);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      });
      expect(mockCreate.mock.calls[0]![0]).not.toHaveProperty('domains');
    });

    it('should not send an empty list of domains', async () => {
      withMode('optional');
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();
      await result.current.createProvider({ ...providerData, domains: [] });

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      });
      expect(mockCreate.mock.calls[0]![0]).not.toHaveProperty('domains');
    });

    it('should keep the domains out of the provider options', async () => {
      withMode('required');
      mockCreate.mockResolvedValue(mockIdentityProvider);

      const { result } = renderUseSsoProviderCreateService();
      await result.current.createProvider(providerData);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      });
      expect(mockCreate.mock.calls[0]![0].options).not.toHaveProperty('domains');
    });

    describe('after the provider is created', () => {
      const renderWithClient = () => {
        const { wrapper, queryClient } = createTestQueryClientWrapper();
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
        const { result } = renderHook(() => useSsoProviderCreateService(), { wrapper });
        return { result, invalidate };
      };

      it('should refresh the domain and provider caches when domains were attached', async () => {
        withMode('required');
        mockCreate.mockResolvedValue({ ...mockIdentityProvider, domains: ['acme.com'] });
        const { result, invalidate } = renderWithClient();

        await result.current.createProvider(providerData);

        await waitFor(() => {
          expect(invalidate).toHaveBeenCalledWith({ queryKey: domainQueryKeys.lists() });
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: domainQueryKeys.available() });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: domainQueryKeys.allProviders() });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: ssoDomainQueryKeys.lists() });
      });

      it('should leave the domain caches alone when no domain was attached', async () => {
        withMode('optional');
        mockCreate.mockResolvedValue(mockIdentityProvider);
        const { result, invalidate } = renderWithClient();

        await result.current.createProvider({ ...providerData, domains: [] });

        await waitFor(() => {
          expect(mockCreate).toHaveBeenCalledTimes(1);
        });
        expect(invalidate).not.toHaveBeenCalledWith({ queryKey: domainQueryKeys.lists() });
        expect(invalidate).not.toHaveBeenCalledWith({ queryKey: domainQueryKeys.available() });
      });
    });
  });
  describe('the domains field', () => {
    const domain = (name: string, status: 'verified' | 'pending', association: string) =>
      createMockDomain({
        id: `id_${name}`,
        domain: name,
        status,
        identity_provider_association: association as 'associated' | 'unassociated',
      });
    const acme = domain('acme.com', 'verified', 'unassociated');
    const initech = domain('initech.com', 'verified', 'unassociated');
    const pending = domain('pending.com', 'pending', 'unassociated');
    const taken = domain('taken.com', 'verified', 'associated');

    const withMode = (mode?: string) =>
      vi.mocked(useIdpConfig).mockReturnValue(
        createMockUseIdpConfig({
          idpConfig: {
            strategies: {},
            organization: {},
            ...(mode === undefined ? {} : { domain_aliases_config: { domain_verification: mode } }),
          } as never,
        }),
      );

    beforeEach(() => {
      mockList.mockResolvedValue({
        response: { organization_domains: [acme, pending, taken, initech] },
      });
    });

    describe.each([
      ['the mode is none', 'none'],
      ['the mode is not a known one', 'strict'],
      ['the configuration reports no mode', undefined],
    ])('when %s', (_label, mode) => {
      it('should not offer the field or load domains', () => {
        withMode(mode);

        const { result } = renderUseSsoProviderCreateService({ canListDomains: true });

        expect(result.current.providerDomains).toBeNull();
        expect(mockList).not.toHaveBeenCalled();
      });
    });

    describe('when the mode is optional', () => {
      beforeEach(() => withMode('optional'));

      it('should offer the verified domains that no provider holds', async () => {
        const { result } = renderUseSsoProviderCreateService({ canListDomains: true });

        await waitFor(() => {
          expect(result.current.providerDomains?.options).toEqual([acme, initech]);
        });
        expect(result.current.providerDomains).toMatchObject({
          mode: 'optional',
          isLoading: false,
          canList: true,
        });
      });

      it('should ask for as many domains as the Assign list does', async () => {
        renderUseSsoProviderCreateService({ canListDomains: true });

        await waitFor(() => {
          expect(mockList).toHaveBeenCalledWith({ take: MAX_ORG_DOMAINS });
        });
      });

      it('should report loading until the domains arrive', async () => {
        const { result } = renderUseSsoProviderCreateService({ canListDomains: true });

        expect(result.current.providerDomains).toMatchObject({ isLoading: true, options: [] });

        await waitFor(() => {
          expect(result.current.providerDomains?.isLoading).toBe(false);
        });
      });

      it('should not offer the field without permission to list domains', () => {
        const { result } = renderUseSsoProviderCreateService({ canListDomains: false });

        expect(result.current.providerDomains).toBeNull();
        expect(mockList).not.toHaveBeenCalled();
      });

      it('should not offer the field when the permission is not given', () => {
        const { result } = renderUseSsoProviderCreateService();

        expect(result.current.providerDomains).toBeNull();
      });
    });

    describe('when the mode is required', () => {
      beforeEach(() => withMode('required'));

      it('should offer the field with the available domains', async () => {
        const { result } = renderUseSsoProviderCreateService({ canListDomains: true });

        await waitFor(() => {
          expect(result.current.providerDomains?.options).toEqual([acme, initech]);
        });
        expect(result.current.providerDomains).toMatchObject({ mode: 'required', canList: true });
      });

      it('should keep the field, marked as not listable, without loading domains', () => {
        const { result } = renderUseSsoProviderCreateService({ canListDomains: false });

        expect(result.current.providerDomains).toMatchObject({
          mode: 'required',
          canList: false,
          options: [],
        });
        expect(mockList).not.toHaveBeenCalled();
      });

      it('should offer no domains when the organization has none', async () => {
        mockList.mockResolvedValue({ response: undefined });

        const { result } = renderUseSsoProviderCreateService({ canListDomains: true });

        await waitFor(() => {
          expect(result.current.providerDomains?.isLoading).toBe(false);
        });
        expect(result.current.providerDomains?.options).toEqual([]);
      });

      it('should load fresh domains each time it mounts', async () => {
        const { wrapper } = createTestQueryClientWrapper();
        const first = renderHook(() => useSsoProviderCreateService({ canListDomains: true }), {
          wrapper,
        });
        await waitFor(() => {
          expect(first.result.current.providerDomains?.options).toHaveLength(2);
        });
        first.unmount();

        renderHook(() => useSsoProviderCreateService({ canListDomains: true }), { wrapper });

        await waitFor(() => {
          expect(mockList).toHaveBeenCalledTimes(2);
        });
      });

      it('should report a failure to load the domains', async () => {
        mockList.mockRejectedValue(new Error('Request failed'));

        renderUseSsoProviderCreateService({ canListDomains: true });

        await waitFor(() => {
          expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error), {
            fallbackMessage: 'An error occurred',
          });
        });
      });
    });
  });
});
