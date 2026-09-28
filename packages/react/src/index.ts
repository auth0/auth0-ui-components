/**
 * Unified entry point for Auth0 UI components, hooks & types.
 */

// Deprecated bare hook aliases are re-declared as local `const` exports (in the
// hook sections below) rather than `export { useX } from '...'`. tsup's dts
// bundler drops the JSDoc from re-export statements, so a `@deprecated` on a bare
// re-export never reaches consumers' `.d.ts`. A local `const` is emitted as its
// own declaration and carries the tag through. Each canonical `useXModel` alias
// re-exports the same impl binding and stays non-deprecated.
import { useUserMFA as useUserMFAImpl } from './hooks/my-account/use-user-mfa';
import { useUserPasskey as useUserPasskeyImpl } from './hooks/my-account/use-user-passkey';
import { useDomainTable as useDomainTableImpl } from './hooks/my-organization/use-domain-table';
import { useOrganizationMemberDetail as useOrganizationMemberDetailImpl } from './hooks/my-organization/use-member-detail';
import { useOrganizationDetailsEdit as useOrganizationDetailsEditImpl } from './hooks/my-organization/use-organization-details-edit';
import { useOrganizationMemberManagement as useOrganizationMemberManagementImpl } from './hooks/my-organization/use-organization-member-management';
import { useSsoProviderCreate as useSsoProviderCreateImpl } from './hooks/my-organization/use-sso-provider-create';
import { useSsoProviderEdit as useSsoProviderEditImpl } from './hooks/my-organization/use-sso-provider-edit';
import { useSsoProviderTable as useSsoProviderTableImpl } from './hooks/my-organization/use-sso-provider-table';

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

// Providers
export { PermissionProvider } from './providers/permission-provider';

// Shared hooks
export { useCoreClient, CoreClientContext } from './hooks/shared/use-core-client';
export { useTranslator } from './hooks/shared/use-translator';
export { useTheme } from './hooks/shared/use-theme';
export { useCoreClientInitialization } from './hooks/shared/use-core-client-initialization';
export { useErrorHandler } from './hooks/shared/use-error-handler';
export { usePermissions } from './hooks/shared/use-permissions';

// My Account hooks
/** @deprecated Use {@link useUserMFAModel} instead; the bare alias is removed next major. */
export const useUserMFA = useUserMFAImpl;
/** @deprecated Use {@link useUserPasskeyModel} instead; the bare alias is removed next major. */
export const useUserPasskey = useUserPasskeyImpl;
// Tier-4 headless aliases — stable public names for the model hooks.
export { useUserMFAImpl as useUserMFAModel, useUserPasskeyImpl as useUserPasskeyModel };

// My Organization hooks
export { useConfig } from './hooks/my-organization/shared/services/use-config-service';
export { useIdpConfig } from './hooks/my-organization/shared/services/use-idp-config-service';
/** @deprecated Use {@link useOrganizationDetailsEditModel} instead; the bare alias is removed next major. */
export const useOrganizationDetailsEdit = useOrganizationDetailsEditImpl;
export { useOrganizationDetailsEditImpl as useOrganizationDetailsEditModel };
/** @deprecated Use {@link useDomainTableModel} instead; the bare alias is removed next major. */
export const useDomainTable = useDomainTableImpl;
export { useDomainTableImpl as useDomainTableModel };
export { useProviderFormMode } from './hooks/my-organization/use-provider-form-mode';
export { useSsoDomainTab } from './hooks/my-organization/use-sso-domain-tab';
/** @deprecated Use {@link useSsoProviderCreateModel} instead; the bare alias is removed next major. */
export const useSsoProviderCreate = useSsoProviderCreateImpl;
export { useSsoProviderCreateImpl as useSsoProviderCreateModel };
/** @deprecated Use {@link useSsoProviderEditModel} instead; the bare alias is removed next major. */
export const useSsoProviderEdit = useSsoProviderEditImpl;
export { useSsoProviderEditImpl as useSsoProviderEditModel };
/** @deprecated Use {@link useSsoProviderTableModel} instead; the bare alias is removed next major. */
export const useSsoProviderTable = useSsoProviderTableImpl;
// Tier-4 headless alias — stable public name for the model hook.
export { useSsoProviderTableImpl as useSsoProviderTableModel };

// Member Management hooks
/** @deprecated Use {@link useOrganizationMemberManagementModel} instead; the bare alias is removed next major. */
export const useOrganizationMemberManagement = useOrganizationMemberManagementImpl;
export { useOrganizationMemberManagementImpl as useOrganizationMemberManagementModel };
/** @deprecated Use {@link useOrganizationMemberDetailModel} instead; the bare alias is removed next major. */
export const useOrganizationMemberDetail = useOrganizationMemberDetailImpl;
export { useOrganizationMemberDetailImpl as useOrganizationMemberDetailModel };

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
export * from './types/permissions/permissions-types';
