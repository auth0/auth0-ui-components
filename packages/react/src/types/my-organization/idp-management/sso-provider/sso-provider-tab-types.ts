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

import type { FormActionsProps } from '../../../../components/ui/form-actions';
import type { IdpConfig } from '../../config/config-idp-types';

import type { SsoProviderCreateClasses } from './sso-provider-create-types';
import type {
  SsoProviderDeleteClasses,
  SsoProviderRemoveClasses,
} from './sso-provider-delete-types';

/* ============ Components ============ */

export interface SsoProviderTabEditProps {
  updateAction?: ComponentAction<IdentityProvider, IdentityProvider>;
  deleteAction: ComponentAction<IdentityProvider, void>;
  deleteFromOrganizationAction: ComponentAction<IdentityProvider, void>;
}

export interface SsoProviderTabClasses
  extends SsoProviderDetailsClasses,
    SsoProviderDeleteClasses,
    SsoProviderRemoveClasses {}

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
