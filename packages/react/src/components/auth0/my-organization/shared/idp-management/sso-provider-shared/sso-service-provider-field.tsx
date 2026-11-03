/**
 * Read-only, copyable service provider value (callback URL, ACS URL, entity ID, ...).
 * @module sso-service-provider-field
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SsoServiceProviderFieldBaseProps {
  label: string;
  helperText?: string;
}

interface SsoServiceProviderFormFieldProps extends SsoServiceProviderFieldBaseProps {
  /** Form field holding the value. Requires a form context. */
  name: string;
  value?: never;
  id?: never;
}

interface SsoServiceProviderValueFieldProps extends SsoServiceProviderFieldBaseProps {
  name?: never;
  /** Value to show; no form needed. */
  value: string;
  id: string;
}

export type SsoServiceProviderFieldProps =
  | SsoServiceProviderFormFieldProps
  | SsoServiceProviderValueFieldProps;

/**
 * Shows a value the administrator copies into their identity provider. Bound to a form field
 * (`name`) or given a plain `value`, so it works inside the strategy forms and on guided setup
 * pages.
 * @param props - Component props.
 * @returns JSX element
 */
export function SsoServiceProviderField(props: SsoServiceProviderFieldProps) {
  if (props.name !== undefined) {
    return <SsoServiceProviderFormField {...props} />;
  }

  const { id, label, helperText, value } = props;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-label font-medium">
        {label}
      </Label>
      <CopyableTextField id={id} type="text" readOnly={true} value={value} />
      {helperText && (
        <p className={cn('text-muted-foreground text-sm', 'text-paragraph font-normal text-left')}>
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Form-bound variant of {@link SsoServiceProviderField}.
 * @param props - Component props.
 * @returns JSX element
 */
function SsoServiceProviderFormField({
  name,
  label,
  helperText,
}: SsoServiceProviderFormFieldProps) {
  const { control } = useFormContext();

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
