/**
 * Read-only callback URL bound to the `callback_url` form field.
 * @module sso-callback-url-field
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
import { useTranslator } from '@/hooks/shared/use-translator';

export interface SsoCallbackUrlFieldProps {
  messageKey: string;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * The callback URL the administrator registers in their identity provider.
 * @param props - Component props.
 * @param props.messageKey - Strategy message key prefix.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoCallbackUrlField({ messageKey, customMessages = {} }: SsoCallbackUrlFieldProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="callback_url"
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-label font-medium">
            {t(`${messageKey}.callback_url.label`)}
          </FormLabel>
          <FormControl>
            <CopyableTextField
              type="text"
              placeholder={t(`${messageKey}.callback_url.placeholder`)}
              error={Boolean(fieldState.error)}
              readOnly={true}
              {...field}
            />
          </FormControl>
          <FormMessage role="alert" className="text-left text-paragraph" />
          <FormDescription className="text-paragraph font-normal text-left">
            {t(`${messageKey}.callback_url.helper_text`)}
          </FormDescription>
        </FormItem>
      )}
    />
  );
}
