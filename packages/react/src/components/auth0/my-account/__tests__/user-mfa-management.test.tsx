import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  UserMFAManagement,
  UserMFAManagementView,
} from '@/components/auth0/my-account/user-mfa-management';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockAPIError,
  createMockAuthenticator,
  createMockAuthenticationMethodsResponse,
  createMockOTPEnrollmentResponse,
  createMockUserMFAManagementViewProps,
} from '@/tests/utils/__mocks__/my-account/user-mfa-management/user-mfa-management.mocks';
import { renderWithProviders } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UserMFAManagementProps } from '@/types/my-account/user-mfa-management/user-mfa-management-types';
import type { UserMFAManagementViewProps } from '@/types/my-account/user-mfa-management/user-mfa-management-types';

// ===== Mock packages =====

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

// ===== Local mock creators =====

const createMockUserMFAManagementProps = (
  overrides?: Partial<UserMFAManagementProps>,
): UserMFAManagementProps => ({
  hideHeader: false,
  showActiveOnly: false,
  disableEnroll: false,
  disableDelete: false,
  readOnly: false,
  factorConfig: {},
  ...overrides,
});

const waitForComponentToLoad = async () => {
  await waitFor(() => {
    expect(screen.queryByText(/loading\.\.\./i)).not.toBeInTheDocument();
  });
};

const setupEnrolledTotpFactor = (
  apiService: ReturnType<ReturnType<typeof initMockCoreClient>['getMyAccountApiClient']>,
) => {
  apiService.authenticationMethods.list = vi.fn().mockResolvedValue(
    createMockAuthenticationMethodsResponse([
      createMockAuthenticator({
        type: 'totp',
        enrolled: true,
      }),
    ]),
  );
};

// ===== Tests =====

