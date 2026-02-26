/**
 * SSO provider create types.
 * @module sso-provider-create-types
 */

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
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { IdpConfig } from '@/types/my-organization/config/config-idp-types';

export interface ProviderConfigureHandle {
  validate: () => Promise<boolean>;
  getData: () => ProviderConfigureFormValues;
}

export interface ProviderDetailsFormHandle {
  validate: () => Promise<boolean>;
  getData: () => ProviderDetailsFormValues;
  isDirty: () => boolean;
  reset: (data?: ProviderDetailsFormValues) => void;
}

/** Form mode for provider configuration. */
export type FormMode = 'create' | 'edit';

/** CSS classes for SsoProviderCreate. */
export interface SsoProviderCreateClasses {
  'SsoProviderCreate-header'?: string;
  'SsoProviderCreate-wizard'?: string;
  'ProviderSelect-root'?: string;
  'ProviderDetails-root'?: string;
  'ProviderConfigure-root'?: string;
}

/** Props for ProviderSelect component. */
export interface ProviderSelectProps
  extends SharedComponentProps<ProviderSelectMessages, SsoProviderCreateClasses> {
  isLoading: boolean;
  strategyList: IdpStrategy[];
  onClickStrategy: (strategy: IdpStrategy) => void;
  selectedStrategy?: IdpStrategy | null;
  form?: UseFormReturn<ProviderSelectionFormValues>;
  className?: string;
}

/** Props for ProviderDetails component. */
export interface ProviderDetailsProps
  extends SharedComponentProps<ProviderDetailsMessages, SsoProviderCreateClasses> {
  initialData?: Partial<ProviderDetailsFormValues>;
  className?: string;
  hideHeader?: boolean;
  mode: 'edit' | 'create';
  onFormDirty?: (isDirty: boolean) => void;
}

/** Props for ProviderConfigure component. */
export interface ProviderConfigureProps
  extends SharedComponentProps<ProviderConfigureMessages, SsoProviderCreateClasses> {
  className?: string;
  isLoading: boolean;
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
  idpConfig: IdpConfig | null;
}

export interface ProviderConfigureFieldsProps
  extends SharedComponentProps<ProviderConfigureFieldsMessages, SsoProviderCreateClasses> {
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
  className?: string;
  onFormDirty?: (isDirty: boolean) => void;
  idpConfig: IdpConfig | null;
  mode?: FormMode;
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
  createAction: ComponentAction<CreateIdentityProviderRequestContentPrivate, IdentityProvider>;
  backButton?: SsoProviderCreateBackButton;
  onPrevious?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
  onNext?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
}

export interface UseSsoProviderCreateOptions {
  createAction?: SsoProviderCreateProps['createAction'];
  customMessages?: SsoProviderCreateProps['customMessages'];
}

export interface UseSsoProviderCreateLogicOptions {
  onNext?: SsoProviderCreateProps['onNext'];
  onPrevious?: SsoProviderCreateProps['onPrevious'];
  createProvider: (data: CreateIdentityProviderRequestContentPrivate) => Promise<void>;
}

export interface UseSsoProviderCreateLogicResult {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  detailsRef: React.RefObject<ProviderDetailsFormHandle | null>;
  configureRef: React.RefObject<ProviderConfigureHandle | null>;
  handleCreate: () => Promise<void>;
  isLoadingConfig: boolean;
  filteredStrategies: IdpStrategy[];
  isLoadingIdpConfig: boolean;
  idpConfig?: IdpConfig | null;
  createStepActions: (
    stepId: 'provider_details' | 'provider_configure',
    ref: React.RefObject<ProviderDetailsFormHandle | ProviderConfigureHandle | null>,
  ) => {
    onNextAction: () => Promise<boolean>;
    onPreviousAction: () => Promise<boolean>;
  };
}

export type FormState = {
  strategy?: IdpStrategy;
  details?: ProviderDetailsFormValues | null;
  configure?: ProviderConfigureFormValues | null;
};

export type SsoProviderCreateViewProps = {
  logic: SsoProviderCreateLogicProps;
  handlers: SsoProviderCreateHandlerProps;
};

export interface SsoProviderCreateLogicProps {
  formData: FormState;
  strategy?: IdpStrategy;
  details?: ProviderDetailsFormValues | null;
  configure?: ProviderConfigureFormValues | null;
  isCreating: boolean;
  isLoadingConfig: boolean;
  filteredStrategies: IdpStrategy[];
  isLoadingIdpConfig: boolean;
  idpConfig?: IdpConfig | null;
  styling?: SsoProviderCreateProps['styling'];
  customMessages?: SsoProviderCreateProps['customMessages'];
  backButton?: SsoProviderCreateProps['backButton'];
}

export interface SsoProviderCreateHandlerProps {
  onNext: ((stepId: string, values: Partial<SsoProviderFormValues>) => boolean) | undefined;
  onPrevious: ((stepId: string, values: Partial<SsoProviderFormValues>) => boolean) | undefined;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  detailsRef: React.RefObject<ProviderDetailsFormHandle | null>;
  configureRef: React.RefObject<ProviderConfigureHandle | null>;
  handleCreate: () => Promise<void>;
  createStepActions: (
    stepId: 'provider_details' | 'provider_configure',
    ref: React.RefObject<ProviderDetailsFormHandle | ProviderConfigureHandle | null>,
  ) => {
    onNextAction: () => Promise<boolean>;
    onPreviousAction: () => Promise<boolean>;
  };
}
