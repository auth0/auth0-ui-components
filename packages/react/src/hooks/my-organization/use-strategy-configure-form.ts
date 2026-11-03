/**
 * Form setup shared by the SSO strategy configure forms.
 * @module use-strategy-configure-form
 */

import { createProviderConfigureSchema, type IdpStrategy } from '@auth0/universal-components-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Mode,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form';

import { FORM_REVALIDATE_MODE, FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';

/** Imperative handle every strategy configure form exposes to its parent. */
export interface StrategyConfigureFormHandle<TValues> {
  validate: () => Promise<boolean>;
  getData: () => TValues;
  isDirty: () => boolean;
  reset: (data?: TValues) => void;
}

export interface UseStrategyConfigureFormOptions<TValues extends FieldValues> {
  strategy: IdpStrategy;
  defaultValues: DefaultValues<TValues>;
  /**
   * Validation mode; defaults to `onTouched` when the option is omitted.
   * Pass `undefined`to use react-hook-form's own default (validate on submit).
   */
  mode?: Mode;
  onFormDirty?: (isDirty: boolean) => void;
  getData?: (form: UseFormReturn<TValues>) => TValues;
  reset?: (form: UseFormReturn<TValues>, data?: TValues) => void;
}

/**
 * Creates a strategy configure form: zod schema for the strategy, validation modes, dirty
 * reporting, and the imperative handle (`validate`, `getData`, `isDirty`, `reset`).
 * @param ref - Ref forwarded to the form component.
 * @param options - Form options.
 * @param options.strategy - Strategy whose schema validates the form.
 * @param options.defaultValues - Initial values.
 * @param options.mode - Validation mode.
 * @param options.onFormDirty - Called when the dirty state changes.
 * @param options.getData - Custom `getData`.
 * @param options.reset - Custom `reset`.
 * @returns The react-hook-form instance.
 */
export function useStrategyConfigureForm<TValues extends FieldValues>(
  ref: React.ForwardedRef<StrategyConfigureFormHandle<TValues>>,
  options: UseStrategyConfigureFormOptions<TValues>,
): UseFormReturn<TValues> {
  const { strategy, defaultValues, onFormDirty, getData, reset } = options;
  const mode = 'mode' in options ? options.mode : FORM_VALIDATION_MODE;

  const form = useForm<TValues>({
    resolver: zodResolver(createProviderConfigureSchema(strategy)) as unknown as Resolver<TValues>,
    mode,
    reValidateMode: FORM_REVALIDATE_MODE,
    defaultValues,
  });

  const { isDirty } = form.formState;

  React.useEffect(() => {
    onFormDirty?.(isDirty);
  }, [isDirty, onFormDirty]);

  React.useImperativeHandle(ref, () => ({
    validate: () => form.trigger(),
    getData: () => (getData ? getData(form) : form.getValues()),
    isDirty: () => form.formState.isDirty,
    reset: (data) => {
      if (reset) {
        reset(form, data);
      } else if (data) {
        form.reset(data);
      } else {
        form.reset();
      }
    },
  }));

  return form;
}

/**
 * Parses values with the strategy schema, falling back to the raw values when parsing fails.
 * Used by forms whose `getData` returns schema-normalised values.
 * @param strategy - Strategy whose schema to use.
 * @param values - Values to parse.
 * @returns Parsed values, or the input when invalid.
 */
export function parseStrategyConfigureValues<TValues>(
  strategy: IdpStrategy,
  values: TValues,
): TValues {
  const result = createProviderConfigureSchema(strategy).safeParse(values);
  return result.success ? (result.data as TValues) : values;
}
