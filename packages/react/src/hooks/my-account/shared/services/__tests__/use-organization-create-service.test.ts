import {
  OrganizationDetailsFactory,
  userOrganizationQueryKeys,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationCreateService } from '@/hooks/my-account/shared/services/use-organization-create-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

const values: OrganizationPrivate = {
  ...OrganizationDetailsFactory.create(),
  name: 'bulba_leaf',
  display_name: 'Bulba Leaf',
};
const created = { id: 'org_123', name: 'bulba_leaf', display_name: 'Bulba Leaf' };

const createApiError = (status: number) =>
  Object.assign(new Error('Request failed'), { statusCode: status });

describe('useOrganizationCreateService', () => {
  let createOrganization: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    createOrganization = mockCoreClient.getMyAccountApiClient().organizations.create as ReturnType<
      typeof vi.fn
    >;
    createOrganization.mockResolvedValue(created);
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  const render = (options: Parameters<typeof useOrganizationCreateService>[0] = {}) => {
    const { wrapper, queryClient } = createQueryClientWrapper();
    return { ...renderHook(() => useOrganizationCreateService(options), { wrapper }), queryClient };
  };

  describe('when createAction.onAfter fails', () => {
    it('still reports success and shows no error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onAfter = vi.fn().mockRejectedValue(new Error('navigation failed'));
      const { result } = render({ createAction: { onAfter } });

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.createOrganization(values);
      });

      expect(success).toBe(true);
      expect(mockedShowToast).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
      expect(consoleError).toHaveBeenCalledTimes(1);
      consoleError.mockRestore();
    });
  });

  describe('when creation succeeds', () => {
    it('sends the mapped payload and resolves to true', async () => {
      const { result } = render();

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.createOrganization(values);
      });

      expect(success).toBe(true);
      expect(createOrganization).toHaveBeenCalledWith({
        name: 'bulba_leaf',
        display_name: 'Bulba Leaf',
        branding: { colors: values.branding.colors },
      });
    });

    it('shows the success toast, refreshes organization lists, and calls onAfter', async () => {
      const onAfter = vi.fn();
      const { result, queryClient } = render({ createAction: { onAfter } });
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

      await act(async () => {
        await result.current.createOrganization(values);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'notifications.success',
      });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: userOrganizationQueryKeys.all });
      expect(onAfter).toHaveBeenCalledWith(values, created);
    });
  });

  describe('when createAction.onBefore returns false', () => {
    it('skips the request and resolves to false', async () => {
      const { result } = render({ createAction: { onBefore: () => false } });

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.createOrganization(values);
      });

      expect(success).toBe(false);
      expect(createOrganization).not.toHaveBeenCalled();
    });
  });

  describe('when creation fails', () => {
    it('shows the conflict message for a 409', async () => {
      createOrganization.mockRejectedValue(createApiError(409));
      const onAfter = vi.fn();
      const { result } = render({ createAction: { onAfter } });

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.createOrganization(values);
      });

      expect(success).toBe(false);
      expect(onAfter).not.toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'notifications.conflict_error',
      });
    });

    it('uses the shared error handler for other errors', async () => {
      createOrganization.mockRejectedValue(createApiError(403));
      const { result } = render();

      await act(async () => {
        await result.current.createOrganization(values);
      });

      expect(mockedShowToast).toHaveBeenCalledTimes(1);
      expect(mockedShowToast).not.toHaveBeenCalledWith(
        expect.objectContaining({ message: 'notifications.conflict_error' }),
      );
    });
  });
});
