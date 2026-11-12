import type { GetIdpTestResponseContent } from '@auth0/universal-components-core';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSsoProviderTestService } from '@/hooks/my-organization/shared/services/use-sso-provider-test-service';
import { useSsoProviderTest } from '@/hooks/my-organization/use-sso-provider-test';
import type { UsePollUntilReturn } from '@/types/poll-types';

vi.mock('@/hooks/my-organization/shared/services/use-sso-provider-test-service');

const idpId = 'con_123';
const testId = 'cnt_1111111111111111111111';
const testUrl = 'https://example.auth0.com/try-connection?token=abc';

const created = {
  id: testId,
  status: 'in_progress' as const,
  test_url: testUrl,
  created_at: '2026-11-03T00:00:00.000Z',
  expires_at: '2026-11-03T05:00:00.000Z',
};

const createPoll = (
  overrides: Partial<UsePollUntilReturn<GetIdpTestResponseContent>> = {},
): UsePollUntilReturn<GetIdpTestResponseContent> => ({
  data: undefined,
  error: null,
  attempts: 0,
  isPolling: true,
  timedOut: false,
  stop: vi.fn(),
  ...overrides,
});

const createTab = () => {
  const location = { href: '' };
  return {
    opener: {} as unknown,
    location,
    closed: false,
    close: vi.fn(),
  };
};

describe('useSsoProviderTest', () => {
  const startTest = vi.fn();
  let poll = createPoll();
  let tab = createTab();
  const openSpy = vi.fn();

  const mockService = () => {
    vi.mocked(useSsoProviderTestService).mockImplementation(() => ({
      startTest,
      isStarting: false,
      poll,
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    poll = createPoll();
    tab = createTab();
    startTest.mockResolvedValue(created);
    openSpy.mockReturnValue(tab);
    vi.stubGlobal('open', openSpy);
    mockService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const startTestRun = async () => {
    const hook = renderHook(() => useSsoProviderTest(idpId));
    await act(async () => {
      await hook.result.current.start();
    });
    return hook;
  };

  describe('initially', () => {
    it('should be idle', () => {
      const { result } = renderHook(() => useSsoProviderTest(idpId));

      expect(result.current.state).toBe('idle');
      expect(useSsoProviderTestService).toHaveBeenLastCalledWith(idpId, null, {
        customMessages: {},
      });
    });
  });

  describe('start', () => {
    describe('when the test starts', () => {
      it('should open a blank window before the request and then navigate it', async () => {
        let openedBeforeRequest = false;
        startTest.mockImplementation(async () => {
          openedBeforeRequest = openSpy.mock.calls.length === 1;
          return created;
        });

        const { result } = await startTestRun();

        expect(openSpy).toHaveBeenCalledWith(
          '',
          '_blank',
          expect.stringContaining('popup=yes,width='),
        );
        expect(openedBeforeRequest).toBe(true);
        expect(tab.opener).toBeNull();
        expect(tab.location.href).toBe(testUrl);
        expect(result.current.state).toBe('polling');
        expect(result.current.blockedTestUrl).toBeNull();
        expect(useSsoProviderTestService).toHaveBeenLastCalledWith(idpId, testId, {
          customMessages: {},
        });
      });
    });

    describe('when the browser blocks the window', () => {
      it('should expose the test URL for a manual link', async () => {
        openSpy.mockReturnValue(null);

        const { result } = await startTestRun();

        expect(result.current.state).toBe('polling');
        expect(result.current.blockedTestUrl).toBe(testUrl);
      });
    });

    describe('when the request fails', () => {
      it('should close the window and return to idle', async () => {
        startTest.mockResolvedValue(null);

        const { result } = await startTestRun();

        expect(tab.close).toHaveBeenCalled();
        expect(result.current.state).toBe('idle');
      });
    });
  });

  describe('poll outcome', () => {
    describe('when the test succeeds', () => {
      it('should expose the user', async () => {
        const user = { email: 'bob@acme.corp' };
        const { result, rerender } = await startTestRun();

        poll = createPoll({ isPolling: false, data: { ...created, status: 'success', user } });
        mockService();
        rerender();

        expect(result.current.state).toBe('success');
        expect(result.current.user).toEqual(user);
      });
    });

    describe('when the provider returns an error', () => {
      it('should expose the provider message', async () => {
        const { result, rerender } = await startTestRun();

        poll = createPoll({
          isPolling: false,
          data: { ...created, status: 'error', error: { message: 'Invalid issuer' } },
        });
        mockService();
        rerender();

        expect(result.current.state).toBe('error');
        expect(result.current.errorReason).toBe('provider');
        expect(result.current.errorMessage).toBe('Invalid issuer');
      });
    });

    describe.each([
      [404, 'expired'],
      [403, 'forbidden'],
    ])('when polling stops with %s', (status, reason) => {
      it(`should report ${reason}`, async () => {
        const { result, rerender } = await startTestRun();

        poll = createPoll({ isPolling: false, error: { status } });
        mockService();
        rerender();

        expect(result.current.state).toBe('error');
        expect(result.current.errorReason).toBe(reason);
      });
    });

    describe('when polling times out', () => {
      it('should report a timeout', async () => {
        const { result, rerender } = await startTestRun();

        poll = createPoll({ isPolling: false, timedOut: true });
        mockService();
        rerender();

        expect(result.current.state).toBe('timeout');
      });
    });

    describe('when a non-fatal error occurs while polling', () => {
      it('should stay polling', async () => {
        const { result, rerender } = await startTestRun();

        poll = createPoll({ isPolling: true, error: { status: 401 } });
        mockService();
        rerender();

        expect(result.current.state).toBe('polling');
      });
    });
  });

  describe('retry', () => {
    it('should close the previous window and start a new test', async () => {
      const { result } = await startTestRun();
      const nextTab = createTab();
      openSpy.mockReturnValue(nextTab);

      await act(async () => {
        await result.current.retry();
      });

      expect(tab.close).toHaveBeenCalled();
      expect(startTest).toHaveBeenCalledTimes(2);
      expect(nextTab.location.href).toBe(testUrl);
      expect(result.current.state).toBe('polling');
    });
  });

  describe('cancel', () => {
    it('should close the window and return to idle', async () => {
      const { result } = await startTestRun();

      act(() => result.current.cancel());

      expect(tab.close).toHaveBeenCalled();
      expect(result.current.state).toBe('idle');
      expect(useSsoProviderTestService).toHaveBeenLastCalledWith(idpId, null, {
        customMessages: {},
      });
    });
  });

  describe('when unmounted while polling', () => {
    it('should leave the test window open', async () => {
      const { unmount } = await startTestRun();

      unmount();

      expect(tab.close).not.toHaveBeenCalled();
    });
  });
});
