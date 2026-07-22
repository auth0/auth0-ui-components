import { PERMISSION_MANIFEST } from '@auth0/universal-components-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePermissions } from '@/hooks/my-organization/use-permissions';
import { CoreClientContext } from '@/hooks/shared/use-core-client';
import { PERMISSION_STALE_TIME_MS } from '@/lib/constants/common-constants';
import { PermissionProvider } from '@/providers/permission-context';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClient } from '@/tests/utils/test-provider';

const getPermissionsMock = (coreClient: ReturnType<typeof createMockCoreClient>) =>
  coreClient.getMyOrganizationApiClient!().organization.configuration.members.get as ReturnType<
    typeof vi.fn
  >;

const renderPermissions = (coreClient: ReturnType<typeof createMockCoreClient>) => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>
      <CoreClientContext.Provider value={{ coreClient }}>
        <PermissionProvider>{children}</PermissionProvider>
      </CoreClientContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(() => usePermissions(), { wrapper });
};

describe('PermissionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('caches permissions for 5 minutes', () => {
    expect(PERMISSION_STALE_TIME_MS).toBe(5 * 60 * 1000);
  });

  it('eagerly requests the full manifest as a comma-separated list', async () => {
    const coreClient = createMockCoreClient();
    const getPermissions = getPermissionsMock(coreClient);
    getPermissions.mockResolvedValue({ permissions: ['read:my_org:members'] });

    renderPermissions(coreClient);

    await waitFor(() => {
      expect(getPermissions).toHaveBeenCalledWith({ permissions: PERMISSION_MANIFEST.join(',') });
    });
  });

  it('exposes the granted subset returned by the API', async () => {
    const coreClient = createMockCoreClient();
    const getPermissions = getPermissionsMock(coreClient);
    getPermissions.mockResolvedValue({
      permissions: ['read:my_org:members', 'delete:my_org:members'],
    });

    const { result } = renderPermissions(coreClient);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasProvider).toBe(true);
    expect(result.current.permissions).toEqual(['read:my_org:members', 'delete:my_org:members']);
    expect(result.current.getUserTier('members')).toBe('admin');
  });

  it('provides an empty permission set until data resolves', async () => {
    const coreClient = createMockCoreClient();
    const getPermissions = getPermissionsMock(coreClient);
    let resolve: (value: { permissions: string[] }) => void = () => {};
    getPermissions.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );

    const { result } = renderPermissions(coreClient);

    expect(result.current.isLoading).toBe(true);
    expect(result.current.permissions).toEqual([]);

    resolve({ permissions: ['read:my_org:members'] });

    await waitFor(() => {
      expect(result.current.permissions).toEqual(['read:my_org:members']);
    });
  });
});