describe('UserMFAManagement', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    // Trigger the onAutoClose callback immediately for testing purposes,
    // mirroring how the real showToast passes it through to the toast provider.
    mockedShowToast.mockImplementation(({ data }: { data?: { onAutoClose?: () => void } }) => {
      if (data?.onAutoClose) {
        setTimeout(() => {
          data.onAutoClose!();
        }, 0);
      }
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header with title', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ hideHeader: false })} />,
        );

        await waitForComponentToLoad();

        await waitFor(() => {
          expect(screen.getByText('header.title')).toBeInTheDocument();
        });
      });
    });

    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ hideHeader: true })} />,
        );

        await waitFor(() => {
          expect(screen.queryByText('header.title')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('showActiveOnly', () => {
    describe('when is true and has no active factors', () => {
      it('should show empty state message', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ showActiveOnly: true })} />,
        );

        await waitForComponentToLoad();

        await screen.findByText(/no_active_mfa/i);
      });
    });
  });

  describe('disableEnroll', () => {
    describe('when is true', () => {
      it('should disable enroll buttons', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ disableEnroll: true })} />,
        );

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          buttons.forEach((button) => {
            expect(button).toHaveTextContent('button_text');
            expect(button).toBeDisabled();
          });
        });
      });
    });

    describe('when is false', () => {
      it('should enable enroll buttons', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ disableEnroll: false })} />,
        );

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          expect(buttons.length).toBeGreaterThan(0);
          buttons.forEach((button) => {
            expect(button).toHaveTextContent('button_text');
            expect(button).not.toBeDisabled();
          });
        });
      });
    });
  });

  describe('disableDelete', () => {
    describe('when is true', () => {
      it('should disable delete functionality', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ disableDelete: true })} />,
        );

        await waitFor(() => {
          const deleteButtons = screen.queryAllByRole('button', { name: /delete/i });
          deleteButtons.forEach((button) => {
            expect(button).toBeDisabled();
          });
        });
      });
    });
  });

  describe('readOnly', () => {
    describe('when is true', () => {
      it('should not render action buttons', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ readOnly: true })} />,
        );

        await waitFor(() => {
          const buttons = screen.queryAllByRole('button', { name: /button_text/i });
          expect(buttons).toHaveLength(0);
        });
      });
    });

    describe('when is false', () => {
      it('should render action buttons', async () => {
        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ readOnly: false })} />,
        );

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          expect(buttons.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('factorConfig', () => {
    describe('when factor visibility is set to false', () => {
      it('should hide the factor', async () => {
        const factorConfig = {
          totp: {
            visible: false,
          },
        };

        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ factorConfig })} />,
        );

        await waitFor(() => {
          expect(screen.queryByText(/totp/i)).not.toBeInTheDocument();
        });
      });
    });

    describe('when factor enabled is set to false', () => {
      it('should disable the factor', async () => {
        const factorConfig = {
          totp: {
            enabled: false,
          },
        };

        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ factorConfig })} />,
        );

        await waitFor(() => {
          const otpSection = screen.getByLabelText(/totp.*title/i);
          expect(otpSection).toHaveAttribute('aria-disabled', 'true');
        });
      });
    });
  });

  describe('onEnroll', () => {
    describe('when enrollment is successful', () => {
      it('should call onEnroll callback', async () => {
        const user = userEvent.setup();
        const onAfter = vi.fn();
        const enrollAction = { onAfter };

        // Mock successful enrollment response
        const apiService = mockCoreClient.getMyAccountApiClient();
        apiService.authenticationMethods.create = vi
          .fn()
          .mockResolvedValue(createMockOTPEnrollmentResponse());

        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ enrollAction })} />,
        );

        await waitForComponentToLoad();

        // Click on an enroll button (e.g., for TOTP)
        const enrollButtons = screen.getAllByRole('button');
        const totpEnrollButton = enrollButtons.find(
          (btn) => btn.getAttribute('aria-label') === 'factors.totp.button_text',
        );

        expect(totpEnrollButton).toBeDefined();
        await user.click(totpEnrollButton!);

        // Wait for dialog to open and QR code to load
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Wait for QR code to be displayed
        await waitFor(() => {
          expect(screen.getByRole('img')).toBeInTheDocument();
        });

        // Click the "Continue" button to proceed to OTP input phase
        const continueButton = screen.getByRole('button', { name: /continue/i });
        await user.click(continueButton);

        // Wait for OTP input form to appear - OTPField creates multiple textbox inputs
        await waitFor(
          () => {
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThan(0);
          },
          { timeout: 3000 },
        );

        // OTPField has 6 separate input fields for each digit
        const otpInputs = screen.getAllByRole('textbox');
        // Type one digit in each field to simulate '123456'
        await user.type(otpInputs[0]!, '1');
        await user.type(otpInputs[1]!, '2');
        await user.type(otpInputs[2]!, '3');
        await user.type(otpInputs[3]!, '4');
        await user.type(otpInputs[4]!, '5');
        await user.type(otpInputs[5]!, '6');

        // Wait for the submit button to be enabled (it's disabled until all 6 digits are entered)
        await waitFor(() => {
          const submitButton = screen.getByRole('button', { name: /verify/i });
          expect(submitButton).not.toBeDisabled();
        });

        // Click the submit button
        const submitButton = screen.getByRole('button', { name: /verify/i });
        await user.click(submitButton);

        // Verify that the enrollment APIs were called successfully
        await waitFor(() => {
          expect(apiService.authenticationMethods.create).toHaveBeenCalled();
          expect(apiService.authenticationMethods.verify).toHaveBeenCalled();
        });

        // Verify that factors were reloaded after successful enrollment
        await waitFor(() => {
          expect(apiService.authenticationMethods.list).toHaveBeenCalledTimes(2); // Once on mount, once after enrollment
        });

        // Since the onEnroll callback is called in the toast's onAutoClose after 2000ms,
        // we need to wait for it. Give it enough time to trigger.
        await waitFor(
          () => {
            expect(onAfter).toHaveBeenCalled();
          },
          { timeout: 3000 },
        );
      });
    });
  });

  describe('onDelete', () => {
    describe('when deletion is successful', () => {
      it('should call onDelete callback', async () => {
        const user = userEvent.setup();
        const onAfter = vi.fn();
        const deleteAction = { onAfter };

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ deleteAction })} />,
        );

        await waitForComponentToLoad();

        // Find and click the actions button (three dots) to open popover
        await waitFor(() => {
          const actionsButton = screen.getByRole('button', { name: /actions/i });
          expect(actionsButton).toBeInTheDocument();
        });

        const actionsButton = screen.getByRole('button', { name: /actions/i });
        await user.click(actionsButton);

        // Wait for popover to open and find the remove button
        await waitFor(() => {
          const removeButton = screen.getByRole('menuitem', { name: /remove/i });
          expect(removeButton).toBeInTheDocument();
        });

        const removeButton = screen.getByRole('menuitem', { name: /remove/i });
        await user.click(removeButton);

        // Wait for confirmation dialog to open
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        // Click the confirm button in the dialog
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        await user.click(confirmButton);

        // Verify that delete API was called
        await waitFor(() => {
          expect(apiService.authenticationMethods.delete).toHaveBeenCalled();
        });

        // Since the onDelete callback is called in the toast's onAutoClose,
        // we need to wait for it to trigger.
        await waitFor(
          () => {
            expect(onAfter).toHaveBeenCalled();
          },
          { timeout: 3000 },
        );
      });
    });
  });

  describe('error handling', () => {
    describe('when an enrollment error occurs', () => {
      it('should close the dialog and not crash', async () => {
        const user = userEvent.setup();

        const apiService = mockCoreClient.getMyAccountApiClient();
        const enrollError = createMockAPIError('Failed to enroll factor', 400);
        apiService.authenticationMethods.create = vi.fn().mockRejectedValue(enrollError);

        renderWithProviders(<UserMFAManagement {...createMockUserMFAManagementProps()} />);

        await waitForComponentToLoad();

        const enrollButtons = screen.getAllByRole('button');
        const totpEnrollButton = enrollButtons.find(
          (btn) => btn.getAttribute('aria-label') === 'factors.totp.button_text',
        );

        expect(totpEnrollButton).toBeDefined();
        await user.click(totpEnrollButton!);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });
    });

    describe('when a deletion error occurs', () => {
      it('should close the confirmation dialog and not crash', async () => {
        const user = userEvent.setup();

        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        const deleteError = createMockAPIError('Failed to delete factor', 403);
        apiService.authenticationMethods.delete = vi.fn().mockRejectedValue(deleteError);

        renderWithProviders(<UserMFAManagement {...createMockUserMFAManagementProps()} />);

        await waitForComponentToLoad();

        const actionsButton = screen.getByRole('button', { name: /actions/i });
        await user.click(actionsButton);

        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /remove/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole('menuitem', { name: /remove/i }));

        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /confirm/i }));

        await waitFor(
          () => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
          },
          { timeout: 3000 },
        );
      });
    });
  });

  describe('onBeforeAction', () => {
    describe('when returns true', () => {
      it('should proceed with the delete action', async () => {
        const user = userEvent.setup();
        const onBefore = vi.fn(() => true);
        const deleteAction = { onBefore };

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ deleteAction })} />,
        );

        await waitForComponentToLoad();

        // Find and click the actions button (three dots) to open popover
        await waitFor(() => {
          const actionsButton = screen.getByRole('button', { name: /actions/i });
          expect(actionsButton).toBeInTheDocument();
        });

        const actionsButton = screen.getByRole('button', { name: /actions/i });
        await user.click(actionsButton);

        // Wait for popover to open and find the remove button
        await waitFor(() => {
          const removeButton = screen.getByRole('menuitem', { name: /remove/i });
          expect(removeButton).toBeInTheDocument();
        });

        const removeButton = screen.getByRole('menuitem', { name: /remove/i });
        await user.click(removeButton);

        // Verify onBeforeAction was called with correct parameters
        await waitFor(() => {
          expect(onBefore).toHaveBeenCalledWith('totp');
        });

        // Confirm in the dialog that opens
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
        await user.click(screen.getByRole('button', { name: /confirm/i }));

        // Verify that delete API was called (since onBeforeAction returned true)
        await waitFor(() => {
          expect(apiService.authenticationMethods.delete).toHaveBeenCalled();
        });
      });
    });

    describe('when returns false', () => {
      it('should prevent the delete action', async () => {
        const user = userEvent.setup();
        const onBefore = vi.fn(() => false);
        const deleteAction = { onBefore };

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        renderWithProviders(
          <UserMFAManagement {...createMockUserMFAManagementProps({ deleteAction })} />,
        );

        await waitForComponentToLoad();

        // Find and click the actions button (three dots) to open popover
        await waitFor(() => {
          const actionsButton = screen.getByRole('button', { name: /actions/i });
          expect(actionsButton).toBeInTheDocument();
        });

        const actionsButton = screen.getByRole('button', { name: /actions/i });
        await user.click(actionsButton);

        // Wait for popover to open and find the remove button
        await waitFor(() => {
          const removeButton = screen.getByRole('menuitem', { name: /remove/i });
          expect(removeButton).toBeInTheDocument();
        });

        const removeButton = screen.getByRole('menuitem', { name: /remove/i });
        await user.click(removeButton);

        // Verify onBeforeAction was called with correct parameters
        await waitFor(() => {
          expect(onBefore).toHaveBeenCalledWith('totp');
        });

        // Verify that delete API was NOT called (since onBeforeAction returned false)
        await waitFor(() => {
          expect(apiService.authenticationMethods.delete).not.toHaveBeenCalled();
        });

        // Verify that the confirmation dialog was NOT opened (since onBeforeAction handles it)
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});

describe('UserMFAManagementView', () => {
  function setupView(overrides: Partial<UserMFAManagementViewProps> = {}) {
    const props = createMockUserMFAManagementViewProps(overrides);
    renderWithProviders(<UserMFAManagementView {...props} />);
    return props;
  }

  it('renders error state', () => {
    setupView({ error: 'Some error' });
    expect(screen.getByText(/component_error\.title/i)).toBeInTheDocument();
    expect(screen.getByText(/component_error\.description/i)).toBeInTheDocument();
  });

  it('renders empty state if showActiveOnly and hasNoActiveFactors', () => {
    setupView({ showActiveOnly: true, hasNoActiveFactors: true });
    expect(screen.getByText(/no_active_mfa/i)).toBeInTheDocument();
  });

  it('renders factors and enroll button', () => {
    setupView();
    expect(screen.getByText(/factors.email.title/i)).toBeInTheDocument();
    expect(screen.getByText(/factors.email.description/i)).toBeInTheDocument();

    const enrollBtn = screen.getAllByRole('button', { name: /button_text/i })[0];
    expect(enrollBtn).toBeInTheDocument();
  });

  it('disables enroll button if disableEnroll is true', () => {
    setupView({ disableEnroll: true });
    const enrollBtn = screen.getAllByRole('button', { name: /button_text/i })[0];
    expect(enrollBtn).toBeDisabled();
  });

  it('renders EnrollFactorModal when enrollFactor is set', () => {
    setupView({ enrollFactor: 'email', isEnrollDialogOpen: true, enrollmentPhase: 'enterContact' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders DeleteFactorConfirmation when isDeleteDialogOpen is true', () => {
    setupView({ isDeleteDialogOpen: true, factorToDelete: { id: '1', type: 'email' } });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
