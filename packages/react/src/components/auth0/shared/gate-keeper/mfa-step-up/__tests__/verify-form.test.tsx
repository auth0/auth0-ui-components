import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { VerifyForm } from '@/components/auth0/shared/gate-keeper/mfa-step-up/verify-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  createMockFacts,
  createMockSnapshot,
  createMockStepUpMachine,
} from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const renderInDialog = (step: React.ReactElement) =>
  renderWithProviders(
    <Dialog open>
      <DialogContent>{step}</DialogContent>
    </Dialog>,
  );

const challengeOption = (
  authenticator: { authenticatorType: 'otp' | 'oob' | 'recovery-code'; name?: string },
  factor: string,
) => ({
  id: 'challenge:auth-1',
  kind: 'challenge' as const,
  factor,
  authenticator: { id: 'auth-1', ...authenticator },
});

const snapshotFor = (factor: string, overrides: Parameters<typeof createMockSnapshot>[0] = {}) =>
  createMockSnapshot({
    step: 'challenge',
    facts: createMockFacts({ mode: 'challenge', factor, optionCount: 1 }),
    ...overrides,
  });

describe('VerifyForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('answering with an authenticator the user already has', () => {
    it('asks for the one-time code of an OTP authenticator', async () => {
      renderInDialog(
        <VerifyForm
          snapshot={snapshotFor('otp', {
            selected: challengeOption({ authenticatorType: 'otp' }, 'otp'),
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.challenge.otp_title')).toBeInTheDocument();
      expect(screen.getByText('mfa.challenge.otp_description')).toBeInTheDocument();
    });

    it('asks for the code of a named OTP authenticator, not one that was sent', async () => {
      renderInDialog(
        <VerifyForm
          snapshot={snapshotFor('otp', {
            selected: challengeOption({ authenticatorType: 'otp', name: 'My phone' }, 'otp'),
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.challenge.otp_title')).toBeInTheDocument();
      expect(screen.getByText('mfa.challenge.otp_description')).toBeInTheDocument();
      expect(screen.queryByText('mfa.challenge.code_sent_description')).not.toBeInTheDocument();
    });

    it('hands a recovery code to the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(
        <VerifyForm
          snapshot={snapshotFor('recovery-code', {
            selected: challengeOption({ authenticatorType: 'recovery-code' }, 'recovery-code'),
          })}
          machine={machine}
        />,
      );

      await user.type(await screen.findByRole('textbox'), 'ABCD-1234');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => expect(machine.next).toHaveBeenCalledWith('ABCD-1234'));
    });

    it('says where the code was sent for an out-of-band authenticator', async () => {
      renderInDialog(
        <VerifyForm
          snapshot={snapshotFor('sms', {
            selected: challengeOption({ authenticatorType: 'oob', name: '+1 *** 0123' }, 'sms'),
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.challenge.code_sent_description')).toBeInTheDocument();
    });

    it('cancels through the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(
        <VerifyForm
          snapshot={snapshotFor('recovery-code', {
            selected: challengeOption({ authenticatorType: 'recovery-code' }, 'recovery-code'),
          })}
          machine={machine}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(machine.cancel).toHaveBeenCalledTimes(1);
    });

    it('shows the verifying state while the request runs', async () => {
      renderInDialog(
        <VerifyForm
          snapshot={snapshotFor('recovery-code', {
            selected: challengeOption({ authenticatorType: 'recovery-code' }, 'recovery-code'),
            request: { name: 'verify', isLoading: true },
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByRole('button', { name: 'mfa.challenge.verifying' })).toBeDisabled();
    });
  });

  describe('resending the code', () => {
    const oobSnapshot = (canResend: boolean) =>
      snapshotFor('sms', {
        canResend,
        selected: challengeOption({ authenticatorType: 'oob', name: 'phone' }, 'sms'),
      });

    it('offers a resend link only when the flow says it applies', async () => {
      renderInDialog(
        <VerifyForm snapshot={oobSnapshot(false)} machine={createMockStepUpMachine()} />,
      );

      expect(await screen.findByText('mfa.challenge.code_sent_description')).toBeInTheDocument();
      expect(screen.queryByText('mfa.challenge.resend')).not.toBeInTheDocument();
    });

    it('asks the machine for a new code', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(<VerifyForm snapshot={oobSnapshot(true)} machine={machine} />);

      await user.click(await screen.findByText('mfa.challenge.resend'));

      expect(machine.resend).toHaveBeenCalledTimes(1);
    });
  });

  describe('finishing an enrollment', () => {
    it('says where the code was sent, using the contact the user entered', async () => {
      renderInDialog(
        <VerifyForm
          snapshot={createMockSnapshot({
            step: 'enroll.verify',
            facts: createMockFacts({ mode: 'enroll', factor: 'sms' }),
            contact: '+14155550123',
            selected: { id: 'enroll:sms', kind: 'enroll', factor: 'sms' },
            enrollment: { authenticatorType: 'oob' },
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.challenge.code_sent_description')).toBeInTheDocument();
    });

    it('asks for the code of the authenticator app after an OTP enrollment', async () => {
      renderInDialog(
        <VerifyForm
          snapshot={createMockSnapshot({
            step: 'enroll.verify',
            selected: { id: 'enroll:otp', kind: 'enroll', factor: 'otp' },
            enrollment: { authenticatorType: 'otp' },
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.challenge.otp_description')).toBeInTheDocument();
    });
  });

  describe('finishing an enrollment, going back', () => {
    it('goes back through the machine, not out of the flow', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(
        <VerifyForm
          snapshot={createMockSnapshot({
            step: 'enroll.verify',
            selected: { id: 'enroll:otp', kind: 'enroll', factor: 'otp' },
            enrollment: { authenticatorType: 'otp' },
          })}
          machine={machine}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));

      expect(machine.back).toHaveBeenCalledTimes(1);
    });
  });

  describe('push', () => {
    const pushSnapshot = (mode: 'push' | 'code', canApprove = true) =>
      snapshotFor('push', {
        selected: challengeOption({ authenticatorType: 'oob', name: 'iPhone' }, 'push'),
        push: { mode, phase: 'waiting', canApprove },
      });

    it('waits for the approval on the device while in push mode', async () => {
      renderInDialog(
        <VerifyForm snapshot={pushSnapshot('push')} machine={createMockStepUpMachine()} />,
      );

      expect(await screen.findByText('mfa.challenge.push_waiting_title')).toBeInTheDocument();
    });

    it('does not offer the push again when it cannot be approved here', async () => {
      renderInDialog(
        <VerifyForm snapshot={pushSnapshot('code', false)} machine={createMockStepUpMachine()} />,
      );

      expect(await screen.findByText('mfa.challenge.guardian_code_title')).toBeInTheDocument();
      expect(screen.queryByText('mfa.challenge.use_push_instead')).not.toBeInTheDocument();
    });

    it('asks for the code from Guardian in code mode, and offers the push again', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(<VerifyForm snapshot={pushSnapshot('code')} machine={machine} />);

      expect(await screen.findByText('mfa.challenge.guardian_code_title')).toBeInTheDocument();
      expect(await screen.findAllByRole('textbox')).toHaveLength(6);
      await user.click(screen.getByText('mfa.challenge.use_push_instead'));

      expect(machine.switchToPush).toHaveBeenCalledTimes(1);
    });

    it('lets the keyboard reach and use the push again action', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(<VerifyForm snapshot={pushSnapshot('code')} machine={machine} />);

      const action = await screen.findByRole('button', { name: 'mfa.challenge.use_push_instead' });
      action.focus();
      await user.keyboard('{Enter}');

      expect(machine.switchToPush).toHaveBeenCalledTimes(1);
    });
  });
});
