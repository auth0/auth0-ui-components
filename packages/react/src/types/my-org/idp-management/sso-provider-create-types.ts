import type {
  SharedComponentProps,
  ProviderSelectMessages,
  ProviderDetailsMessages,
  IdpStrategy,
  ProviderSelectionFormValues,
  IdentityProvider,
  ProviderConfigureMessages,
  ProviderConfigureFieldsMessages,
  SsoProviderCreateMessages,
  ProviderDetailsFormValues,
  ProviderConfigureFormValues,
  SsoProviderFormValues,
  SsoProviderSchema,
  ComponentAction,
  BackButton,
  CreateIdentityProviderRequestContentPrivate,
} from '@auth0-web-ui-components/core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

export interface SsoProviderCreateClasses {
  'SsoProviderCreate-header'?: string;
  'SsoProviderCreate-wizard'?: string;
  'ProviderSelect-root'?: string;
  'ProviderDetails-root'?: string;
  'ProviderConfigure-root'?: string;
}

export interface ProviderSelectProps
  extends SharedComponentProps<ProviderSelectMessages, SsoProviderCreateClasses> {
  strategyList: IdpStrategy[];
  onClickStrategy: (strategy: IdpStrategy) => void;
  selectedStrategy?: IdpStrategy | null;
  form?: UseFormReturn<ProviderSelectionFormValues>;
  className?: string;
}

export interface ProviderDetailsProps
  extends SharedComponentProps<ProviderDetailsMessages, SsoProviderCreateClasses> {
  initialData?: Partial<ProviderDetailsFormValues>;
  className?: string;
}

export interface ProviderConfigureProps
  extends SharedComponentProps<ProviderConfigureMessages, SsoProviderCreateClasses> {
  className?: string;
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
}

export interface ProviderConfigureFieldsProps
  extends SharedComponentProps<ProviderConfigureFieldsMessages, SsoProviderCreateClasses> {
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
  className?: string;
}

export interface SsoProviderCreateBackButton extends Omit<BackButton, 'onClick'> {
  icon?: LucideIcon;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export interface SsoProviderCreateProps
  extends SharedComponentProps<
    SsoProviderCreateMessages,
    SsoProviderCreateClasses,
    SsoProviderSchema
  > {
  create: ComponentAction<CreateIdentityProviderRequestContentPrivate, IdentityProvider>;
  backButton?: SsoProviderCreateBackButton;
  onPrevious?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
  onNext?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
}

export interface UseSsoProviderCreateOptions {
  create?: SsoProviderCreateProps['create'];
  customMessages?: SsoProviderCreateProps['customMessages'];
}
