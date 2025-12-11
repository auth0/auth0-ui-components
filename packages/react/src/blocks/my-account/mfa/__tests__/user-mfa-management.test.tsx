import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import * as useCoreClientModule from '../../../../hooks/use-core-client';
import {
  createMockAPIError,
  createMockAuthenticator,
  createMockAuthenticationMethodsResponse,
  createMockOTPEnrollmentResponse,
} from '../../../../internals/__mocks__';
import { renderWithProviders } from '../../../../internals/test-provider';
import { mockCore, mockToast } from '../../../../internals/test-setup';
import type { UserMFAMgmtProps } from '../../../../types/my-account/mfa/mfa-types';
import { UserMFAMgmt } from '../user-mfa-management';

// ===== Mock packages =====

mockToast();
const { initMockCoreClient } = mockCore();

// Mock sonner toast to capture and trigger callbacks
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn((_message, options) => {
      // Trigger the onAutoClose callback immediately for testing purposes
      if (options?.onAutoClose) {
        setTimeout(() => {
          options.onAutoClose();
        }, 0);
      }
    }),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// ===== Local mock creators =====

const createMockUserMFAMgmtProps = (overrides?: Partial<UserMFAMgmtProps>): UserMFAMgmtProps => ({
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

describe('UserMFAMgmt', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hideHeader', () => {
    describe('when is false', () => {
      it('should render the header with title', async () => {
        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ hideHeader: false })} />);

        await waitForComponentToLoad();

        await waitFor(() => {
          expect(document.getElementById('mfa-management-title')).toBeInTheDocument();
        });
      });
    });

    describe('when is true', () => {
      it('should not render the header', async () => {
        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ hideHeader: true })} />);

        await waitFor(() => {
          expect(document.getElementById('mfa-management-title')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('showActiveOnly', () => {
    describe('when is true and has no active factors', () => {
      it('should show empty state message', async () => {
        renderWithProviders(
          <UserMFAMgmt {...createMockUserMFAMgmtProps({ showActiveOnly: true })} />,
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
          <UserMFAMgmt {...createMockUserMFAMgmtProps({ disableEnroll: true })} />,
        );

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          buttons.forEach((button) => {
            expect(button).toHaveTextContent('button-text');
            expect(button).toBeDisabled();
          });
        });
      });
    });

    describe('when is false', () => {
      it('should enable enroll buttons', async () => {
        renderWithProviders(
          <UserMFAMgmt {...createMockUserMFAMgmtProps({ disableEnroll: false })} />,
        );

        await waitFor(() => {
          const buttons = screen.getAllByRole('button');
          expect(buttons.length).toBeGreaterThan(0);
          buttons.forEach((button) => {
            expect(button).toHaveTextContent('button-text');
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
          <UserMFAMgmt {...createMockUserMFAMgmtProps({ disableDelete: true })} />,
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
        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ readOnly: true })} />);

        await waitFor(() => {
          const buttons = screen.queryAllByRole('button', { name: /button-text/i });
          expect(buttons).toHaveLength(0);
        });
      });
    });

    describe('when is false', () => {
      it('should render action buttons', async () => {
        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ readOnly: false })} />);

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

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ factorConfig })} />);

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

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ factorConfig })} />);

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
        const onEnroll = vi.fn();

        // Mock successful enrollment response
        const apiService = mockCoreClient.getMyAccountApiClient();
        apiService.authenticationMethods.create = vi
          .fn()
          .mockResolvedValue(createMockOTPEnrollmentResponse());

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onEnroll })} />);

        await waitForComponentToLoad();

        // Click on an enroll button (e.g., for TOTP)
        const enrollButtons = screen.getAllByRole('button');
        const totpEnrollButton = enrollButtons.find(
          (btn) => btn.getAttribute('aria-label') === 'totp.button-text',
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
          const submitButton = screen.getByRole('button', { name: /submit|verifying/i });
          expect(submitButton).not.toBeDisabled();
        });

        // Click the submit button
        const submitButton = screen.getByRole('button', { name: /submit/i });
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
            expect(onEnroll).toHaveBeenCalled();
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
        const onDelete = vi.fn();

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onDelete })} />);

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
            expect(onDelete).toHaveBeenCalled();
          },
          { timeout: 3000 },
        );
      });
    });
  });

  describe('onFetch', () => {
    describe('when factors are loaded', () => {
      it('should call onFetch callback', async () => {
        const onFetch = vi.fn();

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onFetch })} />);

        await waitFor(() => {
          expect(onFetch).toHaveBeenCalled();
        });
      });
    });
  });

  describe('onErrorAction', () => {
    describe('when an enrollment error occurs', () => {
      it('should call onErrorAction callback with error details', async () => {
        const user = userEvent.setup();
        const onErrorAction = vi.fn();

        // Mock enrollment to fail with a specific error
        const apiService = mockCoreClient.getMyAccountApiClient();
        const enrollError = createMockAPIError('Failed to enroll factor', 400);
        apiService.authenticationMethods.create = vi.fn().mockRejectedValue(enrollError);

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onErrorAction })} />);

        await waitForComponentToLoad();

        // Click on an enroll button (e.g., for TOTP)
        const enrollButtons = screen.getAllByRole('button');
        const totpEnrollButton = enrollButtons.find(
          (btn) => btn.getAttribute('aria-label') === 'totp.button-text',
        );

        expect(totpEnrollButton).toBeDefined();
        await user.click(totpEnrollButton!);

        // Wait for the dialog to open and trigger the error
        // The UserMFASetupForm will attempt to enroll and call onError, which calls onErrorAction
        await waitFor(() => {
          expect(onErrorAction).toHaveBeenCalled();
        });

        // Verify callback was called with correct parameters
        expect(onErrorAction).toHaveBeenCalledTimes(1);
        expect(onErrorAction).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Failed to enroll factor',
            statusCode: 400,
          }),
          'enroll',
        );
      });
    });

    describe('when a deletion error occurs', () => {
      it('should call onErrorAction callback with deletion error details', async () => {
        const user = userEvent.setup();
        const onErrorAction = vi.fn();

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        // Mock deletion to fail with a specific error
        const deleteError = createMockAPIError('Failed to delete factor', 403);
        apiService.authenticationMethods.delete = vi.fn().mockRejectedValue(deleteError);

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onErrorAction })} />);

        await waitForComponentToLoad();

        // Find and click the actions button (three dots) to open popover
        const actionsButton = screen.getByRole('button', { name: /actions/i });
        await user.click(actionsButton);

        // Wait for popover to open and find the remove button
        await waitFor(() => {
          expect(screen.getByRole('menuitem', { name: /remove/i })).toBeInTheDocument();
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

        // Verify onErrorAction was called with deletion error
        await waitFor(
          () => {
            expect(onErrorAction).toHaveBeenCalled();
          },
          { timeout: 3000 },
        );

        expect(onErrorAction).toHaveBeenCalledTimes(1);
        expect(onErrorAction).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Failed to delete factor',
            statusCode: 403,
          }),
          'delete',
        );
      });
    });

    describe('when a verification error occurs', () => {
      it('should call onErrorAction callback with verification error details', async () => {
        const user = userEvent.setup();
        const onErrorAction = vi.fn();

        // Mock successful enrollment but failed verification
        const apiService = mockCoreClient.getMyAccountApiClient();
        apiService.authenticationMethods.create = vi
          .fn()
          .mockResolvedValue(createMockOTPEnrollmentResponse());

        // Mock verification to fail with an invalid OTP error
        const verifyError = createMockAPIError('Invalid OTP code', 400);
        apiService.authenticationMethods.verify = vi.fn().mockRejectedValue(verifyError);

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onErrorAction })} />);

        await waitForComponentToLoad();

        // Click on an enroll button (e.g., for TOTP)
        const enrollButtons = screen.getAllByRole('button');
        const totpEnrollButton = enrollButtons.find(
          (btn) => btn.getAttribute('aria-label') === 'totp.button-text',
        );

        expect(totpEnrollButton).toBeDefined();
        await user.click(totpEnrollButton!);

        // Wait for dialog to open and QR code to load
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByRole('img')).toBeInTheDocument();
        });

        // Click the "Continue" button to proceed to OTP input phase
        const continueButton = screen.getByRole('button', { name: /continue/i });
        await user.click(continueButton);

        // Wait for OTP input form to appear
        await waitFor(
          () => {
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThan(0);
          },
          { timeout: 3000 },
        );

        // Enter an invalid OTP code
        const otpInputs = screen.getAllByRole('textbox');
        await user.type(otpInputs[0]!, '9');
        await user.type(otpInputs[1]!, '9');
        await user.type(otpInputs[2]!, '9');
        await user.type(otpInputs[3]!, '9');
        await user.type(otpInputs[4]!, '9');
        await user.type(otpInputs[5]!, '9');

        // Wait for the submit button to be enabled
        await waitFor(() => {
          const submitButton = screen.getByRole('button', { name: /submit|verifying/i });
          expect(submitButton).not.toBeDisabled();
        });

        // Click the submit button
        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        // Verify onErrorAction was called with verification error
        await waitFor(() => {
          expect(onErrorAction).toHaveBeenCalled();
        });

        expect(onErrorAction).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Invalid OTP code',
            statusCode: 400,
          }),
          'confirm',
        );
      });
    });
  });

  describe('onBeforeAction', () => {
    describe('when returns true', () => {
      it('should proceed with the delete action', async () => {
        const user = userEvent.setup();
        const onBeforeAction = vi.fn(() => Promise.resolve(true));

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onBeforeAction })} />);

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
          expect(onBeforeAction).toHaveBeenCalledWith('delete', 'totp');
        });

        // Verify that delete API was called (since onBeforeAction returned true)
        await waitFor(() => {
          expect(apiService.authenticationMethods.delete).toHaveBeenCalled();
        });
      });
    });

    describe('when returns false', () => {
      it('should prevent the delete action', async () => {
        const user = userEvent.setup();
        const onBeforeAction = vi.fn(() => Promise.resolve(false));

        // Mock a factor that's already enrolled
        const apiService = mockCoreClient.getMyAccountApiClient();
        setupEnrolledTotpFactor(apiService);

        renderWithProviders(<UserMFAMgmt {...createMockUserMFAMgmtProps({ onBeforeAction })} />);

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
          expect(onBeforeAction).toHaveBeenCalledWith('delete', 'totp');
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
