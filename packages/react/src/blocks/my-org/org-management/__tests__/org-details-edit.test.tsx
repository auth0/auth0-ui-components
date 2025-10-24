import type { ComponentAction, OrganizationPrivate } from '@auth0-web-ui-components/core';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../hooks/use-core-client';
import {
  createMockOrganization,
  mockCore,
  mockToast,
  renderWithProviders,
} from '../../../../internals';
import type {
  OrgDetailsEditProps,
  OrgEditBackButton,
} from '../../../../types/my-org/org-management';
import { OrgDetailsEdit } from '../org-details-edit';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockOrgDetailsEditProps = (
  overrides?: Partial<OrgDetailsEditProps>,
): OrgDetailsEditProps => ({
  schema: undefined,
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly: false,
  hideHeader: false,
  saveAction: undefined,
  cancelAction: undefined,
  backButton: undefined,
  ...overrides,
});

const createMockBackButton = (): OrgEditBackButton => ({
  onClick: vi.fn(),
});

const createMockSaveAction = (): ComponentAction<OrganizationPrivate> => ({
  disabled: false,
  onBefore: vi.fn(() => true),
  onAfter: vi.fn(),
});

const createMockCancelAction = (): Omit<ComponentAction<OrganizationPrivate>, 'onBefore'> => ({
  disabled: false,
  onAfter: vi.fn(),
});

// ===== Local utils =====

const waitForComponentToLoad = async () => {
  return await screen.findByDisplayValue('Auth0 Corporation');
};

// ===== Tests =====

