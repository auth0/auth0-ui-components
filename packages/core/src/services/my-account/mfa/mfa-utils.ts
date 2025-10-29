import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_WEBAUTHN_PLATFORM,
  FACTOR_TYPE_WEBAUTHN_ROAMING,
} from './mfa-constants';
import type {
  MFAType,
  EnrollOptions,
  Authenticator,
  ListFactorsResponseContent,
  ListAuthenticationMethodsResponseContent,
  CreateAuthenticationMethodRequestContent,
} from './mfa-types';

export function buildEnrollParams(
  factorType: MFAType,
  options: EnrollOptions = {},
): CreateAuthenticationMethodRequestContent {
  switch (factorType) {
    case FACTOR_TYPE_EMAIL:
      if (!options.email) {
        throw new Error('Email is required for email enrollment');
      }
      return {
        type: FACTOR_TYPE_EMAIL,
        email: options.email,
      };
    case FACTOR_TYPE_PHONE:
      if (!options.phone_number) {
        throw new Error('Phone number is required for SMS enrollment');
      }
      return {
        type: FACTOR_TYPE_PHONE,
        phone_number: options.phone_number,
      };
    case FACTOR_TYPE_TOTP:
      return { type: FACTOR_TYPE_TOTP };
    case FACTOR_TYPE_WEBAUTHN_ROAMING:
      return { type: FACTOR_TYPE_WEBAUTHN_ROAMING };
    case FACTOR_TYPE_WEBAUTHN_PLATFORM:
      return { type: FACTOR_TYPE_WEBAUTHN_PLATFORM };
    case FACTOR_TYPE_RECOVERY_CODE:
      return { type: FACTOR_TYPE_RECOVERY_CODE };
    case FACTOR_TYPE_PUSH_NOTIFICATION:
      return { type: FACTOR_TYPE_PUSH_NOTIFICATION };
    default:
      throw new Error(`Unsupported factor type: ${factorType}`);
  }
}

type AuthenticationMethod =
  ListAuthenticationMethodsResponseContent['authentication_methods'][number];

type EnrolledFactor = AuthenticationMethod & {
  type: MFAType;
};

function getFactorDisplayName(type: MFAType, enrolledFactor: EnrolledFactor): string {
  switch (type) {
    case FACTOR_TYPE_PHONE:
      return 'phone_number' in enrolledFactor && typeof enrolledFactor.phone_number === 'string'
        ? enrolledFactor.phone_number || 'SMS'
        : 'SMS';
    case FACTOR_TYPE_EMAIL:
      return 'email' in enrolledFactor && typeof enrolledFactor.email === 'string'
        ? enrolledFactor.email || 'Email'
        : 'Email';
    case FACTOR_TYPE_RECOVERY_CODE:
      if (enrolledFactor.id && enrolledFactor.id.includes('|')) {
        const name = enrolledFactor.id.split('|')[1];
        return name;
      }
      return 'Recovery Codes';
    case FACTOR_TYPE_TOTP:
      if (enrolledFactor.id && enrolledFactor.id.includes('|')) {
        const name = enrolledFactor.id.split('|')[1];
        return name;
      }
      return 'Authenticator App';
    default:
      return 'name' in enrolledFactor && enrolledFactor.name ? enrolledFactor.name : type;
  }
}

function createAuthenticator(
  type: MFAType,
  id: string,
  enrolled: boolean,
  created_at: string | null,
  enrolledFactor?: EnrolledFactor,
): Authenticator {
  return {
    id,
    type,
    enrolled,
    name: enrolledFactor ? getFactorDisplayName(type, enrolledFactor) : type,
    created_at,
  };
}

export function transformMyAccountFactors(
  availableFactorsResponse: ListFactorsResponseContent,
  enrolledFactors: ListAuthenticationMethodsResponseContent,
  onlyActive: boolean,
): Partial<Record<MFAType, Authenticator[]>> {
  const result: Partial<Record<MFAType, Authenticator[]>> = {};

  const confirmedFactors = enrolledFactors.authentication_methods.filter(
    (factor): factor is EnrolledFactor => {
      return !('confirmed' in factor) || factor.confirmed !== false;
    },
  );

  if (onlyActive) {
    // Only return confirmed enrolled factors
    for (const factor of confirmedFactors) {
      const mfaType = factor.type;

      if (!result[mfaType]) {
        result[mfaType] = [];
      }

      result[mfaType]!.push(
        createAuthenticator(mfaType, factor.id, true, factor.created_at, factor),
      );
    }
    return result;
  }

  // Full listing: enrolled + unenrolled placeholders
  const enrolledByType = new Map<MFAType, EnrolledFactor[]>();

  // Group confirmed enrolled factors by type
  for (const factor of confirmedFactors) {
    const mfaType = factor.type;
    if (!enrolledByType.has(mfaType)) {
      enrolledByType.set(mfaType, []);
    }
    enrolledByType.get(mfaType)!.push(factor);
  }

  // Process all available factor types
  for (const availableFactor of availableFactorsResponse.factors) {
    const mfaType = availableFactor.type as MFAType;

    const skipFactors = [FACTOR_TYPE_WEBAUTHN_PLATFORM, FACTOR_TYPE_WEBAUTHN_ROAMING];
    if (skipFactors.includes(mfaType)) {
      continue;
    }

    if (!result[mfaType]) {
      result[mfaType] = [];
    }

    const enrolled = enrolledByType.get(mfaType) || [];

    if (enrolled.length > 0) {
      // Add enrolled factors
      for (const factor of enrolled) {
        result[mfaType]!.push(
          createAuthenticator(mfaType, factor.id, true, factor.created_at, factor),
        );
      }
    } else {
      // Add placeholder for unenrolled factor type
      result[mfaType]!.push(createAuthenticator(mfaType, `placeholder-${mfaType}`, false, null));
    }
  }

  return result;
}
