import {
  withMfaStepUp,
  mfaStepUpStore,
  type MfaAuthenticator,
} from '@auth0/universal-components-core';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MfaStepUpDialog } from '@/components/auth0/shared/gate-keeper/mfa-step-up/mfa-step-up-dialog';
import { GateKeeperContext } from '@/providers/gate-keeper-context';
import {
  createMockCoreClient,
  createMockMfaApiClient,
} from '@/tests/utils/__mocks__/core/core-client.mocks';
import { mockMfaRequiredError } from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { MfaStepUpSettings } from '@/types/mfa-step-up-types';

const recoveryCode: MfaAuthenticator = {
  id: 'rc-1',
  authenticatorType: 'recovery-code',
  active: true,
};

describe('MfaStepUpDialog', () => {
  let apiClient: ReturnType<typeof createMockMfaApiClient>;

  beforeEach(() => {
    apiClient = createMockMfaApiClient();
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([recoveryCode]);
    vi.mocked(apiClient.verify).mockResolvedValue({ access_token: 'token' });
  });

  afterEach(() => {
    mfaStepUpStore.getSnapshot()?.cancel();
  });

  const renderHost = (settings?: MfaStepUpSettings) =>
    renderWithProviders(
      <GateKeeperContext.Provider value={{ error: null, mfaStepUp: settings }}>
        <MfaStepUpDialog />
      </GateKeeperContext.Provider>,
      { coreClient: createMockCoreClient(undefined, apiClient) },
    );

  const open = (error: unknown = mockMfaRequiredError) => {
    let outcome: Promise<unknown>;
    act(() => {
      outcome = mfaStepUpStore.request(error).then(
        () => 'done',
        (failure: unknown) => failure,
      );
    });
    return outcome!;
  };

  const passMfa = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(await screen.findByRole('radio', { name: /mfa.method.recovery/ }));
    await user.click(screen.getByRole('button', { name: 'mfa.continue' }));
    await user.click(await screen.findByRole('button', { name: 'mfa.confirm.verify_selected' }));
    await user.type(await screen.findByRole('textbox'), 'ABCD-1234');
    await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));
  };

  it('shows nothing while no step-up is open', () => {
    renderHost();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens for a step-up, and settles it as done once the user passed MFA', async () => {
    const user = userEvent.setup();
    renderHost();
    const outcome = open();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await passMfa(user);

    expect(await outcome).toBe('done');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(apiClient.verify).toHaveBeenCalledWith(
      expect.objectContaining({ recoveryCode: 'ABCD-1234' }),
    );
  });

  it('fails the caller with a cancelled error carrying its own error when the user presses Escape', async () => {
    const user = userEvent.setup();
    renderHost();
    const outcome = open();
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');

    expect(await outcome).toMatchObject({ code: 'cancelled', cause: mockMfaRequiredError });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('fails the caller with the cancelled error when the user presses Cancel', async () => {
    const user = userEvent.setup();
    renderHost();
    const outcome = open();

    await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

    expect(await outcome).toMatchObject({ code: 'cancelled' });
  });

  it('fails the caller with the real reason when the service is down', async () => {
    vi.mocked(apiClient.getAuthenticators).mockRejectedValue(
      Object.assign(new Error('Bad Request'), {
        status: 400,
        data: { error: 'unknown_error', error_description: 'fetch failed' },
      }),
    );
    renderHost();

    const outcome = open();

    expect(await outcome).toMatchObject({ code: 'unavailable' });
  });

  it('shows one dialog for callers that fail together, and settles all of them', async () => {
    const user = userEvent.setup();
    renderHost();
    const first = open();
    const second = open({ ...mockMfaRequiredError, mfa_token: 'another-token' });

    await screen.findByRole('dialog');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    await passMfa(user);

    expect(await Promise.all([first, second])).toEqual(['done', 'done']);
  });

  describe('a call wrapped in withMfaStepUp', () => {
    it('returns the result of the second try, after the user passed MFA in the dialog', async () => {
      const user = userEvent.setup();
      renderHost();
      const call = vi
        .fn<() => Promise<string>>()
        .mockRejectedValueOnce({ response: { status: 403, data: mockMfaRequiredError } })
        .mockResolvedValueOnce('orders');

      const result = withMfaStepUp(call);
      await passMfa(user);

      expect(await result).toBe('orders');
      expect(call).toHaveBeenCalledTimes(2);
    });

    it('rejects with a cancelled error, and does not call again, when the user cancels', async () => {
      const user = userEvent.setup();
      renderHost();
      const call = vi
        .fn<() => Promise<unknown>>()
        .mockRejectedValue({ response: { status: 403, data: mockMfaRequiredError } });

      const result = withMfaStepUp(call).catch((error: unknown) => error);
      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(await result).toMatchObject({ code: 'cancelled' });
      expect(call).toHaveBeenCalledTimes(1);
    });
  });

  describe('with the integrator’s settings', () => {
    it('shows the screen that replaces a built-in one', async () => {
      renderHost({ screens: { list: () => <p>my own list</p> } });
      void open();

      expect(await screen.findByText('my own list')).toBeInTheDocument();
    });

    it('shows the screen of an added step after MFA', async () => {
      const user = userEvent.setup();
      renderHost({
        flow: { add: [{ id: 'consent' }] },
        screens: { consent: () => <p>accept the terms</p> },
      });
      void open();

      await passMfa(user);

      expect(await screen.findByText('accept the terms')).toBeInTheDocument();
    });

    it('aligns the buttons, and adds the class of the dialog', async () => {
      renderHost({ actionsAlign: 'center', classes: { 'MfaStepUp-dialogContent': 'x-dialog' } });
      void open();

      expect(await screen.findByRole('dialog')).toHaveClass('x-dialog');
      expect(document.querySelector('[data-actions-align="center"]')).not.toBeNull();
    });
  });
});
