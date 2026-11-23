import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { PushChallenge } from '@/components/auth0/shared/gate-keeper/mfa-step-up/push-challenge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  createMockSnapshot,
  createMockStepUpMachine,
} from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const snapshotAt = (
  phase: 'waiting' | 'approved' | 'denied' | 'expired',
  overrides: Parameters<typeof createMockSnapshot>[0] = {},
) =>
  createMockSnapshot({
    step: 'challenge',
    selected: {
      id: 'challenge:push-1',
      kind: 'challenge',
      factor: 'push',
      authenticator: { id: 'push-1', authenticatorType: 'oob', name: 'iPhone 15 Pro' },
    },
    push: { mode: 'push', phase, canApprove: true },
    ...overrides,
  });

const renderPush = (
  snapshot: ReturnType<typeof snapshotAt>,
  machine = createMockStepUpMachine(),
) => {
  renderWithProviders(
    <Dialog open>
      <DialogContent>
        <PushChallenge snapshot={snapshot} machine={machine} />
      </DialogContent>
    </Dialog>,
  );
  return machine;
};

describe('PushChallenge', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('markup', () => {
    it.each(['waiting', 'approved', 'denied', 'expired'] as const)(
      'is valid in the %s phase, with no warning from React',
      async (phase) => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        renderPush(snapshotAt(phase, { canChooseAnotherFactor: true }));
        await screen.findByRole('dialog');

        const nestingWarnings = error.mock.calls.filter((args) =>
          /cannot contain|cannot be a descendant|validateDOMNesting/.test(args.join(' ')),
        );
        expect(nestingWarnings).toHaveLength(0);
        error.mockRestore();
      },
    );
  });

  describe('waiting', () => {
    it('says which device to look at, and that it is waiting', async () => {
      renderPush(snapshotAt('waiting'));

      expect(await screen.findByText('mfa.challenge.push_waiting_title')).toBeInTheDocument();
      expect(screen.getByText('mfa.challenge.push_waiting_description')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('mfa.challenge.push_waiting_status');
    });

    it('does not name a device it does not know', async () => {
      renderPush(
        snapshotAt('waiting', {
          selected: {
            id: 'challenge:push-1',
            kind: 'challenge',
            factor: 'push',
            authenticator: { id: 'push-1', authenticatorType: 'oob' },
          },
        }),
      );

      expect(
        await screen.findByText('mfa.challenge.push_waiting_description_generic'),
      ).toBeInTheDocument();
    });

    it('resends, switches to a code, and cancels through the machine', async () => {
      const user = userEvent.setup();
      const machine = renderPush(snapshotAt('waiting'));

      await user.click(await screen.findByText('mfa.challenge.push_resend'));
      await user.click(screen.getByText('mfa.challenge.push_enter_code'));
      await user.click(screen.getByRole('button', { name: 'mfa.cancel' }));

      expect(machine.resend).toHaveBeenCalledTimes(1);
      expect(machine.switchToCode).toHaveBeenCalledTimes(1);
      expect(machine.cancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('approved', () => {
    it('says the user is verified, with nothing to click', async () => {
      renderPush(snapshotAt('approved'));

      expect(await screen.findByText('mfa.challenge.push_approved_title')).toBeInTheDocument();
      expect(screen.getByText('mfa.challenge.push_approved_description')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /mfa\./ })).not.toBeInTheDocument();
    });
  });

  describe('denied', () => {
    it('lets the user try again, or use another method when there is one', async () => {
      const user = userEvent.setup();
      const machine = renderPush(snapshotAt('denied', { canChooseAnotherFactor: true }));

      expect(await screen.findByText('mfa.challenge.push_denied_title')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'mfa.challenge.push_try_again' }));
      await user.click(screen.getByRole('button', { name: 'mfa.challenge.use_another_method' }));

      expect(machine.resend).toHaveBeenCalledTimes(1);
      expect(machine.chooseAnotherFactor).toHaveBeenCalledTimes(1);
    });

    it('offers Cancel instead when there is no other method', async () => {
      const user = userEvent.setup();
      const machine = renderPush(snapshotAt('denied', { canChooseAnotherFactor: false }));

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(
        screen.queryByRole('button', { name: 'mfa.challenge.use_another_method' }),
      ).not.toBeInTheDocument();
      expect(machine.cancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('expired', () => {
    it('lets the user send the notification again, or use another method', async () => {
      const user = userEvent.setup();
      const machine = renderPush(snapshotAt('expired', { canChooseAnotherFactor: true }));

      expect(await screen.findByText('mfa.challenge.push_expired_title')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'mfa.challenge.push_resend' }));
      await user.click(screen.getByRole('button', { name: 'mfa.challenge.use_another_method' }));

      expect(machine.resend).toHaveBeenCalledTimes(1);
      expect(machine.chooseAnotherFactor).toHaveBeenCalledTimes(1);
    });
  });
});
