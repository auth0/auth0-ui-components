import type {
  SharedComponentProps,
  SsoProviderDetailsMessages,
  IdentityProvider,
  SsoProviderDetailsSchema,
  UpdateIdentityProviderRequestContentPrivate,
} from '@auth0-web-ui-components/core';

import type { FormActionsProps } from '../../../components/ui/form-actions';

export interface SsoProviderDetailsClasses {
  'SsoProviderDetails-root'?: string;
}

export interface SsoProviderDetailsFormActions extends Omit<FormActionsProps, 'nextAction'> {
  nextAction?: {
    disabled: boolean;
    onClick?: (data: UpdateIdentityProviderRequestContentPrivate) => Promise<void>;
  };
}

export interface SsoProviderDetailsProps
  extends SharedComponentProps<
    SsoProviderDetailsMessages,
    SsoProviderDetailsClasses,
    SsoProviderDetailsSchema
  > {
  provider: IdentityProvider;
  isLoading?: boolean;
  className?: string;
  formActions: SsoProviderDetailsFormActions;
}
