import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  UserPasskeyManagement,
  UserPasskeyManagementView,
} from '@/components/auth0/my-account/user-passkey-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockPasskey,
  createMockUserPasskeyManagementViewProps,
  renderWithProviders,
} from '@/tests/utils';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

describe('UserPasskeyManagement', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders header when hideHeader is false', async () => {
    renderWithProviders(<UserPasskeyManagement hideHeader={false} />);
    await waitFor(() => expect(screen.getByText('header.title')).toBeInTheDocument());
  });

  it('does not render header when hideHeader is true', async () => {
    renderWithProviders(<UserPasskeyManagement hideHeader={true} />);
    await waitFor(() => expect(screen.queryByText('header.title')).not.toBeInTheDocument());
  });

  it('shows no_passkeys message when api returns empty list', async () => {
    mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
      .fn()
      .mockResolvedValue({ authentication_methods: [] });
    renderWithProviders(<UserPasskeyManagement />);
    await screen.findByText('no_passkeys');
  });

  it('renders passkey name and enabled badge when passkeys are returned', async () => {
    mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi.fn().mockResolvedValue({
      authentication_methods: [
        { id: 'pk-1', type: 'passkey', name: 'My Passkey', created_at: '2024-01-01' },
      ],
    });
    renderWithProviders(<UserPasskeyManagement />);
    await screen.findByText('passkey_name');
    expect(screen.getByText('enabled')).toBeInTheDocument();
  });

  it('hides add button when addAction.disabled is true', async () => {
    renderWithProviders(<UserPasskeyManagement addAction={{ disabled: true }} />);
    await screen.findByText('no_passkeys');
    expect(screen.queryByRole('button', { name: 'add_passkey' })).not.toBeInTheDocument();
  });

  it('shows add button when addAction is not disabled', async () => {
    renderWithProviders(<UserPasskeyManagement />);
    expect(await screen.findByRole('button', { name: 'add_passkey' })).toBeInTheDocument();
  });

  it('calls onFetch after passkeys are loaded', async () => {
    const onFetch = vi.fn();
    renderWithProviders(<UserPasskeyManagement onFetch={onFetch} />);
    await waitFor(() => expect(onFetch).toHaveBeenCalledTimes(1));
  });

  describe('revoke flow', () => {
    const passkeyList = {
      authentication_methods: [
        { id: 'pk-1', type: 'passkey', name: 'My Passkey', created_at: '2024-01-01' },
      ],
    };

    beforeEach(() => {
      mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
        .fn()
        .mockResolvedValue(passkeyList);
    });

    const openRevokeModal = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(await screen.findByRole('button', { name: 'passkey_name' }));
      await user.click(await screen.findByRole('menuitem', { name: /actions\.revoke/i }));
    };

    it('opens revoke modal on dropdown revoke click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserPasskeyManagement />);
      await openRevokeModal(user);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();
    });

    it('calls revokeAction.onAfter after successful revoke', async () => {
      const user = userEvent.setup();
      const onAfter = vi.fn();
      mockCoreClient.getMyAccountApiClient().authenticationMethods.delete = vi
        .fn()
        .mockResolvedValue(undefined);

      renderWithProviders(<UserPasskeyManagement revokeAction={{ onAfter }} />);
      await openRevokeModal(user);
      await user.click(await screen.findByRole('button', { name: 'confirm' }));

      await waitFor(() => expect(onAfter).toHaveBeenCalled());
    });

    it('calls onErrorAction on revoke failure', async () => {
      const user = userEvent.setup();
      const onErrorAction = vi.fn();
      mockCoreClient.getMyAccountApiClient().authenticationMethods.delete = vi
        .fn()
        .mockRejectedValue(new Error('revoke failed'));

      renderWithProviders(<UserPasskeyManagement onErrorAction={onErrorAction} />);
      await openRevokeModal(user);
      await user.click(await screen.findByRole('button', { name: 'confirm' }));

      await waitFor(() => expect(onErrorAction).toHaveBeenCalledWith(expect.any(Error), 'revoke'));
    });

    it('hides revoke dropdown when revokeAction.disabled is true', async () => {
      renderWithProviders(<UserPasskeyManagement revokeAction={{ disabled: true }} />);
      await screen.findByText('passkey_name');
      expect(screen.queryByRole('button', { name: 'passkey_name' })).not.toBeInTheDocument();
    });
  });
});

