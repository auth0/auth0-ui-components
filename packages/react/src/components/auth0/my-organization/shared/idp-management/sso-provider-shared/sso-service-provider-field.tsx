/**
 * Read-only, copyable service provider value (callback URL, ACS URL, entity ID, ...).
 * @module sso-service-provider-field
 * @internal
 */

import { useFormContext, type FieldValues } from 'react-hook-form';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import type {
  SsoServiceProviderFieldProps,
  SsoServiceProviderFormFieldProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Shows a value the user copies into their identity provider.
 * @param props - Component props.
 * @returns JSX element
 */
export function SsoServiceProviderField<TValues extends FieldValues = FieldValues>(
  props: SsoServiceProviderFieldProps<TValues>,
) {
  const { id, name, label, helperText, value } = props;

  if (name !== undefined) {
    return (
      <SsoServiceProviderFormField<TValues> name={name} label={label} helperText={helperText} />
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-label font-medium">
        {label}
      </Label>
      <CopyableTextField id={id} type="text" readOnly={true} value={value} />
      {helperText && (
        <p className="text-muted-foreground text-paragraph font-normal text-left">{helperText}</p>
      )}
    </div>
  );
}

/**
 * Form-bound variant of {@link SsoServiceProviderField}.
 * @param props - Component props.
 * @returns JSX element
 */
function SsoServiceProviderFormField<TValues extends FieldValues>({
  name,
  label,
  helperText,
}: SsoServiceProviderFormFieldProps<TValues>) {
  const { control } = useFormContext<TValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-label font-medium">{label}</FormLabel>
          <FormControl>
            <CopyableTextField type="text" readOnly={true} {...field} />
          </FormControl>
          {helperText && (
            <FormDescription className="text-paragraph font-normal text-left">
              {helperText}
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
