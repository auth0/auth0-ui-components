import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { OrganizationDetails } from '../organization-details';

import {
  createMockOrganization,
  mockCore,
  renderWithProviders,
  createMockCoreClient,
  TestProvider,
} from '@/tests/utils';
import type {
  OrganizationDetailsFormActions,
  OrganizationDetailsProps,
} from '@/types/my-organization/organization-management/organization-details-types';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockOrganizationDetailsProps = (
  overrides?: Partial<OrganizationDetailsProps>,
): OrganizationDetailsProps => {
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
  overrides?: Partial<OrganizationDetailsFormActions>,
): OrganizationDetailsFormActions => ({
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

describe('OrganizationDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    initMockCoreClient();
  });

  describe('when loading', () => {
    it('should display spinner when isLoading is true', () => {
      renderWithProviders(
        <OrganizationDetails {...createMockOrganizationDetailsProps({ isLoading: true })} />,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByLabelText(/display_name\.label/i)).not.toBeInTheDocument();
    });

    it('should display form when isLoading is false', () => {
      renderWithProviders(
        <OrganizationDetails {...createMockOrganizationDetailsProps({ isLoading: false })} />,
      );

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
          <OrganizationDetails {...createMockOrganizationDetailsProps({ schema: customSchema })} />,
        );

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Short');

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        await user.click(saveButton);

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

        renderWithProviders(
          <OrganizationDetails {...createMockOrganizationDetailsProps({ customMessages })} />,
        );

        expect(screen.getByRole('button', { name: 'Custom Save' })).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('when OrganizationDetails_Card custom classes are provided', () => {
      it('should apply custom class to OrganizationDetails_Card', () => {
        const customStyling = {
          variables: { common: {}, light: {}, dark: {} },
          classes: {
            OrganizationDetails_Card: 'custom-card-class',
          },
        };

        renderWithProviders(
          <OrganizationDetails
            {...createMockOrganizationDetailsProps({ styling: customStyling })}
          />,
        );

        const cardElement = screen.getByTestId('organization-details-card');
        expect(cardElement).toHaveClass('custom-card-class');
      });
    });
  });

  describe('formActions', () => {
    describe('formActions.isLoading', () => {
      describe('when isLoading is true', () => {
        it('should disable save and cancel buttons', async () => {
          const user = userEvent.setup();
          const mockFormActions = createMockFormActions({ isLoading: true });

          renderWithProviders(
            <OrganizationDetails
              {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
            />,
          );

          const displayNameInput = screen.getByLabelText(/display_name\.label/i);
          await user.clear(displayNameInput);
          await user.type(displayNameInput, 'Modified Corporation');

          const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
          const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });

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
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

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
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

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
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

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
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();

            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            await waitFor(() => {
              expect(mockFormActions.nextAction?.onClick).toHaveBeenCalled();
            });

            await waitFor(() => {
              expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();
            });

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
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            await waitFor(() => {
              expect(mockFormActions.nextAction?.onClick).toHaveBeenCalled();
            });

            expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();
          });
        });
      });
    });

    describe('formActions.previousAction', () => {
      describe('formActions.previousAction.disabled', () => {
        describe('when disabled is true', () => {
          it('should disable cancel button', async () => {
            const user = userEvent.setup();
            const mockFormActions = createMockFormActions({
              previousAction: { disabled: true, onClick: vi.fn() },
            });

            renderWithProviders(
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            expect(cancelButton).toBeDisabled();
          });
        });

        describe('when disabled is false', () => {
          it('should enable cancel button', async () => {
            const user = userEvent.setup();
            const mockFormActions = createMockFormActions({
              previousAction: { disabled: false, onClick: vi.fn() },
            });

            renderWithProviders(
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

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
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            await user.click(cancelButton);

            expect(mockFormActions.previousAction?.onClick).toHaveBeenCalledTimes(1);
          });

          it('should reset form to original values', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions();

            renderWithProviders(
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            expect(displayNameInput).toHaveValue('Modified Corporation');

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            await user.click(cancelButton);

            await waitFor(() => {
              expect(displayNameInput).toHaveValue('Auth0 Corporation');
            });
          });

          it('should clear unsaved changes message after reset', async () => {
            const user = userEvent.setup();

            const mockFormActions = createMockFormActions();

            renderWithProviders(
              <OrganizationDetails
                {...createMockOrganizationDetailsProps({ formActions: mockFormActions })}
              />,
            );

            const displayNameInput = screen.getByLabelText(/display_name\.label/i);
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();

            const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
            await user.click(cancelButton);

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
        const { container } = renderWithProviders(
          <OrganizationDetails
            {...createMockOrganizationDetailsProps({ organization: mockOrg })}
          />,
        );

        expect(screen.getByLabelText(/display_name\.label/i)).toHaveValue(
          mockOrg.display_name ?? '',
        );
        expect(screen.getByLabelText(/fields\.name\.label/i)).toHaveValue(mockOrg.name);
        expect(screen.getByLabelText(/fields\.logo\.label/i)).toHaveValue(
          mockOrg.branding.logo_url ?? '',
        );

        const primaryColorInput = container.querySelector(
          'input[name="branding.colors.primary"]',
        ) as HTMLInputElement;
        const pageBackgroundColorInput = container.querySelector(
          'input[name="branding.colors.page_background"]',
        ) as HTMLInputElement;

        expect(primaryColorInput).toHaveValue(mockOrg.branding.colors.primary.toLowerCase());
        expect(pageBackgroundColorInput).toHaveValue(
          mockOrg.branding.colors.page_background.toLowerCase(),
        );
      });

      it('should update form fields when organization prop changes', () => {
        const mockOrg1 = createMockOrganization();
        const mockOrg2 = createMockOrganization();
        mockOrg2.display_name = 'Updated Organization Name';
        mockOrg2.branding.colors.primary = '#FF5733';

        const mockCoreClient = createMockCoreClient();

        const { rerender, container } = renderWithProviders(
          <OrganizationDetails
            {...createMockOrganizationDetailsProps({ organization: mockOrg1 })}
          />,
          { coreClient: mockCoreClient },
        );

        rerender(
          <TestProvider coreClient={mockCoreClient}>
            <OrganizationDetails
              {...createMockOrganizationDetailsProps({ organization: mockOrg2 })}
            />
          </TestProvider>,
        );

        expect(screen.getByLabelText(/display_name\.label/i)).toHaveValue(
          mockOrg2.display_name ?? '',
        );

        const primaryColorInput = container.querySelector(
          'input[name="branding.colors.primary"]',
        ) as HTMLInputElement;

        expect(primaryColorInput).toHaveValue(mockOrg2.branding.colors.primary.toLowerCase());
      });
    });
  });

  describe('unsaved changes behavior', () => {
    describe('when user makes changes', () => {
      it('should show unsaved changes message', async () => {
        const user = userEvent.setup();

        renderWithProviders(<OrganizationDetails {...createMockOrganizationDetailsProps()} />);

        expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Modified Corporation');

        expect(screen.getByText(/unsaved_changes_text/i)).toBeInTheDocument();
      });

      it('should enable save button when there are unsaved changes', async () => {
        const user = userEvent.setup();

        renderWithProviders(<OrganizationDetails {...createMockOrganizationDetailsProps()} />);

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });

        expect(saveButton).toBeDisabled();

        const displayNameInput = screen.getByLabelText(/display_name\.label/i);
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Modified Corporation');

        await waitFor(() => {
          expect(saveButton).not.toBeDisabled();
        });
      });
    });

    describe('when user has not made changes', () => {
      it('should not show unsaved changes message', () => {
        renderWithProviders(<OrganizationDetails {...createMockOrganizationDetailsProps()} />);

        expect(screen.queryByText(/unsaved_changes_text/i)).not.toBeInTheDocument();
      });

      it('should disable save button', () => {
        renderWithProviders(<OrganizationDetails {...createMockOrganizationDetailsProps()} />);

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        expect(saveButton).toBeDisabled();
      });
    });
  });
});
