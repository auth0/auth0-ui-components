import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_OTP,
} from './mfa-constants';
import type {
  EnrollMfaParams,
  ConfirmMfaEnrollmentParams,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
} from './mfa-types';

/**
 * Builds the parameters for an MFA enrollment request based on the factor type and options.
 *
 * @param factorName - The type of MFA factor to enroll
 * @param options - Factor-specific enrollment options
 * @returns The parameters required for the enrollment API call
 * @throws Error if required options for the factor type are missing
 */
export function buildEnrollParams(
  factorName: MFAType,
  options: EnrollOptions = {},
): EnrollMfaParams {
  switch (factorName) {
    case FACTOR_TYPE_SMS:
      if (!options.phone_number) {
        throw new Error('Phone number is required for SMS enrollment');
      }
      return {
        authenticator_types: ['oob'],
        oob_channels: ['sms'],
        phone_number: options.phone_number,
      };

    case FACTOR_TYPE_EMAIL:
      if (!options.email) {
        throw new Error('Email is required for email enrollment');
      }
      return {
        authenticator_types: ['oob'],
        oob_channels: ['email'],
        email: options.email,
      };

    case FACTOR_TYPE_OTP:
      return {
        authenticator_types: ['otp'],
      };

    case FACTOR_TYPE_PUSH_NOTIFICATION:
      return {
        authenticator_types: ['oob'],
        oob_channels: ['auth0'],
      };

    default:
      throw new Error(`Unsupported factor type: ${factorName}`);
  }
}

/**
 * Builds the parameters for an MFA confirmation request based on the factor type and options.
 *
 * @param factorName - The type of MFA factor being confirmed
 * @param options - Confirmation options including codes and tokens
 * @param clientId - The client ID (optional, used in non-proxy mode)
 * @param mfaToken - The MFA token for authorization
 * @returns The parameters required for the confirmation API call
 */
export function buildConfirmParams(
  factorName: MFAType,
  options: ConfirmEnrollmentOptions,
  clientId?: string,
  mfaToken?: string,
): ConfirmMfaEnrollmentParams {
  const baseParams: ConfirmMfaEnrollmentParams = {
    grant_type:
      factorName === FACTOR_TYPE_OTP
        ? 'http://auth0.com/oauth/grant-type/mfa-otp'
        : 'http://auth0.com/oauth/grant-type/mfa-oob',
    oob_code: options.oobCode,
    client_id: clientId,
    mfa_token: mfaToken,
  };

  if (factorName === FACTOR_TYPE_OTP) {
    baseParams.otp = options.userOtpCode;
  } else if (
    [FACTOR_TYPE_SMS, FACTOR_TYPE_EMAIL, FACTOR_TYPE_PUSH_NOTIFICATION].includes(factorName)
  ) {
    baseParams.binding_code = options.userOtpCode;
  }

  return baseParams;
}
