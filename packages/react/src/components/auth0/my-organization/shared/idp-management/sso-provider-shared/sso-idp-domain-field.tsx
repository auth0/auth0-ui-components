/**
 * Identity provider domain input (Okta domain, Entra ID domain, Google Workspace domain).
 * @module sso-idp-domain-field
 * @internal
 */

import { useFormContext } from 'react-hook-form';

import { SsoHelpText } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-shared/sso-help-text';
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

export interface SsoIdpDomainFieldProps {
  name: string;
  messageKey: string;
  helpUrl?: string;
  readOnly?: boolean;
  customMessages?: Partial<Record<string, unknown>>;
}

/**
 * Domain of the administrator's identity provider tenant.
 * @param props - Component props.
 * @param props.name - Form field name.
 * @param props.messageKey - Message key prefix.
 * @param props.helpUrl - Help link URL.
 * @param props.readOnly - Disable editing.
 * @param props.customMessages - Custom translation messages.
 * @returns JSX element
 */
export function SsoIdpDomainField({
  name,
  messageKey,
  helpUrl,
  readOnly = false,
  customMessages = {},
}: SsoIdpDomainFieldProps) {
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
            <TextField
              type="text"
              placeholder={t(`${messageKey}.placeholder`)}
              error={Boolean(fieldState.error)}
              readOnly={readOnly}
              {...field}
            />
          </FormControl>
          <FormMessage role="alert" className="text-left text-paragraph" />
          {helpUrl && (
            <FormDescription className="text-paragraph font-normal text-left">
              <SsoHelpText
                messageKey={`${messageKey}.helper_text`}
                href={helpUrl}
                linkKey={`${name}-help-link`}
                customMessages={customMessages}
              />
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
}
