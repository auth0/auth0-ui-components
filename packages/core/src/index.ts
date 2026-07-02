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

export {
  AuthDetails,
  CoreClientInterface,
  BasicAuth0ContextInterface,
  FetcherAuthParams,
} from './auth/auth-types';

export {
  type CssImplementation,
  type DistributionChannel,
  type Framework,
  type TelemetryComponentGetter,
  type TelemetryConfig,
} from './api/telemetry';

export * from './schemas';

export * from './theme';

export * from './types';

export * from './services/my-organization';

export * from './services/my-account';

export {
  isMfaRequiredError,
  normalizeMfaRequiredError,
  normalizeFactorType,
} from './services/mfa-step-up/mfa-step-up-api-utils';
export {
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_VOICE,
} from './services/mfa-step-up/mfa-step-up-api-constants';
export type {
  MfaRequiredError,
  MfaAuthenticator,
  MfaFactorType,
  EnrollmentFactor,
  EnrollParams,
  EnrollmentResponse,
  ChallengeResponse,
  VerifyParams,
} from './services/mfa-step-up/mfa-step-up-api-types';

export * from './assets/icons';