describe('UserPasskeyManagementView', () => {
  function setup(overrides: Parameters<typeof createMockUserPasskeyManagementViewProps>[0] = {}) {
    const props = createMockUserPasskeyManagementViewProps(overrides);
    renderWithProviders(<UserPasskeyManagementView {...props} />);
    return props;
  }

  it('shows no_passkeys and hides enabled badge when list is empty', () => {
    setup({ passkeys: [] });
    expect(screen.getByText('no_passkeys')).toBeInTheDocument();
    expect(screen.queryByText('enabled')).not.toBeInTheDocument();
  });

  it('renders passkey name, enabled badge, and created_at', () => {
    setup({ passkeys: [createMockPasskey({ createdAt: '2024-06-01T00:00:00.000Z' })] });
    expect(screen.getByText('My Passkey')).toBeInTheDocument();
    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.getByText(/created_at/i)).toBeInTheDocument();
  });

  it('does not render created_at when createdAt is absent', () => {
    setup({ passkeys: [createMockPasskey({ createdAt: undefined })] });
    expect(screen.queryByText(/created_at/i)).not.toBeInTheDocument();
  });

  it('renders multiple passkeys', () => {
    setup({
      passkeys: [
        createMockPasskey({ id: '1', name: 'Key A' }),
        createMockPasskey({ id: '2', name: 'Key B' }),
      ],
    });
    expect(screen.getByText('Key A')).toBeInTheDocument();
    expect(screen.getByText('Key B')).toBeInTheDocument();
  });

  describe('header', () => {
    it('renders when hideHeader is false', () => {
      setup({ hideHeader: false });
      expect(screen.getByText('header.title')).toBeInTheDocument();
    });

    it('hides when hideHeader is true', () => {
      setup({ hideHeader: true });
      expect(screen.queryByText('header.title')).not.toBeInTheDocument();
    });
  });

  describe('add passkey button', () => {
    it('shows enabled button when disableAdd is false', () => {
      setup({ disableAdd: false });
      expect(screen.getByRole('button', { name: 'add_passkey' })).toBeEnabled();
    });

    it('hides button when disableAdd is true', () => {
      setup({ disableAdd: true });
      expect(screen.queryByRole('button', { name: 'add_passkey' })).not.toBeInTheDocument();
    });

    it('disables button when isEnrolling', () => {
      setup({ disableAdd: false, isEnrolling: true });
      expect(screen.getByRole('button', { name: 'add_passkey' })).toBeDisabled();
    });

    it('calls handleAddPasskey on click', async () => {
      const user = userEvent.setup();
      const props = setup({ disableAdd: false });
      await user.click(screen.getByRole('button', { name: 'add_passkey' }));
      expect(props.handleAddPasskey).toHaveBeenCalledTimes(1);
    });
  });

  describe('revoke dropdown', () => {
    it('shows trigger when disableRevoke is false', () => {
      setup({ passkeys: [createMockPasskey()], disableRevoke: false });
      expect(screen.getByRole('button', { name: 'My Passkey' })).toBeInTheDocument();
    });

    it('hides trigger when disableRevoke is true', () => {
      setup({ passkeys: [createMockPasskey()], disableRevoke: true });
      expect(screen.queryByRole('button', { name: 'My Passkey' })).not.toBeInTheDocument();
    });

    it('calls handleRevokePasskey with passkey on click', async () => {
      const user = userEvent.setup();
      const passkey = createMockPasskey();
      const props = setup({ passkeys: [passkey], disableRevoke: false });

      await user.click(screen.getByRole('button', { name: 'My Passkey' }));
      await user.click(await screen.findByRole('menuitem', { name: /actions\.revoke/i }));

      expect(props.handleRevokePasskey).toHaveBeenCalledWith(passkey);
    });
  });

  describe('revoke modal', () => {
    it('renders when isRevokeModalOpen is true', () => {
      setup({
        passkeys: [createMockPasskey()],
        isRevokeModalOpen: true,
        currentPasskey: createMockPasskey(),
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('calls setIsRevokeModalOpen(false) when modal is closed', async () => {
      const user = userEvent.setup();
      const props = setup({
        passkeys: [createMockPasskey()],
        isRevokeModalOpen: true,
        currentPasskey: createMockPasskey(),
      });

      await user.click(await screen.findByRole('button', { name: 'cancel' }));

      expect(props.setIsRevokeModalOpen).toHaveBeenCalledWith(false);
    });
  });
});
