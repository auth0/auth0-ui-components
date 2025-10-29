import type {
  MFAType,
  Authenticator,
  ConfirmEnrollmentOptions,
  VerifyAuthenticationMethodRequestContent,
  EnrollOptions,
  ListFactorsResponseContent,
  ListAuthenticationMethodsResponseContent,
} from './mfa-types';
import { transformMyAccountFactors, buildEnrollParams } from './mfa-utils';

export const MFAMappers = {
  fromAPI(
    availableFactorsResponse: ListFactorsResponseContent,
    enrolledFactorsResponse: ListAuthenticationMethodsResponseContent,
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
  ): VerifyAuthenticationMethodRequestContent {
    const baseParams = { auth_session: authSession };
    return ['totp', 'phone', 'email'].includes(factorType) && options.userOtpCode?.trim()
      ? { ...baseParams, otp_code: options.userOtpCode.trim() }
      : baseParams;
  },
};
