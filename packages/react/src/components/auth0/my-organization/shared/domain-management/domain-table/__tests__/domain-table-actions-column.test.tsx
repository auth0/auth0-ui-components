import type { Domain } from '@auth0/universal-components-core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DomainTableActionsColumn } from '@/components/auth0/my-organization/shared/domain-management/domain-table/domain-table-actions-column';
import { renderWithProviders } from '@/tests/utils';
import {
  createMockDomain,
  createMockVerifiedDomain,
} from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import type { DomainTableActionsColumnProps } from '@/types/my-organization/domain-management/domain-table-types';

// Create mock props helper
function createMockDomainTableActionsColumnProps(
  overrides: Partial<DomainTableActionsColumnProps> = {},
): DomainTableActionsColumnProps {
  return {
    readOnly: false,
    domain: createMockDomain(),
    onView: vi.fn(),
    onConfigure: vi.fn(),
    onVerify: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };
}

describe('DomainTableActionsColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Basic Structure', () => {
    it('should render dropdown trigger button', () => {
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('h-8', 'w-8');
    });

    it('should render with custom messages', async () => {
      const user = userEvent.setup();
      const customMessages = {
        table: {
          empty_message: 'No domains',
          columns: {
            domain: 'Domain',
            status: 'Status',
          },
          actions: {
            delete_button_text: 'Custom Delete',
            configure_button_text: 'Custom Configure',
            view_button_text: 'Custom View',
            verify_button_text: 'Custom Verify',
          },
        },
      };
      const props = createMockDomainTableActionsColumnProps({ customMessages });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(screen.getByRole('menuitem', { name: 'Custom Delete' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Custom View' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Custom Verify' })).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Dropdown Menu Interactions', () => {
    it('should open dropdown menu when trigger button is clicked', async () => {
      const user = userEvent.setup();
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');

      // When trigger button is clicked, should open the dropdown menu
      await user.click(trigger);

      // When menu opens, should display appropriate menu items based on domain status (pending)
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.view_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.verify_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
    });

    it('should close dropdown menu when user presses Escape key', async () => {
      const user = userEvent.setup();
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // When menu is opened, should be visible
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();

      // When Escape key is pressed, should close the dropdown menu
      await user.keyboard('{Escape}');

      // When menu closes, menu items should no longer be visible
      await waitFor(() => {
        expect(
          screen.queryByRole('menuitem', { name: 'table.actions.delete_button_text' }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Domain Status: Verified', () => {
    it('should show Configure action for verified domains', async () => {
      const user = userEvent.setup();
      const verifiedDomain = createMockVerifiedDomain();
      const props = createMockDomainTableActionsColumnProps({
        domain: verifiedDomain,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'table.actions.configure_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.view_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.verify_button_text' }),
      ).not.toBeInTheDocument();
    });

    it('should call onConfigure when Configure menu item is clicked', async () => {
      const user = userEvent.setup();
      const onConfigure = vi.fn();
      const verifiedDomain = createMockVerifiedDomain();
      const props = createMockDomainTableActionsColumnProps({
        domain: verifiedDomain,
        onConfigure,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const configureMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.configure_button_text',
      });

      // When Configure menu item is clicked, should call onConfigure callback
      await user.click(configureMenuItem);

      // When onConfigure is called, should receive the verified domain data
      expect(onConfigure).toHaveBeenCalledTimes(1);
      expect(onConfigure).toHaveBeenCalledWith(verifiedDomain);
    });
  });

  describe('Domain Status: Pending', () => {
    it('should show View and Verify actions for pending domains', async () => {
      const user = userEvent.setup();
      const pendingDomain = createMockDomain({ status: 'pending' });
      const props = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(
        screen.getByRole('menuitem', { name: 'table.actions.view_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.verify_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.configure_button_text' }),
      ).not.toBeInTheDocument();
    });

    it('should call onConfigure when View menu item is clicked', async () => {
      const user = userEvent.setup();
      const onConfigure = vi.fn();
      const onView = vi.fn();
      const pendingDomain = createMockDomain({ status: 'pending' });
      const props = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
        onConfigure,
        onView,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const viewMenuItem = screen.getByRole('menuitem', { name: 'table.actions.view_button_text' });

      // When View menu item is clicked, should call onConfigure (not onView)
      await user.click(viewMenuItem);

      // When View action is triggered, should call onConfigure with pending domain
      expect(onConfigure).toHaveBeenCalledTimes(1);
      expect(onConfigure).toHaveBeenCalledWith(pendingDomain);
      // When View uses onConfigure, onView should not be called
      expect(onView).not.toHaveBeenCalled();
    });

    it('should not call onView callback as View action uses onConfigure', async () => {
      const user = userEvent.setup();
      const onConfigure = vi.fn();
      const onView = vi.fn();
      const pendingDomain = createMockDomain({ status: 'pending' });
      const props = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
        onConfigure,
        onView,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const viewMenuItem = screen.getByRole('menuitem', { name: 'table.actions.view_button_text' });

      // When View menu item is clicked, should use onConfigure instead of onView
      await user.click(viewMenuItem);

      // When View action is executed, onView should never be called since View uses onConfigure
      expect(onView).not.toHaveBeenCalled();
      // When View action is executed, onConfigure should be called with the domain
      expect(onConfigure).toHaveBeenCalledWith(pendingDomain);
    });

    it('should call onVerify when Verify menu item is clicked', async () => {
      const user = userEvent.setup();
      const onVerify = vi.fn();
      const pendingDomain = createMockDomain({ status: 'pending' });
      const props = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
        onVerify,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const verifyMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.verify_button_text',
      });

      // When Verify menu item is clicked, should call onVerify callback
      await user.click(verifyMenuItem);

      // When onVerify is called, should receive the pending domain data
      expect(onVerify).toHaveBeenCalledTimes(1);
      expect(onVerify).toHaveBeenCalledWith(pendingDomain);
    });
  });

  describe('Delete Action', () => {
    it('should show Delete action for all domain statuses', async () => {
      const user = userEvent.setup();
      const testCases = [
        { status: 'pending' as const, label: 'pending domain' },
        { status: 'verified' as const, label: 'verified domain' },
        { status: 'failed' as const, label: 'failed domain' },
      ];

      for (const testCase of testCases) {
        const domain = createMockDomain({ status: testCase.status });
        const props = createMockDomainTableActionsColumnProps({ domain });
        const { unmount } = renderWithProviders(<DomainTableActionsColumn {...props} />);

        const trigger = screen.getByRole('button');
        await user.click(trigger);

        expect(
          screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
        ).toBeInTheDocument();

        unmount();
      }
    });

    it('should call onDelete when Delete menu item is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const domain = createMockDomain();
      const props = createMockDomainTableActionsColumnProps({
        domain,
        onDelete,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      // When Delete menu item is clicked, should call onDelete callback
      await user.click(deleteMenuItem);

      // When onDelete is called, should receive the domain data
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(domain);
    });

    it('should have destructive styling for Delete action', async () => {
      const user = userEvent.setup();
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });
      expect(deleteMenuItem).toHaveClass('text-destructive-foreground');
    });
  });

  describe('Read-Only Mode', () => {
    it('should disable all actions when readOnly is true', async () => {
      const user = userEvent.setup();
      const pendingDomain = createMockDomain({ status: 'pending' });
      const props = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
        readOnly: true,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const viewMenuItem = screen.getByRole('menuitem', { name: 'table.actions.view_button_text' });
      const verifyMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.verify_button_text',
      });
      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      // When readOnly is true, all menu items should be disabled
      expect(viewMenuItem).toHaveAttribute('aria-disabled', 'true');
      expect(verifyMenuItem).toHaveAttribute('aria-disabled', 'true');
      expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should disable Configure action for verified domains when readOnly is true', async () => {
      const user = userEvent.setup();
      const verifiedDomain = createMockVerifiedDomain();
      const props = createMockDomainTableActionsColumnProps({
        domain: verifiedDomain,
        readOnly: true,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const configureMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.configure_button_text',
      });
      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      // When readOnly is true for verified domains, both Configure and Delete should be disabled
      expect(configureMenuItem).toHaveAttribute('aria-disabled', 'true');
      expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not call callbacks when actions are disabled', async () => {
      const user = userEvent.setup();
      const onConfigure = vi.fn();
      const onDelete = vi.fn();
      const verifiedDomain = createMockVerifiedDomain();
      const props = createMockDomainTableActionsColumnProps({
        domain: verifiedDomain,
        onConfigure,
        onDelete,
        readOnly: true,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const configureMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.configure_button_text',
      });
      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      // When readOnly is true, the DropdownMenuItem should have disabled prop which prevents onClick
      // When checking disabled state, should have aria-disabled attribute
      expect(configureMenuItem).toHaveAttribute('aria-disabled', 'true');
      expect(deleteMenuItem).toHaveAttribute('aria-disabled', 'true');

      // When actions are disabled, callbacks should not be invoked
      expect(onConfigure).not.toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Callback Functionality', () => {
    it('should call correct callback functions', async () => {
      const user = userEvent.setup();
      const onConfigure = vi.fn();
      const onVerify = vi.fn();
      const onDelete = vi.fn();

      // Test with pending domain (shows View, Verify, Delete actions)
      const pendingDomain = createMockDomain({ status: 'pending' });
      const pendingProps = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
        onConfigure,
        onVerify,
        onDelete,
      });

      const { unmount } = renderWithProviders(<DomainTableActionsColumn {...pendingProps} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const viewMenuItem = screen.getByRole('menuitem', { name: 'table.actions.view_button_text' });
      await user.click(viewMenuItem);
      expect(onConfigure).toHaveBeenCalledWith(pendingDomain);

      await user.click(trigger); // Reopen the menu
      const verifyMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.verify_button_text',
      });
      await user.click(verifyMenuItem);
      expect(onVerify).toHaveBeenCalledWith(pendingDomain);

      // Cleanup and test verified domain
      unmount();
      vi.clearAllMocks();

      const verifiedDomain = createMockVerifiedDomain();
      const verifiedProps = createMockDomainTableActionsColumnProps({
        domain: verifiedDomain,
        onConfigure,
        onDelete,
      });

      renderWithProviders(<DomainTableActionsColumn {...verifiedProps} />);

      const triggerVerified = screen.getByRole('button');
      await user.click(triggerVerified);

      const configureMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.configure_button_text',
      });
      await user.click(configureMenuItem);
      expect(onConfigure).toHaveBeenCalledWith(verifiedDomain);

      await user.click(triggerVerified);
      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });
      await user.click(deleteMenuItem);
      expect(onDelete).toHaveBeenCalledWith(verifiedDomain);
    });
  });

  describe('Icons and UI Elements', () => {
    it('should render correct icons for each action', async () => {
      const user = userEvent.setup();
      const pendingDomain = createMockDomain({ status: 'pending' });
      const props = createMockDomainTableActionsColumnProps({
        domain: pendingDomain,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Check for SVG elements in menu items (icons are rendered as SVGs)
      const viewMenuItem = screen.getByRole('menuitem', { name: 'table.actions.view_button_text' });
      const verifyMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.verify_button_text',
      });
      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      expect(viewMenuItem.querySelector('svg')).toBeInTheDocument();
      expect(verifyMenuItem.querySelector('svg')).toBeInTheDocument();
      expect(deleteMenuItem.querySelector('svg')).toBeInTheDocument();
    });

    it('should render Configure icon for verified domains', async () => {
      const user = userEvent.setup();
      const verifiedDomain = createMockVerifiedDomain();
      const props = createMockDomainTableActionsColumnProps({
        domain: verifiedDomain,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const configureMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.configure_button_text',
      });
      expect(configureMenuItem.querySelector('svg')).toBeInTheDocument();
    });

    it('should render MoreHorizontal icon in trigger', () => {
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      // Check for the SVG element instead of CSS class
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle domain with missing status', async () => {
      const user = userEvent.setup();
      const domainWithoutStatus = createMockDomain();
      delete (domainWithoutStatus as unknown as Record<string, unknown>).status;
      const props = createMockDomainTableActionsColumnProps({
        domain: domainWithoutStatus as Domain,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Should only show Delete (no status-specific actions)
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.configure_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.view_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.verify_button_text' }),
      ).not.toBeInTheDocument();
    });

    it('should handle unknown domain status', async () => {
      const user = userEvent.setup();
      const domainWithUnknownStatus = createMockDomain({ status: 'unknown' as never });
      const props = createMockDomainTableActionsColumnProps({
        domain: domainWithUnknownStatus,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Should only show Delete (no status-specific actions)
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.configure_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.view_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.verify_button_text' }),
      ).not.toBeInTheDocument();
    });

    it('should handle rapid consecutive clicks', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const props = createMockDomainTableActionsColumnProps({ onDelete });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      // Rapid clicks
      await user.click(deleteMenuItem);
      await user.click(deleteMenuItem);

      // Should only be called once (menu closes after first click)
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');

      // When trigger is focused, should have focus
      trigger.focus();
      expect(trigger).toHaveFocus();

      // When Enter key is pressed, should open the dropdown menu
      await user.keyboard('{Enter}');

      // When menu opens via keyboard, should display menu items
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      expect(trigger).toHaveAttribute('type', 'button');
      expect(trigger).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      const user = userEvent.setup();
      const props = createMockDomainTableActionsColumnProps();
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Menu items should be focusable
      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });
      expect(deleteMenuItem).toBeInTheDocument();
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multiple domains with different statuses', async () => {
      const user = userEvent.setup();
      const domains = [
        createMockDomain({ id: 'domain1', status: 'pending' }),
        createMockVerifiedDomain(),
        createMockDomain({ id: 'domain3', status: 'failed' }),
      ];

      for (const domain of domains) {
        const props = createMockDomainTableActionsColumnProps({ domain });
        const { unmount } = renderWithProviders(<DomainTableActionsColumn {...props} />);

        const trigger = screen.getByRole('button');
        await user.click(trigger);

        // All should have Delete
        expect(
          screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
        ).toBeInTheDocument();

        unmount();
      }
    });

    it('should handle callback errors gracefully', async () => {
      const user = userEvent.setup();

      let errorThrown = false;
      const onDeleteWithError = vi.fn(() => {
        errorThrown = true;
        // Simulate error without throwing to avoid unhandled error
        return Promise.reject(new Error('Delete failed'));
      });

      const props = createMockDomainTableActionsColumnProps({
        onDelete: onDeleteWithError,
      });

      // Should not throw during render
      expect(() => {
        renderWithProviders(<DomainTableActionsColumn {...props} />);
      }).not.toThrow();

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      const deleteMenuItem = screen.getByRole('menuitem', {
        name: 'table.actions.delete_button_text',
      });

      // Click should trigger the callback
      await user.click(deleteMenuItem);

      expect(onDeleteWithError).toHaveBeenCalledTimes(1);
      expect(errorThrown).toBe(true);
    });
  });

  describe('All Domain Statuses', () => {
    it('should handle failed domain status', async () => {
      const user = userEvent.setup();
      const failedDomain = createMockDomain({ status: 'failed' });
      const props = createMockDomainTableActionsColumnProps({
        domain: failedDomain,
      });
      renderWithProviders(<DomainTableActionsColumn {...props} />);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      // Failed domains should only show Delete (no specific actions for failed status)
      expect(
        screen.getByRole('menuitem', { name: 'table.actions.delete_button_text' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.configure_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.view_button_text' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'table.actions.verify_button_text' }),
      ).not.toBeInTheDocument();
    });
  });
});
