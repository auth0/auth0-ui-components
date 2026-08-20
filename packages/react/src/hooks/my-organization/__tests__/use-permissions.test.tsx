import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePermissions } from '../use-permissions';

import { usePermissionsService } from '@/hooks/my-organization/shared/services/use-permissions-service';
import type { UsePermissionsResult } from '@/types/permissions/permissions-types';

vi.mock('@/hooks/my-organization/shared/services/use-permissions-service', () => ({
  usePermissionsService: vi.fn(),
}));

const mockUsePermissionsService = vi.mocked(usePermissionsService);

describe('usePermissions', () => {
  it('delegates to usePermissionsService and returns its result', () => {
    const serviceResult: UsePermissionsResult = {
      permissions: ['read:my_org:members'],
      isLoading: false,
      createPermissionResolver: vi.fn(),
    };
    mockUsePermissionsService.mockReturnValue(serviceResult);

    const { result } = renderHook(() => usePermissions());

    expect(mockUsePermissionsService).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(serviceResult);
  });
});
