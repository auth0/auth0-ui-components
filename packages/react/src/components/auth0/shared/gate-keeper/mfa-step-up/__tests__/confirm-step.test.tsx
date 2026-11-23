import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { ConfirmStep } from '@/components/auth0/shared/gate-keeper/mfa-step-up/confirm-step';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  createMockSnapshot,
  createMockStepUpMachine,
} from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const option = (
  id: string,
  factor: string,
  authenticator: { name?: string; lastAuth?: string; createdAt?: string } = {},
) => ({
  id: `challenge:${id}`,
  kind: 'challenge' as const,
  factor,
  authenticator: { id, authenticatorType: 'oob' as const, ...authenticator },
});

const renderConfirm = (
  snapshot: ReturnType<typeof createMockSnapshot>,
  machine = createMockStepUpMachine(),
) => {
  renderWithProviders(
    <Dialog open>
      <DialogContent>
        <ConfirmStep snapshot={snapshot} machine={machine} />
      </DialogContent>
    </Dialog>,
  );
  return machine;
};

describe('ConfirmStep', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows only the authenticators of the picked method, with the pick selected', async () => {
    const phone = option('sms-1', 'sms', { name: '+•••2345' });
    const email = option('mail-1', 'email', { name: 's•••@atko.com' });
    renderConfirm(
      createMockSnapshot({
        step: 'challenge.confirm',
        options: [phone, email],
        selected: phone,
      }),
    );

    expect(await screen.findByRole('radio', { name: /mfa.ending_in/ })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /atko.com/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'mfa.confirm.method.phone' })).toBeInTheDocument();
  });

  it('groups text and voice together', async () => {
    const sms = option('sms-1', 'sms', { name: '+1 •• 1111' });
    const voice = option('voice-1', 'voice', { name: '+1 •• 2222' });
    renderConfirm(
      createMockSnapshot({ step: 'challenge.confirm', options: [sms, voice], selected: sms }),
    );

    expect(await screen.findAllByRole('radio')).toHaveLength(2);
  });

  it('confirms the pick with the method-neutral button', async () => {
    const user = userEvent.setup();
    const email = option('mail-1', 'email', { name: 'sarah@proton.me' });
    const machine = renderConfirm(
      createMockSnapshot({ step: 'challenge.confirm', options: [email], selected: email }),
    );

    await user.click(await screen.findByRole('button', { name: 'mfa.confirm.verify_selected' }));

    expect(machine.next).toHaveBeenCalledWith('challenge:mail-1');
  });

  it('lets the user pick another device, and sends the push', async () => {
    const user = userEvent.setup();
    const iphone = option('push-1', 'push', { name: "Sara's iPhone" });
    const android = option('push-2', 'push', { name: "Harry's Android Phone" });
    const machine = renderConfirm(
      createMockSnapshot({
        step: 'challenge.confirm',
        options: [iphone, android],
        selected: iphone,
        push: { mode: 'push', phase: 'waiting', canApprove: true },
      }),
    );

    expect(await screen.findByText('mfa.confirm.push_description')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Harry/ }));
    await user.click(screen.getByRole('button', { name: 'mfa.confirm.send_push' }));

    expect(machine.next).toHaveBeenCalledWith('challenge:push-2');
  });

  it('says no push will be sent, and verifies the code, when a push cannot be approved here', async () => {
    const user = userEvent.setup();
    const iphone = option('push-1', 'push', { name: "Sara's iPhone" });
    const machine = renderConfirm(
      createMockSnapshot({
        step: 'challenge.confirm',
        options: [iphone],
        selected: iphone,
        push: { mode: 'code', phase: 'waiting', canApprove: false },
      }),
    );

    await screen.findByRole('radio', { name: /iPhone/ });
    expect(screen.queryByText('mfa.confirm.push_description')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'mfa.confirm.send_push' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'mfa.confirm.verify_selected' }));

    expect(machine.next).toHaveBeenCalledWith('challenge:push-1');
  });

  it('cancels through the machine', async () => {
    const user = userEvent.setup();
    const otp = option('app-1', 'otp');
    const machine = renderConfirm(
      createMockSnapshot({ step: 'challenge.confirm', options: [otp], selected: otp }),
    );

    await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

    expect(machine.cancel).toHaveBeenCalledTimes(1);
  });

  it('has no link to another method', async () => {
    const otp = option('app-1', 'otp');
    renderConfirm(
      createMockSnapshot({
        step: 'challenge.confirm',
        options: [otp],
        selected: otp,
        canChooseAnotherFactor: true,
      }),
    );

    await screen.findByRole('radio');
    expect(screen.queryByText('mfa.challenge.use_another_method')).not.toBeInTheDocument();
  });
});
