import type {
  DirectoryProvisioningConfig,
  IdpKnownResponse,
} from '@auth0/universal-components-core';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoProvisioningGoogleSyncPanel } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provisioning/sso-provisioning-google-sync/sso-provisioning-google-sync-panel';
import { useGoogleWorkspaceProvisioning } from '@/hooks/my-organization/use-google-workspace-provisioning';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type {
  GoogleWorkspaceProvisioningActions,
  GoogleWorkspaceProvisioningModel,
} from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

vi.mock('@/hooks/my-organization/use-google-workspace-provisioning');

const mockProvider = {
  id: 'idp_123',
  name: 'google-workspace',
  strategy: 'google-apps',
  display_name: 'Google Workspace',
  is_enabled: true,
  access_level: 'full',
  options: {},
  attributes: [],
} as IdpKnownResponse;

const mockConfig: DirectoryProvisioningConfig = {
  connection_id: 'con_123',
  connection_name: 'google-workspace',
  strategy: 'google-apps',
  synchronize_automatically: false,
  status: 'incomplete',
  created_at: '2026-11-01T00:00:00.000Z',
  updated_at: '2026-11-01T00:00:00.000Z',
  last_synchronization_at: new Date(Date.now() - 2 * 60_000).toISOString(),
  last_synchronization_status: 'completed',
};

const syncedConfig: DirectoryProvisioningConfig = {
  ...mockConfig,
  synchronize_automatically: true,
  status: 'complete',
};
const noPermissions = { permissions: createIdpPermissions([]) };
const unsyncedConfig: DirectoryProvisioningConfig = {
  ...syncedConfig,
  last_synchronization_at: undefined,
  last_synchronization_status: undefined,
};
const alertMessages = {
  customMessages: {
    google_workspace: {
      status_alert: {
        unconfirmed_authorization:
          'Unconfirmed. <link>Continue with Google</link> to re-authorize.',
        sync_failed: 'Sync failed. <link>Continue with Google</link> to re-authorize.',
      },
    },
  },
};

const createModel = (
  overrides: Partial<GoogleWorkspaceProvisioningModel> = {},
): GoogleWorkspaceProvisioningModel => {
  const state = overrides.state ?? 'not_connected';
  return {
    state,
    config: state === 'connected' ? syncedConfig : null,
    consentPhase: 'idle',
    isConsentPending: false,
    isGranted: false,
    isLoading: false,
    isStartingConsent: false,
    isUpdating: false,
    isDeleting: false,
    isEnableAutoSyncModalOpen: false,
    isDisableModalOpen: false,
    ...overrides,
  };
};

