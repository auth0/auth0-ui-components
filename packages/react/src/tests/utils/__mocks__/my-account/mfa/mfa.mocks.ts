import type { Authenticator, MFAType } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type {
  UserMFAMgmtHandlerProps,
  UserMFAMgmtLogicProps,
} from '@/types/my-account/mfa/mfa-types';

export const createMockAuthenticator = (overrides?: Partial<Authenticator>): Authenticator => ({
  id: 'auth_mock123',
  type: 'totp',
  enrolled: true,
  created_at: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

type MockOTPEnrollmentResponse = {
  id: string;
  barcode_uri: string;
  secret: string;
  auth_session: string;
  manual_input_code: string;
};

export const createMockOTPEnrollmentResponse = (
  overrides: Partial<MockOTPEnrollmentResponse> = {},
): MockOTPEnrollmentResponse => ({
  id: 'new_auth_123',
  barcode_uri: 'otpauth://totp/test',
  secret: 'TESTSECRET123',
  auth_session: 'test_session_123',
  manual_input_code: 'MANUAL123',
  ...overrides,
});

export const createMockTOTPAuthenticator = (): Authenticator =>
  createMockAuthenticator({
    id: 'auth_totp_123',
    type: 'totp',
    enrolled: true,
  });

export const createMockPhoneAuthenticator = (): Authenticator =>
  createMockAuthenticator({
    id: 'auth_phone_123',
    type: 'phone',
    enrolled: true,
  });

export const createMockPushNotificationAuthenticator = (): Authenticator =>
  createMockAuthenticator({
    id: 'auth_push_123',
    type: 'push-notification',
    enrolled: true,
  });

export const createMockEmailAuthenticator = (): Authenticator =>
  createMockAuthenticator({
    id: 'auth_email_123',
    type: 'email',
    email: 'user@example.com',
    enrolled: true,
  });

export const createMockWebAuthnAuthenticator = (): Authenticator =>
  createMockAuthenticator({
    id: 'auth_webauthn_123',
    type: 'webauthn-roaming',
    name: 'YubiKey 5',
    enrolled: true,
  });

export const createMockAuthenticationMethodsResponse = (
  authenticators: Authenticator[] = [createMockAuthenticator()],
) => ({
  authentication_methods: authenticators,
});

export const createMockUnenrolledAuthenticator = (type: MFAType = 'totp'): Authenticator =>
  createMockAuthenticator({
    id: `auth_${type}_unenrolled`,
    type,
    enrolled: false,
    created_at: null,
  });

export const createMockUnconfirmedAuthenticator = (): Authenticator =>
  createMockAuthenticator({
    id: 'auth_unconfirmed_123',
    type: 'email',
    email: 'user@example.com',
    enrolled: true,
    confirmed: false,
  });

export const createMockAuthenticatorsList = (): Authenticator[] => [
  createMockTOTPAuthenticator(),
  createMockPhoneAuthenticator(),
  createMockEmailAuthenticator(),
];

export const createMockEmptyAuthenticatorsList = (): Authenticator[] => [];

export const createMockAvailableFactors = () => ({
  factors: [
    { type: 'totp', enabled: true },
    { type: 'phone', enabled: true },
    { type: 'email', enabled: true },
    { type: 'push-notification', enabled: true },
  ],
});

export const createMockEmptyAuthenticationMethods = () => ({
  authentication_methods: [],
});

export const createMockAPIError = (message: string, statusCode?: number) => {
  const error = new Error(message) as Error & { statusCode?: number; code?: string };
  if (statusCode) {
    error.statusCode = statusCode;
  }
  return error;
};

export const createMockUserMFAMgmtLogic = (
  logicOverrides: Partial<UserMFAMgmtLogicProps> = {},
): UserMFAMgmtLogicProps => ({
  isLoading: false,
  isDeleting: false,
  customMessages: {},
  hideHeader: false,
  showActiveOnly: false,
  disableEnroll: false,
  disableDelete: false,
  readOnly: false,
  factorConfig: {},
  error: null,
  schema: undefined,
  dialogOpen: false,
  enrollFactor: null,
  isDeleteDialogOpen: false,
  factorToDelete: null,
  factorsByType: {
    email: [
      {
        id: '2',
        type: 'email',
        enrolled: false,
        created_at: null,
      },
    ],
    phone: [],
    'push-notification': [],
    totp: [],
    'webauthn-roaming': [],
    'webauthn-platform': [],
    'recovery-code': [],
  },
  visibleFactorTypes: ['email'],
  hasNoActiveFactors: false,
  confirmEnrollment: vi.fn(),
  styling: undefined,
  ...logicOverrides,
});

export const createMockUserMFAMgmtHandlers = (
  handlerOverrides: Partial<UserMFAMgmtHandlerProps> = {},
): UserMFAMgmtHandlerProps => ({
  enrollMfa: vi.fn(),
  onEnrollFactor: vi.fn(),
  onDeleteFactor: vi.fn(),
  handleCloseDialog: vi.fn(),
  handleEnrollError: vi.fn(),
  handleEnrollSuccess: vi.fn(),
  handleConfirmDelete: vi.fn(),
  setIsDeleteDialogOpen: vi.fn(),
  ...handlerOverrides,
});
