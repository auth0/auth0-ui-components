/**
 * Public hooks exports.
 * @module hooks
 */

// Shared hooks
export { useCoreClient, CoreClientContext } from './shared/use-core-client';
export { useTranslator } from './shared/use-translator';
export { useTheme } from './shared/use-theme';
export { useCoreClientInitialization } from './shared/use-core-client-initialization';
export { useErrorHandler } from './shared/use-error-handler';

// My Account hooks
export { useUserMFA } from './my-account/use-user-mfa';

// My Organization hooks
export { useOrganizationDetailsEdit } from './my-organization/use-organization-details-edit';
export { useDomainTable } from './my-organization/use-domain-table';
export { useProviderFormMode } from './my-organization/use-provider-form-mode';
export { useSsoDomainTab } from './my-organization/use-sso-domain-tab';
export { useSsoProviderCreate } from './my-organization/use-sso-provider-create';
export { useSsoProviderEdit } from './my-organization/use-sso-provider-edit';
export { useSsoProviderTable } from './my-organization/use-sso-provider-table';

// Member Management hooks
export { useOrganizationMemberManagement } from './my-organization/use-organization-member-management';
export { useOrganizationMemberDetail } from './my-organization/use-member-detail';

// Permissions
export { usePermissions } from './my-organization/use-permissions';
export type { UsePermissionsResult } from './my-organization/use-permissions';
