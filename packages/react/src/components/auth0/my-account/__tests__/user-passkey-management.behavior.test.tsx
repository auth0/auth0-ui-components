/**
 * Behaviour matrix for the Tier-1 `UserPasskeyManagement`.
 *
 * Written against the pre-composability component so the compound rebuild has to
 * keep the same observable behaviour: action visibility, header, loading, error
 * gating, and the revoke dialog flow.
 */
import * as coreModule from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { UserPasskeyManagement } from '@/components/auth0/my-account/user-passkey-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as gateKeeperContextModule from '@/providers/gate-keeper-context';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';

mockToast();
const { initMockCoreClient } = mockCore();

const PASSKEY_LIST = {
  authentication_methods: [
    { id: 'pk-1', type: 'passkey', name: 'My Passkey', created_at: '2024-01-01' },
  ],
};

describe('UserPasskeyManagement behaviour', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    mockCoreClient = initMockCoreClient();
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
      .fn()
      .mockResolvedValue(PASSKEY_LIST);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.each([
    { addDisabled: false, revokeDisabled: false, hideHeader: false },
    { addDisabled: false, revokeDisabled: false, hideHeader: true },
    { addDisabled: true, revokeDisabled: false, hideHeader: false },
    { addDisabled: false, revokeDisabled: true, hideHeader: false },
    { addDisabled: true, revokeDisabled: true, hideHeader: false },
    { addDisabled: true, revokeDisabled: true, hideHeader: true },
  ])(
    'addAction.disabled=$addDisabled revokeAction.disabled=$revokeDisabled hideHeader=$hideHeader',
    ({ addDisabled, revokeDisabled, hideHeader }) => {
      beforeEach(async () => {
        renderWithProviders(
          <UserPasskeyManagement
            hideHeader={hideHeader}
            addAction={{ disabled: addDisabled }}
            revokeAction={{ disabled: revokeDisabled }}
          />,
        );
        await screen.findByText('passkey_name');
      });

      it('renders the header unless hidden', () => {
        expect(Boolean(screen.queryByText('header.title'))).toBe(!hideHeader);
      });

      it('renders the add action unless disabled', () => {
        expect(Boolean(screen.queryByRole('button', { name: 'add_passkey' }))).toBe(!addDisabled);
      });

      it('renders the revoke menu unless disabled', () => {
        expect(Boolean(screen.queryByRole('button', { name: 'passkey_name' }))).toBe(
          !revokeDisabled,
        );
      });

      it('always renders the section title and enabled badge', () => {
        expect(screen.getByText('section_title')).toBeInTheDocument();
        expect(screen.getByText('enabled')).toBeInTheDocument();
      });
    },
  );

  it('renders no passkey content or actions while loading', async () => {
    mockCoreClient.getMyAccountApiClient().authenticationMethods.list = vi
      .fn()
      .mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UserPasskeyManagement />);

    await waitFor(() =>
      expect(mockCoreClient.getMyAccountApiClient().authenticationMethods.list).toHaveBeenCalled(),
    );
    expect(screen.queryByRole('button', { name: 'add_passkey' })).not.toBeInTheDocument();
    expect(screen.queryByText('no_passkeys')).not.toBeInTheDocument();
    expect(screen.queryByText('section_title')).not.toBeInTheDocument();
  });

  it('replaces the content with the error fallback on a 5xx error', async () => {
    vi.spyOn(gateKeeperContextModule, 'useGateKeeperContext').mockReturnValue({
      error: new Error('server'),
      onRetry: vi.fn(),
    } as ReturnType<typeof gateKeeperContextModule.useGateKeeperContext>);
    vi.spyOn(coreModule, 'isMfaRequiredError').mockReturnValue(false);
    vi.spyOn(coreModule, 'getStatusCode').mockReturnValue(500);

    renderWithProviders(<UserPasskeyManagement />);

    expect(await screen.findByText('fallback.title')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'add_passkey' })).not.toBeInTheDocument();
    expect(screen.queryByText('section_title')).not.toBeInTheDocument();
  });

  it('requires confirmation before revoking and revokes the selected passkey', async () => {
    const user = userEvent.setup();
    const remove = vi.fn().mockResolvedValue(undefined);
    mockCoreClient.getMyAccountApiClient().authenticationMethods.delete = remove;
    const onBefore = vi.fn().mockReturnValue(true);

    renderWithProviders(<UserPasskeyManagement revokeAction={{ onBefore }} />);

    await user.click(await screen.findByRole('button', { name: 'passkey_name' }));
    await user.click(await screen.findByRole('menuitem', { name: /actions\.revoke/i }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
    expect(onBefore).toHaveBeenCalledWith(expect.objectContaining({ id: 'pk-1' }));

    await user.click(screen.getByRole('button', { name: 'confirm' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('pk-1'));
  });

  it('does not open the revoke dialog when onBefore returns false', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserPasskeyManagement revokeAction={{ onBefore: () => false }} />);

    await user.click(await screen.findByRole('button', { name: 'passkey_name' }));
    await user.click(await screen.findByRole('menuitem', { name: /actions\.revoke/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
