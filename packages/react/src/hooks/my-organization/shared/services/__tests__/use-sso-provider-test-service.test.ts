import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { useSsoProviderTestService } from '@/hooks/my-organization/shared/services/use-sso-provider-test-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { setupMockUseCoreClient, setupMockUseCoreClientNull } from '@/tests/utils/test-utilities';

const idpId = 'con_123';
const testId = 'cnt_1111111111111111111111';

const created = {
  id: testId,
  status: 'in_progress' as const,
  test_url: 'https://example.auth0.com/try-connection?token=abc',
  created_at: '2026-11-03T00:00:00.000Z',
  expires_at: '2026-11-03T05:00:00.000Z',
};

describe('useSsoProviderTestService', () => {
  const mockCoreClient = createMockCoreClient();
  const mockOrgClient = mockCoreClient.getMyOrganizationApiClient();
  const mockCreate = vi.fn();
  const mockGet = vi.fn();
  let mockHandleError: Mock;
  const mockT = vi.fn((key: string) => key);

  const renderService = (currentTestId: string | null = null) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useSsoProviderTestService(idpId, currentTestId), { wrapper });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgClient.organization.identityProviders.tests.create = mockCreate;
    mockOrgClient.organization.identityProviders.tests.get = mockGet;
    mockCreate.mockResolvedValue(created);
    mockGet.mockResolvedValue({ ...created, status: 'in_progress' });
    setupMockUseCoreClient(mockCoreClient, useCoreClientModule);
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({ t: mockT } as never);
    mockHandleError = vi.fn();
    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(mockHandleError);
  });

  describe('startTest', () => {
    describe('when the request succeeds', () => {
      it('should create the test with an empty body and return it', async () => {
        const { result } = renderService();

        let response: unknown;
        await act(async () => {
          response = await result.current.startTest();
        });

        expect(mockCreate).toHaveBeenCalledWith(idpId, {});
        expect(response).toEqual(created);
      });
    });

    describe('when the request fails', () => {
      it('should report the error and resolve to null', async () => {
        const error = { status: 429 };
        mockCreate.mockRejectedValue(error);
        const { result } = renderService();

        let response: unknown;
        await act(async () => {
          response = await result.current.startTest();
        });

        expect(response).toBeNull();
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'test_provider_start_error',
        });
      });
    });

    describe('when there is no core client', () => {
      it('should resolve to null without calling the API', async () => {
        setupMockUseCoreClientNull(useCoreClientModule);
        const { result } = renderService();

        let response: unknown;
        await act(async () => {
          response = await result.current.startTest();
        });

        expect(response).toBeNull();
        expect(mockCreate).not.toHaveBeenCalled();
      });
    });
  });

  describe('poll', () => {
    describe('when there is no test id', () => {
      it('should not poll', async () => {
        const { result } = renderService(null);

        await waitFor(() => expect(result.current.poll.isPolling).toBe(false));
        expect(mockGet).not.toHaveBeenCalled();
      });
    });

    describe('when there is a test id', () => {
      it('should fetch the test result', async () => {
        renderService(testId);

        await waitFor(() => expect(mockGet).toHaveBeenCalledWith(idpId, testId));
      });
    });

    describe('when the test completes', () => {
      it('should stop polling with the result', async () => {
        const user = { email: 'bob@acme.corp' };
        mockGet.mockResolvedValue({ ...created, status: 'success', user });
        const { result } = renderService(testId);

        await waitFor(() => expect(result.current.poll.data).toMatchObject({ user }));
        expect(result.current.poll.isPolling).toBe(false);
      });
    });

    describe.each([403, 404])('when polling fails with %s', (status) => {
      it('should stop polling', async () => {
        mockGet.mockRejectedValue({ status });
        const { result } = renderService(testId);

        await waitFor(() => expect(result.current.poll.error).toEqual({ status }));
        expect(result.current.poll.isPolling).toBe(false);
      });
    });

    describe('when polling fails with 401', () => {
      it('should keep polling', async () => {
        mockGet.mockRejectedValue({ status: 401 });
        const { result } = renderService(testId);

        await waitFor(() => expect(result.current.poll.error).toEqual({ status: 401 }));
        expect(result.current.poll.isPolling).toBe(true);
      });
    });
  });
});
