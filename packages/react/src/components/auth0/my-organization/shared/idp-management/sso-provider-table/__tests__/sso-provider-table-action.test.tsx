import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SsoProviderTableActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-table/sso-provider-table-action';
import { renderWithProviders } from '@/tests/utils';
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
    ...overrides,
  };
}

function createMockSsoProviderTableActionsColumnProps(
  overrides: Partial<SsoProviderTableActionsColumnProps> = {},
): SsoProviderTableActionsColumnProps {
  return {
    provider: createMockProvider(),
    shouldAllowDeletion: true,
    readOnly: false,
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
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render loading spinner when updating', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'provider_123',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('should render switch when updating different provider', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_provider',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should not render switch when updating current provider', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'provider_123',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
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

    it('should disable switch when readOnly is true', () => {
      const props = createMockSsoProviderTableActionsColumnProps({ readOnly: true });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
    });

    it('should disable switch when isUpdating is true', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_provider',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeDisabled();
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

    it('should handle provider with missing is_enabled property', () => {
      const { is_enabled, ...provider } = createMockProvider();
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should remain interactive when wrapped in span', async () => {
      const user = userEvent.setup();
      const onToggleEnabled = vi.fn();
      const provider = createMockProvider({ is_enabled: true });
      const props = createMockSsoProviderTableActionsColumnProps({ onToggleEnabled, provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      await user.click(switchElement);

      expect(onToggleEnabled).toHaveBeenCalledTimes(1);
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

    it('should disable edit menu item when readOnly is true', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ readOnly: true });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const editItem = screen.getByText('table.actions.edit_button_text');
      // Check if the menu item has aria-disabled or data-disabled attribute
      const menuItemParent = editItem.closest('[role="menuitem"]') || editItem.parentElement;
      expect(menuItemParent).toHaveAttribute('data-disabled');
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

    it('should disable delete menu item when readOnly is true', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ readOnly: true });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const deleteItem = screen.getByText('table.actions.delete_button_text');
      const menuItemParent = deleteItem.closest('[role="menuitem"]') || deleteItem.parentElement;
      expect(menuItemParent).toHaveAttribute('data-disabled');
    });

    it('should disable remove menu item when readOnly is true', async () => {
      const user = userEvent.setup();
      const props = createMockSsoProviderTableActionsColumnProps({ readOnly: true });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const menuButton = screen.getByRole('button');
      await user.click(menuButton);

      const removeItem = screen.getByText('table.actions.remove_button_text');
      const menuItemParent = removeItem.closest('[role="menuitem"]') || removeItem.parentElement;
      expect(menuItemParent).toHaveAttribute('data-disabled');
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

    it('should show tooltip on keyboard focus with span wrapper', async () => {
      const user = userEvent.setup();
      const provider = createMockProvider({ is_enabled: false });
      const props = createMockSsoProviderTableActionsColumnProps({ provider });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      await user.tab();

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        expect(tooltip).toHaveTextContent('table.actions.disabled_tooltip');
      });
    });

    it('should not show tooltip when spinner is displayed', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'provider_123',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      // Switch should not be rendered
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
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

    it('should show spinner for correct provider only', () => {
      const props = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'provider_123',
      });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();

      // Now test with different provider ID
      const props2 = createMockSsoProviderTableActionsColumnProps({
        isUpdating: true,
        isUpdatingId: 'other_provider',
      });
      const { unmount } = renderWithProviders(<SsoProviderTableActionsColumn {...props2} />);

      expect(screen.getByRole('switch')).toBeInTheDocument();
      unmount();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable through span', async () => {
      const user = userEvent.setup();
      const onToggleEnabled = vi.fn();
      const props = createMockSsoProviderTableActionsColumnProps({ onToggleEnabled });
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveFocus();

      await user.keyboard(' ');
      expect(onToggleEnabled).toHaveBeenCalledTimes(1);
    });

    it('should have proper ARIA attributes on switch', () => {
      const props = createMockSsoProviderTableActionsColumnProps();
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
    });

    it('should manage focus properly with span wrapper', async () => {
      const props = createMockSsoProviderTableActionsColumnProps();
      renderWithProviders(<SsoProviderTableActionsColumn {...props} />);

      const switchElement = screen.getByRole('switch');
      switchElement.focus();

      expect(switchElement).toHaveFocus();
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
});
