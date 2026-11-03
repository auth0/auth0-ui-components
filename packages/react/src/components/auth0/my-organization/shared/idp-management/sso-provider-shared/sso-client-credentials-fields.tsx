/**
 * OAuth client credentials: client ID and client secret.
 * @module sso-client-credentials-fields
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { SsoHelpText } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-help-text';
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

export interface SsoClientCredentialsFieldsProps {
  messageKey: string;
  readOnly?: boolean;
  showCopyButton?: boolean;
  required?: boolean;
  showClientSecret?: boolean;
  helpUrls?: { clientId?: string; clientSecret?: string };
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Client ID and client secret inputs bound to `client_id` and `client_secret`.
 * @param props - Component props.
 * @param props.messageKey - Strategy message key prefix.
 * @param props.readOnly - Disable editing.
 * @param props.showCopyButton - Show copy buttons.
 * @param props.required - Set `aria-required`.
 * @param props.showClientSecret - Render the secret field.
 * @param props.helpUrls - Help links for the helper texts.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoClientCredentialsFields({
  messageKey,
  readOnly = false,
  showCopyButton,
  required = false,
  showClientSecret = true,
  helpUrls = {},
  customMessages = {},
}: SsoClientCredentialsFieldsProps) {
  const { t } = useTranslator(
    'idp_management.create_sso_provider.provider_configure',
    customMessages,
  );
  const { control } = useFormContext();

  const renderField = (name: 'client_id' | 'client_secret', helpUrl?: string) => (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-label font-medium">
            {t(`${messageKey}.${name}.label`)}
          </FormLabel>
          <FormControl>
            <CopyableTextField
              type={name === 'client_secret' ? 'password' : 'text'}
              placeholder={t(`${messageKey}.${name}.placeholder`)}
              error={Boolean(fieldState.error)}
              readOnly={readOnly}
              showCopyButton={showCopyButton}
              {...(required
                ? { 'aria-required': true, 'aria-invalid': Boolean(fieldState.error) }
                : {})}
              {...field}
            />
          </FormControl>
          <FormMessage role="alert" className="text-left text-paragraph" />
          <FormDescription className="text-paragraph font-normal text-left">
            <SsoHelpText
              messageKey={`${messageKey}.${name}.helper_text`}
              href={helpUrl}
              linkKey={`${name}-help-link`}
              customMessages={customMessages}
            />
          </FormDescription>
        </FormItem>
      )}
    />
  );

  return (
    <>
      {renderField('client_id', helpUrls.clientId)}
      {showClientSecret && renderField('client_secret', helpUrls.clientSecret)}
    </>
  );
}
