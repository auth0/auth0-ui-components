import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIdpInstructionsService } from '@/hooks/my-organization/shared/services/use-idp-instructions-service';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import {
  createMockIdpInstructions,
  createMockIdpProvisioningInstructions,
} from '@/tests/utils/__mocks__/my-organization/idp-management/idp-instructions.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

vi.mock('@/hooks/shared/use-core-client');

describe('useIdpInstructionsService', () => {
  const mockCoreClient = createMockCoreClient();
  const configuration = mockCoreClient.getMyOrganizationApiClient().organization.configuration;
  const getCreation = vi.fn();
  const getProvisioning = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    configuration.identityProviderInstructions.get = getCreation;
    configuration.identityProviderProvisioningInstructions.get = getProvisioning;
    vi.mocked(useCoreClient).mockReturnValue({ coreClient: mockCoreClient });
  });

  const render = (options: Parameters<typeof useIdpInstructionsService>[0]) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useIdpInstructionsService(options), { wrapper });
  };

  it('loads creation instructions for the strategy and locale', async () => {
    getCreation.mockResolvedValue(createMockIdpInstructions('samlp'));

    const { result } = render({ kind: 'creation', strategy: 'samlp', locale: 'en' });

    await waitFor(() => expect(result.current.instructions).not.toBeNull());
    expect(getCreation).toHaveBeenCalledWith('samlp', { locale: 'en' });
    expect(result.current.instructions?.pages.map((page) => page.key)).toEqual([
      'samlp-create-application',
      'samlp-configure-connection-tabs',
      'samlp-attribute-mapping',
      'samlp-test-connection',
    ]);
    expect(getProvisioning).not.toHaveBeenCalled();
  });

  it('loads provisioning instructions when kind is provisioning', async () => {
    getProvisioning.mockResolvedValue(createMockIdpProvisioningInstructions('okta'));

    const { result } = render({ kind: 'provisioning', strategy: 'okta', locale: 'en' });

    await waitFor(() => expect(result.current.instructions).not.toBeNull());
    expect(getProvisioning).toHaveBeenCalledWith('okta', { locale: 'en' });
    expect(getCreation).not.toHaveBeenCalled();
  });

  it('resolves a 404 to null without retrying', async () => {
    getCreation.mockRejectedValue({ body: { status: 404 } });

    const { result } = render({ kind: 'creation', strategy: 'okta', locale: 'en' });

    await waitFor(() => expect(getCreation).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.instructions).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('does not fetch without a strategy', () => {
    const { result } = render({ kind: 'creation', strategy: undefined, locale: 'en' });

    expect(getCreation).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not fetch when disabled', () => {
    const { result } = render({ kind: 'creation', strategy: 'okta', locale: 'en', enabled: false });

    expect(getCreation).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not fetch in preview mode', () => {
    vi.mocked(useCoreClient).mockReturnValue({
      coreClient: { ...mockCoreClient, auth: { ...mockCoreClient.auth, previewMode: true } },
    });

    render({ kind: 'creation', strategy: 'okta', locale: 'en' });

    expect(getCreation).not.toHaveBeenCalled();
  });
});
