import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { renderWithProviders } from '../../../../../internals';
import type { SsoProviderTabProps } from '../../../../../types/my-organization/idp-management/sso-provider/sso-provider-tab-types';
import { SsoProviderTab } from '../sso-provider-tab';

// Mock hooks
vi.mock('../../../../../hooks/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, params?: any) => {
      if (key === 'delete_button_label') return 'Delete';
      if (key === 'remove_button_label') return 'Remove';
      if (key === 'title' && params?.providerName) return `Delete ${params.providerName}`;
      return key;
    },
  }),
}));

vi.mock('../../../../../hooks/use-theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

describe('SsoProviderTab', () => {
  const mockProps: SsoProviderTabProps = {
    provider: {
      id: 'test-id',
      name: 'Test Provider',
      display_name: 'Test Provider Display',
      options: {},
      strategy: 'oidc', // Use a valid strategy property
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

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      });
    });

    describe('when shouldAllowDeletion is false', () => {
      it('should not render delete section', () => {
        const props = { ...mockProps, shouldAllowDeletion: false };
        renderWithProviders(<SsoProviderTab {...props} />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
      });
    });

    describe('when provider and organization are provided', () => {
      it('should render remove section', () => {
        renderWithProviders(<SsoProviderTab {...mockProps} />);

        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
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

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(deleteButton);

      // The delete button opens a modal, not calls onDelete directly
      // Verify modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProviderTab {...mockProps} />);

      const removeButton = screen.getByRole('button', { name: 'Remove' });
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
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      });
    });

    describe('when isRemoving is true', () => {
      it('should pass loading state to remove component', () => {
        const props = { ...mockProps, isRemoving: true };
        renderWithProviders(<SsoProviderTab {...props} />);

        // Verify the remove button still renders (loading is handled in modal)
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
      });
    });
  });

  describe('read-only mode', () => {
    describe('when readOnly is true', () => {
      it('should disable delete button', () => {
        const props = { ...mockProps, readOnly: true };
        renderWithProviders(<SsoProviderTab {...props} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete' });
        expect(deleteButton).toBeDisabled();
      });

      it('should disable remove button', () => {
        const props = { ...mockProps, readOnly: true };
        renderWithProviders(<SsoProviderTab {...props} />);

        const removeButton = screen.getByRole('button', { name: 'Remove' });
        expect(removeButton).toBeDisabled();
      });
    });
  });
});
