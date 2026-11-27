import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { AuthenticatorsList } from '@/components/auth0/shared/gate-keeper/mfa-step-up/authenticators-list';
import {
  createMockSnapshot,
  createMockStepUpMachine,
} from '@/tests/utils/__mocks__/shared/mfa-step-up.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';

const enrollOptions = [
  { id: 'enroll:otp', kind: 'enroll' as const, factor: 'otp' },
  { id: 'enroll:sms', kind: 'enroll' as const, factor: 'sms' },
];

const challengeOptions = [
  {
    id: 'challenge:auth-1',
    kind: 'challenge' as const,
    factor: 'sms',
    authenticator: { id: 'auth-1', authenticatorType: 'oob' as const, type: 'phone' as const },
  },
  {
    id: 'challenge:auth-2',
    kind: 'challenge' as const,
    factor: 'oob',
    authenticator: { id: 'auth-2', authenticatorType: 'oob' as const, name: 'My phone' },
  },
];

describe('AuthenticatorsList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('enroll options', () => {
    it('renders each factor with an enroll button', async () => {
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: enrollOptions })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findAllByRole('button', { name: /mfa.enroll_button/i })).toHaveLength(2);
      expect(screen.getByText('mfa.authenticator_type.otp')).toBeInTheDocument();
      expect(screen.getByText('mfa.authenticator_type.sms')).toBeInTheDocument();
    });

    it('hands the option id to the machine when enroll is clicked', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: enrollOptions })}
          machine={machine}
        />,
      );

      await user.click(
        await screen.findByRole('button', { name: 'mfa.enroll_button mfa.authenticator_type.sms' }),
      );

      expect(machine.next).toHaveBeenCalledWith('enroll:sms');
    });
  });

  describe('challenge options', () => {
    const datedOptions = [
      {
        id: 'challenge:otp-1',
        kind: 'challenge' as const,
        factor: 'otp',
        authenticator: {
          id: 'otp-1',
          authenticatorType: 'otp' as const,
          createdAt: '2026-02-01T10:00:00.000Z',
        },
      },
      {
        id: 'challenge:sms-1',
        kind: 'challenge' as const,
        factor: 'sms',
        authenticator: {
          id: 'sms-1',
          authenticatorType: 'oob' as const,
          name: '+\u2022\u2022\u2022\u2022\u20222345',
          lastAuth: '2026-05-02T10:00:00.000Z',
        },
      },
    ];

    it('groups the authenticators by method, and names an unknown one by its name', async () => {
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: challengeOptions })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findAllByRole('radio')).toHaveLength(2);
      expect(screen.getByRole('heading', { name: 'mfa.method.phone' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'mfa.method.other' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'My phone' })).toBeInTheDocument();
    });

    it('shows when an authenticator was last used, or else when it was added', async () => {
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: datedOptions })}
          machine={createMockStepUpMachine()}
        />,
      );

      expect(await screen.findByRole('radio', { name: /mfa.added_on/ })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /mfa.last_used_on/ })).toBeInTheDocument();
    });

    it('selects the first authenticator, and hands the chosen one to the machine on continue', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: challengeOptions })}
          machine={machine}
        />,
      );

      expect(await screen.findByRole('radio', { name: /mfa.method.phone/ })).toBeChecked();
      await user.click(screen.getByRole('radio', { name: 'My phone' }));
      await user.click(screen.getByRole('button', { name: 'mfa.continue' }));

      expect(machine.next).toHaveBeenCalledWith('challenge:auth-2');
    });

    it('cancels through the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: challengeOptions })}
          machine={machine}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(machine.cancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('while an option is being picked', () => {
    it('disables every button until the machine has finished, then enables them again', async () => {
      let finish!: () => void;
      const machine = createMockStepUpMachine();
      vi.mocked(machine.next).mockImplementation(
        () => new Promise<void>((resolve) => (finish = resolve)),
      );
      const user = userEvent.setup();
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: enrollOptions })}
          machine={machine}
        />,
      );

      await user.click(
        await screen.findByRole('button', { name: 'mfa.enroll_button mfa.authenticator_type.otp' }),
      );

      await waitFor(() => {
        screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
      });

      finish();

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: 'mfa.enroll_button mfa.authenticator_type.sms' }),
        ).toBeEnabled(),
      );
    });
  });

  describe('cancel button', () => {
    it('cancels the flow through the machine', async () => {
      const machine = createMockStepUpMachine();
      const user = userEvent.setup();
      renderWithProviders(
        <AuthenticatorsList
          snapshot={createMockSnapshot({ options: enrollOptions })}
          machine={machine}
        />,
      );

      await user.click(await screen.findByRole('button', { name: 'mfa.cancel' }));

      expect(machine.cancel).toHaveBeenCalledTimes(1);
    });
  });
});
