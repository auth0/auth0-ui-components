/**
 * Types for the shared SSO provider form sections.
 * @module sso-provider-shared-types
 * @internal
 */

import type {
  PingFederateConfigureFormValues,
  SamlpConfigureFormValues,
} from '@auth0/universal-components-core';
import type * as React from 'react';
import type { DefaultValues, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SamlSelectFieldConfig {
  name: 'signatureAlgorithm' | 'digestAlgorithm' | 'bindingMethod';
  messageKey: string;
  options: readonly SelectOption[];
}

export type SamlRequestSettingsFormValues = Pick<
  PingFederateConfigureFormValues,
  'signSAMLRequest' | 'signatureAlgorithm' | 'digestAlgorithm'
> &
  Partial<Pick<SamlpConfigureFormValues, 'meta_data_source' | 'bindingMethod'>>;

export type SamlConnectionSource = 'meta_data_url' | 'meta_data_file';

export type ConnectionSourceSelectorVariant = 'radio' | 'tabs';

export interface SsoConnectionSourceSelectorProps {
  messageKey: string;
  variant?: ConnectionSourceSelectorVariant;
  readOnly?: boolean;
  panels?: Partial<Record<SamlConnectionSource, React.ReactNode>>;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoSamlConnectionFieldsProps {
  readOnly?: boolean;
  sourceSelector?: ConnectionSourceSelectorVariant;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoSamlRequestSettingsProps {
  signRequestCertUrl: string;
  messageKey?: string;
  readOnly?: boolean;
  showSignRequest?: boolean;
  showProtocolBinding?: boolean;
  signRequestHelperText?: 'by-source' | 'single';
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoSamlServiceProviderFieldsProps {
  spIssuerUrn: string;
  customMessages?: Partial<Record<string, unknown>>;
}

interface SsoServiceProviderFieldBaseProps {
  label: string;
  helperText?: string;
}

export interface SsoServiceProviderFormFieldProps<TValues extends FieldValues = FieldValues>
  extends SsoServiceProviderFieldBaseProps {
  name: Path<TValues>;
  value?: never;
  id?: never;
}

interface SsoServiceProviderValueFieldProps extends SsoServiceProviderFieldBaseProps {
  name?: never;
  value: string;
  id: string;
}

export type SsoServiceProviderFieldProps<TValues extends FieldValues = FieldValues> =
  | SsoServiceProviderFormFieldProps<TValues>
  | SsoServiceProviderValueFieldProps;

export interface UseFileContentFieldResult {
  files: File[];
  onFilesChange: (files: File[]) => Promise<void>;
}

/** Imperative handle every strategy configure form exposes to its parent. */
export interface StrategyConfigureFormHandle<TValues> {
  validate: () => Promise<boolean>;
  getData: () => TValues;
  getValues: () => TValues;
  isDirty: () => boolean;
  reset: (data?: TValues) => void;
}

export interface UseStrategyConfigureFormOptions<TSchema extends z.ZodTypeAny> {
  schema: TSchema;
  defaultValues: DefaultValues<z.infer<TSchema>>;
  readOnly?: boolean;
  onFormDirty?: (isDirty: boolean) => void;
  getData?: (form: UseFormReturn<z.infer<TSchema>>) => z.infer<TSchema>;
  reset?: (form: UseFormReturn<z.infer<TSchema>>, data?: z.infer<TSchema>) => void;
}

export interface UseServiceProviderValuesOptions {
  connectionName?: string;
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
  fallbackDomain?: string;
}

export interface SsoAdfsConnectionFieldsProps {
  readOnly?: boolean;
  sourceSelector?: ConnectionSourceSelectorVariant;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoFileFieldProps extends UseFileContentFieldResult {
  name: string;
  messageKey: string;
  accept: string;
  readOnly?: boolean;
  invalidFileMessageKey?: string;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoUrlFieldProps {
  name: string;
  messageKey: string;
  readOnly?: boolean;
  required?: boolean;
  copyable?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

export type OidcChannel = 'back_channel' | 'front_channel';

export interface UseOidcChannelResult {
  channel: OidcChannel | undefined;
  showClientSecret: boolean;
}

export interface SsoCallbackUrlFieldProps {
  messageKey: string;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoClientCredentialsFieldsProps {
  messageKey: string;
  readOnly?: boolean;
  showCopyButton?: boolean;
  required?: boolean;
  showClientSecret?: boolean;
  helpUrls?: { clientId?: string; clientSecret?: string };
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoIdpDomainFieldProps {
  name: string;
  messageKey: string;
  helpUrl?: string;
  readOnly?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoHelpTextProps {
  messageKey: string;
  href?: string;
  linkKey?: string;
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoOidcConnectionFieldsProps {
  readOnly?: boolean;
  showCopyButton?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}
