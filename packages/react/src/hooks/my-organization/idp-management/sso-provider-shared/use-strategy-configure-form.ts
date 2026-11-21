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
 * Creates a strategy configure form: validation by the strategy's zod schema, validation modes, dirty
 * reporting, and the imperative handle (`validate`, `getData`, `isDirty`, `reset`).
 * @param ref - Ref forwarded to the form component.
 * @param options - Form options.
 * @param options.schema - Strategy configure schema that validates the form and types its values.
 * @param options.defaultValues - Initial values.
 * @param options.mode - Validation mode.
 * @param options.onFormDirty - Called when the dirty state changes.
 * @param options.getData - Custom `getData`.
 * @param options.reset - Custom `reset`.
 * @returns The react-hook-form instance.
 */
export function useStrategyConfigureForm<TSchema extends z.ZodTypeAny>(
  ref: React.ForwardedRef<StrategyConfigureFormHandle<z.infer<TSchema>>>,
  {
    schema,
    defaultValues,
    mode = FORM_VALIDATION_MODE,
    onFormDirty,
    getData,
    reset,
  }: UseStrategyConfigureFormOptions<TSchema>,
): UseFormReturn<z.infer<TSchema>> {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
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
 * @param schema - Strategy configure schema.
 * @param values - Values to parse.
 * @returns Parsed values, or the input when invalid.
 */
export function parseStrategyConfigureValues<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  values: z.infer<TSchema>,
): z.infer<TSchema> {
  const result = schema.safeParse(values);
  return result.success ? result.data : values;
}
