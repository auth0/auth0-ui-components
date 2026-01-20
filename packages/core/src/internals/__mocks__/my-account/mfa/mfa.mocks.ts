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
  EnrolledFactor,
  ListAuthenticationMethodsResponseContent,
  ListFactorsResponseContent,
  MFAType,
} from '../../../../services/my-account/mfa/mfa-types';

type MockEmailAuthMethod = EnrolledFactor & { email: string };
type MockPhoneAuthMethod = EnrolledFactor & { phone_number: string };
type MockWebAuthnAuthMethod = EnrolledFactor & { name: string };

/**
 * Default usage for MFA authentication methods.
 */
const DEFAULT_USAGE: ['secondary'] = ['secondary'];

const createBaseAuthMethod = () => ({
  id: '',
  created_at: '2024-01-01T00:00:00.000Z',
  confirmed: true,
  usage: DEFAULT_USAGE,
});

/**
 * Creates a mock enrolled authentication method.
 */
export const createMockAuthenticationMethod = (
  overrides?: Partial<EnrolledFactor>,
): EnrolledFactor => ({
  ...createBaseAuthMethod(),
  id: 'auth_method_123',
  type: FACTOR_TYPE_TOTP as MFAType,
  ...overrides,
});

/**
 * Creates a mock email authentication method
 */
export const createMockEmailAuthMethod = (
  email = 'user@example.com',
  overrides?: Partial<MockEmailAuthMethod>,
): MockEmailAuthMethod => ({
  ...createBaseAuthMethod(),
  id: 'email|user@example.com',
  type: FACTOR_TYPE_EMAIL as MFAType,
  email,
  ...overrides,
});

/**
 * Creates a mock phone authentication method
 */
export const createMockPhoneAuthMethod = (
  phoneNumber = '+1234567890',
  overrides?: Partial<MockPhoneAuthMethod>,
): MockPhoneAuthMethod => ({
  ...createBaseAuthMethod(),
  id: 'phone|+1234567890',
  type: FACTOR_TYPE_PHONE as MFAType,
  phone_number: phoneNumber,
  ...overrides,
});

/**
 * Creates a mock TOTP authentication method
 */
export const createMockTotpAuthMethod = (
  name = 'Google Authenticator',
  overrides?: Partial<EnrolledFactor>,
): EnrolledFactor => ({
  ...createBaseAuthMethod(),
  id: `totp|${name}`,
  type: FACTOR_TYPE_TOTP as MFAType,
  ...overrides,
});

/**
 * Creates a mock recovery code authentication method
 */
export const createMockRecoveryCodeAuthMethod = (
  name = 'recovery-codes',
  overrides?: Partial<EnrolledFactor>,
): EnrolledFactor => ({
  ...createBaseAuthMethod(),
  id: `recovery-code|${name}`,
  type: FACTOR_TYPE_RECOVERY_CODE as MFAType,
  ...overrides,
});

/**
 * Creates a mock WebAuthn roaming authentication method
 */
export const createMockWebAuthnRoamingAuthMethod = (
  name = 'YubiKey',
  overrides?: Partial<MockWebAuthnAuthMethod>,
): MockWebAuthnAuthMethod => ({
  ...createBaseAuthMethod(),
  id: `webauthn-roaming|${name}`,
  type: FACTOR_TYPE_WEBAUTHN_ROAMING as MFAType,
  name,
  ...overrides,
});

/**
 * Creates a mock WebAuthn platform authentication method
 */
export const createMockWebAuthnPlatformAuthMethod = (
  name = 'TouchID',
  overrides?: Partial<MockWebAuthnAuthMethod>,
): MockWebAuthnAuthMethod => ({
  ...createBaseAuthMethod(),
  id: `webauthn-platform|${name}`,
  type: FACTOR_TYPE_WEBAUTHN_PLATFORM as MFAType,
  name,
  ...overrides,
});

/**
 * Creates a mock push notification authentication method
 */
export const createMockPushNotificationAuthMethod = (
  overrides?: Partial<EnrolledFactor>,
): EnrolledFactor => ({
  ...createBaseAuthMethod(),
  id: 'push-notification|123',
  type: FACTOR_TYPE_PUSH_NOTIFICATION as MFAType,
  ...overrides,
});

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
