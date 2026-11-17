import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoDomainTabActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-domain-tab-action-column';
import { createMockDomain } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { SsoDomainTabActionColumn } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

function createMockSsoDomainTabActionColumnProps(
  overrides: Partial<SsoDomainTabActionColumn> = {},
): SsoDomainTabActionColumn {
  return {
    translatorKey: 'idp_management.edit_sso_provider.tabs.domains',
    customMessages: {},
    permissions: ALL_IDP_PERMISSIONS,
    domain: createMockDomain({ id: 'domain_123', status: 'verified' }),
    idpName: 'Pepe the King Prawn',
    isUpdating: false,
    isUpdatingId: null,
    onRemove: vi.fn(),
    ...overrides,
  };
}

const getRemoveButton = () =>
  screen.getByRole('button', { name: 'table.actions.remove_domain_aria_label' });

describe('SsoDomainTabActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render a remove button for the domain', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn {...createMockSsoDomainTabActionColumnProps()} />,
      );

      expect(getRemoveButton()).toBeInTheDocument();
    });

    it('should not render a switch or a verify button', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn {...createMockSsoDomainTabActionColumnProps()} />,
      );

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'table.columns.verify' }),
      ).not.toBeInTheDocument();
    });

    it('should render nothing when read only', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({ readOnly: true })}
        />,
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Remove', () => {
    it('should call onRemove with the domain when clicked', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      await user.click(getRemoveButton());

      expect(props.onRemove).toHaveBeenCalledTimes(1);
      expect(props.onRemove).toHaveBeenCalledWith(props.domain);
    });

    it('should be disabled while another update is in progress', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({ isUpdating: true, isUpdatingId: 'other' })}
        />,
      );

      expect(getRemoveButton()).toBeDisabled();
    });

    it('should show a spinner instead of the button while this domain is updating', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({
            isUpdating: true,
            isUpdatingId: 'domain_123',
          })}
        />,
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should be disabled without the dissociate permission', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({
            permissions: createIdpPermissions(['create:my_org:identity_providers_domains']),
          })}
        />,
      );

      expect(getRemoveButton()).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be enabled with only the dissociate permission', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({
            permissions: createIdpPermissions(['delete:my_org:identity_providers_domains']),
          })}
        />,
      );

      expect(getRemoveButton()).toBeEnabled();
    });
  });

  describe('Tooltip', () => {
    it('should explain that the domain is disassociated from the provider on hover', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <SsoDomainTabActionsColumn {...createMockSsoDomainTabActionColumnProps()} />,
      );

      await user.hover(getRemoveButton());

      await waitFor(() => {
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
          'table.actions.remove_domain_tooltip',
        );
      });
    });

    it('should explain the missing permission on hover', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({
            permissions: createIdpPermissions(['create:my_org:identity_providers_domains']),
          })}
        />,
      );

      await user.hover(getRemoveButton().closest('span')!);

      await waitFor(() => {
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('error.forbidden');
      });
    });
  });

  describe('Accessibility', () => {
    it('should be reachable and activated with the keyboard', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      await user.tab();
      expect(getRemoveButton()).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(props.onRemove).toHaveBeenCalledWith(props.domain);
    });
  });
  describe('Why Remove is disabled', () => {
    const reasonFor = () =>
      document.getElementById(getRemoveButton().getAttribute('aria-describedby')!);

    it('should keep the last verified domain of an enabled provider', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({ lockLastDomain: true })}
        />,
      );

      expect(getRemoveButton()).toHaveAttribute('aria-disabled', 'true');
      expect(reasonFor()).toHaveTextContent('table.actions.last_verified_domain_tooltip');

      await user.hover(getRemoveButton());
      await waitFor(() => {
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
          'table.actions.last_verified_domain_tooltip',
        );
      });
    });

    it('should be disabled below full access and say why', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({ canManageProviderDomains: false })}
        />,
      );

      expect(getRemoveButton()).toHaveAttribute('aria-disabled', 'true');
      expect(reasonFor()).toHaveTextContent('table.actions.provider_access_restricted_tooltip');
    });

    it('should report a missing permission before the access level or the lock', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({
            permissions: createIdpPermissions(['create:my_org:identity_providers_domains']),
            canManageProviderDomains: false,
            lockLastDomain: true,
          })}
        />,
      );

      expect(reasonFor()).toHaveTextContent('error.forbidden');
    });

    it('should report the access level before the lock', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({
            canManageProviderDomains: false,
            lockLastDomain: true,
          })}
        />,
      );

      expect(reasonFor()).toHaveTextContent('table.actions.provider_access_restricted_tooltip');
    });

    it('should not call onRemove while blocked, even when activated', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps({ lockLastDomain: true });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      await user.click(getRemoveButton());
      getRemoveButton().focus();
      await user.keyboard('{Enter}');

      expect(props.onRemove).not.toHaveBeenCalled();
    });

    it('should have no description when it can be used', () => {
      renderWithProviders(
        <SsoDomainTabActionsColumn {...createMockSsoDomainTabActionColumnProps()} />,
      );

      expect(getRemoveButton()).toBeEnabled();
      expect(getRemoveButton()).not.toHaveAttribute('aria-describedby');
      expect(getRemoveButton().parentElement).not.toHaveAttribute('tabindex');
    });

    it('should let keyboard users reach the reason', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <SsoDomainTabActionsColumn
          {...createMockSsoDomainTabActionColumnProps({ lockLastDomain: true })}
        />,
      );

      await user.tab();

      expect(getRemoveButton()).toHaveFocus();
      expect(getRemoveButton()).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
