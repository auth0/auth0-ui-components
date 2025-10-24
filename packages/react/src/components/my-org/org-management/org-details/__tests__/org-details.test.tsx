import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import {
  createMockOrganization,
  mockCore,
  renderWithProviders,
  createMockCoreClient,
  TestProvider,
} from '../../../../../internals';
import type {
  OrgDetailsFormActions,
  OrgDetailsProps,
} from '../../../../../types/my-org/org-management';
import { OrgDetails } from '../org-details';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockOrgDetailsProps = (overrides?: Partial<OrgDetailsProps>): OrgDetailsProps => {
  const mockOrganization = createMockOrganization();

  return {
    organization: mockOrganization,
    isLoading: false,
    schema: undefined,
    customMessages: {},
    styling: {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    readOnly: false,
    formActions: {
      isLoading: false,
      nextAction: {
        disabled: false,
        onClick: vi.fn(async () => true),
      },
      previousAction: {
        disabled: false,
        onClick: vi.fn(),
      },
    },
    ...overrides,
  };
};

const createMockFormActions = (
  overrides?: Partial<OrgDetailsFormActions>,
): OrgDetailsFormActions => ({
  isLoading: false,
  nextAction: {
    disabled: false,
    onClick: vi.fn(async () => true),
  },
  previousAction: {
    disabled: false,
    onClick: vi.fn(),
  },
  ...overrides,
});

// ===== Tests =====

describe('OrgDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMockCoreClient();
  });

  describe('when loading', () => {
    it('should display spinner when isLoading is true', () => {
      renderWithProviders(<OrgDetails {...createMockOrgDetailsProps({ isLoading: true })} />);

      // Spinner doesn't have role="status", so we check for the loading text
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByLabelText(/display_name\.label/i)).not.toBeInTheDocument();
    });

    it('should display form when isLoading is false', () => {
      renderWithProviders(<OrgDetails {...createMockOrgDetailsProps({ isLoading: false })} />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/display_name\.label/i)).toBeInTheDocument();
    });
  });

  describe('schema', () => {
    describe('when user submits form with invalid data', () => {
      it('should validate displayName field with custom schema', async () => {
        const user = userEvent.setup();

        const customSchema = {
          displayName: {
            minLength: 10,
            errorMessage: 'Display name must be at least 10 characters',
          },
        };

        renderWithProviders(
          <OrgDetails {...createMockOrgDetailsProps({ schema: customSchema })} />,
        );

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Short');

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        await user.click(saveButton);

        // Check validation error appears
        await screen.findByText(/Display name must be at least 10 characters/i);
      });
    });
  });

  describe('customMessages', () => {
    describe('when submit_button_label custom messages are provided', () => {
      it('should override submit button label', () => {
        const customMessages = {
          submit_button_label: 'Custom Save',
        };

        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps({ customMessages })} />);

        expect(screen.getByRole('button', { name: 'Custom Save' })).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('when OrgDetails_Card custom classes are provided', () => {
      it('should apply custom class to OrgDetails_Card', () => {
        const customStyling = {
          variables: { common: {}, light: {}, dark: {} },
          classes: {
            OrgDetails_Card: 'custom-card-class',
          },
        };

        renderWithProviders(
          <OrgDetails {...createMockOrgDetailsProps({ styling: customStyling })} />,
        );

        const cardElement = screen.getByTestId('org-details-card');
        expect(cardElement).toHaveClass('custom-card-class');
      });
    });
  });

  describe('readOnly', () => {
    describe('when readOnly is true', () => {
      it('should disable standard form inputs', () => {
        const { container } = renderWithProviders(
          <OrgDetails {...createMockOrgDetailsProps({ readOnly: true })} />,
        );

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        const nameInput = screen.getByLabelText(/fields\.name\.label/i);
        const logoInput = container.querySelector('input[name="branding.logo_url"]');
        const primaryColorInput = container.querySelector(
          'input[name="branding.colors.primary"][role="textbox"]',
        );
        const pageBackgroundColorInput = container.querySelector(
          'input[name="branding.colors.page_background"][role="textbox"]',
        );

        expect(displayNameInput).toHaveAttribute('readonly');
        expect(nameInput).toHaveAttribute('readonly');
        expect(logoInput).toHaveAttribute('readonly');
        expect(primaryColorInput).toHaveAttribute('readonly');
        expect(pageBackgroundColorInput).toHaveAttribute('readonly');
      });

      it('should disable save and cancel buttons', () => {
        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps({ readOnly: true })} />);

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });

        expect(saveButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
      });
    });

    describe('when readOnly is false', () => {
      it('should enable form inputs', () => {
        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps({ readOnly: false })} />);

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);

        expect(displayNameInput).not.toBeDisabled();
      });

      it('should enable cancel button', () => {
        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps({ readOnly: false })} />);

        const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
        expect(cancelButton).not.toBeDisabled();
      });
    });
  });

  describe('formActions', () => {
    describe('formActions.isLoading', () => {
      describe('when isLoading is true', () => {
        it('should disable save and cancel buttons', () => {
          const mockFormActions = createMockFormActions({ isLoading: true });

          renderWithProviders(
            <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
          );

          const buttons = screen.getAllByRole('button');
          const saveButton = buttons.find((btn) => btn.classList.contains('FormActions-next'));
          const cancelButton = buttons.find((btn) =>
            btn.classList.contains('FormActions-previous'),
          );

          expect(saveButton).toBeDisabled();
          expect(cancelButton).toBeDisabled();
        });
      });
    });

    describe('formActions.nextAction', () => {
      describe('formActions.nextAction.disabled', () => {
        describe('when disabled is true', () => {
          it('should disable save button even with changes', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions({
              nextAction: { disabled: true, onClick: vi.fn(async () => true) },
            });

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Button should still be disabled
            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            expect(saveButton).toBeDisabled();
          });
        });

        describe('when disabled is false and has unsaved changes', () => {
          it('should enable save button', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions({
              nextAction: { disabled: false, onClick: vi.fn(async () => true) },
            });

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Button should be enabled
            await waitFor(() => {
              const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
              expect(saveButton).not.toBeDisabled();
            });
          });
        });
      });

      describe('formActions.nextAction.onClick', () => {
        describe('when form is submitted with valid data', () => {
          it('should call onClick with updated organization data', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions();

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Submit form
            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            // Verify onClick was called with correct data
            await waitFor(() => {
              expect(mockFormActions.nextAction?.onClick).toHaveBeenCalledWith(
                expect.objectContaining({
                  display_name: 'Modified Corporation',
                }),
              );
            });
          });

          it('should reset form dirty state when onClick returns true', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions({
              nextAction: { disabled: false, onClick: vi.fn(async () => true) },
            });

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Verify unsaved changes message appears
            expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();

            // Submit form
            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            // Wait for form to be submitted and reset
            await waitFor(() => {
              expect(mockFormActions.nextAction?.onClick).toHaveBeenCalled();
            });

            // Unsaved changes message should be gone
            await waitFor(() => {
              expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();
            });

            // Save button should be disabled again (no unsaved changes)
            await waitFor(() => {
              const saveButtonAfter = screen.getByRole('button', { name: /submit_button_label/i });
              expect(saveButtonAfter).toBeDisabled();
            });
          });

          it('should not reset form dirty state when onClick returns false', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions({
              nextAction: { disabled: false, onClick: vi.fn(async () => false) },
            });

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Submit form
            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            await waitFor(() => {
              expect(mockFormActions.nextAction?.onClick).toHaveBeenCalled();
            });

            // Unsaved changes message should still be there
            expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();
          });
        });
      });
    });

    describe('formActions.previousAction', () => {
      describe('formActions.previousAction.disabled', () => {
        describe('when disabled is true', () => {
          it('should disable cancel button', () => {
            const mockFormActions = createMockFormActions({
              previousAction: { disabled: true, onClick: vi.fn() },
            });

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            expect(cancelButton).toBeDisabled();
          });
        });

        describe('when disabled is false', () => {
          it('should enable cancel button', () => {
            const mockFormActions = createMockFormActions({
              previousAction: { disabled: false, onClick: vi.fn() },
            });

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            expect(cancelButton).not.toBeDisabled();
          });
        });
      });

      describe('formActions.previousAction.onClick', () => {
        describe('when cancel button is clicked', () => {
          it('should call onClick', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions();

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            await user.click(cancelButton);

            expect(mockFormActions.previousAction?.onClick).toHaveBeenCalledTimes(1);
          });

          it('should reset form to original values', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions();

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Verify change was made
            expect(displayNameInput).toHaveValue('Modified Corporation');

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            await user.click(cancelButton);

            // Verify form was reset
            await waitFor(() => {
              expect(displayNameInput).toHaveValue('Auth0 Corporation');
            });
          });

          it('should clear unsaved changes message after reset', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions();

            renderWithProviders(
              <OrgDetails {...createMockOrgDetailsProps({ formActions: mockFormActions })} />,
            );

            // Make a change
            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Verify unsaved changes message appears
            expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();

            // Click cancel
            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            await user.click(cancelButton);

            // Unsaved changes message should be gone
            await waitFor(() => {
              expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();
            });
          });
        });
      });
    });
  });

  describe('organization data', () => {
    describe('when organization is provided', () => {
      it('should display all organization fields', () => {
        const mockOrg = createMockOrganization();

        renderWithProviders(
          <OrgDetails {...createMockOrgDetailsProps({ organization: mockOrg })} />,
        );

        expect(screen.getByLabelText(/display_name\.label/i)).toHaveValue(
          mockOrg.display_name ?? '',
        );
        expect(screen.getByLabelText(/fields\.name\.label/i)).toHaveValue(mockOrg.name);
        expect(screen.getByLabelText(/fields\.logo\.label/i)).toHaveValue(
          mockOrg.branding.logo_url ?? '',
        );
        // Color values are normalized to lowercase by the input
        expect(screen.getByLabelText(/primary_color\.label/i)).toHaveValue(
          mockOrg.branding.colors.primary.toLowerCase(),
        );
        expect(screen.getByLabelText(/page_background_color\.label/i)).toHaveValue(
          mockOrg.branding.colors.page_background.toLowerCase(),
        );
      });

      it('should update form fields when organization prop changes', () => {
        const mockOrg1 = createMockOrganization();
        const mockOrg2 = createMockOrganization();
        mockOrg2.display_name = 'Updated Organization Name';
        mockOrg2.branding.colors.primary = '#FF5733';

        // Create a stable mock core client to use across renders
        const mockCoreClient = createMockCoreClient();

        // Render with mock 1
        const { rerender } = renderWithProviders(
          <OrgDetails {...createMockOrgDetailsProps({ organization: mockOrg1 })} />,
          { coreClient: mockCoreClient },
        );

        // Re-render with mock 2
        rerender(
          <TestProvider coreClient={mockCoreClient}>
            <OrgDetails {...createMockOrgDetailsProps({ organization: mockOrg2 })} />
          </TestProvider>,
        );

        expect(screen.getByLabelText(/display_name\.label/i)).toHaveValue(
          mockOrg2.display_name ?? '',
        );
        expect(screen.getByLabelText(/primary_color\.label/i)).toHaveValue(
          mockOrg2.branding.colors.primary.toLowerCase(),
        );
      });
    });
  });

  describe('unsaved changes behavior', () => {
    describe('when user makes changes', () => {
      it('should show unsaved changes message', async () => {
        const user = userEvent.setup();

        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps()} />);

        // Initially no unsaved changes
        expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();

        // Make a change
        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Modified Corporation');

        // Unsaved changes message should appear
        expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();
      });

      it('should enable save button when there are unsaved changes', async () => {
        const user = userEvent.setup();

        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps()} />);

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });

        // Initially disabled (no changes)
        expect(saveButton).toBeDisabled();

        // Make a change
        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Modified Corporation');

        // Save button should be enabled
        await waitFor(() => {
          expect(saveButton).not.toBeDisabled();
        });
      });
    });

    describe('when user has not made changes', () => {
      it('should not show unsaved changes message', () => {
        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps()} />);

        expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();
      });

      it('should disable save button', () => {
        renderWithProviders(<OrgDetails {...createMockOrgDetailsProps()} />);

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        expect(saveButton).toBeDisabled();
      });
    });
  });
});
