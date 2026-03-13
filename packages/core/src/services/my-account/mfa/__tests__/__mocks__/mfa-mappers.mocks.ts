import type { MyAccount } from '@auth0/myaccount-js';

import {
  createMockAvailableFactors,
  createMockEnrolledFactors,
  createMockEmailAuthMethod,
  createMockPhoneAuthMethod,
  createMockTotpAuthMethod,
  createMockRecoveryCodeAuthMethod,
  createMockWebAuthnRoamingAuthMethod,
  createMockWebAuthnPlatformAuthMethod,
  createMockPushNotificationAuthMethod,
} from '../../../../../internals/__mocks__/my-account/mfa/mfa.mocks';
import type { ConfirmEnrollmentOptions, EnrollOptions } from '../../mfa-types';

/**
 * Mock data for testing MFA mappers
 */

// Available Factors Mocks
export const mockAvailableFactorsResponse: MyAccount.ListFactorsResponseContent =
  createMockAvailableFactors();

export const mockEmptyAvailableFactorsResponse: MyAccount.ListFactorsResponseContent = {
  factors: [],
};

// Enrolled Factors Mocks
export const mockEnrolledFactorsResponse: MyAccount.ListAuthenticationMethodsResponseContent =
  createMockEnrolledFactors([
    createMockTotpAuthMethod('Google Authenticator'),
    createMockEmailAuthMethod('user@example.com'),
    createMockPhoneAuthMethod('+1234567890'),
  ]);

export const mockEmptyEnrolledFactorsResponse: MyAccount.ListAuthenticationMethodsResponseContent =
  {
    authentication_methods: [],
  };

export const mockSingleTotpEnrolledResponse: MyAccount.ListAuthenticationMethodsResponseContent =
  createMockEnrolledFactors([createMockTotpAuthMethod('Authy')]);

export const mockMixedConfirmationStatusResponse: MyAccount.ListAuthenticationMethodsResponseContent =
  createMockEnrolledFactors([
    createMockTotpAuthMethod('Confirmed App', { confirmed: true }),
    createMockEmailAuthMethod('unconfirmed@example.com', { confirmed: false }),
  ]);

export const mockAllFactorTypesEnrolledResponse: MyAccount.ListAuthenticationMethodsResponseContent =
  createMockEnrolledFactors([
    createMockTotpAuthMethod('TOTP App'),
    createMockEmailAuthMethod('test@example.com'),
    createMockPhoneAuthMethod('+9876543210'),
    createMockRecoveryCodeAuthMethod('backup'),
    createMockWebAuthnRoamingAuthMethod('YubiKey 5'),
    createMockWebAuthnPlatformAuthMethod('TouchID'),
    createMockPushNotificationAuthMethod(),
  ]);

// Enroll Options Mocks
export const mockEmailEnrollOptions: EnrollOptions = {
  email: 'user@example.com',
};

export const mockPhoneEnrollOptions: EnrollOptions = {
  phone_number: '+1234567890',
};

export const mockInvalidEmailEnrollOptions: EnrollOptions = {
  email: '',
};

export const mockInvalidPhoneEnrollOptions: EnrollOptions = {
  phone_number: '',
};

export const mockComplexEmailEnrollOptions: EnrollOptions = {
  email: 'user+tag@subdomain.example.co.uk',
};

export const mockInternationalPhoneEnrollOptions: EnrollOptions = {
  phone_number: '+44 20 7946 0958',
};

// Confirm Enrollment Options Mocks
export const mockConfirmEnrollmentWithOtpOptions: ConfirmEnrollmentOptions = {
  userOtpCode: '123456',
};

export const mockConfirmEnrollmentWithSpacesOtpOptions: ConfirmEnrollmentOptions = {
  userOtpCode: '  123456  ',
};

export const mockConfirmEnrollmentEmptyOtpOptions: ConfirmEnrollmentOptions = {
  userOtpCode: '',
};

export const mockConfirmEnrollmentWithOnlySpacesOtpOptions: ConfirmEnrollmentOptions = {
  userOtpCode: '   ',
};

export const mockConfirmEnrollmentNoOtpOptions: ConfirmEnrollmentOptions = {};

// Auth Session Mocks
export const mockAuthSession = 'auth_session_token_xyz123';
export const mockAuthSessionLong =
  'auth_session_very_long_token_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';

// Expected Verification Request Content Mocks
export const mockBaseVerifyRequest: MyAccount.VerifyAuthenticationMethodRequestContent = {
  auth_session: mockAuthSession,
};

export const mockVerifyRequestWithOtp: MyAccount.VerifyAuthenticationMethodRequestContent = {
  auth_session: mockAuthSession,
  otp_code: '123456',
};

/**
 * Helper function to create custom enrolled factors response
 */
export function createCustomEnrolledFactorsResponse(
  methods: MyAccount.ListAuthenticationMethodsResponseContent['authentication_methods'],
): MyAccount.ListAuthenticationMethodsResponseContent {
  return createMockEnrolledFactors(methods);
}

/**
 * Helper function to create custom available factors response
 */
export function createCustomAvailableFactorsResponse(
  factors: MyAccount.ListFactorsResponseContent['factors'],
): MyAccount.ListFactorsResponseContent {
  return { factors };
}
