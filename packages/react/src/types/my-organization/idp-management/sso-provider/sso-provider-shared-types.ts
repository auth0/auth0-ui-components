/**
 * Types for the shared SSO provider form sections.
 * @module sso-provider-shared-types
 * @internal
 */

import type { DefaultValues, FieldValues, Mode, Path, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SamlSelectFieldConfig {
  name: 'signatureAlgorithm' | 'digestAlgorithm' | 'bindingMethod';
  labelKey: string;
  placeholderKey: string;
  options: readonly SelectOption[];
}

export type SamlConnectionSource = 'meta_data_url' | 'meta_data_file';

export interface SsoSamlConnectionFieldsProps {
  readOnly?: boolean;
  sourceSelector?: 'radio' | 'tabs';
  customMessages?: Partial<Record<string, unknown>>;
}

export interface SsoSamlRequestSettingsProps {
  signRequestCertUrl: string;
  readOnly?: boolean;
  showSignRequest?: boolean;
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
  isDirty: () => boolean;
  reset: (data?: TValues) => void;
}

export interface UseStrategyConfigureFormOptions<TSchema extends z.ZodTypeAny> {
  schema: TSchema;
  defaultValues: DefaultValues<z.infer<TSchema>>;
  mode?: Mode;
  onFormDirty?: (isDirty: boolean) => void;
  getData?: (form: UseFormReturn<z.infer<TSchema>>) => z.infer<TSchema>;
  reset?: (form: UseFormReturn<z.infer<TSchema>>, data?: z.infer<TSchema>) => void;
}

export interface UseServiceProviderValuesOptions {
  connectionName?: string;
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
  fallbackDomain?: string;
}
