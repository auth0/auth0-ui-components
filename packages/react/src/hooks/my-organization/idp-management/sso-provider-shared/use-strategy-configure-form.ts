/**
 * Form setup shared by the SSO strategy configure forms.
 * @module use-strategy-configure-form
 */

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

import { FORM_REVALIDATE_MODE, FORM_VALIDATION_MODE } from '@/lib/constants/form-constants';
import type {
  StrategyConfigureFormHandle,
  UseStrategyConfigureFormOptions,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Creates a strategy configure form with an imperative handle.
 * @param ref - Forwarded ref.
 * @param options - Form options.
 * @param options.schema - Validation schema.
 * @param options.defaultValues - Initial values.
 * @param options.readOnly - Validate on submit only.
 * @param options.onFormDirty - Dirty state callback.
 * @param options.getData - Custom `getData`.
 * @param options.reset - Custom `reset`.
 * @returns The form.
 */
export function useStrategyConfigureForm<TSchema extends z.ZodTypeAny>(
  ref: React.ForwardedRef<StrategyConfigureFormHandle<z.infer<TSchema>>>,
  {
    schema,
    defaultValues,
    readOnly = false,
    onFormDirty,
    getData,
    reset,
  }: UseStrategyConfigureFormOptions<TSchema>,
): UseFormReturn<z.infer<TSchema>> {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: readOnly ? 'onSubmit' : FORM_VALIDATION_MODE,
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
 * Parses values with the schema, or returns them unchanged when invalid.
 * @param schema - Validation schema.
 * @param values - Values to parse.
 * @returns The parsed or original values.
 */
export function parseStrategyConfigureValues<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  values: z.infer<TSchema>,
): z.infer<TSchema> {
  const result = schema.safeParse(values);
  return result.success ? result.data : values;
}
