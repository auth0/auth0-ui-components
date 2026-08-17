/**
 * SSO provider tab types.
 * @module sso-provider-tab-types
 */

import type {
  SharedComponentProps,
  IdpKnownResponse,
  OrganizationPrivate,
  UpdateIdentityProviderRequestContentPrivate,
  SsoProviderTabMessages,
  SsoProviderDetailsMessages,
  SsoProviderDetailsSchema,
  ComponentAction,
  GetIdpConfigurationResponseContent,
  ThirdPartyAccessMessages,
  CrossAppAccessMessages,
} from '@auth0/universal-components-core';

import type { FormActionsProps } from '@/components/auth0/shared/form-actions';
import type { SsoProviderCreateClasses } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';
import type {
  SsoProviderDeleteClasses,
  SsoProviderRemoveClasses,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-delete-types';

/** SSO provider tab edit action props. */
export interface SsoProviderTabEditProps {
  updateAction?: ComponentAction<IdpKnownResponse, IdpKnownResponse>;
  deleteAction: ComponentAction<IdpKnownResponse, void>;
  deleteFromOrganizationAction: ComponentAction<IdpKnownResponse, void>;
}

/** CSS classes for SsoProviderTab. */
export interface SsoProviderTabClasses
  extends SsoProviderDetailsClasses,
    SsoProviderDeleteClasses,
    SsoProviderRemoveClasses {
  'SsoProviderAttributeSyncAlert-root'?: string;
  'SsoProviderAttributeSyncAlert-dialogContent'?: string;
}

/** Form actions for SSO provider details. */
export interface SsoProviderDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    disabled: boolean;
    onClick?: (data: UpdateIdentityProviderRequestContentPrivate) => Promise<void>;
  };
}

/** SSO provider tab schemas. */
export interface SsoProviderTabSchemas extends SsoProviderDetailsSchema {}

/** Props for SsoProviderTab component. */
export interface SsoProviderTabProps
  extends SharedComponentProps<
    SsoProviderTabMessages,
    SsoProviderTabClasses,
    SsoProviderTabSchemas
  > {
  formActions: SsoProviderDetailsFormActions;
  idpConfig: GetIdpConfigurationResponseContent | null;
  shouldAllowDeletion: boolean;
  hideDeleteProvider?: boolean;
  hideRemoveFromOrganization?: boolean;
  hideAttributeMappings?: boolean;
  provider: IdpKnownResponse | null;
  onDelete: (provider: IdpKnownResponse) => Promise<void>;
  onRemove: (provider: IdpKnownResponse) => Promise<void>;
  organization: OrganizationPrivate | null;
  isDeleting: boolean;
  isRemoving: boolean;
  hasSsoAttributeSyncWarning?: boolean;
  onAttributeSync?: () => void | Promise<void>;
  isSyncingAttributes?: boolean;
  showThirdPartyAccess?: boolean;
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
}

export interface ProviderDetailsClasses
  extends Omit<
    SsoProviderCreateClasses,
    'SsoProviderCreate-header' | 'SsoProviderCreate-wizard' | 'ProviderSelect-root'
  > {}

export interface ProviderConfigureFieldsClasses
  extends Omit<
    SsoProviderCreateClasses,
    'SsoProviderCreate-header' | 'SsoProviderCreate-wizard' | 'ProviderSelect-root'
  > {}

export interface SsoProviderDetailsClasses {
  'ProviderDetails-root'?: string;
  'ProviderConfigure-root'?: string;
  'SsoProvider-attributeMapping'?: string;
  'SsoProviderDetails-FormActions'?: string;
  'ProviderConfigure-ThirdPartyAccess'?: string;
  'ProviderConfigure-CrossAppAccess'?: string;
}

export interface SsoProviderDetailsProps
  extends SharedComponentProps<SsoProviderDetailsMessages, SsoProviderDetailsClasses> {
  provider: IdpKnownResponse;
  idpConfig: GetIdpConfigurationResponseContent | null;
  readOnly?: boolean;
  hideAttributeMappings?: boolean;
  formActions?: SsoProviderDetailsFormActions;
  showThirdPartyAccess?: boolean;
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
}

export interface ThirdPartyAccessSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  readOnly?: boolean;
  customMessages?: Partial<ThirdPartyAccessMessages>;
  className?: string;
}

export interface CrossAppAccessSectionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  readOnly?: boolean;
  customMessages?: Partial<CrossAppAccessMessages>;
  className?: string;
  strategy?: 'oidc' | 'okta' | 'samlp';
  discoveryUrl?: string;
  onDiscoveryUrlChange?: (url: string) => void;
  discoveryUrlError?: string;
}
