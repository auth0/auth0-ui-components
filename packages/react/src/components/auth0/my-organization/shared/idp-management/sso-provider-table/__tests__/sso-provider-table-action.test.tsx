import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoProviderTableActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-table/sso-provider-table-action';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { SsoProviderTableActionsColumnProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

// Mock hooks
vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string) => key,
  }),
}));

// Helper functions
function createMockProvider(overrides = {}) {
  return {
    id: 'provider_123',
    name: 'Test Provider',
    display_name: 'Test Provider Display',
    strategy: 'oidc' as const,
    is_enabled: true,
    options: {},
    attributes: [],
    ...overrides,
  };
}

function createMockSsoProviderTableActionsColumnProps(
  overrides: Partial<SsoProviderTableActionsColumnProps> = {},
): SsoProviderTableActionsColumnProps {
  return {
    provider: createMockProvider(),
    shouldAllowDeletion: true,
    permissions: ALL_IDP_PERMISSIONS,
    isUpdating: false,
    isUpdatingId: null,
    customMessages: {},
    edit: { disabled: false },
    onToggleEnabled: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onRemoveFromOrganization: vi.fn(),
    ...overrides,
  };
}

describe('SsoProviderTableActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render switch and dropdown menu', () => {
      const props = createMockSsoProviderTableActionsColumnProps();
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'table.actions.menu_label' })).toBeInTheDocument();
    });

    it('should render switch when updating different provider', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_provider',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should disable switch when updating current provider', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'provider_123',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeDisabled();
    });
  });

  describe('Switch Component', () => {
    it('should show checked switch when provider is enabled', () => {
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeChecked();
    });

    it('should show unchecked switch when provider is disabled', () => {
      const provider = createMockProvider({ is_enabled: false });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should show unchecked switch when is_enabled is undefined', () => {
      const provider = createMockProvider({ is_enabled: undefined });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should show unchecked switch when is_enabled is null', () => {
      const provider = createMockProvider({ is_enabled: null });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should disable switch without the permission to toggle it', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        permissions: createIdpPermissions(['read:my_org:identity_providers']),
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should disable switch when enableProviderAction.disabled is true', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        enableProviderAction: { disabled: true },
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should not disable switch when enableProviderAction.disabled is false', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        enableProviderAction: { disabled: false },
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeDisabled();
    });

    it('should not disable switch when enableProviderAction is undefined', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        enableProviderAction: undefined,
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeDisabled();
    });

    it('should not disable switch when updating a different provider', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_provider',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeDisabled();
    });

    it('should call onToggleEnabled when switch is toggled', async () => {
      const user = userEvent.setup();
      const onToggleEnabled = vi.fn();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ onToggleEnabled, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onToggleEnabled).toHaveBeenCalledTimes(1);
      expect(onToggleEnabled).toHaveBeenCalledWith(provider, false);
    });

    it('should call onToggleEnabled with true when unchecked switch is clicked', async () => {
      const user = userEvent.setup();
      const onToggleEnabled = vi.fn();
      const provider = createMockProvider({ is_enabled: false });
      const props = createMockSsoProviderTableActionsColumnProps({ onToggleEnabled, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onToggleEnabled).toHaveBeenCalledTimes(1);
      expect(onToggleEnabled).toHaveBeenCalledWith(provider, true);
    });
  });

  describe('Dropdown Menu', () => {
    it('should render edit menu item', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps();
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('table.actions.edit_button_text')).toBeInTheDocument();
    });

    it('should render delete menu item when shouldAllowDeletion is true', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ shouldAllowDeletion: true });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('table.actions.delete_button_text')).toBeInTheDocument();
    });

    it('should not render delete menu item when shouldAllowDeletion is false', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ shouldAllowDeletion: false });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.queryByText('table.actions.delete_button_text')).not.toBeInTheDocument();
    });

    it('should render remove from organization menu item', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps();
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      expect(screen.getByText('table.actions.remove_button_text')).toBeInTheDocument();
    });

    it('should call onEdit when edit menu item is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const provider = createMockProvider();
      const props = createMockSsoProviderTableActionsColumnProps({ onEdit, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const editItem = screen.getByText('table.actions.edit_button_text');
      await user.click(editItem);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(provider);
    });

    it('should call onDelete when delete menu item is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const provider = createMockProvider();
      const props = createMockSsoProviderTableActionsColumnProps({ onDelete, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const deleteItem = screen.getByText('table.actions.delete_button_text');
      await user.click(deleteItem);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(provider);
    });

    it('should call onRemoveFromOrganization when remove menu item is clicked', async () => {
      const user = userEvent.setup();
      const onRemoveFromOrganization = vi.fn();
      const provider = createMockProvider();
      const props = createMockSsoProviderTableActionsColumnProps({
        onRemoveFromOrganization,
        provider,
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const removeItem = screen.getByText('table.actions.remove_button_text');
      await user.click(removeItem);

      expect(onRemoveFromOrganization).toHaveBeenCalledTimes(1);
      expect(onRemoveFromOrganization).toHaveBeenCalledWith(provider);
    });

    it('should hide the edit menu item without update:my_org:identity_providers', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({
        permissions: createIdpPermissions(['delete:my_org:identity_providers']),
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button', { name: 'table.actions.menu_label' });
      await user.click(menuButton);

      expect(screen.queryByText('table.actions.edit_button_text')).not.toBeInTheDocument();
    });

    it('should disable edit menu item when edit.disabled is true', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ edit: { disabled: true } });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const editItem = screen.getByText('table.actions.edit_button_text');
      const menuItemParent = editItem.closest('[role="menuitem"]') || editItem.parentElement;
      expect(menuItemParent).toHaveAttribute('data-disabled');
    });

    it('should hide the delete menu item without delete:my_org:identity_providers', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({
        permissions: createIdpPermissions(['update:my_org:identity_providers']),
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button', { name: 'table.actions.menu_label' });
      await user.click(menuButton);

      expect(screen.queryByText('table.actions.delete_button_text')).not.toBeInTheDocument();
    });

    it('should hide the remove menu item without update:my_org:identity_providers_detach', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({
        permissions: createIdpPermissions(['update:my_org:identity_providers']),
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button', { name: 'table.actions.menu_label' });
      await user.click(menuButton);

      expect(screen.queryByText('table.actions.remove_button_text')).not.toBeInTheDocument();
    });

    it('should handle undefined edit prop', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ edit: undefined });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const editItem = screen.getByText('table.actions.edit_button_text');
      const menuItemParent = editItem.closest('[role="menuitem"]') || editItem.parentElement;
      expect(menuItemParent).toHaveAttribute('data-disabled');
    });
  });

  describe('Tooltip Functionality', () => {
    it('should show enabled tooltip for enabled provider on hover', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.enabled_tooltip');
      });
    });

    it('should show disabled tooltip for disabled provider on hover', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: false });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disabled_tooltip');
      });
    });

    it('should show disabled tooltip when is_enabled is undefined', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: undefined });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disabled_tooltip');
      });
    });

    it('should show disabled tooltip when is_enabled is null', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: null });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disabled_tooltip');
      });
    });

    it('should show correct tooltip based on provider state', async () => {
      // Test enabled provider tooltip
      const user = userEvent.setup();
      const enabledProvider = createMockProvider({ is_enabled: true });
      const { unmount } = renderWithProviders(
        <SsoProviderTableActionsColumn
          {...createMockSsoProviderTableActionsColumnProps({ provider: enabledProvider })}
        />,
      );

      let switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.enabled_tooltip');
      });

      unmount();

      // Test disabled provider tooltip
      const disabledProvider = createMockProvider({ is_enabled: false });
      renderWithProviders(
        <SsoProviderTableActionsColumn
          {...createMockSsoProviderTableActionsColumnProps({ provider: disabledProvider })}
        />,
      );

      switchElement = screen.getByRole('switch');
      await user.hover(switchElement);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disabled_tooltip');
      });
    });

    it('should show tooltip when hovering over span wrapper', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      const spanWrapper = switchElement.parentElement;

      expect(spanWrapper?.tagName).toBe('SPAN');

      await user.hover(spanWrapper!);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.enabled_tooltip');
      });
    });
  });

  describe('Span Wrapper Tests', () => {
    it('should wrap switch in span element', () => {
      const props = createMockSsoProviderTableActionsColumnProps();
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      const spanWrapper = switchElement.parentElement;

      expect(spanWrapper?.tagName).toBe('SPAN');
    });

    it('should not block pointer events through span wrapper', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      const spanWrapper = switchElement.parentElement;

      // Hover over span wrapper should trigger tooltip
      await user.hover(spanWrapper!);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.enabled_tooltip');
      });
    });

    it('should not block keyboard navigation through span wrapper', async () => {
      const user = userEvent.setup();
      const onToggleEnabled = vi.fn();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ onToggleEnabled, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveFocus();

      await user.keyboard(' ');
      expect(onToggleEnabled).toHaveBeenCalledTimes(1);
    });

    it('should allow tooltip trigger to work through span wrapper', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: false });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      // Focus via tab
      await user.tab();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disabled_tooltip');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      const onToggleEnabled = vi.fn();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ onToggleEnabled, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');

      // Rapidly click multiple times
      await user.click(switchElement);
      await user.click(switchElement);
      await user.click(switchElement);

      expect(onToggleEnabled).toHaveBeenCalledTimes(3);
    });

    it('should handle provider with all optional fields missing', () => {
      const provider = createMockProvider({
        name: undefined,
        display_name: undefined,
        is_enabled: undefined,
      });
      const props = createMockSsoProviderTableActionsColumnProps({ provider: provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe('Custom Messages', () => {
    it('should accept custom messages prop', () => {
      const customMessages = {
        table: {
          actions: {
            edit_button_text: 'Custom Edit',
            delete_button_text: 'Custom Delete',
          },
        },
      };
      const props = createMockSsoProviderTableActionsColumnProps({ customMessages });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });
  });

  describe('Granted permissions', () => {
    describe('when update:my_org:identity_providers is granted', () => {
      it('should label the detail entry "Edit"', async () => {
        const user = userEvent.setup();
        const props = createMockSsoProviderTableActionsColumnProps({
          permissions: createIdpPermissions(['update:my_org:identity_providers']),
        });
        renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(screen.getByText('table.actions.edit_button_text')).toBeInTheDocument();
        expect(screen.queryByText('table.actions.configure_button_text')).not.toBeInTheDocument();
      });
    });

    describe('when only domain, provisioning or SCIM mutations are granted', () => {
      it('should label the detail entry "Configure" instead', async () => {
        const user = userEvent.setup();
        const props = createMockSsoProviderTableActionsColumnProps({
          permissions: createIdpPermissions(['create:my_org:identity_providers_domains']),
        });
        renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(screen.getByText('table.actions.configure_button_text')).toBeInTheDocument();
        expect(screen.queryByText('table.actions.edit_button_text')).not.toBeInTheDocument();
      });

      it.each(['create:my_org:domains', 'update:my_org:domains', 'delete:my_org:domains'] as const)(
        'should offer Configure for an org-domain mutation such as %s',
        async (scope) => {
          const user = userEvent.setup();
          const props = createMockSsoProviderTableActionsColumnProps({
            permissions: createIdpPermissions(['read:my_org:identity_providers', scope]),
          });
          renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

          await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

          expect(screen.getByText('table.actions.configure_button_text')).toBeInTheDocument();
        },
      );
    });

    describe('when only read permissions are granted', () => {
      it('should render no menu, leaving row-click as the only path', () => {
        const props = createMockSsoProviderTableActionsColumnProps({
          permissions: createIdpPermissions(['read:my_org:identity_providers']),
        });
        renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

        expect(
          screen.queryByRole('button', { name: 'table.actions.menu_label' }),
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
        // the enable/disable toggle stays visible, just disabled
        expect(screen.getByRole('switch')).toBeDisabled();
      });
    });

    describe('when every IDP permission is granted', () => {
      it('should offer edit, delete and remove from organization', async () => {
        const user = userEvent.setup();
        const props = createMockSsoProviderTableActionsColumnProps();
        renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(screen.getByText('table.actions.edit_button_text')).toBeInTheDocument();
        expect(screen.getByText('table.actions.delete_button_text')).toBeInTheDocument();
        expect(screen.getByText('table.actions.remove_button_text')).toBeInTheDocument();
      });
    });

    describe('when update is granted without delete or detach', () => {
      it('should offer edit only, hiding both destructive actions', async () => {
        const user = userEvent.setup();
        const props = createMockSsoProviderTableActionsColumnProps({
          permissions: createIdpPermissions([
            'read:my_org:identity_providers',
            'update:my_org:identity_providers',
          ]),
        });
        renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

        await user.click(screen.getByRole('button', { name: 'table.actions.menu_label' }));

        expect(screen.getByText('table.actions.edit_button_text')).toBeInTheDocument();
        expect(screen.queryByText('table.actions.delete_button_text')).not.toBeInTheDocument();
        expect(screen.queryByText('table.actions.remove_button_text')).not.toBeInTheDocument();
      });

      it('should still allow toggling the provider', () => {
        const props = createMockSsoProviderTableActionsColumnProps({
          permissions: createIdpPermissions([
            'read:my_org:identity_providers',
            'update:my_org:identity_providers',
          ]),
        });
        renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

        expect(screen.getByRole('switch')).toBeEnabled();
      });
    });
  });

  describe('readOnly', () => {
    it('should render no row action at all, not even the toggle', () => {
      const props = createMockSsoProviderTableActionsColumnProps({ readOnly: true });
      const { container } = renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'table.actions.menu_label' }),
      ).not.toBeInTheDocument();
    });

    it('should hide actions even when every permission is granted', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        readOnly: true,
        permissions: createIdpPermissions(),
      });
      const { container } = renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(container).toBeEmptyDOMElement();
    });
  });
});
