/**
 * Leaf parts of `UserPasskeyManagement`: the revoke dialog, the row menu and the row meta.
 * Each is checked as the default content and as parts composed by the host.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserPasskeyManagement } from '@/components/auth0/my-account/user-passkey-management';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const CHROME_ON_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const PASSKEYS = {
  authentication_methods: [
    {
      id: 'pk-1',
      type: 'passkey',
      created_at: '2024-01-01T00:00:00.000Z',
      last_auth_at: '2024-06-01T00:00:00.000Z',
      user_agent: CHROME_ON_MAC,
    },
    { id: 'pk-2', type: 'passkey' },
  ],
};

describe('UserPasskeyManagement leaf parts', () => {
  let api: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({ coreClient: mockCoreClient });
    api = mockCoreClient.getMyAccountApiClient();
    api.authenticationMethods.list = vi.fn().mockResolvedValue(PASSKEYS);
    api.authenticationMethods.delete = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Opens the default revoke dialog for the given row through the row menu. */
  const openRevokeDialog = async (user: ReturnType<typeof userEvent.setup>, row = 0) => {
    const triggers = await screen.findAllByRole('button', { name: 'passkey_name' });
    await user.click(triggers[row]!);
    await user.click(await screen.findByRole('menuitem', { name: 'actions.revoke' }));
    return screen.findByRole('dialog');
  };

  describe('RevokeDialog', () => {
    describe('when the default dialog is mounted by Root', () => {
      it('should not show a dialog until a revoke is requested', async () => {
        renderWithProviders(<UserPasskeyManagement />);
        await screen.findAllByText('passkey_name');

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should show the title, the consent text and both actions', async () => {
        const user = userEvent.setup();
        renderWithProviders(<UserPasskeyManagement />);
        const dialog = await openRevokeDialog(user);

        expect(within(dialog).getByText('title')).toBeInTheDocument();
        expect(within(dialog).getByText('consent')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'cancel' })).toBeEnabled();
        expect(within(dialog).getByRole('button', { name: 'confirm' })).toBeEnabled();
      });

      it('should describe the dialog by its consent text', async () => {
        const user = userEvent.setup();
        renderWithProviders(<UserPasskeyManagement />);
        const dialog = await openRevokeDialog(user);

        expect(dialog).toHaveAccessibleDescription('consent');
      });

      it('should revoke the selected passkey on confirm', async () => {
        const user = userEvent.setup();
        renderWithProviders(<UserPasskeyManagement />);
        const dialog = await openRevokeDialog(user, 1);

        await user.click(within(dialog).getByRole('button', { name: 'confirm' }));

        await waitFor(() => expect(api.authenticationMethods.delete).toHaveBeenCalledWith('pk-2'));
      });

      it('should close without revoking on cancel', async () => {
        const user = userEvent.setup();
        renderWithProviders(<UserPasskeyManagement />);
        const dialog = await openRevokeDialog(user);

        await user.click(within(dialog).getByRole('button', { name: 'cancel' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(api.authenticationMethods.delete).not.toHaveBeenCalled();
      });

      it('should use custom messages for the title', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserPasskeyManagement
            customMessages={{ modals: { revoke: { title: 'Custom Revoke Title' } } }}
          />,
        );
        const dialog = await openRevokeDialog(user);

        expect(within(dialog).getByText('Custom Revoke Title')).toBeInTheDocument();
      });
    });

    describe('while a revoke is running', () => {
      beforeEach(() => {
        api.authenticationMethods.delete = vi.fn().mockReturnValue(new Promise(() => {}));
      });

      it('should disable cancel, and keep confirm named, busy and disabled', async () => {
        const user = userEvent.setup();
        renderWithProviders(<UserPasskeyManagement />);
        const dialog = await openRevokeDialog(user);

        await user.click(within(dialog).getByRole('button', { name: 'confirm' }));

        const confirm = await within(dialog).findByRole('button', { name: 'confirm' });
        await waitFor(() => expect(confirm).toBeDisabled());
        expect(confirm).toHaveAttribute('aria-busy', 'true');
        expect(within(dialog).getByRole('button', { name: 'cancel' })).toBeDisabled();
      });

      it('should keep the dialog open when it is dismissed', async () => {
        const user = userEvent.setup();
        renderWithProviders(<UserPasskeyManagement />);
        const dialog = await openRevokeDialog(user);
        await user.click(within(dialog).getByRole('button', { name: 'confirm' }));
        await waitFor(() =>
          expect(within(dialog).getByRole('button', { name: 'cancel' })).toBeDisabled(),
        );

        await user.keyboard('{Escape}');

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    describe('when the host mounts the dialog', () => {
      it('should not show any dialog if mountDialogs is false and none is rendered', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserPasskeyManagement.Root mountDialogs={false}>
            <UserPasskeyManagement.DefaultLayout />
          </UserPasskeyManagement.Root>,
        );
        const triggers = await screen.findAllByRole('button', { name: 'passkey_name' });
        await user.click(triggers[0]!);
        await user.click(await screen.findByRole('menuitem', { name: 'actions.revoke' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      it('should show the default content of a RevokeDialog the host renders', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserPasskeyManagement.Root mountDialogs={false}>
            <UserPasskeyManagement.DefaultLayout />
            <UserPasskeyManagement.RevokeDialog />
          </UserPasskeyManagement.Root>,
        );
        const dialog = await openRevokeDialog(user);

        expect(within(dialog).getByText('consent')).toBeInTheDocument();
        expect(screen.getAllByRole('dialog')).toHaveLength(1);
      });

      it('should show only the parts the host arranges, with host text and button', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserPasskeyManagement.Root mountDialogs={false}>
            <UserPasskeyManagement.DefaultLayout />
            <UserPasskeyManagement.RevokeDialog>
              <UserPasskeyManagement.RevokeDialogContent className="host-dialog">
                <UserPasskeyManagement.RevokeDialogHeader>
                  <UserPasskeyManagement.RevokeDialogTitle>
                    Remove this passkey?
                  </UserPasskeyManagement.RevokeDialogTitle>
                </UserPasskeyManagement.RevokeDialogHeader>
                <UserPasskeyManagement.RevokeDialogDescription>
                  You will not be able to sign in with it.
                </UserPasskeyManagement.RevokeDialogDescription>
                <UserPasskeyManagement.RevokeDialogFooter>
                  <UserPasskeyManagement.RevokeDialogConfirm
                    render={<button className="host-confirm">Yes, remove</button>}
                  />
                </UserPasskeyManagement.RevokeDialogFooter>
              </UserPasskeyManagement.RevokeDialogContent>
            </UserPasskeyManagement.RevokeDialog>
          </UserPasskeyManagement.Root>,
        );
        const dialog = await openRevokeDialog(user);

        expect(dialog).toHaveClass('host-dialog');
        expect(within(dialog).getByText('Remove this passkey?')).toBeInTheDocument();
        expect(dialog).toHaveAccessibleDescription('You will not be able to sign in with it.');
        expect(within(dialog).queryByRole('button', { name: 'cancel' })).not.toBeInTheDocument();

        await user.click(within(dialog).getByRole('button', { name: 'Yes, remove' }));

        await waitFor(() => expect(api.authenticationMethods.delete).toHaveBeenCalledWith('pk-1'));
      });

      it('should pass the pending state to a function render of the confirm action', async () => {
        api.authenticationMethods.delete = vi.fn().mockReturnValue(new Promise(() => {}));
        const user = userEvent.setup();
        renderWithProviders(
          <UserPasskeyManagement.Root mountDialogs={false}>
            <UserPasskeyManagement.DefaultLayout />
            <UserPasskeyManagement.RevokeDialog>
              <UserPasskeyManagement.RevokeDialogContent>
                <UserPasskeyManagement.RevokeDialogHeader />
                <UserPasskeyManagement.RevokeDialogFooter>
                  <UserPasskeyManagement.RevokeDialogConfirm
                    render={(props, state) => (
                      <button {...props}>{state.pending ? 'Removing…' : 'Remove'}</button>
                    )}
                  />
                </UserPasskeyManagement.RevokeDialogFooter>
              </UserPasskeyManagement.RevokeDialogContent>
            </UserPasskeyManagement.RevokeDialog>
          </UserPasskeyManagement.Root>,
        );
        const dialog = await openRevokeDialog(user);

        await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

        const removing = await within(dialog).findByRole('button', { name: 'Removing…' });
        expect(removing).toBeDisabled();
        expect(removing).toHaveAttribute('aria-busy', 'true');
      });

      it('should close from a replaced cancel action', async () => {
        const user = userEvent.setup();
        renderWithProviders(
          <UserPasskeyManagement.Root mountDialogs={false}>
            <UserPasskeyManagement.DefaultLayout />
            <UserPasskeyManagement.RevokeDialog>
              <UserPasskeyManagement.RevokeDialogContent>
                <UserPasskeyManagement.RevokeDialogHeader />
                <UserPasskeyManagement.RevokeDialogFooter>
                  <UserPasskeyManagement.RevokeDialogCancel render={<button>Keep it</button>} />
                </UserPasskeyManagement.RevokeDialogFooter>
              </UserPasskeyManagement.RevokeDialogContent>
            </UserPasskeyManagement.RevokeDialog>
          </UserPasskeyManagement.Root>,
        );
        const dialog = await openRevokeDialog(user);

        await user.click(within(dialog).getByRole('button', { name: 'Keep it' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      });
    });
  });

  describe('row menu', () => {
    it('should open from the default trigger and show the revoke item', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserPasskeyManagement />);

      await user.click((await screen.findAllByRole('button', { name: 'passkey_name' }))[0]!);

      expect(await screen.findByRole('menuitem', { name: 'actions.revoke' })).toBeInTheDocument();
    });

    it('should hide the default menu when revoking is disabled', async () => {
      renderWithProviders(<UserPasskeyManagement revokeAction={{ disabled: true }} />);
      await screen.findAllByText('passkey_name');

      expect(screen.queryByRole('button', { name: 'passkey_name' })).not.toBeInTheDocument();
    });

    it('should compose the menu with a host item next to the revoke item', async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.Section>
            <UserPasskeyManagement.List>
              {() => (
                <UserPasskeyManagement.Item>
                  <UserPasskeyManagement.ItemDetails />
                  <UserPasskeyManagement.ItemMenu>
                    <UserPasskeyManagement.ItemMenuTrigger>
                      <span>Options</span>
                    </UserPasskeyManagement.ItemMenuTrigger>
                    <UserPasskeyManagement.ItemMenuContent>
                      <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
                      <UserPasskeyManagement.ItemMenuRevoke />
                    </UserPasskeyManagement.ItemMenuContent>
                  </UserPasskeyManagement.ItemMenu>
                </UserPasskeyManagement.Item>
              )}
            </UserPasskeyManagement.List>
          </UserPasskeyManagement.Section>
        </UserPasskeyManagement.Root>,
      );

      await user.click((await screen.findAllByText('Options'))[0]!);
      await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
      expect(onRename).toHaveBeenCalledTimes(1);

      await user.click((await screen.findAllByText('Options'))[0]!);
      await user.click(await screen.findByRole('menuitem', { name: 'actions.revoke' }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('should hide a composed revoke item when revoking is disabled', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserPasskeyManagement.Root revokeAction={{ disabled: true }}>
          <UserPasskeyManagement.List>
            {() => (
              <UserPasskeyManagement.ItemMenu>
                <UserPasskeyManagement.ItemMenuTrigger>
                  <span>Options</span>
                </UserPasskeyManagement.ItemMenuTrigger>
                <UserPasskeyManagement.ItemMenuContent>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <UserPasskeyManagement.ItemMenuRevoke />
                </UserPasskeyManagement.ItemMenuContent>
              </UserPasskeyManagement.ItemMenu>
            )}
          </UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );

      await user.click((await screen.findAllByText('Options'))[0]!);

      expect(await screen.findByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'actions.revoke' })).not.toBeInTheDocument();
    });

    it('should replace the revoke item with a host element that keeps the behaviour', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.List>
            {() => (
              <UserPasskeyManagement.ItemMenu>
                <UserPasskeyManagement.ItemMenuTrigger>
                  <span>Options</span>
                </UserPasskeyManagement.ItemMenuTrigger>
                <UserPasskeyManagement.ItemMenuContent>
                  <UserPasskeyManagement.ItemMenuRevoke
                    render={<DropdownMenuItem>Delete forever</DropdownMenuItem>}
                  />
                </UserPasskeyManagement.ItemMenuContent>
              </UserPasskeyManagement.ItemMenu>
            )}
          </UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );

      await user.click((await screen.findAllByText('Options'))[0]!);
      await user.click(await screen.findByRole('menuitem', { name: 'Delete forever' }));

      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('row meta', () => {
    it('should show device, created and last used dates by default', async () => {
      renderWithProviders(<UserPasskeyManagement />);

      expect(await screen.findByText(/Chrome/)).toBeInTheDocument();
      expect(screen.getByText(/created_at/)).toBeInTheDocument();
      expect(screen.getByText(/last_used/)).toBeInTheDocument();
    });

    it('should render nothing for a passkey without meta', async () => {
      api.authenticationMethods.list = vi.fn().mockResolvedValue({
        authentication_methods: [{ id: 'pk-2', type: 'passkey' }],
      });
      renderWithProviders(<UserPasskeyManagement />);
      await screen.findByText('passkey_name');

      expect(screen.queryByText(/created_at|last_used|Chrome/)).not.toBeInTheDocument();
    });

    it('should let the host pick and order the segments', async () => {
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.List>
            {() => (
              <UserPasskeyManagement.ItemMeta>
                <UserPasskeyManagement.ItemLastUsedAt />
                <UserPasskeyManagement.ItemDevice />
              </UserPasskeyManagement.ItemMeta>
            )}
          </UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );

      const lastUsed = await screen.findByText(/last_used/);
      const device = screen.getByText(/Chrome/);
      expect(
        lastUsed.compareDocumentPosition(device) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(screen.queryByText(/created_at/)).not.toBeInTheDocument();
    });

    it('should let the host replace the text of a segment', async () => {
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.List>
            {() => (
              <UserPasskeyManagement.ItemMeta>
                <UserPasskeyManagement.ItemCreatedAt>
                  Added in 2024
                </UserPasskeyManagement.ItemCreatedAt>
              </UserPasskeyManagement.ItemMeta>
            )}
          </UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );

      expect((await screen.findAllByText('Added in 2024')).length).toBeGreaterThan(0);
    });
  });
});
