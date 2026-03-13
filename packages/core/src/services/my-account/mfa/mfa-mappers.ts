/**
 * MFA data mappers for transforming API responses.
 * @module mfa-mappers
 * @internal
 */

import type { MyAccount } from '@auth0/myaccount-js';

import type { MFAType, Authenticator, ConfirmEnrollmentOptions, EnrollOptions } from './mfa-types';
import { transformMyAccountFactors, buildEnrollParams } from './mfa-utils';

/**
 * MFA data mappers for API transformations.
 * @internal
 */
export const MFAMappers = {
  fromAPI(
    availableFactorsResponse: MyAccount.ListFactorsResponseContent,
    enrolledFactorsResponse: MyAccount.ListAuthenticationMethodsResponseContent,
    onlyActive: boolean = false,
  ): Record<MFAType, Authenticator[]> {
    return transformMyAccountFactors(
      availableFactorsResponse,
      enrolledFactorsResponse,
      onlyActive,
    ) as Record<MFAType, Authenticator[]>;
  },
  buildEnrollParams(factorType: MFAType, options: EnrollOptions = {}) {
    return buildEnrollParams(factorType, options);
  },

  buildConfirmEnrollmentParams(
    factorType: MFAType,
    authSession: string,
    options: ConfirmEnrollmentOptions,
  ): MyAccount.VerifyAuthenticationMethodRequestContent {
    const baseParams = { auth_session: authSession };
    return ['totp', 'phone', 'email'].includes(factorType) && options.userOtpCode?.trim()
      ? { ...baseParams, otp_code: options.userOtpCode.trim() }
      : baseParams;
  },
};
