/**
 * Behaviour matrix for the Tier-1 `UserMFAManagement`.
 *
 * Written against the pre-composability component so the compound rebuild has to
 * keep the same observable behaviour: readOnly, enroll and delete gating, factor
 * configuration, header, loading, error gating, and the enroll and delete flows.
 * Every assertion targets a concrete element, so an empty render cannot pass.
 */
import * as coreModule from '@auth0/universal-components-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserMFAManagement } from '@/components/auth0/my-account/user-mfa-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as gateKeeperContextModule from '@/providers/gate-keeper-context';
import {
  createMockAuthenticationMethodsResponse,
  createMockAuthenticator,
  createMockOTPEnrollmentResponse,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const FACTOR_TYPES = ['totp', 'phone', 'email', 'push-notification'] as const;

const enrollButton = (type: string) =>
  screen.queryByRole('button', { name: `factors.${type}.button_text` });

/** The factor card is the only element with both the factor title label and `aria-disabled`. */
const factorCard = (type: string) =>
  document.querySelector<HTMLElement>(`[aria-label="factors.${type}.title"][aria-disabled]`);

describe('UserMFAManagement behaviour', () => {
  let api: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    api = mockCoreClient.getMyAccountApiClient();
    api.authenticationMethods.list = vi
      .fn()
      .mockResolvedValue(
        createMockAuthenticationMethodsResponse([
          createMockAuthenticator({ id: 'auth_totp_1', type: 'totp', enrolled: true }),
        ]),
      );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderLoaded = async (ui: React.ReactElement) => {
    renderWithProviders(ui);
    await waitFor(() => expect(factorCard('totp')).toBeInTheDocument());
  };

  describe.each([
    { readOnly: false, disableEnroll: false, disableDelete: false, hideHeader: false },
    { readOnly: false, disableEnroll: false, disableDelete: false, hideHeader: true },
    { readOnly: true, disableEnroll: false, disableDelete: false, hideHeader: false },
    { readOnly: false, disableEnroll: true, disableDelete: false, hideHeader: false },
    { readOnly: false, disableEnroll: false, disableDelete: true, hideHeader: false },
    { readOnly: true, disableEnroll: true, disableDelete: true, hideHeader: true },
  ])(
    'readOnly=$readOnly disableEnroll=$disableEnroll disableDelete=$disableDelete hideHeader=$hideHeader',
    ({ readOnly, disableEnroll, disableDelete, hideHeader }) => {
      beforeEach(async () => {
        await renderLoaded(
          <UserMFAManagement
            readOnly={readOnly}
            disableEnroll={disableEnroll}
            disableDelete={disableDelete}
            hideHeader={hideHeader}
          />,
        );
      });

      it('renders the header unless hidden', () => {
        expect(Boolean(screen.queryByText('header.title'))).toBe(!hideHeader);
      });

      it('renders one card per available factor', () => {
        FACTOR_TYPES.forEach((type) => expect(factorCard(type)).toBeInTheDocument());
      });

      it('renders enroll actions unless readOnly, disabled by disableEnroll', () => {
        FACTOR_TYPES.forEach((type) => {
          const button = enrollButton(type);
          if (readOnly) {
            expect(button).not.toBeInTheDocument();
          } else {
            expect(button).toBeInTheDocument();
            expect(button!.hasAttribute('disabled')).toBe(disableEnroll);
          }
        });
      });

      it('marks the enrolled factor as enabled and lists it', () => {
        const card = factorCard('totp')!;
        expect(within(card).getByText('factors.meta.enabled')).toBeInTheDocument();
        expect(within(card).getByLabelText('factors.totp.title')).toBeInTheDocument();
      });

      it('renders the enrolled factor menu unless readOnly', () => {
        expect(Boolean(screen.queryByRole('button', { name: 'actions.menu_aria_label' }))).toBe(
          !readOnly,
        );
      });

      if (!readOnly) {
        it('disables the remove menu item when disableDelete is set', async () => {
          const user = userEvent.setup();
          await user.click(screen.getByRole('button', { name: 'actions.menu_aria_label' }));
          const item = await screen.findByRole('menuitem', {
            name: 'actions.remove_button_label',
          });
          expect(item.hasAttribute('data-disabled')).toBe(disableDelete);
        });
      }
    },
  );

  it('hides factors with visible: false and disables factors with enabled: false', async () => {
    await renderLoaded(
      <UserMFAManagement factorConfig={{ phone: { visible: false }, email: { enabled: false } }} />,
    );
    expect(factorCard('phone')).not.toBeInTheDocument();
    expect(factorCard('email')).toHaveAttribute('aria-disabled', 'true');
    expect(enrollButton('email')).toBeDisabled();
    expect(enrollButton('totp')).toBeEnabled();
  });

  it('shows the empty state when showActiveOnly is set and nothing is enrolled', async () => {
    api.authenticationMethods.list = vi
      .fn()
      .mockResolvedValue(createMockAuthenticationMethodsResponse([]));
    renderWithProviders(<UserMFAManagement showActiveOnly />);
    expect(await screen.findByText('no_active_mfa')).toBeInTheDocument();
    FACTOR_TYPES.forEach((type) => expect(enrollButton(type)).not.toBeInTheDocument());
  });

  it('renders no factors or actions while loading', async () => {
    api.authenticationMethods.list = vi.fn().mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UserMFAManagement />);
    await waitFor(() => expect(api.authenticationMethods.list).toHaveBeenCalled());
    FACTOR_TYPES.forEach((type) => {
      expect(factorCard(type)).not.toBeInTheDocument();
      expect(enrollButton(type)).not.toBeInTheDocument();
    });
  });

  it('replaces the content with the error fallback on a 5xx error', async () => {
    vi.spyOn(gateKeeperContextModule, 'useGateKeeperContext').mockReturnValue({
      error: new Error('server'),
      onRetry: vi.fn(),
    } as ReturnType<typeof gateKeeperContextModule.useGateKeeperContext>);
    vi.spyOn(coreModule, 'isMfaRequiredError').mockReturnValue(false);
    vi.spyOn(coreModule, 'getStatusCode').mockReturnValue(500);

    renderWithProviders(<UserMFAManagement />);

    expect(await screen.findByText('fallback.title')).toBeInTheDocument();
    expect(enrollButton('totp')).not.toBeInTheDocument();
  });

  describe('delete flow', () => {
    const openRemove = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(screen.getByRole('button', { name: 'actions.menu_aria_label' }));
      await user.click(
        await screen.findByRole('menuitem', { name: 'actions.remove_button_label' }),
      );
    };

    it('requires confirmation before deleting the selected factor', async () => {
      const user = userEvent.setup();
      const onBefore = vi.fn().mockReturnValue(true);
      await renderLoaded(<UserMFAManagement deleteAction={{ onBefore }} />);

      await openRemove(user);
      expect(onBefore).toHaveBeenCalledWith('totp');
      const dialog = await screen.findByRole('dialog');
      expect(api.authenticationMethods.delete).not.toHaveBeenCalled();

      await user.click(
        within(dialog).getByRole('button', { name: 'actions.confirm_button_label' }),
      );
      await waitFor(() =>
        expect(api.authenticationMethods.delete).toHaveBeenCalledWith('auth_totp_1'),
      );
    });

    it('does not open the dialog when onBefore returns false', async () => {
      const user = userEvent.setup();
      await renderLoaded(<UserMFAManagement deleteAction={{ onBefore: () => false }} />);
      await openRemove(user);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('enroll flow', () => {
    it('starts enrollment and opens the enroll dialog', async () => {
      const user = userEvent.setup();
      api.authenticationMethods.create = vi
        .fn()
        .mockResolvedValue(createMockOTPEnrollmentResponse());
      const onBefore = vi.fn().mockReturnValue(true);
      await renderLoaded(<UserMFAManagement enrollAction={{ onBefore }} />);

      await user.click(enrollButton('totp')!);
      expect(onBefore).toHaveBeenCalledWith('totp');
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      await waitFor(() => expect(api.authenticationMethods.create).toHaveBeenCalled());
    });

    it('does not start enrollment when onBefore returns false', async () => {
      const user = userEvent.setup();
      await renderLoaded(<UserMFAManagement enrollAction={{ onBefore: () => false }} />);
      await user.click(enrollButton('totp')!);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(api.authenticationMethods.create).not.toHaveBeenCalled();
    });
  });
});
