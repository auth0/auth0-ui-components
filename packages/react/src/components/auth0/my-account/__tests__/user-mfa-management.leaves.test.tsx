/**
 * Leaf parts of `UserMFAManagement`: the enroll dialog, the delete dialog and the enrolled
 * factor row. Each is checked as the default content and as parts composed by the host.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  UserMFAManagement,
  UserMFAManagementView,
} from '@/components/auth0/my-account/user-mfa-management';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  ENTER_CONTACT,
  ENTER_QR,
  QR_PHASE_INSTALLATION,
  SHOW_RECOVERY_CODE,
} from '@/lib/constants/my-account/user-mfa-management/user-mfa-constants';
import {
  createMockAuthenticationMethodsResponse,
  createMockAuthenticator,
  createMockUserMFAManagementViewProps,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UserMFAManagementViewProps } from '@/types/my-account/user-mfa-management/user-mfa-management-types';

mockToast();
const { initMockCoreClient } = mockCore();

const renderView = (overrides: Partial<UserMFAManagementViewProps> = {}) =>
  renderWithProviders(
    <UserMFAManagementView {...createMockUserMFAManagementViewProps(overrides)} />,
  );

const enrolled = (overrides: Parameters<typeof createMockAuthenticator>[0]) =>
  createMockAuthenticator({ enrolled: true, ...overrides });

const phone = enrolled({ id: 'phone_1', type: 'phone', name: '+1234567890' });
const recoveryCode = enrolled({
  id: 'recovery_1',
  type: 'recovery-code',
  created_at: '2023-01-01T00:00:00.000Z',
  last_auth_at: '2023-02-01T00:00:00.000Z',
});

/** View props with an enrolled phone and recovery code. */
const withEnrolledFactors: Partial<UserMFAManagementViewProps> = {
  factorsByType: {
    ...createMockUserMFAManagementViewProps().factorsByType,
    phone: [phone],
    'recovery-code': [recoveryCode],
  },
  visibleFactorTypes: ['phone', 'recovery-code'],
};

