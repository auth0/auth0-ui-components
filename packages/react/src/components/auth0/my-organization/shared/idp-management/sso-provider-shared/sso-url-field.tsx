/**
 * URL input bound to a form field, with label, placeholder and helper text from messages.
 * @module sso-url-field
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { CopyableTextField } from '@/components/auth0/shared/copyable-text-field';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TextField } from '@/components/ui/text-field';
import { useTranslator } from '@/hooks/shared/use-translator';

export interface SsoUrlFieldProps {
  /** Form field name. */
  name: string;
  /** Message key prefix with `label`, `placeholder` and `helper_text`. */
  messageKey: string;
  readOnly?: boolean;
  /** Mark the input as required for assistive technology. */
  required?: boolean;
  /** Render with a copy button (for example the ADFS metadata location URL). */
  copyable?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * URL input for connection settings (metadata URL, sign-in URL, ...).
 * @param props - Component props.
 * @param props.name - Form field name.
 * @param props.messageKey - Message key prefix.
 * @param props.readOnly - Disable editing.
 * @param props.required - Set `aria-required`.
 * @param props.copyable - Add a copy button.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoUrlField({
  name,
  messageKey,
  readOnly = false,
  required = false,
  copyable = false,
  customMessages = {},
}: SsoUrlFieldProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-label font-medium">{t(`${messageKey}.label`)}</FormLabel>
          <FormControl>
            {copyable ? (
              <CopyableTextField
                type="url"
                placeholder={t(`${messageKey}.placeholder`)}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...field}
              />
            ) : (
              <TextField
                type="url"
                placeholder={t(`${messageKey}.placeholder`)}
                error={Boolean(fieldState.error)}
                readOnly={readOnly}
                {...(required ? { 'aria-required': true } : {})}
                aria-invalid={Boolean(fieldState.error)}
                {...field}
              />
            )}
          </FormControl>
          <FormMessage role="alert" className="text-left text-paragraph" />
          <FormDescription className="text-paragraph font-normal text-left">
            {t(`${messageKey}.helper_text`)}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
