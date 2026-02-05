import type {
  SharedComponentProps,
  IdentityProvider,
  OrganizationPrivate,
  UpdateIdentityProviderRequestContentPrivate,
  SsoProviderTabMessages,
  SsoProviderDetailsMessages,
  SsoProviderDetailsSchema,
  ComponentAction,
} from '@auth0/universal-components-core';

import type { IdpConfig } from '../../config/config-idp-types';

import type { SsoProviderCreateClasses } from './sso-provider-create-types';
import type {
  SsoProviderDeleteClasses,
  SsoProviderRemoveClasses,
} from './sso-provider-delete-types';

import type { FormActionsProps } from '@/components/auth0/shared/form-actions';

/* ============ Components ============ */

export interface SsoProviderTabEditProps {
  updateAction?: ComponentAction<IdentityProvider, IdentityProvider>;
  deleteAction: ComponentAction<IdentityProvider, void>;
  deleteFromOrganizationAction: ComponentAction<IdentityProvider, void>;
}

export interface SsoProviderTabClasses
  extends SsoProviderDetailsClasses,
    SsoProviderDeleteClasses,
    SsoProviderRemoveClasses {
  'SsoProviderAttributeSyncAlert-root'?: string;
}

export interface SsoProviderDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    disabled: boolean;
    onClick?: (data: UpdateIdentityProviderRequestContentPrivate) => Promise<void>;
  };
}

export interface SsoProviderTabSchemas extends SsoProviderDetailsSchema {}

export interface SsoProviderTabProps
  extends SharedComponentProps<
    SsoProviderTabMessages,
    SsoProviderTabClasses,
    SsoProviderTabSchemas
  > {
  formActions: SsoProviderDetailsFormActions;
  idpConfig: IdpConfig | null;
  shouldAllowDeletion: boolean;
  provider: IdentityProvider | null;
  onDelete: (provider: IdentityProvider) => Promise<void>;
  onRemove: (provider: IdentityProvider) => Promise<void>;
  organization: OrganizationPrivate | null;
  isDeleting: boolean;
  isRemoving: boolean;
  hasSsoAttributeSyncWarning?: boolean;
  onAttributeSync?: () => void | Promise<void>;
  isSyncingAttributes?: boolean;
}

/* ============ Subcomponents ============ */

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
  'SsoProviderDetails-formActions'?: string;
  'ProviderDetails-root'?: string;
  'ProviderConfigure-root'?: string;
  'SsoProvider-attributeMapping'?: string;
  'SsoProviderDetails-FormActions'?: string;
}

export interface SsoProviderDetailsProps
  extends SharedComponentProps<SsoProviderDetailsMessages, SsoProviderDetailsClasses> {
  provider: IdentityProvider;
  idpConfig: IdpConfig | null;
  readOnly?: boolean;
  formActions?: SsoProviderDetailsFormActions;
}

/* ============ Hooks ============ */
