/**
 * Composition levels of `UserPasskeyManagement`: narrow (`render`), structural
 * (parts inside `Root`) and headless (`useUserPasskeyModel`).
 */
import { act, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  UserPasskeyManagement,
  useUserPasskeyItemContext,
  useUserPasskeyManagementContext,
} from '@/components/auth0/my-account/user-passkey-management';
import { useUserPasskeyModel } from '@/hooks/my-account/use-user-passkey';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { renderWithProviders, TestProvider } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const TWO_PASSKEYS = {
  authentication_methods: [
    { id: 'pk-1', type: 'passkey', name: 'One', created_at: '2024-01-01' },
    { id: 'pk-2', type: 'passkey', name: 'Two', created_at: '2024-02-01' },
  ],
};

describe('UserPasskeyManagement composition', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let api: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>;

  beforeEach(() => {
    mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    api = mockCoreClient.getMyAccountApiClient();
    api.authenticationMethods.list = vi.fn().mockResolvedValue(TWO_PASSKEYS);
    api.authenticationMethods.delete = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('narrow composition', () => {
    it('replaces the add button through DefaultLayout and keeps its behaviour', async () => {
      const user = userEvent.setup();
      const onBefore = vi.fn().mockReturnValue(false);
      renderWithProviders(
        <UserPasskeyManagement.Root addAction={{ onBefore }}>
          <UserPasskeyManagement.DefaultLayout
            addAction={
              <UserPasskeyManagement.AddAction
                render={<button className="host-button">Add a passkey</button>}
              />
            }
          />
        </UserPasskeyManagement.Root>,
      );

      const button = await screen.findByRole('button', { name: 'add_passkey' });
      expect(button).toHaveClass('host-button');
      expect(button).toHaveTextContent('Add a passkey');
      await user.click(button);
      expect(onBefore).toHaveBeenCalledTimes(1);
    });

    it('hides a replaced add button when addAction.disabled is set', async () => {
      renderWithProviders(
        <UserPasskeyManagement.Root addAction={{ disabled: true }}>
          <UserPasskeyManagement.DefaultLayout
            addAction={<UserPasskeyManagement.AddAction render={<button>Host add</button>} />}
          />
        </UserPasskeyManagement.Root>,
      );
      await screen.findAllByText('passkey_name');
      expect(screen.queryByText('Host add')).not.toBeInTheDocument();
    });

    it('passes pending state to a function render', async () => {
      api.authenticationMethods.create = vi.fn().mockReturnValue(new Promise(() => {}));
      const user = userEvent.setup();
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.DefaultLayout
            addAction={
              <UserPasskeyManagement.AddAction
                render={(props, state) => (
                  <button {...props}>{state.pending ? 'Adding…' : 'Add'}</button>
                )}
              />
            }
          />
        </UserPasskeyManagement.Root>,
      );

      await user.click(await screen.findByRole('button', { name: 'add_passkey' }));
      const button = await screen.findByRole('button', { name: 'add_passkey' });
      await waitFor(() => expect(button).toHaveTextContent('Adding…'));
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('structural composition', () => {
    it('keeps host content inside Root visible while loading', async () => {
      api.authenticationMethods.list = vi.fn().mockReturnValue(new Promise(() => {}));
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <nav>Host breadcrumb</nav>
          <UserPasskeyManagement.Header />
          <UserPasskeyManagement.Section />
        </UserPasskeyManagement.Root>,
      );

      expect(await screen.findByText('Host breadcrumb')).toBeInTheDocument();
      expect(screen.getByText('header.title')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'add_passkey' })).not.toBeInTheDocument();
      expect(screen.queryByText('no_passkeys')).not.toBeInTheDocument();
    });

    it('moves the add action into a custom header and omits the card header', async () => {
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.Header>
            <UserPasskeyManagement.HeaderContent>
              <UserPasskeyManagement.Title>Security keys</UserPasskeyManagement.Title>
              <a href="/help">Learn more</a>
            </UserPasskeyManagement.HeaderContent>
            <UserPasskeyManagement.HeaderActions>
              <UserPasskeyManagement.AddAction />
            </UserPasskeyManagement.HeaderActions>
          </UserPasskeyManagement.Header>
          <UserPasskeyManagement.Section>
            <UserPasskeyManagement.List />
          </UserPasskeyManagement.Section>
        </UserPasskeyManagement.Root>,
      );

      const banner = await screen.findByRole('banner');
      expect(within(banner).getByText('Security keys')).toBeInTheDocument();
      expect(within(banner).getByRole('link', { name: 'Learn more' })).toBeInTheDocument();
      expect(within(banner).getByRole('button', { name: 'add_passkey' })).toBeInTheDocument();
      expect(screen.queryByText('section_title')).not.toBeInTheDocument();
      expect(await screen.findAllByText('passkey_name')).toHaveLength(2);
    });

    it('renders every AddAction that is mounted', async () => {
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.AddAction />
          <UserPasskeyManagement.DefaultLayout />
        </UserPasskeyManagement.Root>,
      );
      await screen.findAllByText('passkey_name');
      expect(screen.getAllByRole('button', { name: 'add_passkey' })).toHaveLength(2);
    });

    it('opens the revoke dialog from Root when the default rows are replaced', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.Section>
            <UserPasskeyManagement.List>
              {() => (
                <UserPasskeyManagement.Item>
                  <UserPasskeyManagement.ItemDetails />
                  <UserPasskeyManagement.RevokeAction />
                </UserPasskeyManagement.Item>
              )}
            </UserPasskeyManagement.List>
          </UserPasskeyManagement.Section>
        </UserPasskeyManagement.Root>,
      );

      const [, second] = await screen.findAllByRole('button', { name: 'actions.revoke' });
      await user.click(second!);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'confirm' }));
      await waitFor(() => expect(api.authenticationMethods.delete).toHaveBeenCalledWith('pk-2'));
    });

    it('describes each RevokeAction by its row name', async () => {
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.List>
            {() => (
              <>
                <UserPasskeyManagement.ItemName />
                <UserPasskeyManagement.RevokeAction />
              </>
            )}
          </UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );
      const [first] = await screen.findAllByRole('button', { name: 'actions.revoke' });
      expect(first).toHaveAccessibleDescription('passkey_name');
    });

    it('passes pending state to a function render of RevokeAction while revoking', async () => {
      api.authenticationMethods.delete = vi.fn().mockReturnValue(new Promise(() => {}));
      const user = userEvent.setup();
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.List>
            {() => (
              <UserPasskeyManagement.RevokeAction
                render={(props, state) => (
                  <button {...props}>{state.pending ? 'Revoking…' : 'Revoke'}</button>
                )}
              />
            )}
          </UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );

      const [first, second] = await screen.findAllByRole('button', { name: 'Revoke' });
      await user.click(first!);
      await user.click(await screen.findByRole('button', { name: 'confirm' }));

      const revoking = await screen.findByRole('button', { name: 'Revoking…', hidden: true });
      expect(revoking).toBeDisabled();
      expect(revoking).toHaveAttribute('aria-busy', 'true');
      expect(second).toHaveTextContent('Revoke');
    });

    it('lets host components read the model and the current row', async () => {
      function Count() {
        const { model } = useUserPasskeyManagementContext();
        return <p>{`${model.passkeys.length} keys`}</p>;
      }
      function RowId() {
        const { passkey } = useUserPasskeyItemContext();
        return <span>{passkey.id}</span>;
      }
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <Count />
          <UserPasskeyManagement.List>{() => <RowId />}</UserPasskeyManagement.List>
        </UserPasskeyManagement.Root>,
      );
      expect(await screen.findByText('2 keys')).toBeInTheDocument();
      expect(screen.getByText('pk-1')).toBeInTheDocument();
      expect(screen.getByText('pk-2')).toBeInTheDocument();
    });

    it('throws a readable error for a part outside Root', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderWithProviders(<UserPasskeyManagement.AddAction />)).toThrow(
        '<UserPasskeyManagement.AddAction> must be rendered inside <UserPasskeyManagement.Root>.',
      );
    });
  });

  describe('acceptance: host layout without hiding defaults', () => {
    it('renders a host header action and inline row buttons instead of the menu', async () => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      renderWithProviders(
        <UserPasskeyManagement.Root>
          <UserPasskeyManagement.Header>
            <UserPasskeyManagement.HeaderContent>
              <UserPasskeyManagement.Title />
              <UserPasskeyManagement.Description />
            </UserPasskeyManagement.HeaderContent>
            <UserPasskeyManagement.HeaderActions>
              <UserPasskeyManagement.AddAction
                render={(props, state) => (
                  <button {...props} className="brand-primary">
                    {state.pending ? 'Working…' : '+ Add passkey'}
                  </button>
                )}
              />
            </UserPasskeyManagement.HeaderActions>
          </UserPasskeyManagement.Header>
          <UserPasskeyManagement.Section>
            <UserPasskeyManagement.SectionHeader>
              <UserPasskeyManagement.SectionTitle />
              <UserPasskeyManagement.EmptyState />
            </UserPasskeyManagement.SectionHeader>
            <UserPasskeyManagement.List>
              {(passkey) => (
                <UserPasskeyManagement.Item>
                  <UserPasskeyManagement.ItemIcon />
                  <UserPasskeyManagement.ItemDetails />
                  <button onClick={() => onRename(passkey.id)}>Rename</button>
                  <UserPasskeyManagement.RevokeAction
                    render={<button className="brand-danger">Remove</button>}
                  />
                </UserPasskeyManagement.Item>
              )}
            </UserPasskeyManagement.List>
          </UserPasskeyManagement.Section>
        </UserPasskeyManagement.Root>,
      );

      const banner = await screen.findByRole('banner');
      expect(within(banner).getByRole('button', { name: 'add_passkey' })).toHaveTextContent(
        '+ Add passkey',
      );
      expect(await screen.findAllByRole('button', { name: 'Rename' })).toHaveLength(2);
      expect(screen.queryByRole('button', { name: 'passkey_name' })).not.toBeInTheDocument();

      const [removeFirst] = screen.getAllByRole('button', { name: 'Remove' });
      await user.click(removeFirst!);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'confirm' }));
      await waitFor(() => expect(api.authenticationMethods.delete).toHaveBeenCalledWith('pk-1'));
    });
  });

  describe('headless model', () => {
    it('exposes action props that honour disabled actions', async () => {
      const { result } = renderHook(
        () => useUserPasskeyModel({ addAction: { disabled: true }, revokeAction: {} }),
        { wrapper },
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.getAddActionProps()).toMatchObject({ hidden: true });
      const item = result.current.getItemProps(result.current.passkeys[0]!);
      expect(item.revokeAction).toMatchObject({ hidden: false, disabled: false, pending: false });
    });

    it('requires confirmation: revoke opens the dialog state instead of deleting', async () => {
      const { result } = renderHook(() => useUserPasskeyModel({}), { wrapper });
      await waitFor(() => expect(result.current.hasPasskeys).toBe(true));

      act(() => result.current.getItemProps(result.current.passkeys[1]!).revokeAction.onClick());
      expect(result.current.isRevokeModalOpen).toBe(true);
      expect(result.current.currentPasskey?.id).toBe('pk-2');
      expect(api.authenticationMethods.delete).not.toHaveBeenCalled();

      await act(() => result.current.handleConfirmRevoke());
      expect(api.authenticationMethods.delete).toHaveBeenCalledWith('pk-2');
    });

    it('works without options', async () => {
      const { result } = renderHook(() => useUserPasskeyModel(), { wrapper });
      await waitFor(() => expect(result.current.hasPasskeys).toBe(true));

      expect(result.current.getAddActionProps()).toMatchObject({ hidden: false });
      expect(result.current.passkeys).toHaveLength(2);
    });

    it('does not run a hidden add action', async () => {
      const { result } = renderHook(() => useUserPasskeyModel({ addAction: { disabled: true } }), {
        wrapper,
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      result.current.getAddActionProps().onClick();
      expect(api.authenticationMethods.create).not.toHaveBeenCalled();
    });
  });
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <TestProvider>{children}</TestProvider>;
}
