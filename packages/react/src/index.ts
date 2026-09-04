/**
 * Unified entry point for Auth0 UI components, hooks & types.
 */

// Components
//
// Composability: each block component below is re-exported from its
// `.composable` module (the Tier-1 callable default plus the compound parts:
// `Root`, and where the architecture supports them `Header`/`Content`/action
// parts). The paired `*View` stays sourced from the base module. Tier-4 headless
// model hooks are re-exported under stable `use*Model` aliases further below.
export { UserMFAManagementView } from './components/auth0/my-account/user-mfa-management';
export { UserMFAManagement } from './components/auth0/my-account/user-mfa-management.composable';
export { UserPasskeyManagementView } from './components/auth0/my-account/user-passkey-management';
export { UserPasskeyManagement } from './components/auth0/my-account/user-passkey-management.composable';
export { SsoProviderEditView } from './components/auth0/my-organization/sso-provider-edit';
export { SsoProviderEdit } from './components/auth0/my-organization/sso-provider-edit.composable';
export { SsoProviderCreateView } from './components/auth0/my-organization/sso-provider-create';
export { SsoProviderCreate } from './components/auth0/my-organization/sso-provider-create.composable';
export { SsoProviderTableView } from './components/auth0/my-organization/sso-provider-table';
export { SsoProviderTable } from './components/auth0/my-organization/sso-provider-table.composable';
export { DomainTableView } from './components/auth0/my-organization/domain-table';
export { DomainTable } from './components/auth0/my-organization/domain-table.composable';
export { OrganizationMemberManagementView } from './components/auth0/my-organization/organization-member-management';
export { OrganizationMemberManagement } from './components/auth0/my-organization/organization-member-management.composable';
export { OrganizationMemberDetailView } from './components/auth0/my-organization/organization-member-detail';
export { OrganizationMemberDetail } from './components/auth0/my-organization/organization-member-detail.composable';
export { OrganizationDetailsEditView } from './components/auth0/my-organization/organization-details-edit';
export { OrganizationDetailsEdit } from './components/auth0/my-organization/organization-details-edit.composable';

// Shared hooks
export { useCoreClient, CoreClientContext } from './hooks/shared/use-core-client';
export { useTranslator } from './hooks/shared/use-translator';
export { useTheme } from './hooks/shared/use-theme';
export { useCoreClientInitialization } from './hooks/shared/use-core-client-initialization';
export { useErrorHandler } from './hooks/shared/use-error-handler';

// My Account hooks
export { useUserMFA } from './hooks/my-account/use-user-mfa';
export { useUserPasskey } from './hooks/my-account/use-user-passkey';
// Tier-4 headless aliases — stable public names for the model hooks.
export { useUserMFA as useUserMFAModel } from './hooks/my-account/use-user-mfa';
export { useUserPasskey as useUserPasskeyModel } from './hooks/my-account/use-user-passkey';

// My Organization hooks
export { useConfig } from './hooks/my-organization/shared/services/use-config-service';
export { useIdpConfig } from './hooks/my-organization/shared/services/use-idp-config-service';
export { useOrganizationDetailsEdit } from './hooks/my-organization/use-organization-details-edit';
export { useOrganizationDetailsEdit as useOrganizationDetailsEditModel } from './hooks/my-organization/use-organization-details-edit';
export { useDomainTable } from './hooks/my-organization/use-domain-table';
export { useDomainTable as useDomainTableModel } from './hooks/my-organization/use-domain-table';
export { useProviderFormMode } from './hooks/my-organization/use-provider-form-mode';
export { useSsoDomainTab } from './hooks/my-organization/use-sso-domain-tab';
export { useSsoProviderCreate } from './hooks/my-organization/use-sso-provider-create';
export { useSsoProviderCreate as useSsoProviderCreateModel } from './hooks/my-organization/use-sso-provider-create';
export { useSsoProviderEdit } from './hooks/my-organization/use-sso-provider-edit';
export { useSsoProviderEdit as useSsoProviderEditModel } from './hooks/my-organization/use-sso-provider-edit';
export { useSsoProviderTable } from './hooks/my-organization/use-sso-provider-table';
// Tier-4 headless alias — stable public name for the model hook.
export { useSsoProviderTable as useSsoProviderTableModel } from './hooks/my-organization/use-sso-provider-table';

// Member Management hooks
export { useOrganizationMemberManagement } from './hooks/my-organization/use-organization-member-management';
export { useOrganizationMemberManagement as useOrganizationMemberManagementModel } from './hooks/my-organization/use-organization-member-management';
export { useOrganizationMemberDetail } from './hooks/my-organization/use-member-detail';
export { useOrganizationMemberDetail as useOrganizationMemberDetailModel } from './hooks/my-organization/use-member-detail';

// Auth types
export * from './types/auth-types';

// My Account types
export * from './types/my-account/user-mfa-management/user-mfa-management-types';
export * from './types/my-account/user-passkey-management/user-passkey-management-types';

// My Organization types
export * from './types/my-organization/config/config-types';
export * from './types/my-organization/config/config-idp-types';
export * from './types/my-organization/domain-management/domain-configure-types';
export * from './types/my-organization/domain-management/domain-create-types';
export * from './types/my-organization/domain-management/domain-delete-types';
export * from './types/my-organization/domain-management/domain-table-types';
export * from './types/my-organization/domain-management/domain-verify-types';
export * from './types/my-organization/idp-management/sso-domain/sso-domain-tab-types';
export * from './types/my-organization/idp-management/sso-provider/sso-provider-create-types';
export * from './types/my-organization/idp-management/sso-provider/sso-provider-delete-types';
export * from './types/my-organization/idp-management/sso-provider/sso-provider-edit-types';
export * from './types/my-organization/idp-management/sso-provider/sso-provider-tab-types';
export * from './types/my-organization/idp-management/sso-provider/sso-provider-table-types';
export * from './types/my-organization/idp-management/sso-provisioning/provisioning-manage-token-types';
export * from './types/my-organization/idp-management/sso-provisioning/provisioning-token-types';
export * from './types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';
export * from './types/my-organization/organization-management/organization-details-edit-types';
export * from './types/my-organization/organization-management/organization-details-types';
export * from './types/my-organization/member-management/organization-invitation-table-types';
export * from './types/my-organization/member-management/organization-member-management-types';
export * from './types/my-organization/member-management/organization-member-detail-types';
export * from './types/my-organization/member-management/organization-member-table-types';