describe('SsoProvisioningGoogleSyncPanel', () => {
  let actions: GoogleWorkspaceProvisioningActions;

  const renderComponent = (
    model: GoogleWorkspaceProvisioningModel,
    props: Partial<React.ComponentProps<typeof SsoProvisioningGoogleSyncPanel>> = {},
  ) => {
    vi.mocked(useGoogleWorkspaceProvisioning).mockReturnValue({ model, actions });
    return renderWithProviders(
      <SsoProvisioningGoogleSyncPanel
        provider={mockProvider}
        permissions={ALL_IDP_PERMISSIONS}
        {...props}
      />,
    );
  };

  const getConnectButton = () =>
    screen.getByRole('button', { name: 'google_workspace.header.continue_button_label' });

  beforeEach(() => {
    vi.clearAllMocks();
    actions = {
      setProvisioningEnabled: vi.fn().mockResolvedValue(undefined),
      startConsent: vi.fn().mockResolvedValue(undefined),
      continueConsent: vi.fn(),
      closeConsent: vi.fn(),
      setAutoSync: vi.fn().mockResolvedValue(undefined),
      confirmEnableAutoSyncModal: vi.fn().mockResolvedValue(undefined),
      dismissEnableAutoSyncModal: vi.fn(),
      setDisableModalOpen: vi.fn(),
      confirmDisable: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('not connected', () => {
    it('shows the explainer and an unchecked switch without connect', () => {
      renderComponent(createModel());

      expect(screen.getByText('google_workspace.header.title')).toBeInTheDocument();
      expect(screen.getByText('google_workspace.header.description_disabled')).toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: 'google_workspace.header.enable_tooltip' }),
      ).not.toBeChecked();
      expect(
        screen.queryByRole('button', { name: 'google_workspace.header.continue_button_label' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('google_workspace.auto_sync.title')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('turns provisioning on from the switch', async () => {
      const user = userEvent.setup();
      renderComponent(createModel());

      await user.click(
        screen.getByRole('switch', { name: 'google_workspace.header.enable_tooltip' }),
      );

      expect(actions.setProvisioningEnabled).toHaveBeenCalledWith(true);
    });

    it.each([
      [
        'the access level is not full',
        { provider: { ...mockProvider, access_level: 'limited' } as IdpKnownResponse },
        'google_workspace.header.access_level_required_tooltip',
      ],
      [
        'the provider is disabled',
        { provider: { ...mockProvider, is_enabled: false } },
        'google_workspace.header.provider_disabled_tooltip',
      ],
      ['the user cannot create provisioning', noPermissions, 'error.forbidden'],
    ])('disables the switch when %s', (_, props, tooltip) => {
      renderComponent(createModel(), props);

      expect(screen.getByRole('switch', { name: tooltip })).toBeDisabled();
    });

    it('shows a spinner instead of the switch while the ticket is created', () => {
      renderComponent(createModel({ isStartingConsent: true }));

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('shows a spinner instead of the actions while loading', () => {
      renderComponent(createModel({ isLoading: true }));

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  describe('consent ticket created', () => {
    const pending = () => createModel({ isConsentPending: true });

    it('shows continue with google and a checked switch', () => {
      renderComponent(pending());

      expect(screen.getByText('google_workspace.header.description_enabled')).toBeInTheDocument();
      expect(getConnectButton()).toBeEnabled();
      expect(
        screen.getByRole('switch', { name: 'google_workspace.header.disable_tooltip' }),
      ).toBeChecked();
      expect(screen.queryByText('google_workspace.auto_sync.title')).not.toBeInTheDocument();
    });

    it('opens the ticket when continue is clicked', async () => {
      const user = userEvent.setup();
      renderComponent(pending());

      await user.click(getConnectButton());

      expect(actions.continueConsent).toHaveBeenCalled();
      expect(actions.startConsent).not.toHaveBeenCalled();
    });

    it('turns provisioning off from the switch', async () => {
      const user = userEvent.setup();
      renderComponent(pending());

      await user.click(
        screen.getByRole('switch', { name: 'google_workspace.header.disable_tooltip' }),
      );

      expect(actions.setProvisioningEnabled).toHaveBeenCalledWith(false);
    });

    it('disables continue with a tooltip when consent cannot be started', async () => {
      const user = userEvent.setup();
      renderComponent(pending(), {
        provider: { ...mockProvider, access_level: 'limited' } as IdpKnownResponse,
      });

      const button = getConnectButton();
      expect(button).toBeDisabled();

      await user.hover(button.parentElement!);
      await waitFor(() => {
        expect(screen.getAllByRole('tooltip', { hidden: true })[0]).toHaveTextContent(
          'google_workspace.header.access_level_required_tooltip',
        );
      });
    });

    it('hides continue in read-only mode', () => {
      renderComponent(pending(), { readOnly: true });

      expect(
        screen.queryByRole('button', { name: 'google_workspace.header.continue_button_label' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('connecting', () => {
    const waiting = () => createModel({ isConsentPending: true, consentPhase: 'waiting' });

    it('disables the auto sync switch and the re-authorize link while waiting', () => {
      renderComponent(
        createModel({ state: 'connected', config: unsyncedConfig, consentPhase: 'waiting' }),
        alertMessages,
      );

      expect(
        screen.getByRole('switch', { name: 'google_workspace.auto_sync.disable_tooltip' }),
      ).toBeDisabled();
      expect(
        within(screen.getByRole('alert')).queryByRole('button', { name: /Continue with Google/ }),
      ).not.toBeInTheDocument();
    });

    it('shows the error overlay and hides continue', () => {
      renderComponent(waiting());

      const overlay = screen.getByRole('status');
      expect(within(overlay).getByText('google_workspace.error.title')).toBeInTheDocument();
      expect(
        within(overlay).getByRole('button', { name: 'google_workspace.error.retry_button_label' }),
      ).toBeEnabled();
      expect(
        screen.queryByRole('button', { name: 'google_workspace.header.continue_button_label' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: 'google_workspace.header.disable_tooltip' }),
      ).toBeDisabled();
    });

    it('retries the consent flow', async () => {
      const user = userEvent.setup();
      renderComponent(waiting());

      await user.click(
        screen.getByRole('button', { name: 'google_workspace.error.retry_button_label' }),
      );

      expect(actions.closeConsent).toHaveBeenCalled();
      expect(actions.startConsent).not.toHaveBeenCalled();
    });
  });

  describe('failed', () => {
    it('shows the failed badge and a retry button', async () => {
      const user = userEvent.setup();
      renderComponent(createModel({ isConsentPending: true, consentPhase: 'failed' }));

      expect(screen.getByText('google_workspace.header.status.failed')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'google_workspace.header.continue_button_label' }),
      ).not.toBeInTheDocument();

      await user.click(
        screen.getByRole('button', { name: 'google_workspace.header.retry_button_label' }),
      );
      expect(actions.startConsent).toHaveBeenCalled();
      expect(actions.continueConsent).not.toHaveBeenCalled();
    });
  });

  describe('connected', () => {
    it('shows the summary, auto sync section and the disable switch', () => {
      renderComponent(createModel({ state: 'connected' }));

      expect(screen.getByText('google_workspace.header.description_enabled')).toBeInTheDocument();
      expect(
        screen.getByText('google_workspace.connection_info.last_synced_label', { exact: false }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: 'google_workspace.header.disable_tooltip' }),
      ).toBeChecked();
      expect(
        screen.getByRole('switch', { name: 'google_workspace.auto_sync.disable_tooltip' }),
      ).toBeChecked();
      expect(getConnectButton()).toBeInTheDocument();
      expect(screen.queryByText('google_workspace.header.status.granted')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it.each([
      ['the directory was never synchronized', unsyncedConfig],
      [
        'the last sync is older than the configuration',
        { ...syncedConfig, last_synchronization_at: '2026-10-01T00:00:00.000Z' },
      ],
    ])('shows the unconfirmed authorization warning when %s', async (_, config) => {
      const user = userEvent.setup();
      renderComponent(createModel({ state: 'connected', config }), alertMessages);

      // The test translator passes the whole message to the `link` component.
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Unconfirmed/);
      await user.click(within(alert).getByRole('button', { name: /Continue with Google/ }));

      expect(actions.startConsent).toHaveBeenCalled();
    });

    it('shows the sync failed error when the last sync failed', () => {
      renderComponent(
        createModel({
          state: 'connected',
          config: { ...syncedConfig, last_synchronization_status: 'failed' },
        }),
        alertMessages,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Sync failed/);
      expect(within(alert).getByRole('button', { name: /Continue with Google/ })).toBeEnabled();
    });

    it('renders the re-authorize text without a link when consent cannot be started', () => {
      renderComponent(createModel({ state: 'connected', config: unsyncedConfig }), {
        ...alertMessages,
        ...noPermissions,
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Continue with Google/);
      expect(within(alert).queryByRole('button')).not.toBeInTheDocument();
    });

    it('shows the granted badge after access was granted in this session', () => {
      renderComponent(createModel({ state: 'connected', isGranted: true }));

      expect(screen.getByText('google_workspace.header.status.granted')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('hides the connection info when the directory was never synchronized', () => {
      renderComponent(
        createModel({
          state: 'connected',
          config: { ...syncedConfig, last_synchronization_at: undefined },
        }),
      );

      expect(
        screen.queryByText('google_workspace.connection_info.last_synced_label', { exact: false }),
      ).not.toBeInTheDocument();
    });

    it('asks to disable provisioning when the switch is turned off', async () => {
      const user = userEvent.setup();
      renderComponent(createModel({ state: 'connected' }));

      await user.click(
        screen.getByRole('switch', { name: 'google_workspace.header.disable_tooltip' }),
      );

      expect(actions.setProvisioningEnabled).toHaveBeenCalledWith(false);
    });

    it('disables the switch without delete permission', () => {
      renderComponent(createModel({ state: 'connected' }), {
        permissions: createIdpPermissions(['update:my_org:identity_providers_provisioning']),
      });

      expect(screen.getByRole('switch', { name: 'error.forbidden' })).toBeDisabled();
    });

    it.each([
      [syncedConfig, 'google_workspace.auto_sync.disable_tooltip', false],
      [mockConfig, 'google_workspace.auto_sync.enable_tooltip', true],
    ] as const)('toggles auto sync', async (config, name, next) => {
      const user = userEvent.setup();
      renderComponent(createModel({ state: 'connected', config }));

      await user.click(screen.getByRole('switch', { name }));

      expect(actions.setAutoSync).toHaveBeenCalledWith(next);
    });

    it('disables the auto sync switch without update permission', () => {
      renderComponent(createModel({ state: 'connected' }), {
        permissions: createIdpPermissions(['delete:my_org:identity_providers_provisioning']),
      });

      expect(screen.getByRole('switch', { name: 'error.forbidden' })).toBeDisabled();
    });

    it('shows a spinner instead of the auto sync switch while it is updating', () => {
      renderComponent(createModel({ state: 'connected', isUpdating: true }));

      expect(screen.getAllByRole('switch')).toHaveLength(1);
    });

    it('shows a spinner instead of the provisioning switch while it is deleting', () => {
      renderComponent(createModel({ state: 'connected', isDeleting: true }));

      expect(
        screen.queryByRole('switch', { name: 'google_workspace.header.disable_tooltip' }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole('switch')).toHaveLength(1);
    });
  });

  describe('enable auto sync modal', () => {
    it('enables auto sync or dismisses', async () => {
      const user = userEvent.setup();
      renderComponent(
        createModel({
          state: 'connected',
          config: mockConfig,
          isGranted: true,
          isEnableAutoSyncModalOpen: true,
        }),
      );

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('title', { exact: true })).toBeInTheDocument();
      expect(dialog).toHaveTextContent('content.description_enabled');
      expect(dialog).toHaveTextContent('content.description_skip');

      await user.click(
        within(dialog).getByRole('button', { name: 'actions.confirm_button_label' }),
      );
      expect(actions.confirmEnableAutoSyncModal).toHaveBeenCalled();

      await user.click(
        within(dialog).getByRole('button', { name: 'actions.dismiss_button_label' }),
      );
      expect(actions.dismissEnableAutoSyncModal).toHaveBeenCalled();
    });

    it('is not rendered when closed', () => {
      renderComponent(createModel({ state: 'connected' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('disable modal', () => {
    it('confirms or cancels disabling', async () => {
      const user = userEvent.setup();
      renderComponent(createModel({ state: 'connected', isDisableModalOpen: true }));

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('title', { exact: true })).toBeInTheDocument();
      expect(within(dialog).getByText('content.description', { exact: true })).toBeInTheDocument();

      await user.click(
        within(dialog).getByRole('button', { name: 'actions.confirm_button_label' }),
      );
      expect(actions.confirmDisable).toHaveBeenCalled();

      await user.click(within(dialog).getByRole('button', { name: 'actions.cancel_button_label' }));
      expect(actions.setDisableModalOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('styling', () => {
    it('applies class overrides', () => {
      renderComponent(createModel({ state: 'connected' }), {
        styling: {
          variables: { common: {}, light: {}, dark: {} },
          classes: {
            'SsoProvisioningGoogleSyncPanel-root': 'custom-root',
            'SsoProvisioningGoogleSyncPanel-autoSync': 'custom-auto-sync',
          },
        },
      });

      expect(document.querySelector('.custom-root')).toBeInTheDocument();
      expect(document.querySelector('.custom-auto-sync')).toHaveTextContent(
        'google_workspace.auto_sync.title',
      );
    });
  });
});
