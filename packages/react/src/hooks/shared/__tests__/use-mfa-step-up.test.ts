import type { MfaApiClient } from '@auth0/universal-components-core';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, StrictMode, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import { useMfaStepUp } from '@/hooks/shared/use-mfa-step-up';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  createMockCoreClient,
  createMockMfaApiClient,
} from '@/tests/utils/__mocks__/core/core-client.mocks';
import { mockMfaRequiredError } from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { setupAllCommonMocks } from '@/tests/utils/test-utilities';

describe('useMfaStepUp', () => {
  let mockCoreClient: ReturnType<typeof createMockCoreClient>;
  let stepUpApi: MfaApiClient;
  let handleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    stepUpApi = createMockMfaApiClient();
    mockCoreClient = createMockCoreClient(undefined, stepUpApi);
    stepUpApi.getEnrollmentFactors = vi.fn().mockResolvedValue([{ type: 'otp' }]);
    handleError = vi.fn();

    setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
      handleError,
    });
  });

  const render = (
    props: { error: unknown } = { error: mockMfaRequiredError },
    wrapper?: React.FC<{ children: ReactNode }>,
  ) => renderHook((hookProps) => useMfaStepUp(hookProps), { initialProps: props, wrapper });

  it('loads the options and lands on the list', async () => {
    const { result } = render();

    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    expect(result.current.snapshot?.options.map((option) => option.id)).toEqual(['enroll:otp']);
    expect(stepUpApi.getEnrollmentFactors).toHaveBeenCalledWith(mockMfaRequiredError.mfa_token);
  });

  it('follows the machine as the user moves through the flow', async () => {
    const { result } = render();
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));

    await act(async () => {
      await result.current.machine?.next('enroll:otp');
    });

    expect(result.current.snapshot?.step).toBe('enroll.qr');
  });

  it('sends each request once under StrictMode', async () => {
    const strict = ({ children }: { children: ReactNode }) =>
      createElement(StrictMode, null, children);
    const { result } = render(undefined, strict);

    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    expect(stepUpApi.getEnrollmentFactors).toHaveBeenCalledTimes(1);
  });

  it('keeps the machine alive under StrictMode, and disposes it when it really unmounts', async () => {
    const strict = ({ children }: { children: ReactNode }) =>
      createElement(StrictMode, null, children);
    const { result, unmount } = render(undefined, strict);
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    const machine = result.current.machine!;
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(machine.getSnapshot().status).toBe('active');

    unmount();

    await waitFor(() => expect(machine.getSnapshot().reason).toBe('disposed'));
  });

  it('can be rendered on a server, where no machine exists yet', () => {
    const Probe = () => {
      const { snapshot } = useMfaStepUp({ error: mockMfaRequiredError });
      return createElement('p', null, snapshot?.status ?? 'no snapshot');
    };

    expect(renderToString(createElement(Probe))).toContain('no snapshot');
  });

  it('never returns the old flow for a new token, not even for one render', async () => {
    const seen: Array<{ token: string; machine?: unknown }> = [];
    const { result, rerender } = renderHook(
      ({ error }) => {
        const value = useMfaStepUp({ error });
        seen.push({ token: error.mfa_token, machine: value.machine });
        return value;
      },
      { initialProps: { error: mockMfaRequiredError } },
    );
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    const first = result.current.machine;

    rerender({ error: { ...mockMfaRequiredError, mfa_token: 'another-token' } });
    await waitFor(() => expect(result.current.machine).not.toBe(first));

    expect(
      seen.filter((render) => render.token === 'another-token').map((render) => render.machine),
    ).not.toContain(first);
  });

  it('returns nothing once the core client is gone, not the disposed machine', async () => {
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: null });
    rerender({ error: mockMfaRequiredError });

    await waitFor(() => expect(result.current.machine).toBeUndefined());
    expect(result.current.snapshot).toBeUndefined();
  });

  it('creates no machine for an error that is not mfa_required', async () => {
    const { result } = render({ error: new Error('boom') });

    await waitFor(() => expect(mockCoreClient.createMfaStepUpMachine).not.toHaveBeenCalled());
    expect(result.current.machine).toBeUndefined();
  });

  it('does not restart for an equal error object, but does for a new token', async () => {
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    const first = result.current.machine;

    rerender({ error: { ...mockMfaRequiredError } });
    expect(result.current.machine).toBe(first);

    rerender({ error: { ...mockMfaRequiredError, mfa_token: 'another-token' } });
    expect(result.current.machine).not.toBe(first);
    await waitFor(() =>
      expect(stepUpApi.getEnrollmentFactors).toHaveBeenCalledWith('another-token'),
    );
  });

  it('disposes the old machine when the token changes', async () => {
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    const first = result.current.machine!;

    rerender({ error: { ...mockMfaRequiredError, mfa_token: 'another-token' } });

    await waitFor(() => expect(first.getSnapshot().reason).toBe('disposed'));
    expect(result.current.machine).not.toBe(first);
    expect(result.current.machine?.getSnapshot().status).not.toBe('cancelled');
  });

  it('disposes the machine when the component unmounts', async () => {
    const { result, unmount } = render();
    await waitFor(() => expect(result.current.snapshot?.step).toBe('list'));
    const machine = result.current.machine!;

    unmount();

    await waitFor(() => expect(machine.getSnapshot().reason).toBe('disposed'));
  });

  it('reports request errors through the error handler', async () => {
    const boom = new Error('boom');
    stepUpApi.getEnrollmentFactors = vi.fn().mockRejectedValue(boom);

    const { result } = render();

    await waitFor(() => expect(result.current.snapshot?.status).toBe('blocked'));
    expect(handleError).toHaveBeenCalledWith(boom);
  });

  it('has no snapshot without a core client', () => {
    setupAllCommonMocks({
      coreClient: null,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
      handleError,
    });

    const { result } = render();

    expect(result.current.machine).toBeUndefined();
    expect(result.current.snapshot).toBeUndefined();
  });
});
