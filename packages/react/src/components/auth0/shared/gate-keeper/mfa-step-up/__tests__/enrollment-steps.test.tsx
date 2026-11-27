import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import {
  ContactStep,
  InstallStep,
  QrStep,
  RecoveryStep,
} from '@/components/auth0/shared/gate-keeper/mfa-step-up/enrollment-steps';
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

const factsFor = (factor: string) => createMockFacts({ mode: 'enroll', factor, optionCount: 1 });

describe('enrollment steps', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('InstallStep', () => {
    it('links to both app stores', async () => {
      renderInDialog(
        <InstallStep snapshot={createMockSnapshot()} machine={createMockStepUpMachine()} />,
      );

      expect(await screen.findByText('mfa.enroll.app_store')).toBeInTheDocument();
      expect(screen.getByText('mfa.enroll.google_play')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    it('continues, and goes back, through the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(<InstallStep snapshot={createMockSnapshot()} machine={machine} />);

      await user.click(await screen.findByRole('button', { name: 'mfa.continue' }));
      await user.click(screen.getByRole('button', { name: 'mfa.back' }));

      expect(machine.next).toHaveBeenCalledTimes(1);
      expect(machine.back).toHaveBeenCalledTimes(1);
    });

    it('disables the buttons while a request is running', async () => {
      renderInDialog(
        <InstallStep
          snapshot={createMockSnapshot({ request: { isLoading: true } })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByRole('button', { name: 'mfa.continue' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'mfa.back' })).toBeDisabled();
    });
  });

  describe('ContactStep', () => {
    it('asks for a phone number for sms and voice', async () => {
      renderInDialog(
        <ContactStep
          snapshot={createMockSnapshot({ facts: factsFor('sms') })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.enroll.phone_title')).toBeInTheDocument();
      expect(screen.getByLabelText('mfa.enroll.phone_label')).toHaveAttribute('type', 'tel');
    });

    it('asks for an email for email', async () => {
      renderInDialog(
        <ContactStep
          snapshot={createMockSnapshot({ facts: factsFor('email') })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.enroll.email_title')).toBeInTheDocument();
      expect(screen.getByLabelText('mfa.enroll.email_label')).toHaveAttribute('type', 'email');
    });

    it('fills in the contact the user entered before', async () => {
      renderInDialog(
        <ContactStep
          snapshot={createMockSnapshot({ facts: factsFor('sms'), contact: '+14155550123' })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByLabelText('mfa.enroll.phone_label')).toHaveValue('+14155550123');
    });

    it('does not submit an invalid contact, and says why', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(
        <ContactStep
          snapshot={createMockSnapshot({ facts: factsFor('email') })}
          machine={machine}
        />,
      );

      await user.type(await screen.findByLabelText('mfa.enroll.email_label'), 'not-an-email');
      await user.tab();

      expect(await screen.findByText('mfa.enroll.invalid_email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'mfa.verify_button' })).toBeDisabled();
      expect(machine.next).not.toHaveBeenCalled();
    });

    it('hands a valid contact to the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(
        <ContactStep snapshot={createMockSnapshot({ facts: factsFor('sms') })} machine={machine} />,
      );

      await user.type(await screen.findByLabelText('mfa.enroll.phone_label'), '+14155550123');
      await user.click(screen.getByRole('button', { name: 'mfa.verify_button' }));

      await waitFor(() => expect(machine.next).toHaveBeenCalledWith('+14155550123'));
    });

    it('goes back through the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(
        <ContactStep snapshot={createMockSnapshot({ facts: factsFor('sms') })} machine={machine} />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.back' }));

      expect(machine.back).toHaveBeenCalledTimes(1);
    });
  });

  describe('QrStep', () => {
    const otpSnapshot = createMockSnapshot({
      facts: factsFor('otp'),
      enrollment: { authenticatorType: 'otp', barcodeUri: 'otpauth://totp/x', secret: 'SECRET123' },
    });

    it('shows the QR code and the secret to type in by hand, for OTP', async () => {
      renderInDialog(<QrStep snapshot={otpSnapshot} machine={createMockStepUpMachine()} />);

      expect(await screen.findByText('mfa.enroll.scan_description')).toBeInTheDocument();
      expect(screen.getByText('mfa.enroll.scan_helper')).toBeInTheDocument();
      expect(screen.getByDisplayValue('SECRET123')).toBeInTheDocument();
    });

    it('shows the push description and no secret, for push', async () => {
      renderInDialog(
        <QrStep
          snapshot={createMockSnapshot({
            facts: factsFor('push'),
            enrollment: { authenticatorType: 'oob', barcodeUri: 'guardian://x' },
          })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.enroll.push_scan_description')).toBeInTheDocument();
      expect(screen.queryByText('mfa.enroll.scan_helper')).not.toBeInTheDocument();
    });

    it('shows nothing without a QR code', () => {
      renderInDialog(
        <QrStep
          snapshot={createMockSnapshot({ facts: factsFor('otp') })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(screen.queryByText('mfa.title')).not.toBeInTheDocument();
      expect(screen.queryByText('mfa.enroll.scan_description')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'mfa.continue' })).not.toBeInTheDocument();
    });

    it('continues, and goes back, through the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(<QrStep snapshot={otpSnapshot} machine={machine} />);

      await user.click(await screen.findByRole('button', { name: 'mfa.continue' }));
      await user.click(screen.getByRole('button', { name: 'mfa.back' }));

      expect(machine.next).toHaveBeenCalledTimes(1);
      expect(machine.back).toHaveBeenCalledTimes(1);
    });
  });

  describe('RecoveryStep', () => {
    const snapshot = createMockSnapshot({
      enrollment: { recoveryCodes: ['code-one', 'code-two', 'code-three'] },
    });

    it('shows every recovery code', async () => {
      renderInDialog(<RecoveryStep snapshot={snapshot} machine={createMockStepUpMachine()} />);

      expect(await screen.findByDisplayValue('code-one')).toBeInTheDocument();
      expect(screen.getByDisplayValue('code-two')).toBeInTheDocument();
      expect(screen.getByDisplayValue('code-three')).toBeInTheDocument();
    });

    it.each([
      ['codes issued when a factor was enrolled', { enrollment: { recoveryCodes: ['code-one'] } }],
      ['the code that replaces a used one', { newRecoveryCode: 'code-new' }],
    ])('says the same thing for %s', async (_name, overrides) => {
      renderInDialog(
        <RecoveryStep
          snapshot={createMockSnapshot(overrides)}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByText('mfa.enroll.backup_code_title')).toBeInTheDocument();
      expect(screen.getByText('mfa.enroll.backup_code_description')).toBeInTheDocument();
      expect(screen.getByLabelText('mfa.enroll.backup_code_confirmed')).toBeInTheDocument();
    });

    it('waits for the user to say they saved the codes', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderInDialog(<RecoveryStep snapshot={snapshot} machine={machine} />);

      const continueButton = await screen.findByRole('button', { name: 'mfa.continue' });
      expect(continueButton).toBeDisabled();

      await user.click(screen.getByRole('checkbox'));
      expect(continueButton).toBeEnabled();
      await user.click(continueButton);

      expect(machine.next).toHaveBeenCalledTimes(1);
    });
  });
});
