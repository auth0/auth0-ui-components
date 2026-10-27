/**
 * SSO provider create types.
 * @module sso-provider-create-types
 */

import type {
  IdpManagementPermissions,
  SharedComponentProps,
  ProviderSelectMessages,
  ProviderDetailsMessages,
  IdpStrategy,
  ProviderSelectionFormValues,
  IdpKnownResponse,
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
  GetIdpConfigurationResponseContent,
} from '@auth0/universal-components-core';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';

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
  'ProviderConfigure-ThirdPartyAccess'?: string;
  'ProviderConfigure-CrossAppAccess'?: string;
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
  idpConfig: GetIdpConfigurationResponseContent | null;
  connectionName?: string;
  connectionNamePrefix?: string;
  /** Show the SAML "Sign request" option; hiding it keeps the existing value. Defaults to `true`. */
  showSignRequest?: boolean;
  showThirdPartyAccess?: boolean;
  isThirdPartyAccessReadOnly?: boolean;
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
  crossAppAccessDefaultValue?: CrossAppAccessStatus;
  isOrganizationBlocked?: boolean;
  /**
   * Optional resolver for SAML Service Provider metadata.
   *
   * @param params - Resolver parameters.
   * @param params.connectionName - The SAML connection name.
   * @returns An object containing `entityId` for the SP Issuer URN.
   */
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
}

export interface ProviderConfigureFieldsProps
  extends SharedComponentProps<ProviderConfigureFieldsMessages, SsoProviderCreateClasses> {
  strategy: IdpStrategy;
  initialData?: Partial<ProviderConfigureFormValues>;
  className?: string;
  onFormDirty?: (isDirty: boolean) => void;
  idpConfig: GetIdpConfigurationResponseContent | null;
  connectionName?: string;
  connectionNamePrefix?: string;
  mode?: FormMode;
  /** Show the SAML "Sign request" option; hiding it keeps the existing value. Defaults to `true`. */
  showSignRequest?: boolean;
  showThirdPartyAccess?: boolean;
  isThirdPartyAccessReadOnly?: boolean;
  showCrossAppAccess?: boolean;
  isCrossAppAccessReadOnly?: boolean;
  crossAppAccessDefaultValue?: CrossAppAccessStatus;
  isOrganizationBlocked?: boolean;
  /**
   * Optional resolver for SAML Service Provider metadata.
   *
   * @param params - Resolver parameters.
   * @param params.connectionName - The SAML connection name.
   * @returns An object containing `entityId` for the SP Issuer URN.
   */
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
}

/** Cross App Access status of a connection. */
export type CrossAppAccessStatus = 'enabled' | 'disabled';

/** Existing provider values used to seed the connection-level access fields. */
export interface ConnectionAccessInitialData {
  use_for_third_party_client_access?: boolean;
  cross_app_access_resource_app?: { status: CrossAppAccessStatus };
}

/** Default form values for the connection-level access fields. */
export interface ConnectionAccessDefaults {
  use_for_third_party_client_access: boolean;
  cross_app_access_resource_app?: { status: CrossAppAccessStatus };
}

/** Form values read and written by the connection-level access fields. */
export interface ConnectionAccessFormValues extends ConnectionAccessDefaults {
  discovery_url?: string;
}

/** Props for ConnectionAccessFields component. */
export interface ConnectionAccessFieldsProps
  extends Pick<
    ProviderConfigureFieldsProps,
    | 'strategy'
    | 'showThirdPartyAccess'
    | 'isThirdPartyAccessReadOnly'
    | 'showCrossAppAccess'
    | 'isCrossAppAccessReadOnly'
    | 'isOrganizationBlocked'
  > {
  readOnly?: boolean;
  classes?: Pick<
    SsoProviderCreateClasses,
    'ProviderConfigure-ThirdPartyAccess' | 'ProviderConfigure-CrossAppAccess'
  >;
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
  createAction: ComponentAction<CreateIdentityProviderRequestContentPrivate, IdpKnownResponse>;
  backButton?: SsoProviderCreateBackButton;
  onPrevious?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
  onNext?: (stepId: string, values: Partial<SsoProviderFormValues>) => boolean;
  connectionNamePrefix?: string;
  /** Show the SAML "Sign request" option; hiding it keeps the existing value. Defaults to `true`. */
  showSignRequest?: boolean;
  /**
   * Optional resolver for SAML Service Provider metadata.
   *
   * @param params - Resolver parameters.
   * @param params.connectionName - The SAML connection name.
   * @returns An object containing `entityId` for the SP Issuer URN.
   */
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
}

export interface UseSsoProviderCreateOptions {
  createAction?: SsoProviderCreateProps['createAction'];
  customMessages?: SsoProviderCreateProps['customMessages'];
  readOnly?: SsoProviderCreateProps['readOnly'];
}

export interface UseSsoProviderCreateServiceReturn {
  createProvider: (data: CreateIdentityProviderRequestContentPrivate) => Promise<void>;
  isCreating: boolean;
  isOrganizationBlocked: boolean;
}

export interface UseSsoProviderCreateHookOptions extends UseSsoProviderCreateOptions {
  onNext?: (stepId: string, values: Partial<FormState>) => boolean;
  onPrevious?: (stepId: string, values: Partial<FormState>) => boolean;
}

export interface UseSsoProviderCreateResult {
  permissions: IdpManagementPermissions;
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  detailsRef: React.RefObject<ProviderDetailsFormHandle | null>;
  configureRef: React.RefObject<ProviderConfigureHandle | null>;
  handleCreate: () => Promise<void>;
  isCreating: boolean;
  isLoadingConfig: boolean;
  filteredStrategies: IdpStrategy[];
  isLoadingIdpConfig: boolean;
  idpConfig?: GetIdpConfigurationResponseContent | null;
  showThirdPartyAccess: boolean;
  isThirdPartyAccessReadOnly: boolean;
  thirdPartyAccessDefaultValue?: 'allow' | 'block';
  showCrossAppAccess: boolean;
  isCrossAppAccessReadOnly: boolean;
  getCrossAppAccessDefaultValue: () => CrossAppAccessStatus | undefined;
  isOrganizationBlocked: boolean;
  crossAppAccessDefaultValue?: CrossAppAccessStatus;
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

export interface SsoProviderCreateViewProps
  extends UseSsoProviderCreateResult,
    Pick<
      SsoProviderCreateProps,
      | 'styling'
      | 'customMessages'
      | 'backButton'
      | 'onNext'
      | 'onPrevious'
      | 'resolveSamlMetadata'
      | 'connectionNamePrefix'
      | 'showSignRequest'
    > {
  strategy?: IdpStrategy;
  details?: ProviderDetailsFormValues | null;
  configure?: ProviderConfigureFormValues | null;
}
