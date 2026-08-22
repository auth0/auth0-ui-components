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

// i18n
export { createI18nService, I18nUtils } from './i18n/i18n-service';
export type {
  LangTranslations,
  I18nInitOptions,
  TranslationFunction,
  TFactory,
  I18nServiceInterface,
  EnhancedTranslationFunction,
} from './i18n/i18n-types';

// i18n custom messages - my-account
export * from './i18n/custom-messages/my-account/user-mfa-management/user-mfa-types';
export * from './i18n/custom-messages/my-account/user-mfa-management/user-mfa-delete-types';
export * from './i18n/custom-messages/my-account/user-mfa-management/user-mfa-enrollment-types';
export * from './i18n/custom-messages/my-account/user-mfa-management/user-mfa-factors-list-types';
export * from './i18n/custom-messages/my-account/user-passkey-management/user-passkey-management-types';

// i18n custom messages - my-organization idp-management
export * from './i18n/custom-messages/my-organization/idp-management/sso-provisioning/provisioning-token-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-provisioning/provisioning-manage-token-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-provider/sso-provider-create-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-provider/sso-provider-delete-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-provider/sso-provider-edit-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-provider/sso-provider-table-types';
export * from './i18n/custom-messages/my-organization/idp-management/sso-domain/sso-domain-tab-types';

// i18n custom messages - my-organization organization-management
export * from './i18n/custom-messages/my-organization/organization-management/organization-details-types';
export * from './i18n/custom-messages/my-organization/organization-management/organization-details-edit-types';
export * from './i18n/custom-messages/my-organization/organization-management/organization-delete-types';

// i18n custom messages - my-organization domain-management
export * from './i18n/custom-messages/my-organization/domain-management/domain-create-types';
export * from './i18n/custom-messages/my-organization/domain-management/domain-delete-types';
export * from './i18n/custom-messages/my-organization/domain-management/domain-configure-types';
export * from './i18n/custom-messages/my-organization/domain-management/domain-verify-types';
export * from './i18n/custom-messages/my-organization/domain-management/domain-table-types';

// i18n custom messages - my-organization member-management
export * from './i18n/custom-messages/my-organization/member-management/invitation-tab-types';
export * from './i18n/custom-messages/my-organization/member-management/member-management-types';
export * from './i18n/custom-messages/my-organization/member-management/member-tab-types';

// API
export * from './api/api-error';
export * from './api/business-error';
export * from './api/error-utils';
export * from './api/http-constants';
export * from './api/telemetry';

// Auth
export { createCoreClient } from './auth/core-client';

export {
  AuthDetails,
  CoreClientInterface,
  BasicAuth0ContextInterface,
  FetcherAuthParams,
} from './auth/auth-types';

// Schemas
export * from './schemas/my-account/mfa/email-schema';
export * from './schemas/my-account/mfa/sms-schema';

export * from './schemas/my-organization/organization-management/organization-details-schema';
export * from './schemas/my-organization/organization-management/organization-details-schema-types';

export * from './schemas/my-organization/idp-management/sso-provider/sso-provider-create-schema';
export * from './schemas/my-organization/idp-management/sso-provider/sso-provider-delete-schema';
export * from './schemas/my-organization/idp-management/sso-provisioning/sso-provisioning-edit-schema';
export * from './schemas/my-organization/idp-management/sso-provider/sso-provider-create-schema-types';
export * from './schemas/my-organization/idp-management/sso-provider/sso-provider-delete-schema-types';
export * from './schemas/my-organization/idp-management/sso-provisioning/sso-provisioning-edit-schema-types';
export * from './schemas/my-organization/idp-management/sso-provider-edit-schema-types';

export * from './schemas/my-organization/domain-management/domain-create-schema';
export * from './schemas/my-organization/domain-management/domain-create-schema-types';

export * from './schemas/my-organization/member-management/invitations/invitation-schema';
export * from './schemas/my-organization/member-management/invitations/invitation-create-schema';
export * from './schemas/my-organization/member-management/invitations/invitation-create-schema-types';

export * from './schemas/common/common-schemas';

// Theme
export * from './theme/theme-utils';
export * from './theme/theme-types';

// Types
export * from './types';

export {
  configQueryKeys,
  idpConfigQueryKeys,
} from './services/my-organization/config/config-query-keys';

// My Organization services
export * from './services/my-organization/organization-management/organization-details-types';
export * from './services/my-organization/organization-management/organization-details-factory';
export * from './services/my-organization/organization-management/organization-details-mappers';
export * from './services/my-organization/organization-management/organization-details-constants';
export * from './services/my-organization/organization-management/organization-details-query-keys';
export * from './services/my-organization/organization-management/organization-details-permissions';

export * from './services/my-organization/idp-management/sso-provider/sso-provider-types';
export * from './services/my-organization/idp-management/sso-provisioning/sso-provisioning-types';
export * from './services/my-organization/idp-management/sso-provider/sso-provider-constants';
export * from './services/my-organization/idp-management/sso-provider/sso-provider-mappers';
export * from './services/my-organization/idp-management/sso-provider/sso-provider-query-keys';
export * from './services/my-organization/idp-management/idp-management-permissions';

export * from './services/my-organization/domain-management/domain-types';
export * from './services/my-organization/domain-management/domain-query-keys';
export * from './services/my-organization/domain-management/domain-management-permissions';

export * from './services/my-organization/member-management/member-management-types';
export * from './services/my-organization/member-management/member-management-constants';
export * from './services/my-organization/member-management/member-management-permissions';

export * from './services/my-organization/config/config-types';

// Permissions (shared across modules)
export * from './services/permissions/permission-utils';
export * from './services/permissions/permission-types';
export * from './services/permissions/permission-map';
export * from './services/permissions/permission-api-types';

// My Account services
export * from './services/my-account/user-mfa-management/user-mfa-management-types';
export * from './services/my-account/user-mfa-management/user-mfa-management-constants';
export * from './services/my-account/user-mfa-management/user-mfa-management-utils';
export * from './services/my-account/user-mfa-management/user-mfa-management-mappers';

export * from './services/my-account/user-passkey-management/user-passkey-management-constants';
export * from './services/my-account/user-passkey-management/user-passkey-management-types';
export * from './services/my-account/user-passkey-management/user-passkey-management-utils';

// MFA Step-Up services
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

// Icons
export * from './assets/icons/icons';