describe('UserMFAManagement leaf parts', () => {
  let api: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
    api = mockCoreClient.getMyAccountApiClient();
    api.authenticationMethods.list = vi
      .fn()
      .mockResolvedValue(
        createMockAuthenticationMethodsResponse([
          createMockAuthenticator({ id: 'auth_totp_1', type: 'totp', enrolled: true }),
        ]),
      );
    api.authenticationMethods.delete = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('enroll dialog', () => {
    describe('visibility', () => {
      it('should not render when it is closed', () => {
        renderView({ enrollFactor: 'email', enrollmentPhase: ENTER_CONTACT });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should not render while there is no phase', () => {
        renderView({ isEnrollDialogOpen: true, enrollFactor: 'email', enrollmentPhase: null });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should not render while no factor is being enrolled', () => {
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: null,
          enrollmentPhase: ENTER_CONTACT,
        });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should render with the title of the factor and describe the dialog by it', async () => {
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'email',
          enrollmentPhase: ENTER_CONTACT,
        });

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getAllByText('enrollment.email.title').length).toBeGreaterThan(0);
        expect(dialog).toHaveAccessibleDescription('enrollment.email.title');
      });

      it('should call onCloseEnrollDialog when dismissed with Escape', async () => {
        const user = userEvent.setup();
        const onCloseEnrollDialog = vi.fn().mockResolvedValue(undefined);
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'email',
          enrollmentPhase: ENTER_CONTACT,
          onCloseEnrollDialog,
        });
        await screen.findByRole('dialog');

        await user.keyboard('{Escape}');

        expect(onCloseEnrollDialog).toHaveBeenCalled();
      });

      it('should use custom messages', async () => {
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'email',
          enrollmentPhase: ENTER_CONTACT,
          customMessages: { enrollment: { email: { title: 'Add an email' } } },
        });

        expect((await screen.findAllByText('Add an email')).length).toBeGreaterThan(0);
      });
    });

    describe('phases', () => {
      it.each([
        ['email', 'enrollment.email.title'],
        ['phone', 'enrollment.phone.title'],
      ] as const)('should render the contact phase for %s', async (factor, title) => {
        const user = userEvent.setup();
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: factor,
          enrollmentPhase: ENTER_CONTACT,
        });

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getAllByText(title).length).toBeGreaterThan(0);
        const input = await within(dialog).findByRole('textbox');
        await user.type(input, '12345');
        expect(input).toHaveValue('12345');
      });

      it('should render the QR phase for an authenticator app', async () => {
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'totp',
          enrollmentPhase: ENTER_QR,
          otpData: { barcodeUri: 'otpauth://totp/test', manualInputCode: 'MANUAL123' },
        });

        expect(await screen.findByRole('img')).toBeInTheDocument();
      });

      it('should render the installation phase for push notifications', async () => {
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'push-notification',
          enrollmentPhase: QR_PHASE_INSTALLATION,
        });

        expect(await screen.findByText('enrollment.push.install_description')).toBeInTheDocument();
        expect(await screen.findByRole('link', { name: /app_store/i })).toHaveAttribute(
          'href',
          'https://apps.apple.com/us/app/auth0-guardian/id1093447833',
        );
        expect(await screen.findByRole('link', { name: /google_play/i })).toHaveAttribute(
          'href',
          'https://play.google.com/store/apps/details?id=com.auth0.guardian',
        );
      });

      it('should close from the cancel button of the installation phase', async () => {
        const user = userEvent.setup();
        const onCloseEnrollDialog = vi.fn().mockResolvedValue(undefined);
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'push-notification',
          enrollmentPhase: QR_PHASE_INSTALLATION,
          onCloseEnrollDialog,
        });

        await user.click(
          await screen.findByRole('button', { name: 'actions.cancel_button_label' }),
        );

        expect(onCloseEnrollDialog).toHaveBeenCalledTimes(1);
      });

      it('should continue to the QR step from the installation phase', async () => {
        const user = userEvent.setup();
        const onStartQREnrollment = vi.fn().mockResolvedValue(undefined);
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'push-notification',
          enrollmentPhase: QR_PHASE_INSTALLATION,
          onStartQREnrollment,
        });

        await user.click(
          await screen.findByRole('button', { name: 'actions.continue_button_label' }),
        );

        expect(onStartQREnrollment).toHaveBeenCalledTimes(1);
      });

      it('should render the recovery code phase', async () => {
        renderView({
          isEnrollDialogOpen: true,
          enrollFactor: 'recovery-code',
          enrollmentPhase: SHOW_RECOVERY_CODE,
          recoveryCode: 'ABCD-1234',
        });

        expect(await screen.findByDisplayValue('ABCD-1234')).toBeInTheDocument();
      });
    });

    describe('when the host mounts the dialog', () => {
      /** Starts enrolling an email, which opens the dialog without calling the API. */
      const startEmailEnrollment = async (user: ReturnType<typeof userEvent.setup>) =>
        user.click(await screen.findByRole('button', { name: 'factors.email.button_text' }));

      it('should not open any dialog if mountDialogs is false and none is rendered', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserMFAManagement.Root mountDialogs={false}>
            <UserMFAManagement.DefaultLayout />
          </UserMFAManagement.Root>,
        );

        await startEmailEnrollment(user);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should show the default content of an EnrollDialog the host renders', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserMFAManagement.Root mountDialogs={false}>
            <UserMFAManagement.DefaultLayout />
            <UserMFAManagement.EnrollDialog />
          </UserMFAManagement.Root>,
        );

        await startEmailEnrollment(user);

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getAllByText('enrollment.email.title').length).toBeGreaterThan(0);
        expect(await within(dialog).findByRole('textbox')).toBeInTheDocument();
        expect(screen.getAllByRole('dialog')).toHaveLength(1);
      });

      it('should show only the parts the host arranges, with a host step for a phase', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserMFAManagement.Root mountDialogs={false}>
            <UserMFAManagement.DefaultLayout />
            <UserMFAManagement.EnrollDialog>
              <UserMFAManagement.EnrollDialogContent className="host-dialog">
                <UserMFAManagement.EnrollDialogHeader>
                  <UserMFAManagement.EnrollDialogTitle>
                    Add your email
                  </UserMFAManagement.EnrollDialogTitle>
                  <UserMFAManagement.EnrollDialogDescription>
                    We will send you a code.
                  </UserMFAManagement.EnrollDialogDescription>
                </UserMFAManagement.EnrollDialogHeader>
                <UserMFAManagement.EnrollPhase>
                  {(phase) =>
                    phase === ENTER_CONTACT ? (
                      <p>Host owned contact step</p>
                    ) : (
                      <UserMFAManagement.EnrollPhase />
                    )
                  }
                </UserMFAManagement.EnrollPhase>
              </UserMFAManagement.EnrollDialogContent>
            </UserMFAManagement.EnrollDialog>
          </UserMFAManagement.Root>,
        );

        await startEmailEnrollment(user);

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toHaveClass('host-dialog');
        expect(within(dialog).getByText('Add your email')).toBeInTheDocument();
        expect(dialog).toHaveAccessibleDescription('We will send you a code.');
        expect(within(dialog).getByText('Host owned contact step')).toBeInTheDocument();
        expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('delete dialog', () => {
    const openDeleteDialog = (overrides: Partial<UserMFAManagementViewProps> = {}) =>
      renderView({
        isDeleteDialogOpen: true,
        factorToDelete: { id: 'totp_1', type: 'totp' },
        ...overrides,
      });

    it('should not render when it is closed', () => {
      renderView({ factorToDelete: { id: 'totp_1', type: 'totp' } });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show the title, the consent for the factor type and both actions', async () => {
      openDeleteDialog();

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('remove_factor_dialog.title')).toBeInTheDocument();
      expect(within(dialog).getByText('remove_factor_dialog.consent.totp')).toBeInTheDocument();
      expect(
        within(dialog).getByRole('button', { name: 'actions.cancel_button_label' }),
      ).toBeEnabled();
      expect(
        within(dialog).getByRole('button', { name: 'actions.confirm_button_label' }),
      ).toBeEnabled();
    });

    it('should describe the dialog by its consent text', async () => {
      openDeleteDialog();
      expect(await screen.findByRole('dialog')).toHaveAccessibleDescription(
        'remove_factor_dialog.consent.totp',
      );
    });

    it('should call onCancelDelete on cancel', async () => {
      const user = userEvent.setup();
      const onCancelDelete = vi.fn();
      openDeleteDialog({ onCancelDelete });

      await user.click(await screen.findByRole('button', { name: 'actions.cancel_button_label' }));

      expect(onCancelDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirmDelete on confirm', async () => {
      const user = userEvent.setup();
      const onConfirmDelete = vi.fn();
      openDeleteDialog({ onConfirmDelete });

      await user.click(await screen.findByRole('button', { name: 'actions.confirm_button_label' }));

      expect(onConfirmDelete).toHaveBeenCalledTimes(1);
    });

    it('should call onCancelDelete when dismissed with Escape', async () => {
      const user = userEvent.setup();
      const onCancelDelete = vi.fn();
      openDeleteDialog({ onCancelDelete });
      await screen.findByRole('dialog');

      await user.keyboard('{Escape}');

      expect(onCancelDelete).toHaveBeenCalled();
    });

    describe('while a removal is running', () => {
      it('should disable both actions and label confirm as deleting', async () => {
        openDeleteDialog({ isDeleting: true });

        expect(
          await screen.findByRole('button', { name: 'actions.cancel_button_label' }),
        ).toBeDisabled();
        const confirm = screen.getByRole('button', { name: 'actions.confirm_button_label' });
        expect(confirm).toBeDisabled();
        expect(confirm).toHaveTextContent('actions.deleting_button_text');
        expect(confirm).toHaveAttribute('aria-busy', 'true');
      });
    });

    it('should use custom messages for the title', async () => {
      openDeleteDialog({ customMessages: { remove_factor_dialog: { title: 'Remove it?' } } });
      expect(await screen.findByText('Remove it?')).toBeInTheDocument();
    });

    describe('when the host mounts the dialog', () => {
      const removeFirstRow = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(await screen.findByRole('button', { name: 'actions.menu_aria_label' }));
        await user.click(
          await screen.findByRole('menuitem', { name: 'actions.remove_button_label' }),
        );
      };

      it('should show only the parts the host arranges, with a host confirm button', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserMFAManagement.Root mountDialogs={false}>
            <UserMFAManagement.DefaultLayout />
            <UserMFAManagement.DeleteDialog>
              <UserMFAManagement.DeleteDialogContent className="host-dialog">
                <UserMFAManagement.DeleteDialogHeader>
                  <UserMFAManagement.DeleteDialogTitle>
                    Remove this method?
                  </UserMFAManagement.DeleteDialogTitle>
                </UserMFAManagement.DeleteDialogHeader>
                <UserMFAManagement.DeleteDialogDescription>
                  You can add it again later.
                </UserMFAManagement.DeleteDialogDescription>
                <UserMFAManagement.DeleteDialogFooter>
                  <UserMFAManagement.DeleteDialogConfirm
                    render={<button className="host-confirm">Yes, remove</button>}
                  />
                </UserMFAManagement.DeleteDialogFooter>
              </UserMFAManagement.DeleteDialogContent>
            </UserMFAManagement.DeleteDialog>
          </UserMFAManagement.Root>,
        );

        await removeFirstRow(user);

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toHaveClass('host-dialog');
        expect(within(dialog).getByText('Remove this method?')).toBeInTheDocument();
        expect(dialog).toHaveAccessibleDescription('You can add it again later.');
        expect(
          within(dialog).queryByRole('button', { name: 'actions.cancel_button_label' }),
        ).not.toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: 'Yes, remove' }));

        await waitFor(() =>
          expect(api.authenticationMethods.delete).toHaveBeenCalledWith('auth_totp_1'),
        );
      });

      it('should pass the pending state to a function render of the confirm action', async () => {
        api.authenticationMethods.delete = vi.fn().mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderWithProviders(
          <UserMFAManagement.Root mountDialogs={false}>
            <UserMFAManagement.DefaultLayout />
            <UserMFAManagement.DeleteDialog>
              <UserMFAManagement.DeleteDialogContent>
                <UserMFAManagement.DeleteDialogHeader />
                <UserMFAManagement.DeleteDialogFooter>
                  <UserMFAManagement.DeleteDialogConfirm
                    render={(props, state) => (
                      <button {...props}>{state.pending ? 'Removing…' : 'Remove'}</button>
                    )}
                  />
                </UserMFAManagement.DeleteDialogFooter>
              </UserMFAManagement.DeleteDialogContent>
            </UserMFAManagement.DeleteDialog>
          </UserMFAManagement.Root>,
        );
        await removeFirstRow(user);
        const dialog = await screen.findByRole('dialog');

        await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

        const removing = await within(dialog).findByRole('button', { name: 'Removing…' });
        expect(removing).toBeDisabled();
        expect(removing).toHaveAttribute('aria-busy', 'true');
      });

      it('should close from a replaced cancel action', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserMFAManagement.Root mountDialogs={false}>
            <UserMFAManagement.DefaultLayout />
            <UserMFAManagement.DeleteDialog>
              <UserMFAManagement.DeleteDialogContent>
                <UserMFAManagement.DeleteDialogHeader />
                <UserMFAManagement.DeleteDialogFooter>
                  <UserMFAManagement.DeleteDialogCancel render={<button>Keep it</button>} />
                </UserMFAManagement.DeleteDialogFooter>
              </UserMFAManagement.DeleteDialogContent>
            </UserMFAManagement.DeleteDialog>
          </UserMFAManagement.Root>,
        );
        await removeFirstRow(user);

        await user.click(await screen.findByRole('button', { name: 'Keep it' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(api.authenticationMethods.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe('enrolled factor row', () => {
    describe('by default', () => {
      it('should show the name of each enrolled authenticator', () => {
        renderView(withEnrolledFactors);

        expect(screen.getByText('+1234567890')).toBeInTheDocument();
        expect(screen.getByText('factors.recovery-code.item_label')).toBeInTheDocument();
      });

      it('should show the created and last used dates when known', () => {
        renderView(withEnrolledFactors);

        expect(screen.getAllByText(/factors.meta.created_at/)).toHaveLength(2);
        expect(screen.getAllByText(/factors.meta.last_used/)).toHaveLength(1);
      });

      it('should show no dates for an authenticator without any', () => {
        renderView({
          ...withEnrolledFactors,
          factorsByType: {
            ...createMockUserMFAManagementViewProps().factorsByType,
            phone: [{ ...phone, created_at: null }],
          },
          visibleFactorTypes: ['phone'],
        });

        expect(screen.queryByText(/factors.meta.(created_at|last_used)/)).not.toBeInTheDocument();
      });

      it('should fall back to the id when an authenticator has no name', () => {
        renderView({
          factorsByType: {
            ...createMockUserMFAManagementViewProps().factorsByType,
            email: [enrolled({ id: 'email_1', type: 'email', name: '' })],
          },
          visibleFactorTypes: ['email'],
        });

        expect(screen.getByText('email_1')).toBeInTheDocument();
      });

      it('should label the row card with the name', () => {
        renderView(withEnrolledFactors);
        expect(document.querySelector('[aria-label="+1234567890"]')).toBeInTheDocument();
      });

      it('should offer the menu unless readOnly', async () => {
        const { unmount } = renderView(withEnrolledFactors);
        expect(
          (await screen.findAllByRole('button', { name: 'actions.menu_aria_label' })).length,
        ).toBe(2);
        unmount();

        renderView({ ...withEnrolledFactors, readOnly: true });
        expect(
          screen.queryByRole('button', { name: 'actions.menu_aria_label' }),
        ).not.toBeInTheDocument();
      });

      it('should ask to delete the authenticator from the menu', async () => {
        const user = userEvent.setup();
        const onDeleteFactor = vi.fn().mockResolvedValue(undefined);
        renderView({ ...withEnrolledFactors, onDeleteFactor });

        await user.click(
          (await screen.findAllByRole('button', { name: 'actions.menu_aria_label' }))[0]!,
        );
        await user.click(
          await screen.findByRole('menuitem', { name: 'actions.remove_button_label' }),
        );

        expect(onDeleteFactor).toHaveBeenCalledWith('phone_1', 'phone');
      });

      it.each([
        ['disableDelete is set', { disableDelete: true }],
        ['a removal is running', { isDeleting: true }],
        [
          'the factor is configured with enabled: false',
          { factorConfig: { phone: { enabled: false } } },
        ],
      ] satisfies Array<[string, Partial<UserMFAManagementViewProps>]>)(
        'should disable the remove item when %s',
        async (_, overrides) => {
          const user = userEvent.setup();
          const onDeleteFactor = vi.fn();
          renderView({ ...withEnrolledFactors, ...overrides, onDeleteFactor });

          await user.click(
            (await screen.findAllByRole('button', { name: 'actions.menu_aria_label' }))[0]!,
          );

          const item = await screen.findByRole('menuitem', { name: 'actions.remove_button_label' });
          expect(item).toHaveAttribute('aria-disabled', 'true');
          expect(item).toHaveAccessibleDescription('+1234567890');
          await user.click(item);
          expect(onDeleteFactor).not.toHaveBeenCalled();
        },
      );
    });

    describe('when the host arranges the row', () => {
      const renderRows = (row: () => React.ReactElement, rootProps = {}) =>
        renderWithProviders(
          <UserMFAManagement.Root {...rootProps}>
            <UserMFAManagement.Factors>
              {() => (
                <UserMFAManagement.Factor>
                  <UserMFAManagement.FactorList>{row}</UserMFAManagement.FactorList>
                </UserMFAManagement.Factor>
              )}
            </UserMFAManagement.Factors>
          </UserMFAManagement.Root>,
        );

      beforeEach(() => {
        const withDates = {
          ...enrolled({ id: 'auth_totp_1', type: 'totp' }),
          last_auth_at: '2024-06-01T00:00:00.000Z',
        };
        api.authenticationMethods.list = vi
          .fn()
          .mockResolvedValue(createMockAuthenticationMethodsResponse([withDates]));
      });

      it('should let the host pick and order the meta segments', async () => {
        renderRows(() => (
          <UserMFAManagement.EnrolledFactorMeta>
            <UserMFAManagement.EnrolledFactorLastUsedAt />
            <UserMFAManagement.EnrolledFactorCreatedAt />
          </UserMFAManagement.EnrolledFactorMeta>
        ));

        const lastUsed = await screen.findByText(/factors.meta.last_used/);
        const created = screen.getByText(/factors.meta.created_at/);
        expect(
          lastUsed.compareDocumentPosition(created) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
      });

      it('should let the host replace the text of a date', async () => {
        renderRows(() => (
          <UserMFAManagement.EnrolledFactorCreatedAt>
            Since 2023
          </UserMFAManagement.EnrolledFactorCreatedAt>
        ));

        expect(await screen.findByText('Since 2023')).toBeInTheDocument();
      });

      it('should compose the menu with a host item next to the remove item', async () => {
        const user = userEvent.setup();
        const onRename = vi.fn();
        renderRows(() => (
          <UserMFAManagement.EnrolledFactorMenu>
            <UserMFAManagement.EnrolledFactorMenuTrigger>
              <span>Options</span>
            </UserMFAManagement.EnrolledFactorMenuTrigger>
            <UserMFAManagement.EnrolledFactorMenuContent>
              <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
              <UserMFAManagement.EnrolledFactorMenuDelete />
            </UserMFAManagement.EnrolledFactorMenuContent>
          </UserMFAManagement.EnrolledFactorMenu>
        ));

        await user.click(await screen.findByText('Options'));
        await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
        expect(onRename).toHaveBeenCalledTimes(1);

        await user.click(await screen.findByText('Options'));
        await user.click(
          await screen.findByRole('menuitem', { name: 'actions.remove_button_label' }),
        );
        expect(await screen.findByRole('dialog')).toBeInTheDocument();
      });

      it('should hide a composed remove item when readOnly', async () => {
        const user = userEvent.setup();
        renderRows(
          () => (
            <UserMFAManagement.EnrolledFactorMenu>
              <UserMFAManagement.EnrolledFactorMenuTrigger>
                <span>Options</span>
              </UserMFAManagement.EnrolledFactorMenuTrigger>
              <UserMFAManagement.EnrolledFactorMenuContent>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <UserMFAManagement.EnrolledFactorMenuDelete />
              </UserMFAManagement.EnrolledFactorMenuContent>
            </UserMFAManagement.EnrolledFactorMenu>
          ),
          { readOnly: true },
        );

        await user.click(await screen.findByText('Options'));

        expect(await screen.findByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
        expect(
          screen.queryByRole('menuitem', { name: 'actions.remove_button_label' }),
        ).not.toBeInTheDocument();
      });

      it('should replace the remove item with a host element that keeps the behaviour', async () => {
        const user = userEvent.setup();
        renderRows(() => (
          <UserMFAManagement.EnrolledFactorMenu>
            <UserMFAManagement.EnrolledFactorMenuTrigger>
              <span>Options</span>
            </UserMFAManagement.EnrolledFactorMenuTrigger>
            <UserMFAManagement.EnrolledFactorMenuContent>
              <UserMFAManagement.EnrolledFactorMenuDelete
                render={<DropdownMenuItem>Delete forever</DropdownMenuItem>}
              />
            </UserMFAManagement.EnrolledFactorMenuContent>
          </UserMFAManagement.EnrolledFactorMenu>
        ));

        await user.click(await screen.findByText('Options'));
        await user.click(await screen.findByRole('menuitem', { name: 'Delete forever' }));

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
      });

      it('should build a whole row from the parts', async () => {
        renderRows(() => (
          <UserMFAManagement.EnrolledFactor className="host-row">
            <UserMFAManagement.EnrolledFactorIcon>
              <span data-testid="host-icon" />
            </UserMFAManagement.EnrolledFactorIcon>
            <UserMFAManagement.EnrolledFactorDetails>
              <UserMFAManagement.EnrolledFactorName />
            </UserMFAManagement.EnrolledFactorDetails>
            <UserMFAManagement.DeleteAction render={<button>Remove</button>} />
          </UserMFAManagement.EnrolledFactor>
        ));

        expect(await screen.findByTestId('host-icon')).toBeInTheDocument();
        expect(document.querySelector('.host-row')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toHaveAccessibleDescription(
          'factors.totp.title',
        );
        expect(screen.queryByText(/factors.meta.(created_at|last_used)/)).not.toBeInTheDocument();
      });
    });
  });
});
