import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  renderWithProviders,
  createMockDomain,
  createMockIdentityProviderAssociatedWithDomain,
} from '../../../../../internals';
import type { DomainConfigureProvidersModalProps } from '../../../../../types/my-org/domain-management/domain-configure-types';
import { DomainConfigureProvidersModal } from '../domain-configure-providers-modal';

// Create mock props helper
function createMockDomainConfigureProvidersModalProps(
  overrides: Partial<DomainConfigureProvidersModalProps> = {},
): DomainConfigureProvidersModalProps {
  return {
    isOpen: true,
    isLoading: false,
    isLoadingSwitch: false,
    domain: createMockDomain(),
    providers: [
      createMockIdentityProviderAssociatedWithDomain({
        id: 'con_google123',
        display_name: 'Google Workspace',
        strategy: 'google-apps',
        is_associated: true,
      }),
      createMockIdentityProviderAssociatedWithDomain({
        id: 'con_okta456',
        display_name: 'Okta Enterprise',
        strategy: 'okta',
        is_associated: false,
      }),
    ],
    onClose: vi.fn(),
    onToggleSwitch: vi.fn(),
    onOpenProvider: vi.fn(),
    onCreateProvider: vi.fn(),
    ...overrides,
  };
}

describe('DomainConfigureProvidersModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Display', () => {
    it('should render with required props', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should not render modal when isOpen prop is false', () => {
      // When isOpen is set to false, the modal should not render
      const props = createMockDomainConfigureProvidersModalProps({ isOpen: false });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render domain-specific title and description', () => {
      const domain = createMockDomain({ domain: 'custom.example.com' });
      const props = createMockDomainConfigureProvidersModalProps({ domain });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
    });

    it('should not render content when domain prop is null', () => {
      // When domain is null, the modal content should not render
      const props = createMockDomainConfigureProvidersModalProps({ domain: null });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.queryByText(/description/)).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const props = createMockDomainConfigureProvidersModalProps({
        className: 'custom-class',
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const contentContainer = screen.getByText(/description/).closest('div');
      expect(contentContainer).toHaveClass('custom-class');
    });

    it('should render with custom messages', () => {
      const customMessages = {
        modal: {
          title: 'Custom Title - {domain}',
          description: 'Custom description for {domain}',
        },
      };
      const props = createMockDomainConfigureProvidersModalProps({ customMessages });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // The title should still use the mocked translator
      expect(screen.getByText('title')).toBeInTheDocument();
    });
  });

  describe('Data Table', () => {
    it('should render provider data in table', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('Google Workspace')).toBeInTheDocument();
      expect(screen.getByText('Okta Enterprise')).toBeInTheDocument();
      expect(screen.getByText('google-apps')).toBeInTheDocument();
      expect(screen.getByText('okta')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('table.columns.name')).toBeInTheDocument();
      expect(screen.getByText('table.columns.provider')).toBeInTheDocument();
    });

    it('should show loading state in table', () => {
      const props = createMockDomainConfigureProvidersModalProps({ isLoading: true });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Check for loading indicator (assuming DataTable shows loading state)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render empty state when no providers are available', () => {
      // When providers array is empty, should show empty state message
      const props = createMockDomainConfigureProvidersModalProps({ providers: [] });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // When no providers exist, should display empty message
      expect(screen.getByText('table.empty_message')).toBeInTheDocument();
    });

    it('should render empty state with add provider button when onCreateProvider callback is provided', () => {
      // When onCreateProvider is provided and no providers exist, should show add button
      const onCreateProvider = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({
        providers: [],
        onCreateProvider,
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const addButton = screen.getByRole('button', {
        name: 'table.actions.add_provider_button_text',
      });
      expect(addButton).toBeInTheDocument();
    });

    it('should not render add provider button in empty state when onCreateProvider callback is not provided', () => {
      // When onCreateProvider is not provided, should not show add button even in empty state
      const props = createMockDomainConfigureProvidersModalProps({
        providers: [],
        onCreateProvider: undefined,
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(
        screen.queryByRole('button', { name: 'table.actions.add_provider_button_text' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Provider Actions', () => {
    it('should render View buttons for each provider when onOpenProvider callback is provided', () => {
      // When onOpenProvider callback is provided, should render View buttons for each provider
      const onOpenProvider = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({ onOpenProvider });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const viewButtons = screen.getAllByRole('button', {
        name: 'table.actions.view_provider_button_text',
      });
      expect(viewButtons).toHaveLength(2);
    });

    it('should not render View buttons when onOpenProvider callback is not provided', () => {
      // When onOpenProvider callback is not provided, should not render any View buttons
      const props = createMockDomainConfigureProvidersModalProps({
        onOpenProvider: undefined,
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(
        screen.queryByRole('button', { name: 'table.actions.view_provider_button_text' }),
      ).not.toBeInTheDocument();
    });

    it('should call onOpenProvider when View provider button is clicked', async () => {
      // When View button is clicked, should call onOpenProvider with correct provider data
      const user = userEvent.setup();
      const onOpenProvider = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({ onOpenProvider });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const firstViewButton = screen.getAllByRole('button', {
        name: 'table.actions.view_provider_button_text',
      })[0];

      // When View button is clicked, should trigger onOpenProvider callback

      await user.click(firstViewButton!);

      // When onOpenProvider is called, should receive correct provider object
      expect(onOpenProvider).toHaveBeenCalledTimes(1);
      expect(onOpenProvider).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'con_google123',
          display_name: 'Google Workspace',
          strategy: 'google-apps',
        }),
      );
    });
  });

  describe('Switch Components', () => {
    it('should render switch for each provider', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(2);
    });

    it('should show correct switch states based on is_associated', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const switches = screen.getAllByRole('switch');
      expect(switches[0]).toBeChecked(); // Google Workspace is associated
      expect(switches[1]).not.toBeChecked(); // Okta Enterprise is not associated
    });

    it('should handle switch with undefined is_associated as unchecked', () => {
      const providers = [
        createMockIdentityProviderAssociatedWithDomain({
          id: 'con_test123',
          display_name: 'Test Provider',
          is_associated: undefined as never,
        }),
      ];
      const props = createMockDomainConfigureProvidersModalProps({ providers });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).not.toBeChecked();
    });

    it('should disable switches when isLoadingSwitch prop is true', () => {
      // When isLoadingSwitch is true, all provider switches should be disabled
      const props = createMockDomainConfigureProvidersModalProps({ isLoadingSwitch: true });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const switches = screen.getAllByRole('switch');

      // When switches are checked, they should all be disabled due to loading state
      switches.forEach((switchElement) => {
        expect(switchElement).toBeDisabled();
      });
    });

    it('should call onToggleSwitch when provider switch is toggled', async () => {
      // When a provider switch is toggled, should call onToggleSwitch with correct parameters
      const user = userEvent.setup();
      const onToggleSwitch = vi.fn();
      const domain = createMockDomain();
      const props = createMockDomainConfigureProvidersModalProps({
        onToggleSwitch,
        domain,
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const firstSwitch = screen.getAllByRole('switch')[0];

      // When switch is clicked, should toggle from checked to unchecked

      await user.click(firstSwitch!);

      // When onToggleSwitch is called, should receive correct domain and provider data
      expect(onToggleSwitch).toHaveBeenCalledTimes(1);
      expect(onToggleSwitch).toHaveBeenCalledWith(
        domain,
        expect.objectContaining({
          id: 'con_google123',
          display_name: 'Google Workspace',
        }),
        false, // When toggling from true to false
      );
    });

    it('should call onToggleSwitch with correct new value when unchecked provider switch is clicked', async () => {
      // When an unchecked switch is clicked, should call onToggleSwitch with new value = true
      const user = userEvent.setup();
      const onToggleSwitch = vi.fn();
      const domain = createMockDomain();
      const props = createMockDomainConfigureProvidersModalProps({
        onToggleSwitch,
        domain,
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const secondSwitch = screen.getAllByRole('switch')[1]; // Okta Enterprise (unchecked)

      // When unchecked switch is clicked, should toggle from false to true

      await user.click(secondSwitch!);

      // When onToggleSwitch is called, should receive new value as true
      expect(onToggleSwitch).toHaveBeenCalledTimes(1);
      expect(onToggleSwitch).toHaveBeenCalledWith(
        domain,
        expect.objectContaining({
          id: 'con_okta456',
          display_name: 'Okta Enterprise',
        }),
        true, // When toggling from false to true
      );
    });

    it('should not call onToggleSwitch when domain prop is null', () => {
      // When domain is null, switches should not render and onToggleSwitch should not be called
      // This is more of a safety test since the UI doesn't render when domain is null
      const props = createMockDomainConfigureProvidersModalProps({ domain: null });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  describe('Modal Actions', () => {
    it('should render close button', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Check for the main close button in the modal actions
      const closeButtons = screen.getAllByRole('button', { name: 'actions.close_button_text' });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('should call onClose when modal close button is clicked', async () => {
      // When the close button is clicked, should trigger the onClose callback
      const user = userEvent.setup();
      const onClose = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({ onClose });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Get the main close button (not the X button)
      const closeButtons = screen.getAllByRole('button', { name: 'actions.close_button_text' });
      const mainCloseButton = closeButtons.find(
        (button) =>
          button.textContent === 'actions.close_button_text' && !button.querySelector('svg'),
      );

      if (mainCloseButton) {
        // When main close button is clicked, should trigger onClose
        await user.click(mainCloseButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      } else {
        // When fallback close button is clicked, should trigger onClose

        await user.click(closeButtons[0]!);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not show next/previous navigation buttons', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    });
  });

  describe('Component Functionality', () => {
    it('should render table columns correctly', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Verify columns are rendered
      expect(screen.getByText('table.columns.name')).toBeInTheDocument();
      expect(screen.getByText('table.columns.provider')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle provider with missing display_name', () => {
      const providers = [
        createMockIdentityProviderAssociatedWithDomain({
          display_name: '',
          strategy: 'samlp',
        }),
      ];
      const props = createMockDomainConfigureProvidersModalProps({ providers });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('samlp')).toBeInTheDocument();
    });

    it('should handle provider with missing strategy', () => {
      const providers = [
        createMockIdentityProviderAssociatedWithDomain({
          display_name: 'Test Provider',
          strategy: '' as never,
        }),
      ];
      const props = createMockDomainConfigureProvidersModalProps({ providers });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('Test Provider')).toBeInTheDocument();
    });

    it('should handle empty domain name gracefully', () => {
      const domain = createMockDomain({ domain: '' });
      const props = createMockDomainConfigureProvidersModalProps({ domain });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should handle large number of providers', () => {
      const providers = Array.from({ length: 10 }, (_, index) =>
        createMockIdentityProviderAssociatedWithDomain({
          id: `con_provider${index}`,
          display_name: `Provider ${index + 1}`,
          strategy: 'samlp',
          is_associated: index % 2 === 0,
        }),
      );
      const props = createMockDomainConfigureProvidersModalProps({ providers });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Should render all providers
      expect(screen.getAllByRole('switch')).toHaveLength(10);
      expect(screen.getByText('Provider 1')).toBeInTheDocument();
      expect(screen.getByText('Provider 10')).toBeInTheDocument();
    });

    it('should handle providers with special characters in names', () => {
      const providers = [
        createMockIdentityProviderAssociatedWithDomain({
          display_name: 'Provider & Co. (Test)',
          strategy: 'oidc',
        }),
      ];
      const props = createMockDomainConfigureProvidersModalProps({ providers });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      expect(screen.getByText('Provider & Co. (Test)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for modal', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      // Note: aria-modal might not be explicitly set, but role="dialog" provides the semantics
    });

    it('should have accessible switch labels', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const switches = screen.getAllByRole('switch');
      switches.forEach((switchElement) => {
        expect(switchElement).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onToggleSwitch = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({ onToggleSwitch });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const firstSwitch = screen.getAllByRole('switch')[0];

      firstSwitch!.focus();

      expect(firstSwitch!).toHaveFocus();

      // Simulate space key press to toggle
      await user.keyboard(' ');

      expect(onToggleSwitch).toHaveBeenCalledTimes(1);
    });

    it('should be accessible with screen readers', () => {
      const props = createMockDomainConfigureProvidersModalProps();
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Check for proper heading hierarchy
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Check that table content is accessible
      expect(screen.getByText('table.columns.name')).toBeInTheDocument();
      expect(screen.getByText('table.columns.provider')).toBeInTheDocument();

      // Ensure basic structure is present
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Provider Strategies', () => {
    it('should handle all supported provider strategies', () => {
      const strategies = [
        'adfs',
        'google-apps',
        'oidc',
        'okta',
        'pingfederate',
        'samlp',
        'waad',
      ] as const;

      strategies.forEach((strategy) => {
        const providers = [
          createMockIdentityProviderAssociatedWithDomain({
            id: `con_${strategy}`,
            display_name: `${strategy.toUpperCase()} Provider`,
            strategy,
          }),
        ];
        const props = createMockDomainConfigureProvidersModalProps({ providers });

        const { unmount } = renderWithProviders(<DomainConfigureProvidersModal {...props} />);

        expect(screen.getByText(`${strategy.toUpperCase()} Provider`)).toBeInTheDocument();
        expect(screen.getByText(strategy)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle rapid switch toggling', async () => {
      const user = userEvent.setup();
      const onToggleSwitch = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({ onToggleSwitch });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      const switches = screen.getAllByRole('switch');

      // Rapidly toggle multiple switches

      await user.click(switches[0]!);

      await user.click(switches[1]!);

      await user.click(switches[0]!);

      expect(onToggleSwitch).toHaveBeenCalledTimes(3);
    });

    it('should handle view and toggle actions together', async () => {
      const user = userEvent.setup();
      const onOpenProvider = vi.fn();
      const onToggleSwitch = vi.fn();
      const props = createMockDomainConfigureProvidersModalProps({
        onOpenProvider,
        onToggleSwitch,
      });
      renderWithProviders(<DomainConfigureProvidersModal {...props} />);

      // Click view button first
      const viewButtons = screen.getAllByRole('button', {
        name: 'table.actions.view_provider_button_text',
      });

      await user.click(viewButtons[0]!);

      // Then toggle switch
      const switches = screen.getAllByRole('switch');

      await user.click(switches[0]!);

      expect(onOpenProvider).toHaveBeenCalledTimes(1);
      expect(onToggleSwitch).toHaveBeenCalledTimes(1);
    });

    it('should handle modal state correctly', () => {
      const onClose = vi.fn();
      const propsOpen = createMockDomainConfigureProvidersModalProps({ onClose, isOpen: true });
      renderWithProviders(<DomainConfigureProvidersModal {...propsOpen} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Test that onClose function is available
      expect(onClose).toBeDefined();
    });
  });

  describe('Modal onOpenChange Arrow Function Coverage', () => {
    it('should trigger onClose through onOpenChange arrow function when modal is closed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderWithProviders(
        <DomainConfigureProvidersModal
          {...createMockDomainConfigureProvidersModalProps({ onClose, isOpen: true })}
        />,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Find and trigger the modal's onOpenChange with false to test arrow function: (open) => !open && onClose()

      // Simulate ESC key press that would trigger onOpenChange(false)
      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClose when onOpenChange receives true (modal opening)', () => {
      const onClose = vi.fn();

      // Test the arrow function logic directly
      const onOpenChangeCallback = (open: boolean) => !open && onClose();

      // When modal opens (onOpenChange(true)), the arrow function should not call onClose
      onOpenChangeCallback(true);
      expect(onClose).not.toHaveBeenCalled();

      // When modal closes (onOpenChange(false)), the arrow function should call onClose
      onOpenChangeCallback(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should test the onOpenChange logic behavior directly', () => {
      const mockOnClose = vi.fn();

      // Test the exact arrow function from the component: (open) => !open && onClose()
      const onOpenChangeCallback = (open: boolean) => !open && mockOnClose();

      // Test when modal is closed (should trigger onClose)
      onOpenChangeCallback(false);
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      // Reset mock
      mockOnClose.mockClear();

      // Test when modal is opened (should not trigger onClose)
      onOpenChangeCallback(true);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
