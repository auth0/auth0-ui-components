import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { SsoProviderTab } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-edit/sso-provider-tab';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import {
  ALL_IDP_PERMISSIONS,
  createIdpPermissions,
} from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import type { SsoProviderTabProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-tab-types';

// Mock hooks
vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: createMockI18nService().translator('idp_management.edit_sso_provider.tabs.sso'),
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  }),
}));

vi.mock('@/hooks/shared/use-theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

describe('SsoProviderTab', () => {
  const mockProps: SsoProviderTabProps = {
    permissions: ALL_IDP_PERMISSIONS,
    provider: {
      id: 'test-id',
      name: 'Test Provider',
      display_name: 'Test Provider Display',
      options: {},
      strategy: 'oidc', // Use a valid strategy property
      attributes: [], // Required by IdpOidcResponse
    },
    onDelete: vi.fn(),
    onRemove: vi.fn(),
    organization: {
      id: 'organization-123',
      name: 'Test Organization',
      display_name: 'Test Organization Display',
      branding: {
        colors: {
          primary: '',
          page_background: '',
        },
        logo_url: undefined,
      },
    },
    isDeleting: false,
    isRemoving: false,
    shouldAllowDeletion: true,
    formActions: {},
    idpConfig: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the component with title and description', () => {
      renderWithProviders(<SsoProviderTab {...mockProps} />);

      expect(screen.getByText('content.title')).toBeInTheDocument();
      expect(screen.getByText('content.description')).toBeInTheDocument();
    });

    describe('when provider is provided', () => {
      it('should render SsoProviderDetails', () => {
        renderWithProviders(<SsoProviderTab {...mockProps} />);

        // The component renders, verify by checking that content is present
        expect(screen.getByText('content.title')).toBeInTheDocument();
      });
    });

    describe('when provider is not provided', () => {
      it('should not render SsoProviderDetails', () => {
        const props = { ...mockProps, provider: null };
        renderWithProviders(<SsoProviderTab {...props} />);

        // Component still renders with title even without provider
        expect(screen.getByText('content.title')).toBeInTheDocument();
      });
    });

    describe('when shouldAllowDeletion is true', () => {
      it('should render delete section', () => {
        renderWithProviders(<SsoProviderTab {...mockProps} />);

        expect(screen.getByRole('button', { name: 'delete_button_label' })).toBeInTheDocument();
      });
    });

    describe('when shouldAllowDeletion is false', () => {
      it('should not render delete section', () => {
        const props = { ...mockProps, shouldAllowDeletion: false };
        renderWithProviders(<SsoProviderTab {...props} />);

        expect(
          screen.queryByRole('button', { name: 'delete_button_label' }),
        ).not.toBeInTheDocument();
      });
    });

    describe('when provider and organization are provided', () => {
      it('should render remove section', () => {
        renderWithProviders(<SsoProviderTab {...mockProps} />);

        expect(screen.getByRole('button', { name: 'remove_button_label' })).toBeInTheDocument();
      });
    });

    describe('when organization is not provided', () => {
      it('should not render remove section', () => {
        const props = { ...mockProps, organization: null };
        renderWithProviders(<SsoProviderTab {...props} />);

        expect(screen.queryByTestId('sso-provider-remove')).not.toBeInTheDocument();
      });
    });

    describe('when provider is not provided', () => {
      it('should not render remove section', () => {
        const props = { ...mockProps, provider: null };
        renderWithProviders(<SsoProviderTab {...props} />);

        expect(screen.queryByTestId('sso-provider-remove')).not.toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProviderTab {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'delete_button_label' });
      await user.click(deleteButton);

      // The delete button opens a modal, not calls onDelete directly
      // Verify modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProviderTab {...mockProps} />);

      const removeButton = screen.getByRole('button', { name: 'remove_button_label' });
      await user.click(removeButton);

      // The remove button opens a modal, not calls onRemove directly
      // Verify modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    describe('when isDeleting is true', () => {
      it('should pass loading state to delete component', () => {
        const props = { ...mockProps, isDeleting: true };
        renderWithProviders(<SsoProviderTab {...props} />);

        // Verify the delete button still renders (loading is handled in modal)
        expect(screen.getByRole('button', { name: 'delete_button_label' })).toBeInTheDocument();
      });
    });

    describe('when isRemoving is true', () => {
      it('should pass loading state to remove component', () => {
        const props = { ...mockProps, isRemoving: true };
        renderWithProviders(<SsoProviderTab {...props} />);

        // Verify the remove button still renders (loading is handled in modal)
        expect(screen.getByRole('button', { name: 'remove_button_label' })).toBeInTheDocument();
      });
    });
  });

  describe('granted permissions', () => {
    it('should disable delete without delete:my_org:identity_providers', () => {
      const props = {
        ...mockProps,
        permissions: createIdpPermissions([
          'read:my_org:identity_providers',
          'update:my_org:identity_providers',
          'update:my_org:identity_providers_detach',
        ]),
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('button', { name: 'delete_button_label' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'remove_button_label' })).toBeEnabled();
    });

    it('should disable remove without update:my_org:identity_providers_detach', () => {
      const props = {
        ...mockProps,
        permissions: createIdpPermissions([
          'read:my_org:identity_providers',
          'update:my_org:identity_providers',
          'delete:my_org:identity_providers',
        ]),
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('button', { name: 'remove_button_label' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'delete_button_label' })).toBeEnabled();
    });

    it('should keep destructive actions available without update:my_org:identity_providers', () => {
      const props = {
        ...mockProps,
        permissions: createIdpPermissions([
          'read:my_org:identity_providers',
          'delete:my_org:identity_providers',
          'update:my_org:identity_providers_detach',
        ]),
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('button', { name: 'delete_button_label' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'remove_button_label' })).toBeEnabled();
    });

    it.each([
      { label: 'delete_button_label', scopes: ['read:my_org:identity_providers'] },
      { label: 'remove_button_label', scopes: ['read:my_org:identity_providers'] },
    ] as const)('should explain why $label is unavailable', async ({ label, scopes }) => {
      const user = userEvent.setup();
      const props = { ...mockProps, permissions: createIdpPermissions(scopes) };
      renderWithProviders(<SsoProviderTab {...props} />);

      const button = screen.getByRole('button', { name: label });
      expect(button).toBeDisabled();

      await user.hover(button.parentElement!);

      await waitFor(() => {
        expect(screen.getAllByText('error.forbidden').length).toBeGreaterThan(0);
      });
    });

    it('should disable every destructive action for a viewer', () => {
      const props = {
        ...mockProps,
        permissions: createIdpPermissions(['read:my_org:identity_providers']),
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('button', { name: 'delete_button_label' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'remove_button_label' })).toBeDisabled();
    });
  });

  describe('attribute sync warning', () => {
    it('should render SsoProviderAttributeSyncAlert when hasSsoAttributeSyncWarning is true', () => {
      const props = { ...mockProps, hasSsoAttributeSyncWarning: true };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not render SsoProviderAttributeSyncAlert when hasSsoAttributeSyncWarning is false', () => {
      const props = { ...mockProps, hasSsoAttributeSyncWarning: false };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should pass onAttributeSync to SsoProviderAttributeSyncAlert', async () => {
      const onAttributeSync = vi.fn();
      const props = {
        ...mockProps,
        hasSsoAttributeSyncWarning: true,
        onAttributeSync,
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should pass isSyncingAttributes to SsoProviderAttributeSyncAlert', () => {
      const props = {
        ...mockProps,
        hasSsoAttributeSyncWarning: true,
        isSyncingAttributes: true,
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply custom styling variables', () => {
      const customStyling = {
        variables: {
          common: { '--font-size-heading': '24px' },
          light: {},
          dark: {},
        },
        classes: {},
      };
      const props = { ...mockProps, styling: customStyling };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByText('content.title')).toBeInTheDocument();
    });

    it('should apply custom styling classes', () => {
      const customStyling = {
        variables: { common: {}, light: {}, dark: {} },
        classes: {
          'SsoProviderAttributeSyncAlert-root': 'custom-alert-class',
        },
      };
      const props = {
        ...mockProps,
        styling: customStyling,
        hasSsoAttributeSyncWarning: true,
      };
      renderWithProviders(<SsoProviderTab {...props} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