describe('OrgDetailsEdit', () => {
  const mockOrganization = createMockOrganization();
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize fresh mock client for each test
    mockCoreClient = initMockCoreClient();

    // Override API responses to return full organization
    const apiService = mockCoreClient.getMyOrgApiService();
    (apiService.organizationDetails.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );
    (apiService.organizationDetails.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockOrganization,
    );

    // Mock hooks
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('schema', () => {
    describe('when user saves form', () => {
      it('should validate displayName field with custom schema', async () => {
        const user = userEvent.setup();

        const customSchema = {
          details: {
            displayName: {
              minLength: 10,
              errorMessage: 'Display name must be at least 10 characters',
            },
          },
        };

        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ schema: customSchema })} />,
        );

        const displayNameInput = await waitForComponentToLoad();
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Short');

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        await user.click(saveButton);

        // Check validation error appears
        await screen.findByText(/Display name must be at least 10 characters/i);

        // Verify API was not called due to validation failure
        expect(
          mockCoreClient.getMyOrgApiService().organizationDetails.update,
        ).not.toHaveBeenCalled();
      });
    });
  });

  describe('customMessages', () => {
    describe('when using a custom message on header title', () => {
      it('should override header title', async () => {
        const customMessages = {
          header: {
            title: 'Custom Org Settings',
          },
        };

        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ customMessages })} />,
        );

        await waitForComponentToLoad();

        expect(screen.getByText('Custom Org Settings')).toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    describe('styling.classes', () => {
      describe('when classes are provided for OrgDetails_Card', () => {
        it('should apply the custom class to OrgDetails_Card', async () => {
          const customStyling = {
            variables: { common: {}, light: {}, dark: {} },
            classes: {
              OrgDetails_Card: 'custom-card-class',
            },
          };

          renderWithProviders(
            <OrgDetailsEdit {...createMockOrgDetailsEditProps({ styling: customStyling })} />,
          );

          await waitForComponentToLoad();

          const cardElement = screen.getByTestId('org-details-card');
          expect(cardElement).toHaveClass('custom-card-class');
        });
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should disable inputs and buttons', async () => {
        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ readOnly: true })} />,
        );

        const displayNameInput = await waitForComponentToLoad();

        const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
        expect(saveButton).toBeDisabled();

        const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
        expect(cancelButton).toBeDisabled();

        expect(displayNameInput).toHaveAttribute('readonly');
      });
    });

    describe('when is false', () => {
      it('should enable inputs and buttons', async () => {
        const user = userEvent.setup();

        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ readOnly: false })} />,
        );

        const displayNameInput = await waitForComponentToLoad();

        // Make a change to trigger unsaved changes and enable save button
        await user.clear(displayNameInput);
        await user.type(displayNameInput, 'Modified Corporation');

        // Now button should be enabled
        await waitFor(() => {
          const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
          expect(saveButton).not.toBeDisabled();
        });

        const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
        expect(cancelButton).not.toBeDisabled();

        expect(displayNameInput).not.toBeDisabled();
      });
    });
  });

  describe('saveAction', () => {
    describe('saveAction.disabled', () => {
      describe('when is true', () => {
        it('should disable save button', async () => {
          const user = userEvent.setup();
          const mockSaveAction = createMockSaveAction();
          mockSaveAction.disabled = true;

          renderWithProviders(
            <OrgDetailsEdit {...createMockOrgDetailsEditProps({ saveAction: mockSaveAction })} />,
          );

          const displayNameInput = await waitForComponentToLoad();

          // Make a change to trigger unsaved changes
          await user.clear(displayNameInput);
          await user.type(displayNameInput, 'Modified Corporation');

          // Button should still be disabled
          const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
          expect(saveButton).toBeDisabled();
        });
      });

      describe('when is false and has unsaved changes', () => {
        it('should enable save button', async () => {
          const user = userEvent.setup();
          const mockSaveAction = createMockSaveAction();
          mockSaveAction.disabled = false;

          renderWithProviders(
            <OrgDetailsEdit {...createMockOrgDetailsEditProps({ saveAction: mockSaveAction })} />,
          );

          const displayNameInput = await waitForComponentToLoad();

          // Make a change to trigger unsaved changes
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

    describe('saveAction.onBefore', () => {
      describe('when user clicks save button', () => {
        describe('when onBefore returns true', () => {
          it('should call onBefore and proceed with save', async () => {
            const user = userEvent.setup();
            const mockSaveAction = createMockSaveAction();
            mockSaveAction.onBefore = vi.fn(() => true);

            renderWithProviders(
              <OrgDetailsEdit {...createMockOrgDetailsEditProps({ saveAction: mockSaveAction })} />,
            );

            const displayNameInput = await waitForComponentToLoad();

            // Make a change to enable save
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Click save
            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            // Verify onBefore and API were called
            await waitFor(() => {
              expect(mockSaveAction.onBefore).toHaveBeenCalled();
              expect(
                mockCoreClient.getMyOrgApiService().organizationDetails.update,
              ).toHaveBeenCalled();
            });
          });
        });

        describe('when onBefore returns false', () => {
          it('should call onBefore and not proceed with save', async () => {
            const user = userEvent.setup();
            const mockSaveAction = createMockSaveAction();
            mockSaveAction.onBefore = vi.fn(() => false);

            renderWithProviders(
              <OrgDetailsEdit {...createMockOrgDetailsEditProps({ saveAction: mockSaveAction })} />,
            );

            const displayNameInput = await waitForComponentToLoad();

            // Make a change to enable save
            await user.clear(displayNameInput);
            await user.type(displayNameInput, 'Modified Corporation');

            // Click save
            const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
            await user.click(saveButton);

            // Verify onBefore was called
            await waitFor(() => {
              expect(mockSaveAction.onBefore).toHaveBeenCalled();
            });

            // Verify API was NOT called
            expect(
              mockCoreClient.getMyOrgApiService().organizationDetails.update,
            ).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('saveAction.onAfter', () => {
      describe('when save is successful', () => {
        it('should call onAfter', async () => {
          const user = userEvent.setup();
          const mockSaveAction = createMockSaveAction();
          mockSaveAction.onBefore = vi.fn(() => true);
          mockSaveAction.onAfter = vi.fn();

          renderWithProviders(
            <OrgDetailsEdit {...createMockOrgDetailsEditProps({ saveAction: mockSaveAction })} />,
          );

          const displayNameInput = await waitForComponentToLoad();

          // Make a change to enable save
          await user.clear(displayNameInput);
          await user.type(displayNameInput, 'Modified Corporation');

          // Click save
          const saveButton = screen.getByRole('button', { name: /submit_button_label/i });
          await user.click(saveButton);

          // Verify onAfter and API were called
          await waitFor(() => {
            expect(mockSaveAction.onAfter).toHaveBeenCalled();
            expect(
              mockCoreClient.getMyOrgApiService().organizationDetails.update,
            ).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('cancelAction', () => {
    describe('cancelAction.disabled', () => {
      describe('when is true', () => {
        it('should disable cancel button', async () => {
          const mockCancelAction = { ...createMockCancelAction(), disabled: true };

          renderWithProviders(
            <OrgDetailsEdit
              {...createMockOrgDetailsEditProps({ cancelAction: mockCancelAction })}
            />,
          );

          await waitForComponentToLoad();

          // Button should is disabled
          const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
          expect(cancelButton).toBeDisabled();
        });
      });

      describe('when is false', () => {
        it('should enable cancel button', async () => {
          const mockCancelAction = { ...createMockCancelAction(), disabled: false };

          renderWithProviders(
            <OrgDetailsEdit
              {...createMockOrgDetailsEditProps({ cancelAction: mockCancelAction })}
            />,
          );

          await waitForComponentToLoad();

          const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
          expect(cancelButton).not.toBeDisabled();
        });
      });
    });

    describe('cancelAction.onAfter', () => {
      describe('when cancel is successful', () => {
        it('should call onAfter with organization data', async () => {
          const user = userEvent.setup();
          const mockCancelAction = createMockCancelAction();

          renderWithProviders(
            <OrgDetailsEdit
              {...createMockOrgDetailsEditProps({ cancelAction: mockCancelAction })}
            />,
          );

          await waitForComponentToLoad();

          // Click cancel
          const cancelButton = screen.getByRole('button', { name: /cancel_button_label/i });
          await user.click(cancelButton);

          // Verify onAfter was called with organization data
          await waitFor(() => {
            expect(mockCancelAction.onAfter).toHaveBeenCalledWith(mockOrganization);
          });
        });
      });
    });
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header with title', async () => {
        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ hideHeader: false })} />,
        );

        await waitForComponentToLoad();

        expect(screen.getByText(/header.title/i)).toBeInTheDocument();
      });
    });
    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ hideHeader: true })} />,
        );

        await waitForComponentToLoad();

        expect(screen.queryByText(/header.title/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('backButton', () => {
    describe('when backButton is provided', () => {
      it('should render back button', async () => {
        const mockBackButton = createMockBackButton();

        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ backButton: mockBackButton })} />,
        );

        await screen.findByRole('button', { name: /header.back_button_text/i });
      });
    });

    describe('when backButton is not provided', () => {
      it('should not render back button', async () => {
        renderWithProviders(<OrgDetailsEdit {...createMockOrgDetailsEditProps()} />);

        await waitForComponentToLoad();

        expect(
          screen.queryByRole('button', { name: /header.back_button_text/i }),
        ).not.toBeInTheDocument();
      });
    });

    describe('when backButton is clicked', () => {
      it('should call backButton.onClick', async () => {
        const user = userEvent.setup();
        const mockBackButton = createMockBackButton();

        renderWithProviders(
          <OrgDetailsEdit {...createMockOrgDetailsEditProps({ backButton: mockBackButton })} />,
        );

        const backButton = await screen.findByRole('button', { name: /header.back_button_text/i });
        await user.click(backButton);

        expect(mockBackButton.onClick).toHaveBeenCalledTimes(1);
      });
    });
  });
});
