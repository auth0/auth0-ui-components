import type { MfaAuthenticator, MfaApiClient } from '@auth0/universal-components-core';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MfaWizard } from '@/components/auth0/shared/gate-keeper/mfa-step-up/mfa-wizard';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  createMockCoreClient,
  createMockMfaApiClient,
} from '@/tests/utils/__mocks__/core/core-client.mocks';
import { mockMfaRequiredError } from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { MfaStepScreenProps } from '@/types/mfa-step-up-types';

const TOKEN = mockMfaRequiredError.mfa_token;
const RECOVERY_CODES = ['rc-one', 'rc-two'];

const authenticator = (patch: Partial<MfaAuthenticator>): MfaAuthenticator => ({
  id: 'auth-1',
  authenticatorType: 'otp',
  active: true,
  ...patch,
});

describe('MfaWizard', () => {
  let apiClient: Required<MfaApiClient>;
  let coreClient: ReturnType<typeof createMockCoreClient>;
  const onComplete = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient = createMockMfaApiClient() as Required<MfaApiClient>;
    coreClient = createMockCoreClient(undefined, apiClient);
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue([]);
    vi.mocked(apiClient.challenge).mockResolvedValue({ challengeType: 'oob', oobCode: 'oob-1' });
    const verified = { id_token: '', access_token: '', expires_in: 1 };
    vi.mocked(apiClient.verify).mockResolvedValue(verified);
  });

  const expectNoVerification = () => {
    expect(apiClient.verify).not.toHaveBeenCalled();
    expect(apiClient.verify).not.toHaveBeenCalled();
    expect(apiClient.verify).not.toHaveBeenCalled();
  };

  const withAuthenticators = (...authenticators: MfaAuthenticator[]) =>
    vi.mocked(apiClient.getAuthenticators).mockResolvedValue(authenticators);

  const withEnrollmentFactors = (...types: string[]) => {
    apiClient.getEnrollmentFactors = vi.fn().mockResolvedValue(types.map((type) => ({ type })));
  };

  const withEnrollmentResponse = (response: Record<string, unknown>) =>
    vi.mocked(apiClient.enroll).mockResolvedValue(response as never);

  const renderWizard = (props: Partial<React.ComponentProps<typeof MfaWizard>> = {}) =>
    renderWithProviders(
      <Dialog open>
        <DialogContent>
          <MfaWizard
            error={mockMfaRequiredError}
            onComplete={onComplete}
            onCancel={onCancel}
            {...props}
          />
        </DialogContent>
      </Dialog>,
      { coreClient },
    );

  const choose = async (user: ReturnType<typeof userEvent.setup>, label: string) =>
    user.click(await screen.findByRole('button', { name: new RegExp(label) }));

  const chooseMethod = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
    await user.click(await screen.findByRole('radio', { name: new RegExp(label) }));
    await user.click(screen.getByRole('button', { name: 'mfa.continue' }));
    await user.click(
      await screen.findByRole('button', { name: /mfa\.confirm\.(verify_selected|send_push)/ }),
    );
  };

  const typeCode = async (user: ReturnType<typeof userEvent.setup>, code: string) => {
    const [input] = await screen.findAllByRole('textbox');
    await user.type(input!, code);
  };

  const submitCode = (user: ReturnType<typeof userEvent.setup>) =>
    user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

  describe('answering with an authenticator the user has', () => {
    it('verifies a recovery code and completes', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const user = userEvent.setup();
      renderWizard();

      await chooseMethod(user, 'mfa.method.recovery');
      await user.type(await screen.findByRole('textbox'), 'ABCD-1234');
      await submitCode(user);

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expect(apiClient.verify).toHaveBeenCalledWith({
        mfaToken: TOKEN,
        recoveryCode: 'ABCD-1234',
      });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('shows the new recovery code after one was used, and closes only once it is acknowledged', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      vi.mocked(apiClient.verify).mockResolvedValue({
        id_token: '',
        access_token: '',
        expires_in: 1,
        recovery_code: 'NEW-CODE-1',
      });
      const user = userEvent.setup();
      renderWizard();

      await chooseMethod(user, 'mfa.method.recovery');
      await user.type(await screen.findByRole('textbox'), 'OLD-CODE');
      await submitCode(user);

      expect(await screen.findByDisplayValue('NEW-CODE-1')).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'mfa.continue' })).toBeDisabled();

      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: 'mfa.continue' }));

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    });

    it('verifies the code of an authenticator app and completes', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'otp' }));
      const user = userEvent.setup();
      renderWizard();

      await chooseMethod(user, 'mfa.method.otp');
      await typeCode(user, '123456');
      await submitCode(user);

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expect(apiClient.verify).toHaveBeenCalledWith({ mfaToken: TOKEN, otp: '123456' });
      expect(apiClient.challenge).not.toHaveBeenCalled();
    });

    it('sends a code to an SMS authenticator, then verifies it', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'oob', type: 'phone' }));
      const user = userEvent.setup();
      renderWizard();

      await chooseMethod(user, 'mfa.method.phone');
      await typeCode(user, '123456');
      await submitCode(user);

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expect(apiClient.challenge).toHaveBeenCalledWith({
        mfaToken: TOKEN,
        challengeType: 'oob',
        authenticatorId: 'auth-1',
      });
      expect(apiClient.verify).toHaveBeenCalledWith({
        mfaToken: TOKEN,
        oobCode: 'oob-1',
        bindingCode: '123456',
      });
    });

    describe('with a push notification', () => {
      const pending = () =>
        Object.assign(new Error('pending'), { data: { error: 'authorization_pending' } });

      afterEach(() => vi.useRealTimers());

      const startPush = async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        withAuthenticators(authenticator({ authenticatorType: 'oob', type: 'push-notification' }));
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWizard();
        await chooseMethod(user, 'mfa.method.push');
        await screen.findByText('mfa.challenge.push_waiting_title');
        return user;
      };

      it('waits for the approval, shows it, and then completes', async () => {
        vi.mocked(apiClient.verify)
          .mockRejectedValueOnce(pending())
          .mockResolvedValueOnce({ id_token: '', access_token: '', expires_in: 1 });
        await startPush();

        await act(() => vi.advanceTimersByTimeAsync(3000));
        expect(onComplete).not.toHaveBeenCalled();
        await act(() => vi.advanceTimersByTimeAsync(3000));
        expect(await screen.findByText('mfa.challenge.push_approved_title')).toBeInTheDocument();
        await act(() => vi.advanceTimersByTimeAsync(1200));

        await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
        expect(apiClient.verify).toHaveBeenLastCalledWith({ mfaToken: TOKEN, oobCode: 'oob-1' });
      });

      it('shows a denial, and sends the push again on Try again', async () => {
        vi.mocked(apiClient.verify).mockRejectedValueOnce(
          Object.assign(new Error('denied'), { data: { error: 'access_denied' } }),
        );
        const user = await startPush();

        await act(() => vi.advanceTimersByTimeAsync(3000));
        expect(await screen.findByText('mfa.challenge.push_denied_title')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'mfa.challenge.push_try_again' }));

        expect(await screen.findByText('mfa.challenge.push_waiting_title')).toBeInTheDocument();
        expect(apiClient.challenge).toHaveBeenCalledTimes(2);
      });

      it('shows the code from Guardian when the backend cannot check a push', async () => {
        vi.mocked(apiClient.verify).mockRejectedValueOnce(
          Object.assign(new Error('Bad Request'), {
            status: 400,
            data: {
              error: 'invalid_request',
              error_description: 'Missing verification credential',
            },
          }),
        );
        const user = await startPush();

        await act(() => vi.advanceTimersByTimeAsync(3000));
        expect(await screen.findByText('mfa.challenge.guardian_code_title')).toBeInTheDocument();
        expect(screen.queryByText('mfa.challenge.use_push_instead')).not.toBeInTheDocument();
        await typeCode(user, '246100');
        await submitCode(user);

        await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
        expect(onCancel).not.toHaveBeenCalled();
      });

      it('switches to the code from Guardian, and verifies it', async () => {
        const user = await startPush();

        await user.click(screen.getByText('mfa.challenge.push_enter_code'));
        expect(await screen.findByText('mfa.challenge.guardian_code_title')).toBeInTheDocument();
        await typeCode(user, '246100');
        await submitCode(user);

        await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
        expect(apiClient.verify).toHaveBeenCalledWith({ mfaToken: TOKEN, otp: '246100' });
      });
    });

    it('stays on the code screen when the code is wrong', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      vi.mocked(apiClient.verify).mockRejectedValueOnce(
        Object.assign(new Error('wrong'), { status: 403 }),
      );
      const user = userEvent.setup();
      renderWizard();

      await chooseMethod(user, 'mfa.method.recovery');
      await user.type(await screen.findByRole('textbox'), 'WRONG');
      await submitCode(user);

      await waitFor(() => expect(apiClient.verify).toHaveBeenCalledTimes(1));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('cancels from the code screen', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const user = userEvent.setup();
      renderWizard();

      await chooseMethod(user, 'mfa.method.recovery');
      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
    });
  });

  describe('enrolling a factor', () => {
    it('OTP: shows the QR code, verifies the code, then shows every recovery code', async () => {
      withEnrollmentFactors('otp');
      withEnrollmentResponse({
        authenticatorType: 'otp',
        secret: 'SECRET123',
        barcodeUri: 'otpauth://totp/x',
        recoveryCodes: RECOVERY_CODES,
      });
      const user = userEvent.setup();
      renderWizard();

      await choose(user, 'mfa.enroll_button');
      expect(await screen.findByDisplayValue('SECRET123')).toBeInTheDocument();
      expect(apiClient.enroll).toHaveBeenCalledWith({ mfaToken: TOKEN, factorType: 'otp' });
      await user.click(screen.getByRole('button', { name: 'mfa.continue' }));

      await typeCode(user, '123456');
      await submitCode(user);

      expect(await screen.findByDisplayValue('rc-one')).toBeInTheDocument();
      expect(screen.getByDisplayValue('rc-two')).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();

      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: 'mfa.continue' }));

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expect(apiClient.verify).toHaveBeenCalledWith({ mfaToken: TOKEN, otp: '123456' });
    });

    it('OTP: completes after verifying when no recovery codes come back', async () => {
      withEnrollmentFactors('otp');
      withEnrollmentResponse({ authenticatorType: 'otp', secret: 's', barcodeUri: 'otpauth://x' });
      const user = userEvent.setup();
      renderWizard();

      await choose(user, 'mfa.enroll_button');
      await user.click(await screen.findByRole('button', { name: 'mfa.continue' }));
      await typeCode(user, '123456');
      await submitCode(user);

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    });

    it('push: install, enroll on continue, QR, then completes without verifying', async () => {
      withEnrollmentFactors('push');
      withEnrollmentResponse({
        authenticatorType: 'oob',
        oobChannel: 'auth0',
        barcodeUri: 'guardian://x',
      });
      const user = userEvent.setup();
      renderWizard();

      await choose(user, 'mfa.enroll_button');
      expect(await screen.findByText('mfa.enroll.install_title')).toBeInTheDocument();
      expect(apiClient.enroll).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'mfa.continue' }));
      expect(await screen.findByText('mfa.enroll.push_scan_description')).toBeInTheDocument();
      expect(apiClient.enroll).toHaveBeenCalledWith({ mfaToken: TOKEN, factorType: 'push' });

      await user.click(screen.getByRole('button', { name: 'mfa.continue' }));

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expectNoVerification();
    });

    it('push: going back to the install screen and on again does not enroll twice', async () => {
      withEnrollmentFactors('push');
      withEnrollmentResponse({
        authenticatorType: 'oob',
        oobChannel: 'auth0',
        barcodeUri: 'g://x',
      });
      const user = userEvent.setup();
      renderWizard();

      await choose(user, 'mfa.enroll_button');
      await user.click(await screen.findByRole('button', { name: 'mfa.continue' }));
      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));
      await user.click(await screen.findByRole('button', { name: 'mfa.continue' }));

      await screen.findByText('mfa.enroll.push_scan_description');
      expect(apiClient.enroll).toHaveBeenCalledTimes(1);
    });

    it.each([
      [
        'phone',
        'mfa.enroll.phone_label',
        '+14155550123',
        { phoneNumber: '+14155550123', factorType: 'sms' },
      ],
      [
        'voice',
        'mfa.enroll.phone_label',
        '+14155550123',
        { phoneNumber: '+14155550123', factorType: 'voice' },
      ],
      ['email', 'mfa.enroll.email_label', 'a@b.com', { email: 'a@b.com', factorType: 'email' }],
    ])(
      '%s: asks for the contact, enrolls, sends a code, verifies it',
      async (type, label, contact, params) => {
        withEnrollmentFactors(type);
        withEnrollmentResponse({ authenticatorType: 'oob', oobChannel: 'sms', id: 'enrolled-1' });
        const user = userEvent.setup();
        renderWizard();

        await choose(user, 'mfa.enroll_button');
        await user.type(await screen.findByLabelText(label), contact);
        await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

        expect(await screen.findByText('mfa.challenge.code_sent_description')).toBeInTheDocument();
        expect(apiClient.enroll).toHaveBeenCalledWith({
          mfaToken: TOKEN,
          ...(params as Record<string, string>),
        });
        expect(apiClient.challenge).toHaveBeenCalledWith({
          mfaToken: TOKEN,
          challengeType: 'oob',
          authenticatorId: 'enrolled-1',
        });

        await typeCode(user, '123456');
        await submitCode(user);

        await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
        expect(apiClient.verify).toHaveBeenCalledWith({
          mfaToken: TOKEN,
          oobCode: 'oob-1',
          bindingCode: '123456',
        });
      },
    );
  });

  describe('when it cannot continue', () => {
    it('ends the step-up with the failure, so the page tells the user', async () => {
      renderWizard();

      await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
      expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ code: 'no_authenticators' }));
    });

    it('cancels when the user cancels on the list', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const user = userEvent.setup();
      renderWizard();

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('does not report a cancel when it unmounts', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const { unmount } = renderWizard();
      await screen.findByRole('radio', { name: /mfa.method.recovery/ });

      unmount();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onCancel).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('where the buttons sit', () => {
    it('right-aligns them by default', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const { container } = renderWizard();
      await screen.findByRole('radio', { name: /mfa.method.recovery/ });

      expect(container.ownerDocument.querySelector('[data-actions-align="right"]')).not.toBeNull();
    });

    it.each(['left', 'center'] as const)('can align them to the %s', async (align) => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const { container } = renderWizard({ actionsAlign: align });
      await screen.findByRole('radio', { name: /mfa.method.recovery/ });

      expect(
        container.ownerDocument.querySelector(`[data-actions-align="${align}"]`),
      ).not.toBeNull();
    });
  });

  describe('customizing the flow', () => {
    it('skips the install screen when it is hidden, and still enrolls', async () => {
      withEnrollmentFactors('push');
      withEnrollmentResponse({
        authenticatorType: 'oob',
        oobChannel: 'auth0',
        barcodeUri: 'g://x',
      });
      const user = userEvent.setup();
      renderWizard({ flow: { hide: { 'enroll.install': true } } });

      await choose(user, 'mfa.enroll_button');

      expect(await screen.findByText('mfa.enroll.push_scan_description')).toBeInTheDocument();
      expect(apiClient.enroll).toHaveBeenCalledTimes(1);
    });

    it('shows the screen of an added step after the user passed MFA', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const ConsentScreen = ({ machine }: MfaStepScreenProps) => (
        <button onClick={() => machine.next()}>accept terms</button>
      );
      const user = userEvent.setup();
      renderWizard({ flow: { add: [{ id: 'consent' }] }, screens: { consent: ConsentScreen } });

      await chooseMethod(user, 'mfa.method.recovery');
      await user.type(await screen.findByRole('textbox'), 'ABCD-1234');
      await submitCode(user);
      await user.click(await screen.findByRole('button', { name: 'accept terms' }));

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
      expect(apiClient.verify).toHaveBeenCalledTimes(1);
    });

    it('keeps a built-in screen when a replacement is undefined', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      renderWizard({ screens: { list: undefined } });

      expect(await screen.findByRole('radio', { name: /mfa.method.recovery/ })).toBeInTheDocument();
    });

    it('shows a way out when an added step has no screen', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const user = userEvent.setup();
      renderWizard({ flow: { add: [{ id: 'consent' }] } });

      await chooseMethod(user, 'mfa.method.recovery');
      await user.type(await screen.findByRole('textbox'), 'ABCD-1234');
      await submitCode(user);
      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"consent"'));
      await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1));
      warn.mockRestore();
    });

    it('replaces a built-in screen', async () => {
      withAuthenticators(authenticator({ authenticatorType: 'recovery-code' }));
      renderWizard({ screens: { list: () => <p>my own list</p> } });

      expect(await screen.findByText('my own list')).toBeInTheDocument();
    });
  });
});
