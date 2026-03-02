/**
 * @auth0/universal-components-core
 *
 * Core package for Auth0 Universal Components providing:
 * - Authentication utilities and token management
 * - Internationalization (i18n) services
 * - Theme utilities and styling
 * - API client initialization
 * - Validation schemas
 *
 * @packageDocumentation
 * @internal
 */

export * from './i18n';

export * from './api';

export { createCoreClient } from './auth/core-client';

export { AuthDetails, CoreClientInterface, BasicAuth0ContextInterface } from './auth/auth-types';

export type {
  Authenticator as StepUpAuthenticator,
  AuthenticatorType,
  EnrollmentFactor,
  EnrollmentResponse,
  EnrollParams,
  ChallengeAuthenticatorParams,
  ChallengeResponse,
  VerifyParams,
} from './auth/auth-types';

export * from './schemas';

export * from './theme';

export {
  Authenticator,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  CreateAuthenticationMethodRequestContent,
  CreateAuthenticationMethodResponseContent,
} from './services/my-account/mfa/mfa-types';

export {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PHONE,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_TOTP,
  FACTOR_TYPE_RECOVERY_CODE,
  FACTOR_TYPE_WEBAUTHN_ROAMING,
  FACTOR_TYPE_WEBAUTHN_PLATFORM,
} from './services/my-account/mfa/mfa-constants';

export * from './types';

export * from './services/my-organization';

export * from './services/my-account';

export * from './services/step-up';

export * from './assets/icons';
