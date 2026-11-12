import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoProviderTestCard } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-test/sso-provider-test-card';
import { useSsoProviderTest } from '@/hooks/my-organization/use-sso-provider-test';
import { createMockSsoProvider } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type {
  SsoProviderTestCardProps,
  UseSsoProviderTestReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

vi.mock('@/hooks/my-organization/use-sso-provider-test');

const createHookReturn = (
  overrides: Partial<UseSsoProviderTestReturn> = {},
): UseSsoProviderTestReturn => ({
  state: 'idle',
  user: null,
  errorReason: null,
  errorMessage: null,
  blockedTestUrl: null,
  start: vi.fn().mockResolvedValue(undefined),
  retry: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn(),
  ...overrides,
});

const renderCard = (props: Partial<SsoProviderTestCardProps> = {}) =>
  renderWithProviders(<SsoProviderTestCard provider={createMockSsoProvider()} {...props} />);

describe('SsoProviderTestCard', () => {
  let hookReturn: UseSsoProviderTestReturn;

  beforeEach(() => {
    vi.clearAllMocks();
    hookReturn = createHookReturn();
    vi.mocked(useSsoProviderTest).mockImplementation(() => hookReturn);
  });

  describe('when idle', () => {
    it('should render the title, description and test button', () => {
      renderCard();

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'test_button_label' })).toBeEnabled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should test the given provider', () => {
      const provider = createMockSsoProvider();
      renderCard({ provider });

      expect(useSsoProviderTest).toHaveBeenCalledWith(provider.id, { customMessages: {} });
    });
  });

  describe('when the test button is clicked', () => {
    it('should start a test', async () => {
      const user = userEvent.setup();
      renderCard();

      await user.click(screen.getByRole('button', { name: 'test_button_label' }));

      expect(hookReturn.start).toHaveBeenCalledTimes(1);
    });
  });

  describe.each(['starting', 'polling'] as const)('when %s', (state) => {
    it('should show the polling overlay and disable the test button', () => {
      hookReturn = createHookReturn({ state });
      renderCard();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'test_button_label', hidden: true }),
      ).toBeDisabled();
    });
  });

  describe('when retry is clicked in the overlay', () => {
    it('should retry the test', async () => {
      const user = userEvent.setup();
      hookReturn = createHookReturn({ state: 'polling' });
      renderCard();

      await user.click(screen.getByRole('button', { name: 'retry_button_label' }));

      expect(hookReturn.retry).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the test succeeded', () => {
    it('should render the result inline without a copy button', () => {
      hookReturn = createHookReturn({ state: 'success', user: { email: 'bob@acme.corp' } });
      renderCard();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('success_title')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'copy_button_label' })).not.toBeInTheDocument();
    });
  });

  describe('when the test failed', () => {
    it('should render the error inline', () => {
      hookReturn = createHookReturn({
        state: 'error',
        errorReason: 'provider',
        errorMessage: 'Invalid issuer',
      });
      renderCard();

      expect(screen.getByRole('alert')).toHaveTextContent('Invalid issuer');
    });
  });

  describe('readOnly', () => {
    describe('when true', () => {
      it('should disable the test button', () => {
        renderCard({ readOnly: true });

        expect(screen.getByRole('button', { name: 'test_button_label' })).toBeDisabled();
      });
    });
  });

  describe('permissionDenied', () => {
    describe('when true', () => {
      it('should wrap the test button in the permission tooltip', () => {
        renderCard({ readOnly: true, permissionDenied: true });

        const button = screen.getByRole('button', { name: 'test_button_label' });
        expect(button.closest('[aria-describedby]')).not.toBeNull();
      });
    });

    describe('when false', () => {
      it('should not wrap the test button in the permission tooltip', () => {
        renderCard();

        const button = screen.getByRole('button', { name: 'test_button_label' });
        expect(button.closest('[aria-describedby]')).toBeNull();
      });
    });
  });

  describe('customMessages', () => {
    it('should override the default text', () => {
      renderCard({ customMessages: { test_button_label: 'Run test' } });

      expect(screen.getByRole('button', { name: 'Run test' })).toBeInTheDocument();
    });
  });
});
