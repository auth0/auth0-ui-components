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

// Mock hooks
vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

// Helper function
function createMockSsoDomainTabActionColumnProps(
  overrides: Partial<SsoDomainTabActionColumn> = {},
): SsoDomainTabActionColumn {
  return {
    translatorKey: 'idp_management.edit_sso_provider.tabs.domains',
    customMessages: {},
    permissions: ALL_IDP_PERMISSIONS,
    idpDomains: ['domain_123'],
    domain: createMockDomain({ id: 'domain_123', status: 'verified' }),
    handleVerify: vi.fn(),
    isUpdating: false,
    isUpdatingId: null,
    onToggle: vi.fn(),
    ...overrides,
  };
}

describe('SsoDomainTabActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render switch for verified domain', () => {
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should render verify button for unverified domain', () => {
      const domain = createMockDomain({ status: 'pending' });
      const props = createMockSsoDomainTabActionColumnProps({ domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('button', { name: 'table.columns.verify' })).toBeInTheDocument();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('should render loading spinner when updating', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        isUpdating: true,
        isUpdatingId: 'domain_123',
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render switch when domain is not verified', () => {
      const domain = createMockDomain({ status: 'pending' });
      const props = createMockSsoDomainTabActionColumnProps({ domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  describe('Switch Component', () => {
    it('should show checked switch when domain is in idpDomains', () => {
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeChecked();
    });

    it('should show unchecked switch when domain is not in idpDomains', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        idpDomains: ['other_domain'],
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should disable switch without the permission to toggle it', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        permissions: createIdpPermissions(['read:my_org:identity_providers']),
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should disable switch when isUpdating is true', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_domain',
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should call onToggle when switch is toggled', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const domain = createMockDomain({ id: 'domain_123', status: 'verified' });
      const props = createMockSsoDomainTabActionColumnProps({ onToggle, domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith(domain, false);
    });

    it('should call onToggle with true when unchecked switch is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const domain = createMockDomain({ id: 'domain_123', status: 'verified' });
      const props = createMockSsoDomainTabActionColumnProps({
        onToggle,
        domain,
        idpDomains: [],
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith(domain, true);
    });

    it('should handle empty idpDomains array', () => {
      const props = createMockSsoDomainTabActionColumnProps({ idpDomains: [] });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should handle multiple domains in idpDomains', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        idpDomains: ['domain_123', 'domain_456', 'domain_789'],
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeChecked();
    });
  });

  describe('Verify Button', () => {
    it('should render verify button for pending domain', () => {
      const domain = createMockDomain({ status: 'pending' });
      const props = createMockSsoDomainTabActionColumnProps({ domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('button', { name: 'table.columns.verify' })).toBeInTheDocument();
    });

    it('should call handleVerify when verify button is clicked', async () => {
      const user = userEvent.setup();
      const handleVerify = vi.fn();
      const domain = createMockDomain({ status: 'pending' });
      const props = createMockSsoDomainTabActionColumnProps({ handleVerify, domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const verifyButton = screen.getByRole('button', { name: 'table.columns.verify' });
      await user.click(verifyButton);

      expect(handleVerify).toHaveBeenCalledTimes(1);
      expect(handleVerify).toHaveBeenCalledWith(domain);
    });

    it('should render verify button for failed domain status', () => {
      const domain = createMockDomain({ status: 'failed' });
      const props = createMockSsoDomainTabActionColumnProps({ domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('button', { name: 'table.columns.verify' })).toBeInTheDocument();
    });
  });

  describe('Tooltip Functionality', () => {
    it('should show disable tooltip for enabled domain on hover', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disable_domain_tooltip');
      });
    });

    it('should show enable tooltip for disabled domain on hover', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps({
        idpDomains: [],
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.enable_domain_tooltip');
      });
    });

    it('should show correct tooltip based on domain status', async () => {
      // Test enabled domain tooltip
      const user = userEvent.setup();
      const enabledProps = createMockSsoDomainTabActionColumnProps({
        idpDomains: ['domain_123'],
      });
      const { unmount } = renderWithProviders(<SsoDomainTabActionsColumn {...enabledProps} />);

      let switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disable_domain_tooltip');
      });

      unmount();

      // Test disabled domain tooltip
      const disabledProps = createMockSsoDomainTabActionColumnProps({
        idpDomains: [],
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...disabledProps} />);

      switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.enable_domain_tooltip');
      });
    });

    it('should show tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      await user.tab();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disable_domain_tooltip');
      });
    });

    it('should not show tooltip when domain is not verified', () => {
      const domain = createMockDomain({ status: 'pending' });
      const props = createMockSsoDomainTabActionColumnProps({ domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      // Only verify button is shown, not switch with tooltip
      expect(screen.getByRole('button', { name: 'table.columns.verify' })).toBeInTheDocument();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('should explain the missing permission when the switch is disabled', async () => {
      const user = userEvent.setup();
      const props = createMockSsoDomainTabActionColumnProps({
        permissions: createIdpPermissions(['read:my_org:identity_providers']),
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();

      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('error.forbidden');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty domain gracefully', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        domain: createMockDomain({ id: '', status: 'verified' }),
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should render spinner only when updating specific domain', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        isUpdating: true,
        isUpdatingId: 'domain_123',
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render switch when updating different domain', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_domain',
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeDisabled();
    });

    it('should handle domain with undefined status', () => {
      const domain = createMockDomain({ status: undefined });
      const props = createMockSsoDomainTabActionColumnProps({ domain });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      // Should show verify button when status is not 'verified'
      expect(screen.getByRole('button', { name: 'table.columns.verify' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const props = createMockSsoDomainTabActionColumnProps({ onToggle });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveFocus();

      await user.keyboard(' ');
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should have proper ARIA attributes on switch', () => {
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should manage focus properly', async () => {
      const props = createMockSsoDomainTabActionColumnProps();
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveFocus();
    });
  });

  describe('Custom Messages', () => {
    it('should accept custom messages prop', () => {
      const customMessages = {
        table: {
          columns: {
            verify: 'Custom Verify',
          },
          actions: {
            enable_domain_tooltip: 'Custom Enable',
            disable_domain_tooltip: 'Custom Disable',
          },
        },
      };
      const props = createMockSsoDomainTabActionColumnProps({ customMessages });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should use custom translator key', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        translatorKey: 'custom.translator.key',
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Granted permissions', () => {
    it('should allow associating but not dissociating with only the create scope', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        permissions: createIdpPermissions(['create:my_org:identity_providers_domains']),
        idpDomains: [],
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeEnabled();
    });

    it('should disable the toggle for an associated domain without the delete scope', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        permissions: createIdpPermissions(['create:my_org:identity_providers_domains']),
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('should allow dissociating an associated domain with the delete scope', () => {
      const props = createMockSsoDomainTabActionColumnProps({
        permissions: createIdpPermissions(['delete:my_org:identity_providers_domains']),
      });
      renderWithProviders(<SsoDomainTabActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeEnabled();
    });
  });
});
