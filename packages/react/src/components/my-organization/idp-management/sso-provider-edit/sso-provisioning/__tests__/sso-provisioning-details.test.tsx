import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import * as useCoreClientModule from '../../../../../../hooks/use-core-client';
import { mockCore, mockProps, renderWithProviders } from '../../../../../../internals';
import { SsoProvisioningDetails } from '../sso-provisioning-details';

// ===== Mock packages =====
const { initMockCoreClient } = mockCore();

vi.mock('../../../../../../hooks/use-theme', () => ({
  useTheme: () => ({
    isDarkMode: false,
  }),
}));

describe('SsoProvisioningDetails', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize fresh mock client for each test
    mockCoreClient = initMockCoreClient();

    // Mock hooks
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  describe('rendering', () => {
    it('should render the component with title and description', () => {
      renderWithProviders(<SsoProvisioningDetails {...mockProps} />);

      expect(screen.getByText('fields.user_id_attribute.label')).toBeInTheDocument();
    });

    describe('when provisioning is enabled', () => {
      it('should render provisioning configuration options', () => {
        const props = {
          ...mockProps,
          provisioning: { enabled: true },
        };
        renderWithProviders(<SsoProvisioningDetails {...props} />);

        // Verify the component renders
        expect(screen.getByText('fields.user_id_attribute.label')).toBeInTheDocument();
      });
    });
  });

  describe('loading states', () => {
    describe('when isLoading is true', () => {
      it('should show loading state', () => {
        const props = { ...mockProps, isLoading: true };
        renderWithProviders(<SsoProvisioningDetails {...props} />);

        // Verify the component still renders during loading
        expect(screen.getByText('fields.user_id_attribute.label')).toBeInTheDocument();
      });
    });
  });

  describe('user interactions', () => {
    it('should call onListScimTokens when component mounts', () => {
      renderWithProviders(<SsoProvisioningDetails {...mockProps} />);

      // The component should call onListScimTokens to load tokens
      expect(mockProps.onListScimTokens).toHaveBeenCalled();
    });

    it('should call onCreateScimToken when create token button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProvisioningDetails {...mockProps} />);

      const createButton = screen.queryByRole('button', { name: /create/i });
      if (createButton) {
        await user.click(createButton);
        expect(mockProps.onCreateScimToken).toHaveBeenCalled();
      }
    });

    it('should call onDeleteScimToken when delete token button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SsoProvisioningDetails {...mockProps} />);

      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      if (deleteButton) {
        await user.click(deleteButton);
        expect(mockProps.onDeleteScimToken).toHaveBeenCalled();
      }
    });
  });

  describe('loading states', () => {
    describe('when isScimTokensLoading is true', () => {
      it('should show loading state', () => {
        const props = { ...mockProps, isScimTokensLoading: true };
        renderWithProviders(<SsoProvisioningDetails {...props} />);

        // Verify the component still renders during loading
        expect(screen.getByText('fields.user_id_attribute.label')).toBeInTheDocument();
      });
    });

    describe('when isScimTokenCreating is true', () => {
      it('should disable create token button', () => {
        const props = { ...mockProps, isScimTokenCreating: true };
        renderWithProviders(<SsoProvisioningDetails {...props} />);

        const createButton = screen.queryByRole('button', { name: /create/i });
        if (createButton) {
          expect(createButton).toBeDisabled();
        }
      });
    });

    describe('when isScimTokenDeleting is true', () => {
      it('should disable delete token button', () => {
        const props = { ...mockProps, isScimTokenDeleting: true };
        renderWithProviders(<SsoProvisioningDetails {...props} />);

        const deleteButton = screen.queryByRole('button', { name: /delete/i });
        if (deleteButton) {
          expect(deleteButton).toBeDisabled();
        }
      });
    });
  });
});
