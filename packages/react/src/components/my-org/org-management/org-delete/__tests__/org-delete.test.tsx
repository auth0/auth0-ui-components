import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../../hooks/use-core-client';
import { createMockOrganization, mockCore, renderWithProviders } from '../../../../../internals';
import type { OrgDeleteProps } from '../../../../../types/index';
import { OrgDelete } from '../org-delete';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====
const createMockOrgDelete = (overrides?: Partial<OrgDeleteProps>): OrgDeleteProps => {
  const mockOrganization = createMockOrganization();

  return {
    isLoading: false,
    styling: {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    customMessages: {},
    onDelete: vi.fn(),
    organization: mockOrganization,
    ...overrides,
  };
};

// ===== Tests =====

describe('OrgDelete', () => {
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

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('customMessages', () => {
    describe('when using a custom message on modal title', () => {
      it('should override modal title', async () => {
        const customMessages = {
          title: 'Delete organization',
        };

        renderWithProviders(<OrgDelete {...createMockOrgDelete({ customMessages })} />);

        expect(screen.getByText('Delete organization')).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for OrgDelete_card', () => {
        it('should apply the custom class to OrgDelete_card', async () => {
          const customStyling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              OrgDelete_card: 'custom-card-delete',
            },
          };

          renderWithProviders(<OrgDelete {...createMockOrgDelete({ styling: customStyling })} />);

          const cardElement = screen.getByTestId('org-delete-card');
          expect(cardElement).toHaveClass('custom-card-delete');
        });
      });
    });
  });

  describe('modal', () => {
    describe('when click on delete button', () => {
      it('should render modal', async () => {
        const user = userEvent.setup();

        renderWithProviders(<OrgDelete {...createMockOrgDelete()} />);

        // Click delete
        const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
        await user.click(deleteButton);

        expect(screen.queryByText(/modal_title/i)).toBeInTheDocument();
      });
    });
  });

  describe('isLoading', () => {
    describe('when isLoading is true', () => {
      it('disables delete button', () => {
        renderWithProviders(<OrgDelete {...createMockOrgDelete({ isLoading: true })} />);

        const deleteButton = screen.getByRole('button', { name: /delete_button_label/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });
});
