import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_WEBAUTHN_PLATFORM,
  FACTOR_TYPE_WEBAUTHN_ROAMING,
} from '../../../../services/my-account/mfa/mfa-constants';
import type {
  Authenticator,
  ListAuthenticationMethodsResponseContent,
  ListFactorsResponseContent,
  MFAType,
} from '../../../../services/my-account/mfa/mfa-types';

type AuthenticationMethod =
  ListAuthenticationMethodsResponseContent['authentication_methods'][number];

/**
 * Default usage for MFA authentication methods.
 */
const DEFAULT_USAGE: ['secondary'] = ['secondary'];

/**
 * Base properties shared by all MFA authentication methods.
 */
const createBaseAuthMethod = () => ({
  created_at: '2024-01-01T00:00:00.000Z',
  confirmed: true,
  usage: DEFAULT_USAGE,
});

/**
 * Creates a mock enrolled authentication method
 */
export const createMockAuthenticationMethod = (
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: 'auth_method_123',
    type: FACTOR_TYPE_TOTP,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock email authentication method
 */
export const createMockEmailAuthMethod = (
  email = 'user@example.com',
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: 'email|user@example.com',
    type: FACTOR_TYPE_EMAIL,
    email,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock phone authentication method
 */
export const createMockPhoneAuthMethod = (
  phoneNumber = '+1234567890',
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: 'phone|+1234567890',
    type: FACTOR_TYPE_PHONE,
    phone_number: phoneNumber,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock TOTP authentication method
 */
export const createMockTotpAuthMethod = (
  name = 'Google Authenticator',
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: `totp|${name}`,
    type: FACTOR_TYPE_TOTP,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock recovery code authentication method
 */
export const createMockRecoveryCodeAuthMethod = (
  name = 'recovery-codes',
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: `recovery-code|${name}`,
    type: FACTOR_TYPE_RECOVERY_CODE,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock WebAuthn roaming authentication method
 */
export const createMockWebAuthnRoamingAuthMethod = (
  name = 'YubiKey',
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: `webauthn-roaming|${name}`,
    type: FACTOR_TYPE_WEBAUTHN_ROAMING,
    name,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock WebAuthn platform authentication method
 */
export const createMockWebAuthnPlatformAuthMethod = (
  name = 'TouchID',
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: `webauthn-platform|${name}`,
    type: FACTOR_TYPE_WEBAUTHN_PLATFORM,
    name,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock push notification authentication method
 */
export const createMockPushNotificationAuthMethod = (
  overrides?: Partial<AuthenticationMethod>,
): AuthenticationMethod =>
  ({
    ...createBaseAuthMethod(),
    id: 'push-notification|123',
    type: FACTOR_TYPE_PUSH_NOTIFICATION,
    ...overrides,
  }) as unknown as AuthenticationMethod;

/**
 * Creates a mock list of enrolled authentication methods
 */
export const createMockEnrolledFactors = (
  methods?: ListAuthenticationMethodsResponseContent['authentication_methods'],
): ListAuthenticationMethodsResponseContent => ({
  authentication_methods: methods || [
    createMockTotpAuthMethod(),
    createMockEmailAuthMethod(),
    createMockPhoneAuthMethod(),
  ],
});

/**
 * Creates a mock available factor
 */
export const createMockAvailableFactor = (
  type: MFAType,
  overrides?: Partial<ListFactorsResponseContent['factors'][number]>,
): ListFactorsResponseContent['factors'][number] => ({
  type,
  ...overrides,
});

/**
 * Creates a mock list of available factors
 */
export const createMockAvailableFactors = (
  factors?: ListFactorsResponseContent['factors'],
): ListFactorsResponseContent => ({
  factors: factors || [
    createMockAvailableFactor(FACTOR_TYPE_EMAIL as MFAType),
    createMockAvailableFactor(FACTOR_TYPE_PHONE as MFAType),
    createMockAvailableFactor(FACTOR_TYPE_TOTP as MFAType),
    createMockAvailableFactor(FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType),
    createMockAvailableFactor(FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType),
    createMockAvailableFactor(FACTOR_TYPE_RECOVERY_CODE as MFAType),
    createMockAvailableFactor(FACTOR_TYPE_PUSH_NOTIFICATION as MFAType),
  ],
});

/**
 * Creates a mock authenticator
 */
export const createMockAuthenticator = (overrides?: Partial<Authenticator>): Authenticator => ({
  id: 'auth_123',
  type: FACTOR_TYPE_TOTP as MFAType,
  enrolled: true,
  name: 'Authenticator App',
  created_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Creates an empty enrolled factors response
 */
export const createEmptyEnrolledFactors = (): ListAuthenticationMethodsResponseContent => ({
  authentication_methods: [],
});

/**
 * Creates an empty available factors response
 */
export const createEmptyAvailableFactors = (): ListFactorsResponseContent => ({
  factors: [],
});
